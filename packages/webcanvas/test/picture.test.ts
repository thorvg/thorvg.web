import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { Picture } from '../src/core/Picture';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

const TEST_SVG = '<svg width="100" height="100"><rect width="100" height="100" fill="red"/></svg>';

describe('Picture', () => {
  it('constructor creates a picture', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    expect(picture).toBeInstanceOf(Picture);
    expect(picture.ptr).toBeGreaterThan(0);
  });

  it('load SVG string returns this', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    const result = picture.load(TEST_SVG, { type: 'svg' });
    expect(result).toBe(picture);
  });

  it('load Uint8Array returns this', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    const data = new TextEncoder().encode(TEST_SVG);
    const result = picture.load(data, { type: 'svg' });
    expect(result).toBe(picture);
  });

  it('size getter returns dimensions', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(TEST_SVG, { type: 'svg' });
    const size = picture.size();
    expect(size).toHaveProperty('width');
    expect(size).toHaveProperty('height');
    expect(size.width).toBe(100);
    expect(size.height).toBe(100);
  });

  it('size setter returns this', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(TEST_SVG, { type: 'svg' });
    const result = picture.size(200, 200);
    expect(result).toBe(picture);
  });

  it('inherits Paint methods', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    expect(picture.translate(50, 50)).toBe(picture);
    expect(picture.rotate(45)).toBe(picture);
  });
});
