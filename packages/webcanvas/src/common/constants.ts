/**
 * ThorVG constants and enums
 * @category Constants
 */

/**
 * Blend method for compositing paint layers.
 *
 * Defines various blending modes for combining a source paint (top layer) with a destination (bottom layer).
 * Notation: S = source paint, D = destination, Sa = source alpha, Da = destination alpha.
 * @category Constants
 */
export enum BlendMethod {
  /** Perform alpha blending (default). S if (Sa == 255), otherwise (Sa * S) + (255 - Sa) * D */
  Normal = 0,
  /** Multiply the RGB values of each pixel. (S * D) */
  Multiply = 1,
  /** Invert, multiply, and invert again. (S + D) - (S * D) */
  Screen = 2,
  /** Combines Multiply and Screen modes. (2 * S * D) if (D < 128), otherwise 255 - 2 * (255 - S) * (255 - D) */
  Overlay = 3,
  /** Retains the smallest components. min(S, D) */
  Darken = 4,
  /** Retains the largest components. max(S, D) */
  Lighten = 5,
  /** Divides the bottom layer by the inverted top layer. D / (255 - S) */
  ColorDodge = 6,
  /** Divides the inverted bottom layer by the top layer, then inverts. 255 - (255 - D) / S */
  ColorBurn = 7,
  /** Same as Overlay but with color roles reversed. (2 * S * D) if (S < 128), otherwise 255 - 2 * (255 - S) * (255 - D) */
  HardLight = 8,
  /** Similar to Overlay but softer. (255 - 2 * S) * (D * D) + (2 * S * D) */
  SoftLight = 9,
  /** Absolute difference between layers. (S - D) if (S > D), otherwise (D - S) */
  Difference = 10,
  /** Twice the product subtracted from the sum. S + D - (2 * S * D) */
  Exclusion = 11,
  /** Combine with HSL(Sh + Ds + Dl) then convert to RGB */
  Hue = 12,
  /** Combine with HSL(Dh + Ss + Dl) then convert to RGB */
  Saturation = 13,
  /** Combine with HSL(Sh + Ss + Dl) then convert to RGB */
  Color = 14,
  /** Combine with HSL(Dh + Ds + Sl) then convert to RGB */
  Luminosity = 15,
  /** Simply adds pixel values. (S + D) */
  Add = 16,
  /** For intermediate composition layers; suitable for use with Scene or Picture */
  Composition = 255,
}

/**
 * Stroke cap style for line endings.
 *
 * Determines the shape of the endpoints of open paths when stroked.
 * @category Shape
 */
export enum StrokeCap {
  /** Flat cap at the exact endpoint (no extension) */
  Butt = 0,
  /** Rounded cap extending beyond the endpoint by half the stroke width */
  Round = 1,
  /** Square cap extending beyond the endpoint by half the stroke width */
  Square = 2,
}

/**
 * Stroke join style for line corners.
 *
 * Determines the shape of corners where two path segments meet when stroked.
 * @category Shape
 */
export enum StrokeJoin {
  /** Sharp corner with pointed edge (subject to miter limit) */
  Miter = 0,
  /** Rounded corner with circular arc */
  Round = 1,
  /** Flat corner with angled edge (beveled) */
  Bevel = 2,
}

/**
 * Fill rule for determining whether a point is inside a shape.
 *
 * Used to determine which regions should be filled when rendering complex paths
 * with self-intersections or multiple contours.
 * @category Shape
 */
export enum FillRule {
  /** Non-zero winding rule (default) - counts the number of times a path winds around a point */
  Winding = 0,
  /** Even-odd rule - alternates between filled and unfilled regions, useful for complex shapes with holes */
  EvenOdd = 1,
}

/**
 * Gradient spread method for areas outside the gradient bounds.
 *
 * Determines how the gradient behaves in regions outside the defined gradient vector.
 * @category Gradients
 */
export enum GradientSpread {
  /** Extend the edge colors to infinity (default) */
  Pad = 0,
  /** Mirror the gradient pattern */
  Reflect = 1,
  /** Repeat the gradient pattern */
  Repeat = 2,
}

/**
 * Composite method for combining paint objects.
 *
 * Defines methods for compositing operations such as clipping and masking.
 * @category Constants
 */
export enum CompositeMethod {
  /** No compositing is applied */
  None = 0,
  /** Use the paint as a clipping path */
  ClipPath = 1,
  /** Alpha masking using the mask's alpha values */
  AlphaMask = 2,
  /** Inverse alpha masking using the complement of the mask's alpha values */
  InvAlphaMask = 3,
  /** Luma masking using the grayscale of the mask */
  LumaMask = 4,
  /** Inverse luma masking using the complement of the mask's grayscale */
  InvLumaMask = 5,
}

/**
 * Mask method for masking operations.
 *
 * Defines various methods for applying masks to paint objects.
 * @category Constants
 */
