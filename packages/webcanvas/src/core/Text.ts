/**
 * Render text with fonts and styling
 * @category Text
 */

import { Paint } from './Paint';
import { Fill } from './Fill';
import { getModule } from '../interop/module';
import { textRegistry } from '../interop/registry';
import { checkResult } from '../common/errors';
import type { TextWrapMode } from '../common/constants';

/**
 * @category Text
 */
export interface TextLayout {
  width: number;
  height?: number;
}

/**
 * @category Text
 */
export interface TextOutline {
  width: number;
  color: readonly [number, number, number]; // RGB
}

/**
 * Describes the font metrics of a text object.
 *
 * Provides the basic vertical layout metrics used for text rendering,
 * such as ascent, descent, and line spacing (linegap).
 *
 * @see {@link Text.metrics}
 * @category Text
 *
 * @beta
 */
export interface TextMetrics {
  /** Distance from the baseline to the top of the highest glyph (usually positive). */
  ascent: number;
  /** Distance from the baseline to the bottom of the lowest glyph (usually negative, as in TTF). */
  descent: number;
  /** Additional spacing recommended between lines (leading). */
  linegap: number;
  /** The total vertical advance between lines of text: ascent - descent + linegap (i.e., ascent + |descent| + linegap when descent is negative). */
  advance: number;
}

/**
 * Describes the layout metrics of a glyph.
 *
 * Provides the basic layout metrics used for positioning an individual glyph,
 * including its advance along the baseline direction, bearing relative to the
 * inline axis origin, and its bounding box in local glyph space.
 *
 * The advance value represents the distance the pen position moves along the
 * baseline (inline direction), regardless of whether the text is laid out
 * horizontally or vertically.
 *
 * The bounding box is defined in the glyph's local coordinate space and is
 * independent of any layout direction or transformation.
 *
 * @see {@link Text.metrics}
 * @category Text
 *
 * @beta
 */
export interface GlyphMetrics {
  /** The advance distance along the baseline (inline) direction. */
  advance: number;
  /** The bearing from the origin to the glyph's visible bound along the inline-start direction. */
  bearing: number;
  /** The minimum point of the glyph bounding box in local space. */
  min: { x: number; y: number };
  /** The maximum point of the glyph bounding box in local space. */
  max: { x: number; y: number };
}

/**
 * Text rendering class with font support
 * @category Text
 *
 * @example
 * ```typescript
 * // Basic text rendering
 * const text = new TVG.Text();
 * text.font('Arial', 48)
 *     .text('Hello ThorVG!')
 *     .fill(50, 50, 50, 255)
 *     .translate(100, 200);
 *
 * canvas.add(text);
 * ```
 *
 * @example
 * ```typescript
 * // Text with custom font and styling
 * // Load custom font first
 * const fontData = await fetch('/fonts/custom.ttf').then(r => r.arrayBuffer());
 * TVG.Font.load('CustomFont', new Uint8Array(fontData));
 *
 * const text = new TVG.Text();
 * text.font('CustomFont', 64)
 *     .text('Custom Font')
 *     .fill(100, 150, 255, 255)
 *     .stroke(50, 50, 50, 255, 2);
 *
 * canvas.add(text);
 * ```
 *
 * @example
 * ```typescript
 * // Multi-line text with wrapping
 * const text = new TVG.Text();
 * text.font('Arial')
 *     .fontSize(24)
 *     .text('This is a long text that will wrap across multiple lines')
 *     .fill(50, 50, 50)
 *     .layout(300, 200)
 *     .wrap(TextWrapMode.Word);
 *
 * canvas.add(text);
 * ```
 */
export class Text extends Paint {
  constructor();
  /** @internal */
  constructor(ptr?: number, skipRegistry?: boolean);
  constructor(ptr?: number, skipRegistry: boolean = false) {
    const Module = getModule();
    if (!ptr) {
      ptr = Module._tvg_text_new();
    }
    super(ptr, skipRegistry ? undefined : textRegistry);
  }

  protected _createInstance(ptr: number): Text {
    // Create text from existing pointer (for duplicate)
    return new Text(ptr);
  }

