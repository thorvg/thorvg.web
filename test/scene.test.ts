import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { Scene } from '../src/core/Scene';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('Scene', () => {
  it('constructor creates a scene', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    expect(scene).toBeInstanceOf(Scene);
    expect(scene.ptr).toBeGreaterThan(0);
  });

  it('add returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    const result = scene.add(shape);
    expect(result).toBe(scene);
  });

  it('remove specific paint returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    scene.add(shape);
    const result = scene.remove(shape);
    expect(result).toBe(scene);
  });

  it('remove all returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    scene.add(shape);
    const result = scene.remove();
    expect(result).toBe(scene);
  });

  it('clear returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const result = scene.clear();
    expect(result).toBe(scene);
  });

  it('gaussianBlur returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    scene.add(shape);
    const result = scene.gaussianBlur(2);
    expect(result).toBe(scene);
  });

  it('dropShadow returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    scene.add(shape);
    const result = scene.dropShadow(128, 128, 128, 200, 45, 5, 2);
    expect(result).toBe(scene);
  });

  it('fillEffect returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    scene.add(shape);
    const result = scene.fillEffect(255, 0, 0, 128);
    expect(result).toBe(scene);
  });

  it('tint returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    scene.add(shape);
    const result = scene.tint(0, 0, 0, 255, 255, 255, 50);
    expect(result).toBe(scene);
  });

  it('tritone returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 50, 50).fill(255, 0, 0, 255);
    scene.add(shape);
    const result = scene.tritone(0, 0, 128, 128, 128, 128, 255, 255, 0, 128);
    expect(result).toBe(scene);
  });

  it('resetEffects returns this', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    const result = scene.resetEffects();
    expect(result).toBe(scene);
  });

  it('inherits Paint methods', () => {
    const TVG = getTVG();
    const scene = new TVG.Scene();
    expect(scene.translate(50, 50)).toBe(scene);
    expect(scene.rotate(45)).toBe(scene);
    expect(scene.scale(2)).toBe(scene);
  });
});
