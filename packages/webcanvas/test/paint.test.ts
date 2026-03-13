import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('Paint', () => {
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
