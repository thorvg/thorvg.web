import { beforeAll, afterAll } from 'vitest';
import path from 'path';
import ThorVG from '../src/index';
import type { ThorVGNamespace } from '../src/index';

globalThis.__TEST_ENV = 'happy-dom';
globalThis.__RENDERER = 'sw';

const distDir = path.resolve(__dirname, '../dist');

let TVG: ThorVGNamespace;

beforeAll(async () => {
  TVG = await ThorVG.init({
    locateFile: (p: string) => path.resolve(distDir, p),
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
