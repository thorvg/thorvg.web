import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { Text } from '../src/core/Text';
import { ThorVGError } from '../src/common/errors';
import { TextWrapMode } from '../src/common/constants';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('Text', () => {
  it('constructor creates text', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    expect(text).toBeInstanceOf(Text);
    expect(text.ptr).toBeGreaterThan(0);
  });

  it('text returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.text('Hello');
    expect(result).toBe(text);
  });

  it('fontSize returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.fontSize(24);
    expect(result).toBe(text);
  });

  it('fill with color returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.fill(0, 0, 0);
    expect(result).toBe(text);
  });

  it('fill with gradient returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const gradient = new TVG.LinearGradient(0, 0, 100, 0);
    gradient.addStop(0, [255, 0, 0, 255]).addStop(1, [0, 0, 255, 255]);
    const result = text.fill(gradient);
    expect(result).toBe(text);
  });

  it('align returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.align(0.5, 0.5);
    expect(result).toBe(text);
  });

  it('layout returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.layout(300);
    expect(result).toBe(text);
  });

  it('wrap returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.wrap(TextWrapMode.Word);
    expect(result).toBe(text);
  });

  it('spacing returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.spacing(1.0, 1.5);
    expect(result).toBe(text);
  });

  it('italic returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.italic();
    expect(result).toBe(text);
  });

  it('italic with custom shear returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.italic(0.25);
    expect(result).toBe(text);
  });

  it('outline returns this', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    const result = text.outline(2, 255, 0, 0);
    expect(result).toBe(text);
  });

  it('font with unregistered name throws ThorVGError', () => {
    const TVG = getTVG();
    const text = new TVG.Text();
    expect(() => text.font('default')).toThrow(ThorVGError);
  });
});