  /**
   * Set the font to use for this text.
   * @param name - Font name
    */
  public font(name: string): this {
    const Module = getModule();

    const namePtr = Module._malloc(name.length + 1);
    Module.HEAPU8.set(new TextEncoder().encode(name), namePtr);
    Module.HEAPU8[namePtr + name.length] = 0;

    try {
      const result = Module._tvg_text_set_font(this.ptr, namePtr);
      checkResult(result, 'font');
    } finally {
      Module._free(namePtr);
    }

    return this;
  }

  /**
   * Set the text content (UTF-8 supported)
   * @param content - Text content to display
   */
  public text(content: string): this {
    const Module = getModule();

    const textBytes = new TextEncoder().encode(content);
    const textPtr = Module._malloc(textBytes.length + 1);
    Module.HEAPU8.set(textBytes, textPtr);
    Module.HEAPU8[textPtr + textBytes.length] = 0;

    try {
      const result = Module._tvg_text_set_text(this.ptr, textPtr);
      checkResult(result, 'text');
    } finally {
      Module._free(textPtr);
    }

    return this;
  }

  /**
   * Set the font size
   * @param size - Font size in pixels
   */
  public fontSize(size: number): this {
    const Module = getModule();
    const result = Module._tvg_text_set_size(this.ptr, size);
    checkResult(result, 'fontSize');
    return this;
  }

  /**
   * Set text color (RGB) or fill with gradient
   */
  public fill(gradient: Fill): this;
  public fill(r: number, g: number, b: number): this;
  public fill(gradientOrR: Fill | number, g?: number, b?: number): this {
    const Module = getModule();

    if (gradientOrR instanceof Fill) {
      gradientOrR['_applyStops']();
      const result = Module._tvg_text_set_gradient(this.ptr, gradientOrR.ptr);
      checkResult(result, 'fill (gradient)');
      gradientOrR._markFilled();
    } else if (typeof gradientOrR === 'number' && g !== undefined && b !== undefined) {
      // RGB color
      const result = Module._tvg_text_set_color(this.ptr, gradientOrR, g, b);
      checkResult(result, 'fill (color)');
    } else {
      throw new TypeError('Invalid fill arguments');
    }

    return this;
  }

  /**
   * Set text alignment/anchor point
   * @param x - Horizontal alignment/anchor in [0..1]: 0=left/start, 0.5=center, 1=right/end (Default: 0)
   * @param y - Vertical alignment/anchor in [0..1]: 0=top, 0.5=middle, 1=bottom (Default: 0)
   */
  public align(x: number, y: number): this {
    const Module = getModule();
    const result = Module._tvg_text_align(this.ptr, x, y);
    checkResult(result, 'align');
    return this;
  }

  /**
   * Set text layout constraints (for wrapping)
   * @param width - Maximum width (0 = no constraint)
   * @param height - Maximum height (0 = no constraint)
   */
  public layout(width: number, height: number = 0): this {
    const Module = getModule();
    const result = Module._tvg_text_layout(this.ptr, width, height);
    checkResult(result, 'layout');
    return this;
  }

  /**
   * Set text wrap mode
   * @param mode - Wrap mode: TextWrapMode.None, TextWrapMode.Character, TextWrapMode.Word, TextWrapMode.Smart, or TextWrapMode.Ellipsis
   */
  public wrap(mode: TextWrapMode): this {
    const Module = getModule();
    const result = Module._tvg_text_wrap_mode(this.ptr, mode);
    checkResult(result, 'wrap');
    return this;
  }

  /**
   * Get the number of text lines.
   *
   * Reflects the layout produced by the current wrap configuration, and also counts
   * explicit line feed characters ('\n') contained in the text.
   *
   * @returns The total number of lines
   *
   * @see {@link wrap}
   *
   * @example
   * ```typescript
   * text.text('Hello wrapped world').layout(100).wrap(TVG.TextWrapMode.Word);
   * console.log(text.lines()); // number of lines after wrapping
   * ```
   */
  public lines(): number {
    const Module = getModule();
    return Module._tvg_text_line_count(this.ptr);
  }

