import { describe, it, expect, vi } from 'vitest';
import { Picture } from '../src/core/Picture';
import { getModule } from '../src/interop/module';
import { getTVG, assertNoDoubleFree, assertGCCleanup, canForceGC } from './helpers';


const TEST_SVG = '<svg width="100" height="100"><rect id="target" width="100" height="100" fill="red"/></svg>';
const TEST_RAW = new Uint8Array([255, 255, 255, 255]);

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

  it('load RAW image data returns this', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    const result = picture.load(TEST_RAW, { type: 'raw', width: 1, height: 1, colorSpace: TVG.ColorSpace.ARGB8888 });
    expect(result).toBe(picture);
    const size = picture.size();
    expect(size.width).toBe(1);
    expect(size.height).toBe(1);
  });

  it('load RAW image without height throws', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    expect(() => picture.load(TEST_RAW, { type: 'raw', width: 1 })).toThrow();
  });

  it('filter returns this', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(TEST_RAW, { type: 'raw', width: 1, height: 1, colorSpace: TVG.ColorSpace.ARGB8888 });
    const result = picture.filter(TVG.FilterMethod.Nearest);
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

  it('paint returns null for non-existent id', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    const result = picture.paint(99999);
    expect(result).toBeNull();
  });

  it('paint returns null for non-existent name', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(TEST_SVG, { type: 'svg' });
    const result = picture.paint('missing');
    expect(result).toBeNull();
  });

  it('paint returns an SVG paint', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(TEST_SVG, { type: 'svg' });
    const result = picture.paint('target');
    expect(result).not.toBeNull();
    expect(result?.ptr).toBeGreaterThan(0);
  });

  it('duplicate returns a new Picture', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    picture.load(TEST_SVG, { type: 'svg' });
    const duplicate = picture.duplicate();
    expect(duplicate).toBeInstanceOf(Picture);
    expect(duplicate).not.toBe(picture);
  });

  it('resolver returns this', () => {
    const TVG = getTVG();
    const picture = new TVG.Picture();
    const resolver = () => false;
    expect(picture.resolver(resolver)).toBe(picture);
    expect(picture.resolver(null)).toBe(picture);
  });

  it('replacing a resolver removes the previous callback', () => {
    const TVG = getTVG();
    const module = getModule();
    const picture = new TVG.Picture();
    const removeFunction = vi.spyOn(module, 'removeFunction');
    try {
      picture.resolver(() => false);
      picture.resolver(() => true);
      expect(removeFunction).toHaveBeenCalledTimes(1);
    } finally {
      removeFunction.mockRestore();
      picture.dispose();
    }
  });

  it('dispose + GC should not double-free', () => {
    const TVG = getTVG();
    assertNoDoubleFree(() => new TVG.Picture());
  });

  it.skipIf(!canForceGC)('unreferenced picture is cleaned up by GC', async () => {
    const TVG = getTVG();
    await assertGCCleanup(() => new TVG.Picture());
  });
});
