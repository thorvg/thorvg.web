import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import type { Canvas } from '../src/core/Canvas';
import type { Animation } from '../src/core/Animation';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

const isHappyDom = () => (globalThis as any).__TEST_ENV === 'happy-dom';
const canRender = () => !isHappyDom();
const canCheckPixels = () => !isHappyDom() && (globalThis as any).__RENDERER === 'sw';

function hasPixels(el: HTMLCanvasElement): boolean {
  const ctx = el.getContext('2d');
  if (!ctx) return false;
  const { data } = ctx.getImageData(0, 0, el.width, el.height);
  return data.some(v => v > 0);
}

function snapshotPixels(el: HTMLCanvasElement): Uint8ClampedArray {
  const ctx = el.getContext('2d')!;
  return Uint8ClampedArray.from(ctx.getImageData(0, 0, el.width, el.height).data);
}

const TEST_SVG = '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100"><rect width="100" height="100" fill="red"/></svg>';
const LOTTIE_VISIBLE = JSON.stringify({
  v: '5.0.0', fr: 30, ip: 0, op: 30, w: 100, h: 100,
  layers: [{
    ty: 4, ind: 1, ip: 0, op: 30, st: 0, ks: {}, ao: 0,
    shapes: [
      { ty: 'rc', p: { a: 0, k: [50, 50] }, s: { a: 0, k: [100, 100] }, r: { a: 0, k: 0 } },
      { ty: 'fl', o: { a: 0, k: 100 }, c: { a: 0, k: [1, 0, 0, 1] } },
    ],
  }],
});

let canvasCounter = 0;

interface TestCanvas {
  id: string;
  el: HTMLCanvasElement;
  tvg: Canvas;
}

function createTestCanvas(): TestCanvas {
  const TVG = getTVG();
  const id = `tvg-render-${canvasCounter++}`;
  const el = document.createElement('canvas');
  el.id = id;
  el.width = 100;
  el.height = 100;
  document.body.appendChild(el);
  const tvg = new TVG.Canvas(`#${id}`, { width: 100, height: 100 });
  return { id, el, tvg };
}

function destroyTestCanvas({ id, tvg }: TestCanvas): void {
  tvg.destroy();
  document.getElementById(id)?.remove();
}

describe('Shape renders to canvas', () => {
  let tc: TestCanvas;

  beforeAll(() => { tc = createTestCanvas(); });
  afterAll(() => destroyTestCanvas(tc));

  it.skipIf(!canRender())('add(shape).render() completes without error', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100).fill(255, 0, 0, 255);
    expect(() => tc.tvg.add(shape).render()).not.toThrow();
  });

  it.skipIf(!canCheckPixels())('render writes non-zero pixels to canvas', () => {
    expect(hasPixels(tc.el)).toBe(true);
  });
});


describe('SVG Picture renders to canvas', () => {
  let tc: TestCanvas;

  beforeAll(() => { tc = createTestCanvas(); });
  afterAll(() => destroyTestCanvas(tc));

  it.skipIf(!canRender())('add(svgPicture).render() completes without error', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(TEST_SVG, { type: 'svg' }).size(100, 100);
    expect(() => tc.tvg.add(picture).render()).not.toThrow();
  });

  it.skipIf(!canCheckPixels())('SVG render writes non-zero pixels to canvas', () => {
    expect(hasPixels(tc.el)).toBe(true);
  });
});


describe('Animation primary flow renders to canvas', () => {
  let tc: TestCanvas;
  let anim: Animation;

  beforeAll(() => {
    const TVG = getTVG();
    tc = createTestCanvas();
    anim = new TVG.Animation();
    anim.load(LOTTIE_VISIBLE);
    anim.picture!.size(100, 100);
    tc.tvg.add(anim.picture!);
  });

  afterAll(() => {
    destroyTestCanvas(tc);
    anim.dispose();
  });

  it.skipIf(!canRender())('Animation.load() → canvas.add(picture).update().render() completes without error', () => {
    expect(() => tc.tvg.update().render()).not.toThrow();
  });

  it('info() reflects loaded animation metadata', () => {
    const info = anim.info();
    expect(info).not.toBeNull();
    expect(info!.totalFrames).toBe(30);
    expect(info!.fps).toBeGreaterThan(0);
    expect(info!.duration).toBeGreaterThan(0);
  });

  it.skipIf(!canCheckPixels())('animation render writes non-zero pixels to canvas', () => {
    expect(hasPixels(tc.el)).toBe(true);
  });
});


describe('Scene containing Shape renders to canvas', () => {
  let tc: TestCanvas;

  beforeAll(() => { tc = createTestCanvas(); });
  afterAll(() => destroyTestCanvas(tc));

  it.skipIf(!canRender())('add(scene).render() completes without error', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100).fill(0, 0, 255, 255);
    scene.add(shape);
    expect(() => tc.tvg.add(scene).render()).not.toThrow();
  });

  it.skipIf(!canCheckPixels())('scene render writes non-zero pixels to canvas', () => {
    expect(hasPixels(tc.el)).toBe(true);
  });
});


describe('Animation and SVG Picture co-render on shared canvas', () => {
  let tc: TestCanvas;
  let anim: Animation;

  beforeAll(() => {
    const TVG = getTVG();
    tc = createTestCanvas();

    anim = new TVG.Animation();
    anim.load(LOTTIE_VISIBLE);
    anim.picture!.size(50, 100).translate(0, 0);

    const svgPicture = new TVG.Picture();
    svgPicture.load(TEST_SVG, { type: 'svg' }).size(50, 100).translate(50, 0);

    tc.tvg.add(anim.picture!).add(svgPicture);
  });

  afterAll(() => {
    destroyTestCanvas(tc);
    anim.dispose();
  });

  it.skipIf(!canRender())('add(animation, svgPicture).update().render() completes without error', () => {
    expect(() => tc.tvg.update().render()).not.toThrow();
  });

  it.skipIf(!canCheckPixels())('co-render of animation and SVG picture produces pixels', () => {
    expect(hasPixels(tc.el)).toBe(true);
  });
});


describe('Re-render after transform change produces different pixels', () => {
  let tc: TestCanvas;
  let anim: Animation;

  beforeAll(() => {
    const TVG = getTVG();
    tc = createTestCanvas();
    anim = new TVG.Animation();
    anim.load(LOTTIE_VISIBLE);
    tc.tvg.add(anim.picture!);
  });

  afterAll(() => {
    destroyTestCanvas(tc);
    anim.dispose();
  });

  it.skipIf(!canCheckPixels())('pixel output differs after translate', () => {
    // Render with picture covering only the left half
    anim.picture!.size(50, 100).translate(0, 0);
    tc.tvg.update().render();
    const snapLeft = snapshotPixels(tc.el);

    // Re-render with picture moved to the right half
    anim.picture!.size(50, 100).translate(50, 0);
    tc.tvg.update().render();
    const snapRight = snapshotPixels(tc.el);

    expect(snapLeft.some((v, i) => v !== snapRight[i])).toBe(true);
  });
});


describe('Error paths', () => {
  it('animation.load with invalid data throws ThorVGError', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(() => anim.load('{ not valid lottie }')).toThrow();
    anim.dispose();
  });

  it('picture.load with empty string throws', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    expect(() => picture.load('', { type: 'svg' })).toThrow();
    picture.dispose();
  });
});
