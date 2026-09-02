#!/usr/bin/env node
/**
 * Bundle size measurement and report rendering for thorvg.web packages.
 *
 *   node .github/scripts/bundle-size.mjs measure <package> <ref> <outDir>
 *     Scans packages/<package>/dist using the package.json "exports" map and
 *     writes <outDir>/<package>.<ref>.json with raw/gzip/brotli sizes of the
 *     WASM binary, the Emscripten glue JS and every module-system bundle
 *     (esm/cjs/umd) of each preset.  The glue is recorded for reference only:
 *     rollup inlines it into each bundle and it is not published on its own.
 *
 *   node .github/scripts/bundle-size.mjs report <dir>
 *     Reads every *.json produced by `measure` from <dir> and prints a
 *     markdown report comparing "main" against "pr" to stdout.
 *
 * No third-party dependencies: only Node built-ins are used, so it can run
 * before `pnpm install` and inside the report workflow.
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const REPORT_HEADER = '## Bundle Size Report';
const WASM_FILE = 'thorvg.wasm';
const GLUE_FILE = 'thorvg.js';
const WORKER_FILE = 'thorvg.worker.js';
const MODULES = ['esm', 'cjs', 'umd'];

// ---------------------------------------------------------------------------
// measure
// ---------------------------------------------------------------------------

function fileSizes(filePath) {
  if (!fs.existsSync(filePath)) return null;
  const buf = fs.readFileSync(filePath);
  return {
    file: path.basename(filePath),
    raw: buf.length,
    gzip: zlib.gzipSync(buf, { level: 9 }).length,
    brotli: zlib.brotliCompressSync(buf, {
      params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
    }).length,
  };
}

function resolveEntry(entry, key) {
  // exports["./sw"] may be a string or a conditions object.
  if (typeof entry === 'string') return key === 'import' ? entry : null;
  if (entry && typeof entry === 'object') {
    const value = entry[key];
    return typeof value === 'string' ? value : null;
  }
  return null;
}

function measure(pkgName, ref, outDir) {
  const pkgDir = path.resolve('packages', pkgName);
  const pkgJsonPath = path.join(pkgDir, 'package.json');
  if (!fs.existsSync(pkgJsonPath)) {
    throw new Error(`package.json not found: ${pkgJsonPath}`);
  }
  const pkg = JSON.parse(fs.readFileSync(pkgJsonPath, 'utf8'));
  const exportsMap = pkg.exports ?? { '.': { import: pkg.module, require: pkg.main } };

  const presets = [];
  for (const [subpath, entry] of Object.entries(exportsMap)) {
    const esmRel = resolveEntry(entry, 'import');
    const cjsRel = resolveEntry(entry, 'require');
    const anchor = esmRel ?? cjsRel;
    if (!anchor) continue;

    const dir = path.join(pkgDir, path.dirname(anchor));
    const preset = subpath === '.' ? 'default' : subpath.replace(/^\.\//, '');

    // UMD bundles are not listed in "exports"; derive from the esm file name
    // (lottie-player.esm.js -> lottie-player.js).
    const umdRel = esmRel ? esmRel.replace(/\.esm\.js$/, '.js') : null;

    const bundles = {};
    const esm = esmRel ? fileSizes(path.join(pkgDir, esmRel)) : null;
    const cjs = cjsRel ? fileSizes(path.join(pkgDir, cjsRel)) : null;
    const umd = umdRel && umdRel !== esmRel ? fileSizes(path.join(pkgDir, umdRel)) : null;
    if (esm) bundles.esm = esm;
    if (cjs) bundles.cjs = cjs;
    if (umd) bundles.umd = umd;

    presets.push({
      preset,
      wasm: fileSizes(path.join(dir, WASM_FILE)),
      glue: fileSizes(path.join(dir, GLUE_FILE)),
      worker: fileSizes(path.join(dir, WORKER_FILE)),
      bundles,
    });
  }

  const missing = presets.filter((p) => !p.wasm || !p.glue || Object.keys(p.bundles).length === 0);
  if (presets.length === 0 || missing.length === presets.length) {
    throw new Error(`no build output found under ${path.join(pkgDir, 'dist')}; run the package build first`);
  }
  for (const p of missing) {
    console.warn(`warning: preset "${p.preset}" is incomplete (wasm=${!!p.wasm} glue=${!!p.glue} bundles=${Object.keys(p.bundles).join(',') || 'none'})`);
  }

  const result = { package: pkg.name, ref, presets };
  fs.mkdirSync(outDir, { recursive: true });
  const outFile = path.join(outDir, `${pkgName}.${ref}.json`);
  fs.writeFileSync(outFile, JSON.stringify(result, null, 2) + '\n');

  console.log(`${pkg.name} (${ref})`);
  for (const p of presets) {
    for (const mod of Object.keys(p.bundles)) {
      const t = total(p, mod);
      console.log(`  ${p.preset.padEnd(10)} ${mod.padEnd(4)} raw ${fmt(t.raw).padStart(10)}  gzip ${fmt(t.gzip).padStart(10)}`);
    }
  }
  console.log(`written ${outFile}`);
}

// ---------------------------------------------------------------------------
// report
// ---------------------------------------------------------------------------

// The JSON files come from the PR build, so treat every string as untrusted
// before embedding it in a comment body (mirrors core's binary_size_report).
const SAFE_RE = /[^A-Za-z0-9 ._/+\-=(),:@]/g;
function sanitize(s, limit = 64) {
  return String(s ?? '').replace(/`/g, "'").replace(/\n/g, ' ').replace(SAFE_RE, '').slice(0, limit);
}

function sizeOrNull(entry) {
  if (!entry || typeof entry !== 'object') return null;
  const raw = Number(entry.raw);
  const gzip = Number(entry.gzip);
  if (!Number.isInteger(raw) || !Number.isInteger(gzip) || raw < 0 || gzip < 0) return null;
  return { raw, gzip };
}

// Total = wasm + bundle (+ worker). The glue JS is already inlined in the
// bundle, so adding it would double count.
function total(preset, mod) {
  const parts = [preset.wasm, preset.worker, preset.bundles?.[mod]]
    .map(sizeOrNull)
    .filter(Boolean);
  return parts.reduce((acc, p) => ({ raw: acc.raw + p.raw, gzip: acc.gzip + p.gzip }), { raw: 0, gzip: 0 });
}

function fmt(n) {
  return n.toLocaleString('en-US');
}

function delta(base, pr) {
  const diff = pr - base;
  const pct = base ? (diff / base) * 100 : 0;
  const sign = diff > 0 ? '+' : '';
  return `${sign}${fmt(diff)} (${sign}${pct.toFixed(2)}%)`;
}

function loadResults(dir) {
  const results = new Map(); // package -> { main?: data, pr?: data }
  if (!fs.existsSync(dir)) return results;
  for (const name of fs.readdirSync(dir).sort()) {
    if (!name.endsWith('.json')) continue;
    const m = /^(.+)\.(main|pr)\.json$/.exec(name);
    if (!m) continue;
    let data;
    try {
      data = JSON.parse(fs.readFileSync(path.join(dir, name), 'utf8'));
    } catch {
      continue;
    }
    if (!data || !Array.isArray(data.presets)) continue;
    const key = sanitize(data.package || m[1]);
    if (!results.has(key)) results.set(key, {});
    results.get(key)[m[2]] = data;
  }
  return results;
}

function presetMap(data) {
  const map = new Map();
  for (const p of data?.presets ?? []) {
    if (p && typeof p === 'object') map.set(sanitize(p.preset), p);
  }
  return map;
}

function renderPackage(name, sizes) {
  const lines = [`### ${name}`, ''];
  const main = presetMap(sizes.main);
  const pr = presetMap(sizes.pr);
  const presets = [...new Set([...main.keys(), ...pr.keys()])];

  if (!sizes.main || !sizes.pr) {
    lines.push(`No ${!sizes.main ? 'main' : 'PR'} data collected.`, '');
    return lines;
  }

  lines.push(
    '| Preset / Module | main | PR | Delta | main (gzip) | PR (gzip) | Delta (gzip) |',
    '|-----------------|-----:|---:|------:|------------:|----------:|-------------:|',
  );
  const breakdown = [
    '| Preset | File | main | PR | Delta | main (gzip) | PR (gzip) |',
    '|--------|------|-----:|---:|------:|------------:|----------:|',
  ];

  for (const preset of presets) {
    const m = main.get(preset);
    const p = pr.get(preset);
    const mods = [...new Set([...Object.keys(m?.bundles ?? {}), ...Object.keys(p?.bundles ?? {})])]
      .filter((x) => MODULES.includes(x))
      .sort((a, b) => MODULES.indexOf(a) - MODULES.indexOf(b));

    for (const mod of mods) {
      const label = `${preset} / ${mod}`;
      if (!m?.bundles?.[mod] || !p?.bundles?.[mod]) {
        lines.push(`| ${label} | n/a | n/a | n/a | n/a | n/a | n/a |`);
        continue;
      }
      const tm = total(m, mod);
      const tp = total(p, mod);
      lines.push(
        `| ${label} | ${fmt(tm.raw)} | ${fmt(tp.raw)} | ${delta(tm.raw, tp.raw)} ` +
          `| ${fmt(tm.gzip)} | ${fmt(tp.gzip)} | ${delta(tm.gzip, tp.gzip)} |`,
      );
    }

    const files = [
      ['wasm', m?.wasm, p?.wasm],
      ['glue', m?.glue, p?.glue],
      ['worker', m?.worker, p?.worker],
      ...mods.map((mod) => [mod, m?.bundles?.[mod], p?.bundles?.[mod]]),
    ];
    for (const [kind, fm, fp] of files) {
      const sm = sizeOrNull(fm);
      const sp = sizeOrNull(fp);
      if (!sm && !sp) continue;
      const file = sanitize(fp?.file ?? fm?.file ?? kind);
      if (!sm || !sp) {
        breakdown.push(`| ${preset} | ${file} | ${sm ? fmt(sm.raw) : 'n/a'} | ${sp ? fmt(sp.raw) : 'n/a'} | n/a | ${sm ? fmt(sm.gzip) : 'n/a'} | ${sp ? fmt(sp.gzip) : 'n/a'} |`);
        continue;
      }
      breakdown.push(`| ${preset} | ${file} | ${fmt(sm.raw)} | ${fmt(sp.raw)} | ${delta(sm.raw, sp.raw)} | ${fmt(sm.gzip)} | ${fmt(sp.gzip)} |`);
    }
  }

  lines.push('', '<details>', '<summary>Per-file breakdown</summary>', '', ...breakdown, '', '</details>', '');
  return lines;
}

function report(dir) {
  const results = loadResults(dir);
  const lines = [REPORT_HEADER, ''];
  if (results.size === 0) {
    lines.push('No data collected.', '');
  } else {
    lines.push('Total = thorvg.wasm + module bundle (esm/cjs/umd), in bytes. The Emscripten glue (thorvg.js) is inlined in each bundle and listed in the breakdown for reference only.', '');
    for (const [name, sizes] of [...results.entries()].sort((a, b) => a[0].localeCompare(b[0]))) {
      lines.push(...renderPackage(name, sizes));
    }
  }
  process.stdout.write(lines.join('\n') + '\n');
}

// ---------------------------------------------------------------------------
// cli
// ---------------------------------------------------------------------------

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === 'measure' && args.length === 3) {
    measure(args[0], args[1], args[2]);
  } else if (cmd === 'report' && args.length === 1) {
    report(args[0]);
  } else {
    console.error('usage: bundle-size.mjs measure <package> <ref> <outDir> | report <dir>');
    process.exit(2);
  }
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