export enum MaskMethod {
  /** No masking is applied */
  None = 0,
  /** Alpha masking using the masking target's pixels as an alpha value */
  Alpha = 1,
  /** Alpha masking using the complement to the masking target's pixels */
  InvAlpha = 2,
  /** Alpha masking using the grayscale (0.2126R + 0.7152G + 0.0722B) of the masking target */
  Luma = 3,
  /** Alpha masking using the grayscale of the complement to the masking target */
  InvLuma = 4,
  /** Combines target and source using target alpha. (T * TA) + (S * (255 - TA)) */
  Add = 5,
  /** Subtracts source from target considering alpha. (T * TA) - (S * (255 - TA)) */
  Subtract = 6,
  /** Takes minimum alpha and multiplies with target. (T * min(TA, SA)) */
  Intersect = 7,
  /** Absolute difference between colors. abs(T - S * (255 - TA)) */
  Difference = 8,
  /** Where masks intersect, uses the highest transparency value */
  Lighten = 9,
  /** Where masks intersect, uses the lowest transparency value */
  Darken = 10,
}

/**
 * Scene effect for post-processing effects.
 *
 * Defines various visual effects that can be applied to a Scene to modify its final appearance.
 * @category Scene
 */
export enum SceneEffect {
  /** Reset all previously applied scene effects, restoring the scene to its original state */
  ClearAll = 0,
  /** Apply a blur effect with a Gaussian filter. Params: sigma (>0), direction (both/horizontal/vertical), border (duplicate/wrap), quality (0-100) */
  GaussianBlur = 1,
  /** Apply a drop shadow effect with Gaussian blur. Params: color RGB (0-255), opacity (0-255), angle (0-360), distance, blur sigma (>0), quality (0-100) */
  DropShadow = 2,
  /** Override the scene content color with given fill. Params: color RGB (0-255), opacity (0-255) */
  Fill = 3,
  /** Tint the scene color with black and white parameters. Params: black RGB (0-255), white RGB (0-255), intensity (0-100) */
  Tint = 4,
  /** Apply tritone color effect using shadows, midtones, and highlights. Params: shadow RGB, midtone RGB, highlight RGB (all 0-255), blend (0-255) */
  Tritone = 5,
}

/**
 * Text wrapping mode for multi-line text layout.
 *
 * Controls how text breaks across multiple lines when it exceeds the layout width.
 * @category Text
 */
export enum TextWrapMode {
  /** No wrapping - text remains on a single line */
  None = 0,
  /** Wrap at any character boundary */
  Character = 1,
  /** Wrap at word boundaries (default) */
  Word = 2,
  /** Intelligent wrapping with hyphenation support */
  Smart = 3,
  /** Truncate with ellipsis (...) when text exceeds bounds */
  Ellipsis = 4,
}

/**
 * Color space enum for raw image data.
 * Specifies the channel order and alpha premultiplication.
 * @category Picture
 */
export enum ColorSpace {
  /** Alpha, Blue, Green, Red - alpha-premultiplied */
  ABGR8888 = 0,
  /** Alpha, Red, Green, Blue - alpha-premultiplied */
  ARGB8888 = 1,
  /** Alpha, Blue, Green, Red - un-alpha-premultiplied */
  ABGR8888S = 2,
  /** Alpha, Red, Green, Blue - un-alpha-premultiplied */
  ARGB8888S = 3,
  /** Single channel grayscale data */
  Grayscale8 = 4,
  /** Unknown channel data (reserved for initial value) */
  Unknown = 255,
}

/**
 * MIME type or format hint for loading picture data.
 *
 * Supported image and vector file formats for Picture class.
 * @category Picture
 */
export type MimeType = 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'raw' | 'lot' | 'lottie+json';

/**
 * Rendering backend type for Canvas.
 *
 * ThorVG supports three rendering backends, each with different performance
 * characteristics and browser compatibility:
 *
 * ## Available Renderers
 *
 * ### `'sw'` - Software Renderer
 * - **Rendering**: CPU-based software rendering
 * - **Performance**: Slower, but works everywhere
 * - **Compatibility**: All browsers and devices
 * - **Best for**: Maximum compatibility, simple graphics, server-side rendering
 *
 * ### `'gl'` - WebGL Renderer (Recommended)
 * - **Rendering**: GPU-accelerated using WebGL 2.0
 * - **Performance**: Excellent performance with wide browser support
 * - **Compatibility**: Chrome 56+, Firefox 51+, Safari 15+, Edge 79+
 * - **Best for**: Production applications, interactive graphics, animations
 * - **Recommended for most use cases**
 *
 * ### `'wg'` - WebGPU Renderer
 * - **Rendering**: Next-generation GPU API
 * - **Performance**: Best performance for complex scenes
 * - **Compatibility**: Chrome 113+, Edge 113+ (limited support)
 * - **Best for**: Maximum performance, modern browsers only
 *
 * @example
 * ```typescript
 * // Recommended setup with WebGL
 * const TVG = await ThorVG.init({ renderer: 'gl' });
 * const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });
 * ```
 *
 * @example
 * ```typescript
 * // Maximum performance with WebGPU (modern browsers only)
 * const TVG = await ThorVG.init({ renderer: 'wg' });
 * ```
 *
 * @example
 * ```typescript
 * // Maximum compatibility with Software renderer
 * const TVG = await ThorVG.init({ renderer: 'sw' });
 * ```
 *
 * @category Canvas
 */
export type RendererType = 'sw' | 'gl' | 'wg';
