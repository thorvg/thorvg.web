/**
 * Text class for rendering text with custom fonts and styling
 */

import { Paint } from './Paint';
import { Fill } from '../fill/Fill';
import { getModule } from '../core/Module';
import { textRegistry } from '../core/Registry';
import { checkResult } from '../core/errors';
import type { TextWrapModeType } from '../constants';
import { TextWrapMode } from '../constants';

export interface TextAlign {
  horizontal: number; // 0.0 (left) to 1.0 (right)
  vertical: number;   // 0.0 (top) to 1.0 (bottom)
}

export interface TextLayout {
  width: number;
  height?: number;
}

export interface TextOutline {
  width: number;
  color: readonly [number, number, number]; // RGB
}

export class Text extends Paint {
  constructor() {
    const Module = getModule();
    const ptr = Module._tvg_text_new();
    super(ptr, textRegistry);
  }

  protected _createInstance(ptr: number): Text {
    // Create text from existing pointer (for duplicate)
    const text = Object.create(Text.prototype) as Text;
    Object.setPrototypeOf(text, Text.prototype);
    text.ptr = ptr;
    return text;
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
   * Set text alignment
   * @param horizontal - Horizontal alignment: 0.0 (left), 0.5 (center), 1.0 (right)
   * @param vertical - Vertical alignment: 0.0 (top), 0.5 (middle), 1.0 (bottom)
   */
  public align(horizontal: number, vertical: number): this;
  /**
   * Set text alignment with named values
   */
  public align(options: { horizontal?: 'left' | 'center' | 'right'; vertical?: 'top' | 'middle' | 'bottom' }): this;
  public align(
    horizontalOrOptions: number | { horizontal?: 'left' | 'center' | 'right'; vertical?: 'top' | 'middle' | 'bottom' },
    vertical?: number
  ): this {
    const Module = getModule();

    let hAlign: number;
    let vAlign: number;

    if (typeof horizontalOrOptions === 'number' && vertical !== undefined) {
      hAlign = horizontalOrOptions;
      vAlign = vertical;
    } else if (typeof horizontalOrOptions === 'object') {
      // Named alignment
      const h = horizontalOrOptions.horizontal || 'left';
      const v = horizontalOrOptions.vertical || 'top';

      hAlign = h === 'left' ? 0 : h === 'center' ? 0.5 : 1;
      vAlign = v === 'top' ? 0 : v === 'middle' ? 0.5 : 1;
    } else {
      throw new TypeError('Invalid align arguments');
    }

    const result = Module._tvg_text_align(this.ptr, hAlign, vAlign);
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
   * @param mode - Wrap mode: 'none', 'character', 'word', 'smart', or 'ellipsis'
   */
  public wrap(mode: TextWrapModeType): this {
    const Module = getModule();

    const modeMap: Record<TextWrapModeType, number> = {
      none: TextWrapMode.None,
      character: TextWrapMode.Character,
      word: TextWrapMode.Word,
      smart: TextWrapMode.Smart,
      ellipsis: TextWrapMode.Ellipsis,
    };

    const result = Module._tvg_text_wrap_mode(this.ptr, modeMap[mode]);
    checkResult(result, 'wrap');
    return this;
  }

  /**
   * Set italic style with shear factor
   * @param shear - Shear factor (0.0 = no italic, typical values: 0.1-0.3)
   */
  public italic(shear: number): this {
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
  public outline(width: number, r: number, g: number, b: number): this;
  /**
   * Set text outline with gradient
   */
  public outline(width: number, gradient: Fill): this;
  public outline(
    width: number,
    gradientOrR: Fill | number,
    g?: number,
    b?: number
  ): this {
    const Module = getModule();

    if (gradientOrR instanceof Fill) {
      // Gradient outline
      const result = Module._tvg_text_set_stroke_gradient(this.ptr, gradientOrR.ptr);
      checkResult(result, 'outline (gradient)');
      // Note: Still need to set width separately if there's a function for it
      // For now, this assumes the gradient includes width information
    } else if (typeof gradientOrR === 'number' && g !== undefined && b !== undefined) {
      // Solid color outline
      const result = Module._tvg_text_set_outline(this.ptr, width, gradientOrR, g, b);
      checkResult(result, 'outline');
    } else {
      throw new TypeError('Invalid outline arguments');
    }

    return this;
  }
}
