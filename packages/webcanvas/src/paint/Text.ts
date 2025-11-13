/**
 * Text class for rendering text with custom fonts and styling
 * @category Text
 */

import { Paint } from './Paint';
import { Fill } from '../fill/Fill';
import { getModule } from '../core/Module';
import { textRegistry } from '../core/Registry';
import { checkResult } from '../core/errors';
import { TextWrapMode } from '../constants';

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
  constructor(ptr?: number) {
    const Module = getModule();
    if (!ptr) {
      ptr = Module._tvg_text_new();
    }
    super(ptr, textRegistry);
  }

  protected _createInstance(ptr: number): Text {
    // Create text from existing pointer (for duplicate)
    return new Text(ptr);
  }

  /**
   * Set the font to use for this text
   * @param name - Font name (previously loaded via Font.load()) or "default"
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
      // Gradient fill - apply pending stops before setting
      gradientOrR['_applyStops']();
      const result = Module._tvg_text_set_gradient(this.ptr, gradientOrR.ptr);
      checkResult(result, 'fill (gradient)');
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
