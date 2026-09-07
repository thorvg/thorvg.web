#!/usr/bin/env node

/**
 * Bundle size helper for .github/workflows/bundle_size.yml
 */

import fs from 'node:fs';
import path from 'node:path';

const UP = '🟥';
const DOWN = '🟩';

/** writes the thorvg.wasm + ESM size of every preset to {outDir}/{pkgName}.{ref}.json */
function measure(pkgName, ref, outDir) {
  const pkgDir = path.resolve('packages', pkgName);
  const pkg = JSON.parse(fs.readFileSync(path.join(pkgDir, 'package.json'), 'utf8'));

  const presets = [];
  for (const [subpath, entry] of Object.entries(pkg.exports)) {
    const js = typeof entry === 'string' ? entry : entry.import;
    if (!js) continue;

    presets.push({
      preset: subpath === '.' ? 'default' : subpath.replace('./', ''),
      wasm: fileSize(path.join(pkgDir, path.dirname(js), 'thorvg.wasm')),
      js: fileSize(path.join(pkgDir, js)),
    });
  }
  if (!presets.some((p) => p.wasm !== null && p.js !== null)) {
    throw new Error(`no build output under ${pkgDir}/dist; run the package build first`);
  }

  const json = JSON.stringify({ package: pkg.name, presets }, null, 2);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, `${pkgName}.${ref}.json`), json);

  for (const p of presets) {
    console.log(`${p.preset.padEnd(10)} wasm ${p.wasm}  js ${p.js}`);
  }
}

/** compares the main / pr JSON files in {dir} and prints one table per changed package */
function report(dir) {
  const results = collect(dir);
  const lines = ['## Bundle Size Report', ''];

  if (results.size === 0) {
    lines.push('No data collected.');
  } else {
    let changed = false;

    for (const [name, { main, pr }] of results) {
      if (!main || !pr) {
        lines.push(`### ${name}`, '', `No ${main ? 'PR' : 'main'} data collected.`, '');
        changed = true;
      } else {
        const block = renderPackage(name, presetsOf(main), presetsOf(pr));
        if (block.length) changed = true;
        lines.push(...block);
      }
    }
    if (!changed) lines.push('No size changes.');
  }

  console.log(lines.join('\n'));
}

function collect(dir) {
  const results = new Map();
  if (!fs.existsSync(dir)) return results;

  for (const file of fs.readdirSync(dir).sort()) {
    const match = /^(.+)\.(main|pr)\.json$/.exec(file);
    if (!match) continue;

    const [, name, ref] = match;
    try {
      const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
      const key = sanitize(data.package || name);
      results.set(key, { ...results.get(key), [ref]: data });
    } catch {
      // unreadable artifact: reported as missing data
    }
  }
  return results;
}

function renderPackage(name, mainPresets, prPresets) {
  const presets = [...new Set([...mainPresets.keys(), ...prPresets.keys()])];
  let changed = false;

  const rows = presets.map((preset) => {
    const main = mainPresets.get(preset);
    const pr = prPresets.get(preset);
    if (!main || !pr) {
      changed = true;
      return `| ${preset} | n/a | n/a | n/a | n/a |`;
    }
    if (main.wasm !== pr.wasm || main.js !== pr.js) changed = true;
    const cells = [
      preset,
      fmt(pr.wasm + pr.js),
      delta(main.wasm + main.js, pr.wasm + pr.js, true),
      delta(main.wasm, pr.wasm),
      delta(main.js, pr.js),
    ];
    return `| ${cells.join(' | ')} |`;
  });

  if (!changed) return [];
  return [
    `### ${name}`,
    '',
    '| Preset | Total | Delta | Δ WASM | Δ JS |',
    '|--------|------:|------:|-------:|-----:|',
    ...rows,
    '',
  ];
}

function presetsOf(data) {
  const valid = (n) => Number.isInteger(n) && n >= 0;
  const map = new Map();

  for (const p of data.presets ?? []) {
    if (valid(p?.wasm) && valid(p?.js)) map.set(sanitize(p.preset), p);
  }
  return map;
}

function delta(before, after, withPct) {
  const diff = after - before;
  if (diff === 0) return '0';

  const sign = diff > 0 ? '+' : '';
  const icon = diff > 0 ? UP : DOWN;
  let pct = '';

  if (withPct && before > 0) pct = ` (${sign}${((diff / before) * 100).toFixed(1)}%)`;
  return `${sign}${fmt(diff)}${pct} ${icon}`;
}

function fmt(n) {
  return n.toLocaleString('en-US');
}

/** allow only table-safe characters */
function sanitize(s) {
  return String(s ?? '')
    .replace(/[^A-Za-z0-9 ._/+\-@]/g, '')
    .slice(0, 64);
}

function fileSize(file) {
  return fs.existsSync(file) ? fs.statSync(file).size : null;
}

const [cmd, ...args] = process.argv.slice(2);
try {
  if (cmd === 'measure' && args.length === 3) measure(...args);
  else if (cmd === 'report' && args.length === 1) report(args[0]);
  else throw new Error('usage: bundle-size.mjs measure <package> <ref> <outDir> | report <dir>');
} catch (err) {
  console.error(`error: ${err.message}`);
  process.exit(1);
}
