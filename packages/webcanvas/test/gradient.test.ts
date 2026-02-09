import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { LinearGradient } from '../src/core/LinearGradient';
import { RadialGradient } from '../src/core/RadialGradient';
import { GradientSpread } from '../src/common/constants';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('LinearGradient', () => {
  it('constructor creates gradient', () => {
    const TVG = getTVG();
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    expect(gradient).toBeInstanceOf(LinearGradient);
    expect(gradient.ptr).toBeGreaterThan(0);
  });

  it('addStop returns this', () => {
    const TVG = getTVG();
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    const result = gradient.addStop(0, [255, 0, 0, 255]);
    expect(result).toBe(gradient);
  });

  it('addStop chains multiple stops', () => {
    const TVG = getTVG();
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    const result = gradient
      .addStop(0, [255, 0, 0, 255])
      .addStop(0.5, [0, 255, 0, 255])
      .addStop(1, [0, 0, 255, 255]);
    expect(result).toBe(gradient);
  });

  it('setStops returns this', () => {
    const TVG = getTVG();
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    const result = gradient.setStops(
      [0, [255, 0, 0, 255]],
      [1, [0, 0, 255, 255]],
    );
    expect(result).toBe(gradient);
  });

  it('clearStops returns this', () => {
    const TVG = getTVG();
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    gradient.addStop(0, [255, 0, 0, 255]);
    const result = gradient.clearStops();
    expect(result).toBe(gradient);
  });

  it('spread returns this', () => {
    const TVG = getTVG();
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    const result = gradient.spread(GradientSpread.Reflect);
    expect(result).toBe(gradient);
  });

  it('build applies stops and returns this', () => {
    const TVG = getTVG();
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    const result = gradient
      .addStop(0, [255, 0, 0, 255])
      .addStop(1, [0, 0, 255, 255])
      .build();
    expect(result).toBe(gradient);
  });

  it('dispose cleans up', () => {
    const TVG = getTVG();
    const gradient = new TVG.LinearGradient(0, 0, 100, 100);
    expect(gradient.isDisposed).toBe(false);
    gradient.dispose();
    expect(gradient.isDisposed).toBe(true);
  });
});

describe('RadialGradient', () => {
  it('constructor creates gradient', () => {
    const TVG = getTVG();
    const gradient = new TVG.RadialGradient(50, 50, 50);
    expect(gradient).toBeInstanceOf(RadialGradient);
    expect(gradient.ptr).toBeGreaterThan(0);
  });

  it('constructor with focal point', () => {
    const TVG = getTVG();
    expect(() => new TVG.RadialGradient(50, 50, 50, 30, 30, 0)).not.toThrow();
  });

  it('addStop + build chains', () => {
    const TVG = getTVG();
    const gradient = new TVG.RadialGradient(50, 50, 50);
    const result = gradient
      .addStop(0, [255, 255, 255, 255])
      .addStop(1, [0, 0, 0, 255])
      .build();
    expect(result).toBe(gradient);
  });

  it('spread returns this', () => {
    const TVG = getTVG();
    const gradient = new TVG.RadialGradient(50, 50, 50);
    const result = gradient.spread(GradientSpread.Repeat);
    expect(result).toBe(gradient);
  });
});
