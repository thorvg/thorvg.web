import { describe, it, expect } from 'vitest';
import { getTVG } from './helpers';
import { ThorVGError } from '../src/common/errors';


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