  /**
   * Retrieves the layout metrics of the text object.
   *
   * Returns the font layout values of this text object,
   * such as ascent, descent, linegap, and line advance.
   *
   * The returned values reflect the font size applied to the text object,
   * but do not include any transformations (e.g., scale, rotation, or translation).
   *
   * @returns The font metrics of this text object
   *
   * @example
   * ```typescript
   * text.font('poppins').fontSize(16);
   * const { ascent, descent, advance } = text.metrics();
   * ```
   *
   * @see {@link TextMetrics}
   *
   * @beta
   */
  public metrics(): TextMetrics;
  /**
   * Retrieves the layout metrics of a glyph in the text object.
   *
   * Returns the horizontal layout values of the specified glyph,
   * such as advance, left-side bearing, and bounding box.
   *
   * The returned values reflect the font size applied to the text object,
   * but do not include any transformations (e.g., scale, rotation, or translation).
   *
   * The input must be a single character.
   *
   * @param char - A single character
   * @returns The layout metrics of the glyph
   *
   * @example
   * ```typescript
   * // Measure the width of a string
   * let width = 0;
   * for (const char of 'Hello') {
   *   width += text.metrics(char).advance;
   * }
   * ```
   *
   * @see {@link GlyphMetrics}
   * @remarks Currently, ThorVG only supports horizontal text layout.
   *
   * @beta
   */
  public metrics(char: string): GlyphMetrics;
  public metrics(char?: string): TextMetrics | GlyphMetrics {
    const Module = getModule();

    if (char === undefined) {
      const ptr = Module._malloc(16);
      Module.HEAPU8.fill(0, ptr, ptr + 16);
      try {
        const result = Module._tvg_text_get_text_metrics(this.ptr, ptr);
        checkResult(result, 'metrics');
        const view = new Float32Array(Module.HEAPF32.buffer, ptr, 4);
        return { ascent: view[0]!, descent: view[1]!, linegap: view[2]!, advance: view[3]! };
      } finally {
        Module._free(ptr);
      }
    }

    // utf8 character followed by a null terminator, then the 24 bytes metrics (4 bytes aligned)
    const charBytes = new TextEncoder().encode(char);
    const offset = (charBytes.length + 4) & ~3;
    const ptr = Module._malloc(offset + 24);
    Module.HEAPU8.fill(0, ptr, ptr + offset + 24);
    Module.HEAPU8.set(charBytes, ptr);

    try {
      const result = Module._tvg_text_get_glyph_metrics(this.ptr, ptr, ptr + offset, 0);
      checkResult(result, 'metrics');
      const view = new Float32Array(Module.HEAPF32.buffer, ptr + offset, 6);
      return {
        advance: view[0]!,
        bearing: view[1]!,
        min: { x: view[2]!, y: view[3]! },
        max: { x: view[4]!, y: view[5]! },
      };
    } finally {
      Module._free(ptr);
    }
  }

  /**
   * Set text spacing (letter and line spacing)
   * @param letter - Letter spacing scale factor (1.0 = default, >1.0 = wider, <1.0 = narrower)
   * @param line - Line spacing scale factor (1.0 = default, >1.0 = wider, <1.0 = narrower)
   */
  public spacing(letter: number, line: number): this {
    const Module = getModule();
    const result = Module._tvg_text_spacing(this.ptr, letter, line);
    checkResult(result, 'spacing');
    return this;
  }

  /**
   * Set italic style with shear factor
   * @param shear - Shear factor (0.0 = no italic, default: 0.18, typical range: 0.1-0.3)
   */
  public italic(shear: number = 0.18): this {
    const Module = getModule();
    const result = Module._tvg_text_set_italic(this.ptr, shear);
    checkResult(result, 'italic');
    return this;
  }

  /**
   * Set text outline (stroke)
   * @param width - Outline width
   * @param r - Red (0-255)
   * @param g - Green (0-255)
   * @param b - Blue (0-255)
   */
  public outline(width: number, r: number, g: number, b: number): this {
    const Module = getModule();
    const result = Module._tvg_text_set_outline(this.ptr, width, r, g, b);
    checkResult(result, 'outline');
    return this;
  }
}

// Tvg_Type = 4 (TVG_TYPE_TEXT)
Paint.registerType(4, (ptr) => new Text(ptr, true));
