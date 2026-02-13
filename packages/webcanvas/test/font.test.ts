import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { ThorVGError } from '../src/common/errors';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('Font', () => {
  it('load with empty data throws', () => {
    const TVG = getTVG();
    expect(() => TVG.Font.load('test-font', new Uint8Array(0))).toThrow();
  });

  it('unload non-existent font throws ThorVGError', () => {
    const TVG = getTVG();
    expect(() => TVG.Font.unload('nonexistent')).toThrow(ThorVGError);
  });
});
