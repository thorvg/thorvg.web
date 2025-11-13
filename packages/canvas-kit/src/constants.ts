/**
 * ThorVG constants and enums
 * @category Constants
 */

/**
 * @category Constants
 */
export enum BlendMethod {
  Normal = 0,
  Multiply = 1,
  Screen = 2,
  Overlay = 3,
  Darken = 4,
  Lighten = 5,
  ColorDodge = 6,
  ColorBurn = 7,
  HardLight = 8,
  SoftLight = 9,
  Difference = 10,
  Exclusion = 11,
}

/**
 * Stroke cap enum for line endings.
 * @category Shape
 */
export enum StrokeCap {
  Butt = 0,
  Round = 1,
  Square = 2,
}

/**
 * Stroke join enum for line corners.
 * @category Shape
 */
export enum StrokeJoin {
  Miter = 0,
  Round = 1,
  Bevel = 2,
}

/**
 * Fill rule enum for determining whether a point is inside a shape.
 * @category Shape
 */
export enum FillRule {
  Winding = 0,
  EvenOdd = 1,
}

/**
 * Gradient spread enum for areas outside gradient bounds.
 * @category Gradients
 */
export enum GradientSpread {
  Pad = 0,
  Reflect = 1,
  Repeat = 2,
}

/**
 * @category Constants
 */
export enum CompositeMethod {
  None = 0,
  ClipPath = 1,
  AlphaMask = 2,
  InvAlphaMask = 3,
  LumaMask = 4,
  InvLumaMask = 5,
}

/**
 * Text wrapping mode enum for multi-line text layout.
 * @category Text
 */
export enum TextWrapMode {
  None = 0,
  Character = 1,
  Word = 2,
  Smart = 3,
  Ellipsis = 4,
}

/**
 * Rendering backend type for Canvas.
 * - `'sw'`: Software renderer (CPU-based, works everywhere)
 * - `'gl'`: WebGL renderer (GPU-accelerated, recommended)
 * - `'wg'`: WebGPU renderer (best performance, requires Chrome 113+)
 * - `'auto'`: Automatically select best available renderer
 * @category Canvas
 */
export type RendererType = 'sw' | 'gl' | 'wg' | 'auto';

/**
 * Stroke cap style for line endings.
 * - `'butt'`: Flat cap at the exact endpoint
 * - `'round'`: Rounded cap extending beyond the endpoint
 * - `'square'`: Square cap extending beyond the endpoint
 * @category Shape
 */
export type StrokeCapType = 'butt' | 'round' | 'square';

/**
 * Stroke join style for line corners.
 * - `'miter'`: Sharp corner with pointed edge
 * - `'round'`: Rounded corner
 * - `'bevel'`: Flat corner with angled edge
 * @category Shape
 */
export type StrokeJoinType = 'miter' | 'round' | 'bevel';

/**
 * Fill rule for determining whether a point is inside a shape.
 * - `'winding'`: Non-zero winding rule (default)
 * - `'evenodd'`: Even-odd rule for complex shapes with holes
 * @category Shape
 */
export type FillRuleType = 'winding' | 'evenodd';

/**
 * Gradient spread method for areas outside the gradient bounds.
 * - `'pad'`: Extend the edge colors (default)
 * - `'reflect'`: Mirror the gradient
 * - `'repeat'`: Repeat the gradient pattern
 * @category Gradients
 */
export type GradientSpreadType = 'pad' | 'reflect' | 'repeat';

/**
 * Text wrapping mode for multi-line text layout.
 * - `'none'`: No wrapping (single line)
 * - `'character'`: Wrap at any character
 * - `'word'`: Wrap at word boundaries (default)
 * - `'smart'`: Intelligent wrapping with hyphenation
 * - `'ellipsis'`: Truncate with ellipsis (...)
 * @category Text
 */
export type TextWrapModeType = 'none' | 'character' | 'word' | 'smart' | 'ellipsis';
