import { beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import ThorVG from '../src/index';
import type { ThorVGNamespace } from '../src/index';

globalThis.__TEST_ENV = 'happy-dom';
globalThis.__RENDERER = 'sw';

const distDir = path.resolve(__dirname, '../dist');

const wasmFetch = globalThis.fetch;
globalThis.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof input === 'string' ? input : input instanceof URL ? input.href : (input as Request).url;
  if (url.endsWith('.wasm')) {
    const filePath = url.replace(/^file:\/\//, '');
    const buf = fs.readFileSync(filePath);
    return new Response(buf, { headers: { 'Content-Type': 'application/wasm' } });
  }
  return wasmFetch(input, init);
}) as typeof fetch;

let TVG: ThorVGNamespace;

beforeAll(async () => {
  TVG = await ThorVG.init({
    locateFile: (p: string) => `file://${path.resolve(distDir, p)}`,
    renderer: 'sw',
  });

  const canvas = document.createElement('canvas');
  canvas.id = 'test-canvas';
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild(canvas);

  Object.defineProperty(window, 'devicePixelRatio', {
    value: 1,
    writable: true,
    configurable: true,
  });

  globalThis.__TVG = TVG;
});

afterAll(() => {
  TVG.term();
});
