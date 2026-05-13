import { describe, it, expect } from 'vitest';
import { getTVG } from './helpers';
import { Paint } from '../src/index';


describe('Paint', () => {
  it('is exported from namespace', () => {
    const TVG = getTVG();
    expect(TVG.Paint).toBeDefined();
  });

  it('Shape is instanceof Paint via namespace', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    expect(shape).toBeInstanceOf(TVG.Paint);
  });

  it('Scene is instanceof Paint via namespace', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    expect(scene).toBeInstanceOf(TVG.Paint);
  });

  it('Shape is instanceof Paint via named export', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    expect(shape).toBeInstanceOf(Paint);
  });

  it('id returns 0 by default', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    expect(shape.id).toBe(0);
  });

  it('id setter with number', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.id = 42;
    expect(shape.id).toBe(42);
  });

  it('id setter with string', () => {
    const TVG = getTVG();
    const shape = new TVG.Shape();
    shape.id = 'star';
    const expected = TVG.Accessor.id('star');
    expect(shape.id).toBe(expected);
  });
});
