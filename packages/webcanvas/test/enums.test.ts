import { describe, it, expect } from 'vitest';
import {
  BlendMethod,
  StrokeCap,
  StrokeJoin,
  FillRule,
  GradientSpread,
  MaskMethod,
  SceneEffect,
  TextWrapMode,
  ColorSpace,
} from '../src/common/constants';

describe('BlendMethod', () => {
  it('has correct values', () => {
    expect(BlendMethod.Normal).toBe(0);
    expect(BlendMethod.Multiply).toBe(1);
    expect(BlendMethod.Screen).toBe(2);
    expect(BlendMethod.Overlay).toBe(3);
    expect(BlendMethod.Darken).toBe(4);
    expect(BlendMethod.Lighten).toBe(5);
    expect(BlendMethod.ColorDodge).toBe(6);
    expect(BlendMethod.ColorBurn).toBe(7);
    expect(BlendMethod.HardLight).toBe(8);
    expect(BlendMethod.SoftLight).toBe(9);
    expect(BlendMethod.Difference).toBe(10);
    expect(BlendMethod.Exclusion).toBe(11);
    expect(BlendMethod.Hue).toBe(12);
    expect(BlendMethod.Saturation).toBe(13);
    expect(BlendMethod.Color).toBe(14);
    expect(BlendMethod.Luminosity).toBe(15);
    expect(BlendMethod.Add).toBe(16);
  });
});

describe('StrokeCap', () => {
  it('has correct values', () => {
    expect(StrokeCap.Butt).toBe(0);
    expect(StrokeCap.Round).toBe(1);
    expect(StrokeCap.Square).toBe(2);
  });
});

describe('StrokeJoin', () => {
  it('has correct values', () => {
    expect(StrokeJoin.Miter).toBe(0);
    expect(StrokeJoin.Round).toBe(1);
    expect(StrokeJoin.Bevel).toBe(2);
  });
});

describe('FillRule', () => {
  it('has correct values', () => {
    expect(FillRule.Winding).toBe(0);
    expect(FillRule.EvenOdd).toBe(1);
  });
});

describe('GradientSpread', () => {
  it('has correct values', () => {
    expect(GradientSpread.Pad).toBe(0);
    expect(GradientSpread.Reflect).toBe(1);
    expect(GradientSpread.Repeat).toBe(2);
  });
});

describe('MaskMethod', () => {
  it('has correct values', () => {
    expect(MaskMethod.None).toBe(0);
    expect(MaskMethod.Alpha).toBe(1);
    expect(MaskMethod.InvAlpha).toBe(2);
    expect(MaskMethod.Luma).toBe(3);
    expect(MaskMethod.InvLuma).toBe(4);
    expect(MaskMethod.Add).toBe(5);
    expect(MaskMethod.Subtract).toBe(6);
    expect(MaskMethod.Intersect).toBe(7);
    expect(MaskMethod.Difference).toBe(8);
    expect(MaskMethod.Lighten).toBe(9);
    expect(MaskMethod.Darken).toBe(10);
  });
});

describe('SceneEffect', () => {
  it('has correct values', () => {
    expect(SceneEffect.ClearAll).toBe(0);
    expect(SceneEffect.GaussianBlur).toBe(1);
    expect(SceneEffect.DropShadow).toBe(2);
    expect(SceneEffect.Fill).toBe(3);
    expect(SceneEffect.Tint).toBe(4);
    expect(SceneEffect.Tritone).toBe(5);
  });
});

describe('TextWrapMode', () => {
  it('has correct values', () => {
    expect(TextWrapMode.None).toBe(0);
    expect(TextWrapMode.Character).toBe(1);
    expect(TextWrapMode.Word).toBe(2);
    expect(TextWrapMode.Smart).toBe(3);
    expect(TextWrapMode.Ellipsis).toBe(4);
  });
});

describe('ColorSpace', () => {
  it('has correct values', () => {
    expect(ColorSpace.ABGR8888).toBe(0);
    expect(ColorSpace.ARGB8888).toBe(1);
    expect(ColorSpace.ABGR8888S).toBe(2);
    expect(ColorSpace.ARGB8888S).toBe(3);
    expect(ColorSpace.Grayscale8).toBe(4);
    expect(ColorSpace.Unknown).toBe(255);
  });
});
