import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { Canvas } from '../src/core/Canvas';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('Canvas', () => {
  let canvas: Canvas;

  beforeAll(() => {
    const TVG = getTVG();
    canvas = new TVG.Canvas('#test-canvas', { width: 400, height: 300 });
  });

  afterAll(() => {
    canvas.destroy();
  });

  it('constructor creates canvas', () => {
    expect(canvas).toBeInstanceOf(Canvas);
  });

  it('renderer returns sw', () => {
    expect(canvas.renderer).toBe('sw');
  });

  it('dpr returns a number', () => {
    expect(typeof canvas.dpr).toBe('number');
  });

  it('add returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    const result = canvas.add(shape);
    expect(result).toBe(canvas);
  });

  it('remove returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 30, 30).fill(0, 255, 0, 255);
    canvas.add(shape);
    const result = canvas.remove(shape);
    expect(result).toBe(canvas);
  });

  it('update returns this', () => {
    const result = canvas.update();
    expect(result).toBe(canvas);
  });

  it('resize returns this', () => {
    const result = canvas.resize(1024, 768);
    expect(result).toBe(canvas);
  });

  it('viewport returns this', () => {
    const result = canvas.viewport(0, 0, 400, 300);
    expect(result).toBe(canvas);
  });
});
