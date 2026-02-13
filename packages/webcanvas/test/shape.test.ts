import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { Shape } from '../src/core/Shape';
import { FillRule, BlendMethod, MaskMethod, StrokeCap, StrokeJoin } from '../src/common/constants';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('Shape', () => {
  it('constructor creates a shape', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    expect(shape).toBeInstanceOf(Shape);
    expect(shape.ptr).toBeGreaterThan(0);
  });

  it('appendRect returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.appendRect(0, 0, 100, 100);
    expect(result).toBe(shape);
  });

  it('appendRect with rounded corners', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    expect(() => shape.appendRect(0, 0, 100, 100, { rx: 10, ry: 10 })).not.toThrow();
  });

  it('appendCircle returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.appendCircle(50, 50, 50);
    expect(result).toBe(shape);
  });

  it('appendCircle with different radii', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    expect(() => shape.appendCircle(50, 50, 80, 40)).not.toThrow();
  });

  it('path commands chain correctly', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape
      .moveTo(10, 20)
      .lineTo(100, 200)
      .cubicTo(10, 20, 30, 40, 50, 60)
      .close();
    expect(result).toBe(shape);
  });

  it('fill with color returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100);
    const result = shape.fill(255, 0, 0, 255);
    expect(result).toBe(shape);
  });

  it('fill with gradient', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100);
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    gradient.addStop(0, [255, 0, 0, 255]).addStop(1, [0, 0, 255, 255]);
    expect(() => shape.fill(gradient)).not.toThrow();
  });

  it('stroke with width returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100);
    const result = shape.stroke(3);
    expect(result).toBe(shape);
  });

  it('stroke with options', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100);
    const result = shape.stroke({
      width: 5,
      color: [0, 0, 255, 255],
      cap: StrokeCap.Round,
      join: StrokeJoin.Round,
    });
    expect(result).toBe(shape);
  });

  it('stroke with dash pattern', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100);
    expect(() => shape.stroke({ width: 2, dash: [10, 5] })).not.toThrow();
  });

  it('fillRule returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.fillRule(FillRule.EvenOdd);
    expect(result).toBe(shape);
  });

  it('trimPath returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendCircle(50, 50, 50);
    const result = shape.trimPath(0, 0.5);
    expect(result).toBe(shape);
  });

  it('reset returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100);
    const result = shape.reset();
    expect(result).toBe(shape);
  });
});

describe('Paint (via Shape)', () => {
  it('translate returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.translate(50, 50);
    expect(result).toBe(shape);
  });

  it('rotate returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.rotate(45);
    expect(result).toBe(shape);
  });

  it('scale uniform returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.scale(2);
    expect(result).toBe(shape);
  });

  it('scale non-uniform returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.scale(2, 3);
    expect(result).toBe(shape);
  });

  it('opacity setter returns this, getter returns number', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.opacity(128);
    expect(result).toBe(shape);
    const value = shape.opacity();
    expect(typeof value).toBe('number');
  });

  it('visible setter returns this, getter returns boolean', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.visible(false);
    expect(result).toBe(shape);
    const value = shape.visible();
    expect(typeof value).toBe('boolean');
    expect(value).toBe(false);
  });

  it('bounds returns Bounds object', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(10, 20, 100, 50);
    const bounds = shape.bounds();
    expect(bounds).toHaveProperty('x');
    expect(bounds).toHaveProperty('y');
    expect(bounds).toHaveProperty('width');
    expect(bounds).toHaveProperty('height');
  });

  it('bounds oriented returns Point array', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100);
    const points = shape.bounds({ oriented: true });
    expect(Array.isArray(points)).toBe(true);
  });

  it('origin returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.origin(50, 50);
    expect(result).toBe(shape);
  });

  it('blend returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.blend(BlendMethod.Normal);
    expect(result).toBe(shape);
  });

  it('duplicate returns a new Shape', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 100, 100).fill(255, 0, 0, 255);
    const dup = shape.duplicate();
    expect(dup).toBeInstanceOf(Shape);
    expect(dup).not.toBe(shape);
  });

  it('transform returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    const result = shape.transform({
      e11: 1, e12: 0, e13: 0,
      e21: 0, e22: 1, e23: 0,
      e31: 0, e32: 0, e33: 1,
    });
    expect(result).toBe(shape);
  });

  it('clip returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 200, 200);
    const clipper = new TVG.Shape();
    clipper.appendCircle(100, 100, 50);
    const result = shape.clip(clipper);
    expect(result).toBe(shape);
  });

  it('mask returns this', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 200, 200);
    const maskShape = new TVG.Shape();
    maskShape.appendCircle(100, 100, 50).fill(255, 255, 255, 255);
    const result = shape.mask(maskShape, MaskMethod.Alpha);
    expect(result).toBe(shape);
  });

  it('intersects returns boolean', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.appendRect(50, 50, 100, 100);
    const result = shape.intersects(0, 0, 200, 200);
    expect(typeof result).toBe('boolean');
  });

  it('dispose sets isDisposed', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    expect(shape.isDisposed).toBe(false);
    shape.dispose();
    expect(shape.isDisposed).toBe(true);
  });
});
