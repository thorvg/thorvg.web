import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { OffscreenSurface } from '../src/core/surface/OffscreenSurface';
import { getModule } from '../src/interop/module';


const isHappyDom = () => globalThis.__TEST_ENV === 'happy-dom';

describe('OffscreenSurface', () => {
  let canvas: OffscreenCanvas;
  let surface: OffscreenSurface;

  beforeEach(() => {
    canvas = new OffscreenCanvas(100, 50);
    surface = new OffscreenSurface(canvas);
  });

  afterEach(() => {
    surface.dispose();
  });

  it('constructor registers the provided canvas', () => {
    expect(getModule().specialHTMLTargets[surface.key]).toBe(canvas);
  });

  it('resize sets physical dimensions', () => {
    surface.resize(100, 50, 200, 120);
    expect(canvas.width).toBe(200);
    expect(canvas.height).toBe(120);
  });

  it.skipIf(isHappyDom())('present draws the supplied pixels at the origin', () => {
    const pixels = [255, 0, 0, 255, 0, 255, 0, 255,];
    surface.present(new Uint8Array(pixels), 2, 1);
    const context = canvas.getContext('2d')!;
    const imageData = context.getImageData(0, 0, 2, 1);
    expect(Array.from(imageData.data)).toEqual(pixels);
  });

  it.skipIf(isHappyDom())('clear removes all pixels from the canvas', () => {
    const context = canvas.getContext('2d')!;
    context.fillRect(0, 0, canvas.width, canvas.height);
    expect(context.getImageData(99, 49, 1, 1).data[3]).toBe(255);
    surface.clear();
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    expect(imageData.data.every((value) => value === 0)).toBe(true);
  });
});
