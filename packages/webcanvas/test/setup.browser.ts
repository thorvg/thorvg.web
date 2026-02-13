import { beforeAll, afterAll } from 'vitest';
import ThorVG from '../src/index';
import type { ThorVGNamespace } from '../src/index';
import wasmUrl from '../dist/thorvg.wasm?url';

declare const __TEST_RENDERER: 'wg' | 'gl';

const renderer = typeof __TEST_RENDERER !== 'undefined' ? __TEST_RENDERER : 'wg';

(globalThis as any).__TEST_ENV = 'browser';
(globalThis as any).__RENDERER = renderer;

let TVG: ThorVGNamespace;

beforeAll(async () => {
  TVG = await ThorVG.init({
    locateFile: () => wasmUrl,
    renderer,
  });

  const canvas = document.createElement('canvas');
  canvas.id = 'test-canvas';
  canvas.width = 800;
  canvas.height = 600;
  document.body.appendChild(canvas);

  (globalThis as any).__TVG = TVG;
});

afterAll(() => {
  TVG.term();
});
