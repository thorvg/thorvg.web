import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('Accessor', () => {
  it('id returns a consistent hash for the same name', () => {
    const TVG = getTVG();
    const id1 = TVG.Accessor.id('star');
    const id2 = TVG.Accessor.id('star');
    expect(id1).toBe(id2);
    expect(id1).toBeGreaterThan(0);
  });

  it('id returns different hashes for different names', () => {
    const TVG = getTVG();
    const id1 = TVG.Accessor.id('star');
    const id2 = TVG.Accessor.id('circle');
    expect(id1).not.toBe(id2);
  });
});
