import { describe, expect, it } from 'vitest';
import { LottieAnimation } from '../src/core/LottieAnimation';
import { assertGCCleanup, assertNoDoubleFree, canForceGC, getTVG } from './helpers';
import lottieJson from './resources/lottie.json';

const TEST_LOTTIE = JSON.stringify(lottieJson);

const TEST_LOTTIE_SLOT = {
  test_color: { p: { a: 0, k: [0, 1, 0, 1] } },
};

describe('LottieAnimation', () => {
  it('constructor creates a lottie animation', () => {
    const TVG = getTVG();
    const lottie = new TVG.LottieAnimation();
    expect(lottie).toBeInstanceOf(LottieAnimation);
    expect(lottie.ptr).toBeGreaterThan(0);
  });

  it('load string returns this', () => {
    const TVG = getTVG();
    const lottie = new TVG.LottieAnimation();
    expect(lottie.load(TEST_LOTTIE)).toBe(lottie);
  });

  it('load with invalid string throws', () => {
    const TVG = getTVG();
    const lottie = new TVG.LottieAnimation();
    expect(() => lottie.load('{ invalid string }')).toThrow();
  });

  it('load Uint8Array returns this', () => {
    const TVG = getTVG();
    const lottie = new TVG.LottieAnimation();
    const testLottieBytes = new TextEncoder().encode(TEST_LOTTIE);
    const result = lottie.load(testLottieBytes);
    expect(result).toBe(lottie);
  });

  it('load with invalid bytes throws', () => {
    const TVG = getTVG();
    const lottie = new TVG.LottieAnimation();
    const invalidLottieBytes = new TextEncoder().encode('not a lottie');
    expect(() => lottie.load(invalidLottieBytes)).toThrow();
  });

  it('generate lottie slot data returns non zero number', () => {
    const TVG = getTVG();
    const lottie = new TVG.LottieAnimation();
    lottie.load(TEST_LOTTIE);
    const slotId = lottie.gen(TEST_LOTTIE_SLOT);
    expect(slotId).toBeGreaterThan(0);
  });

  it('apply slot returns this', () => {
    const TVG = getTVG();
    const lottie = new TVG.LottieAnimation();
    lottie.load(TEST_LOTTIE);
    const slotId = lottie.gen(TEST_LOTTIE_SLOT);
    expect(slotId).toBeGreaterThan(0);
    expect(lottie.apply(slotId)).toBe(lottie);
  });

  it('deleting slot returns this', () => {
    const TVG = getTVG();
    const lottie = new TVG.LottieAnimation();
    lottie.load(TEST_LOTTIE);
    const slotId = lottie.gen(TEST_LOTTIE_SLOT);
    expect(slotId).toBeGreaterThan(0);
    expect(lottie.del(slotId)).toBe(lottie);
  });

  it('dispose + GC should not double-free', () => {
    const TVG = getTVG();
    assertNoDoubleFree(() => new TVG.LottieAnimation());
  });

  it.skipIf(!canForceGC)('unreferenced animation is cleaned up by GC', async () => {
    const TVG = getTVG();
    await assertGCCleanup(() => new TVG.LottieAnimation());
  });
});
