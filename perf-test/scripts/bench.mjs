#!/usr/bin/env node

/**
 * Headless benchmark runner for ThorVG perf-test.
 *
 * Usage:
 *   yarn bench                          # defaults: sw renderer, 20 anims, 150px
 *   yarn bench --renderer gl --count 50 --size 200
 *   yarn bench --renderer sw --count 100 --json   # JSON output only
 *   yarn bench --seed <base64>                     # reproducible set
 *   yarn bench --url http://localhost:3000         # skip server start
 *
 * Requires: playwright (npx playwright install chromium)
 */

import { chromium } from 'playwright';
import { execSync, spawn } from 'child_process';
import http from 'http';

function parseArgs() {
  const args = process.argv.slice(2);
  const opts = {
    renderer: 'sw',
    count: 20,
    size: 150,
    seed: '',
    json: false,
    url: '',
    warmup: 3000,
    measure: 10000,
    timeout: 120_000,
  };

  for (let i = 0; i < args.length; i++) {
    const a = args[i];
    if (a === '--renderer' || a === '-r') opts.renderer = args[++i];
    else if (a === '--count' || a === '-c') opts.count = Number(args[++i]);
    else if (a === '--size' || a === '-s') opts.size = Number(args[++i]);
    else if (a === '--seed') opts.seed = args[++i];
    else if (a === '--json') opts.json = true;
    else if (a === '--url') opts.url = args[++i];
    else if (a === '--warmup') opts.warmup = Number(args[++i]);
    else if (a === '--measure') opts.measure = Number(args[++i]);
    else if (a === '--timeout') opts.timeout = Number(args[++i]);
    else if (a === '--help' || a === '-h') {
      console.log(`
Usage: yarn bench [options]

Options:
  --renderer, -r <sw|gl|wg>  Renderer (default: sw)
  --count, -c <n>             Number of animations (default: 20)
  --size, -s <px>             Animation size in pixels (default: 150)
  --seed <base64>             Reproducible animation set
  --json                      Output JSON only (for CI parsing)
  --url <url>                 Connect to running server (skip build/start)
  --warmup <ms>               Warmup duration (default: 3000)
  --measure <ms>              Measure duration (default: 10000)
  --timeout <ms>              Max wall-clock time (default: 120000)
  --help, -h                  Show this help
`);
      process.exit(0);
    }
  }

  return opts;
}

// ── Server management ─────────────────────────────────────────────────────────

function waitForServer(url, timeoutMs = 60_000) {
  return new Promise((resolve, reject) => {
    const deadline = Date.now() + timeoutMs;

    const check = () => {
      if (Date.now() > deadline) return reject(new Error('Server start timed out'));
      http.get(url, (res) => {
        res.resume();
        if (res.statusCode >= 200 && res.statusCode < 400) resolve();
        else setTimeout(check, 500);
      }).on('error', () => setTimeout(check, 500));
    };
    check();
  });
}

async function startServer() {
  // Build first
  console.error('[bench] Building Next.js app…');
  execSync('yarn build', { stdio: 'inherit', cwd: process.cwd() });

  console.error('[bench] Starting server on port 3456…');
  const server = spawn('yarn', ['start', '-p', '3456'], {
    stdio: ['ignore', 'pipe', 'pipe'],
    cwd: process.cwd(),
  });

  server.stdout.on('data', () => {}); // drain
  server.stderr.on('data', () => {}); // drain

  await waitForServer('http://localhost:3456');
  console.error('[bench] Server ready.');
  return { url: 'http://localhost:3456', process: server };
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  const opts = parseArgs();
  let serverProc = null;
  let baseUrl = opts.url;

  try {
    // Start server if needed
    if (!baseUrl) {
      const srv = await startServer();
      baseUrl = srv.url;
      serverProc = srv.process;
    }

    // Build page URL
    const params = new URLSearchParams({
      renderer: opts.renderer,
      count: String(opts.count),
      size: String(opts.size),
      autorun: '1',
    });
    if (opts.seed) params.set('seed', opts.seed);

    const pageUrl = `${baseUrl}/?${params}`;
    if (!opts.json) console.error(`[bench] Opening ${pageUrl}`);

    // Launch browser
    const browser = await chromium.launch({
      args: [
        '--disable-gpu',
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
      ],
    });

    const context = await browser.newContext({
      viewport: { width: 1280, height: 900 },
    });

    const page = await context.newPage();

    // Silence console noise in JSON mode
    if (!opts.json) {
      page.on('console', (msg) => {
        if (msg.type() === 'error') console.error(`[page] ${msg.text()}`);
      });
    }

    page.on('pageerror', (err) => {
      console.error(`[page error] ${err.message}`);
    });

    await page.goto(pageUrl, { waitUntil: 'networkidle', timeout: 60_000 });

    if (!opts.json) console.error('[bench] Page loaded, waiting for benchmark to complete…');

    // Wait for __BENCH_RESULT to appear
    const result = await page.waitForFunction(
      () => (window).__BENCH_RESULT,
      { timeout: opts.timeout },
    );

    const benchResult = await result.jsonValue();

    // Output
    if (opts.json) {
      console.log(JSON.stringify(benchResult, null, 2));
    } else {
      // Format a human-readable report
      const r = benchResult;
      const lines = [
        '',
        'ThorVG Perf Benchmark',
        '─'.repeat(40),
        `Renderer:   ${r.renderer.toUpperCase()}`,
        `Version:    ${r.version}`,
        `Count:      ${r.count} animations`,
        `Size:       ${r.size}px`,
        `Seed:       ${r.seed}`,
        '',
        `Warmup: ${r.warmupMs / 1000}s  |  Measure: ${r.measureMs / 1000}s  |  Frames: ${r.totalFrames}`,
        '',
        `FPS (avg):  ${r.fps}`,
        '',
        'Frame Time (ms)',
        `  avg:  ${r.frameTime.avg.toFixed(2)}`,
        `  min:  ${r.frameTime.min.toFixed(2)}`,
        `  max:  ${r.frameTime.max.toFixed(2)}`,
        `  p95:  ${r.frameTime.p95.toFixed(2)}`,
      ];
      if (r.memory) {
        lines.push('', 'Memory (MB)', `  avg:  ${r.memory.avg.toFixed(1)}`, `  peak: ${r.memory.peak.toFixed(1)}`);
      }
      lines.push('─'.repeat(40), '');
      console.log(lines.join('\n'));
    }

    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error(`[bench] Error: ${err.message}`);
    process.exit(1);
  } finally {
    if (serverProc) {
      serverProc.kill('SIGTERM');
    }
  }
}

main();
