/**
 * Picture class for loading and rendering images and vector files
 * Supports SVG, PNG, JPG, WebP, and Lottie files
 * @category Picture
 */

import { Paint } from './Paint';
import { getModule } from '../core/Module';
import { pictureRegistry } from '../core/Registry';
import { checkResult } from '../core/errors';
import { ColorSpace } from '../constants';
import type { MimeType } from '../constants';

/**
 * @category Picture
 */
export interface LoadDataOptions {
  /** MIME type or format hint (e.g., 'svg', 'png', 'jpg', 'raw') */
  type?: MimeType;
  /** Width of raw image (required for type='raw') */
  width?: number;
  /** Height of raw image (required for type='raw') */
  height?: number;
  /** Color space of raw image (required for type='raw', default: ColorSpace.ARGB8888) */
  colorSpace?: ColorSpace;
}

/**
 * @category Picture
 */
export interface PictureSize {
  width: number;
  height: number;
}

/**
 * Picture class for loading and displaying images and vector graphics
 * @category Picture
 *
 * @example
 * ```typescript
 * // Loading an SVG image
 * const picture = new TVG.Picture();
 *
 * fetch('/images/logo.svg')
 *   .then(res => res.text())
 *   .then(svgData => {
 *     picture.load(svgData, { type: 'svg' });
 *     const size = picture.size();
 *     picture.size(200, 200 * size.height / size.width); // Scale
 *     canvas.add(picture).render();
 *   });
 * ```
 *
 * @example
 * ```typescript
 * // Loading a Lottie animation as static image
 * const picture = new TVG.Picture();
 *
 * fetch('/animations/loading.json')
 *   .then(res => res.text())
 *   .then(lottieData => {
 *     picture.load(lottieData, { type: 'lottie' });
 *     picture.translate(400, 300);
 *     canvas.add(picture);
 *   });
 * ```
 */
export class Picture extends Paint {
  constructor(ptr?: number, skipRegistry: boolean = false) {
    const Module = getModule();
    if (!ptr) {
      ptr = Module._tvg_picture_new();
    }

    // If skipRegistry is true, don't register for automatic cleanup
    // (used when Animation owns the Picture)
    super(ptr, skipRegistry ? undefined : pictureRegistry);
  }

  protected _createInstance(ptr: number): Picture {
    // Create picture from existing pointer (for duplicate)
    return new Picture(ptr);
  }

  /**
   * Load picture from raw data (Uint8Array or string for SVG)
   * @param data - Raw image data as Uint8Array or SVG string
   * @param options - Load options including type hint
   */
  public load(data: Uint8Array | string, options: LoadDataOptions = {}): this {
    const Module = getModule();
    const { type = 'svg', width, height, colorSpace = ColorSpace.ARGB8888 } = options;

    // Convert string to Uint8Array if needed
    const dataArray = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    // Handle raw image format
    if (type === 'raw') {
      if (!width || !height) {
        throw new Error('Width and height are required for raw image format');
      }

      // Allocate WASM memory
      const dataPtr = Module._malloc(dataArray.length);
      Module.HEAPU8.set(dataArray, dataPtr);

      try {
        const result = Module._tvg_picture_load_raw(
          this.ptr,
          dataPtr,
          width,
          height,
          colorSpace,
          1,
        );
        checkResult(result, 'load');
      } finally {
        Module._free(dataPtr);
      }

      return this;
    }

    // Handle other formats (svg, png, jpg, webp, lot, etc.)
    const dataPtr = Module._malloc(dataArray.length);
    Module.HEAPU8.set(dataArray, dataPtr);

    try {
      const result = Module._tvg_picture_load_data(
        this.ptr,
        dataPtr,
        dataArray.length,
        type,
        '',
        1,
      );
      checkResult(result, 'load');
    } finally {
      Module._free(dataPtr);
    }

    return this;
  }

  /**
   * Set the size of the picture (scales it)
   * @param width - Target width
   * @param height - Target height
   */
  public size(width: number, height: number): this;
  /**
   * Get the current size of the picture
   */
  public size(): PictureSize;
  public size(width?: number, height?: number): this | PictureSize {
    const Module = getModule();

    if (width !== undefined && height !== undefined) {
      // Setter
      const result = Module._tvg_picture_set_size(this.ptr, width, height);
      checkResult(result, 'size (set)');
      return this;
    }

    // Getter
    const sizePtr = Module._malloc(8); // 2 floats (4 bytes each)
    try {
      Module._tvg_picture_get_size(this.ptr, sizePtr, sizePtr + 4);
      const sizeView = new Float32Array(Module.HEAPF32.buffer, sizePtr, 2);
      return {
        width: sizeView[0]!,
        height: sizeView[1]!,
      };
    } finally {
      Module._free(sizePtr);
    }
  }

}
