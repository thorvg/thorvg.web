/**
 * Picture class for loading and rendering images and vector files
 * Supports SVG, PNG, JPG, WebP, and Lottie files
 * @category Picture
 */

import { Paint } from './Paint';
import { getModule } from '../core/Module';
import { pictureRegistry } from '../core/Registry';
import { checkResult } from '../core/errors';

/**
 * Supported image and vector file formats for Picture.
 * - `'svg'`: Scalable Vector Graphics
 * - `'png'`: Portable Network Graphics (raster)
 * - `'jpg'`/`'jpeg'`: JPEG image format (raster)
 * - `'webp'`: WebP image format (raster)
 * - `'raw'`: Raw pixel data (ARGB8888, ABGR8888, etc.)
 * - `'lot'`: Lottie animation format
 * - `'lottie+json'`: Lottie animation format with JSON extension
 * @category Picture
 */
export type PictureFormat = 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'raw' | 'lot' | 'lottie+json';

/**
 * Color space formats for raw image data
 * @category Picture
 */
export type ColorSpace = 'argb8888' | 'abgr8888' | 'abgr8888s';

/**
 * @category Picture
 */
export interface LoadDataOptions {
  /** MIME type or format hint (e.g., 'svg', 'png', 'jpg', 'raw') */
  format?: PictureFormat;
  /** Resource path for resolving relative references */
  resourcePath?: string;
  /** Whether to copy the data (default: false) */
  copy?: boolean;
  /** Width of raw image (required for format='raw') */
  width?: number;
  /** Height of raw image (required for format='raw') */
  height?: number;
  /** Color space of raw image (required for format='raw', default: 'argb8888') */
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
 *     picture.load(svgData, { format: 'svg' });
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
 *     picture.load(lottieData, { format: 'lottie' });
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
   * @param options - Load options including format hint
   */
  public loadData(data: Uint8Array | string, options: LoadDataOptions = {}): this {
    const Module = getModule();
    const { format = 'svg', resourcePath = '', copy = false, width, height, colorSpace = 'argb8888' } = options;

    // Convert string to Uint8Array if needed
    const dataArray = typeof data === 'string' ? new TextEncoder().encode(data) : data;

    // Handle raw image format
    if (format === 'raw') {
      if (!width || !height) {
        throw new Error('Width and height are required for raw image format');
      }

      // Map color space string to ThorVG ColorSpace enum
      const colorSpaceMap: Record<ColorSpace, number> = {
        'argb8888': 0,
        'abgr8888': 1,
        'abgr8888s': 2,
      };

      // Allocate WASM memory
      const dataPtr = Module._malloc(dataArray.length);
      Module.HEAPU8.set(dataArray, dataPtr);

      try {
        const result = Module._tvg_picture_load_raw(
          this.ptr,
          dataPtr,
          width,
          height,
          colorSpaceMap[colorSpace],
          copy ? 1 : 0
        );
        checkResult(result, 'loadData');
      } finally {
        Module._free(dataPtr);
      }

      return this;
    }

    // Handle other formats (svg, png, jpg, webp, etc.)
    // Allocate WASM memory
    const dataPtr = Module._malloc(dataArray.length);
    Module.HEAPU8.set(dataArray, dataPtr);

    try {
      const result = Module._tvg_picture_load_data(
        this.ptr,
        dataPtr,
        dataArray.length,
        format,
        resourcePath,
        copy ? 1 : 0
      );
      checkResult(result, 'loadData');
    } finally {
      Module._free(dataPtr);
    }

    return this;
  }

  /**
   * Load picture from file path (for Node.js or when file system is available)
   * @param path - File path to load
   */
  public load(path: string): this {
    const Module = getModule();
    const result = Module._tvg_picture_load(this.ptr, path);
    checkResult(result, 'load');
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
