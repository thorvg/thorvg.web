/**
 * Load and render images and vector files
 * @category Picture
 */

import { Paint } from './Paint';
import { getModule, allocString } from '../interop/module';
import { pictureRegistry } from '../interop/registry';
import { checkResult, handleError, ThorVGResultCode } from '../common/errors';
import { ColorSpace, FilterMethod } from '../common/constants';
import type { MimeType } from '../common/constants';

/**
 * Callback that resolves an external asset (image or font) referenced by a
 * loaded picture, such as the assets inside a Lottie file.
 *
 * The callback is invoked synchronously during {@link Picture.load} for each
 * external reference, so any data it needs must already be in memory — fetch
 * and cache assets before loading, then resolve them here.
 *
 * @param paint - The paint that needs the asset. A {@link Picture} for an image
 *                reference, or a `Text` for a font reference. Use `instanceof`
 *                to tell them apart.
 * @param src - The asset source string exactly as authored in the file.
 * @returns `true` if you resolved the asset; `false` to let the engine fall
 *          back to its own resolution.
 *
 * @category Picture
 */
export type AssetResolver = (paint: Paint, src: string) => boolean;

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
  #resolverPtr: number | null = null;

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

  private _accessible = false;

  /**
   * Whether accessible mode is enabled.
   *
   * In accessible mode the picture retains an internal map of ID-accessible asset nodes
   * (such as named SVG nodes), which makes {@link paint} lookups more efficient and is
   * required for `Accessor.name()` to resolve names.
   *
   * @remarks
   * Must be set **before** {@link load} — the flag is consumed while the asset is parsed,
   * so enabling it afterwards has no effect on already-loaded content.
   *
   * @example
   * ```typescript
   * const picture = new TVG.Picture();
   * picture.accessible = true;
   * picture.load(svgData, { type: 'svg' });
   *
   * const accessor = new TVG.Accessor();
   * accessor.set(picture, (paint) => {
   *   console.log(accessor.name(paint.id));
   *   return true;
   * });
   * ```
   */
  public get accessible(): boolean {
    return this._accessible;
  }

  public set accessible(value: boolean) {
    const Module = getModule();
    const result = Module._tvg_picture_set_accessible(this.ptr, value ? 1 : 0);
    checkResult(result, 'accessible');
    this._accessible = value;
  }

  /**
   * Set a resolver for external assets (images, fonts) referenced by the picture.
   *
   * Set this BEFORE calling {@link load} — the resolver runs during load, once
   * per external reference, and setting it afterwards has no effect on assets
   * that were already resolved. Pass `null` to remove a previously set resolver.
   *
   * @param callback - The resolver, or `null` to unset.
   *
   * @example
   * ```typescript
   * // Resolve a Lottie image asset from prefetched bytes
   * const logo = new Uint8Array(await (await fetch('/logo.png')).arrayBuffer());
   *
   * const animation = new TVG.LottieAnimation();
   * animation.picture.resolver((paint, src) => {
   *   if (paint instanceof TVG.Picture) {
   *     paint.load(logo, { type: 'png' });
   *     return true;
   *   }
   *   return false;
   * });
   * animation.load(lottieData);
   * ```
   *
   * @see {@link AssetResolver}
   */
  public resolver(callback: AssetResolver | null): this {
    const Module = getModule();

    // Unregister previous resolver.
    if (this.#resolverPtr) {
      Module.removeFunction(this.#resolverPtr);
      this.#resolverPtr = null;
    }

    if (!callback) {
      const result = Module._tvg_picture_set_asset_resolver(this.ptr, 0, 0);
      if (result !== ThorVGResultCode.Success && result !== ThorVGResultCode.InsufficientCondition) {
        checkResult(result, 'resolver');
      }
      return this;
    }

    // C signature: bool(Tvg_Paint paint, const char* src, void* data) -> 'iiii'
    const funcPtr = Module.addFunction((paintPtr: number, srcPtr: number): number => {
      const paint = Paint.fromPtr(paintPtr);
      const src = Module.UTF8ToString(srcPtr);
      try {
        return callback(paint, src) ? 1 : 0;
      } catch {
        return 0;
      }
    }, 'iiii');

    this.#resolverPtr = funcPtr;
    checkResult(Module._tvg_picture_set_asset_resolver(this.ptr, funcPtr, 0), 'resolver');
    return this;
  }

  public override dispose(): void {
    if (this.#resolverPtr) {
      getModule().removeFunction(this.#resolverPtr);
      this.#resolverPtr = null;
    }
    super.dispose();
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
        handleError('Width and height are required for raw image format', 'load');
        return this;
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

  /**
   * Retrieve a paint object from this picture's scene tree by ID.
   *
   * @param id - A numeric hash ID or a string name (which will be hashed via Accessor.id)
   * @returns The matching Paint object, or null if not found
   *
   * @note The returned Paint is owned by this Picture — do not dispose it manually.
   */
  public paint(id: number): Paint | null;
  public paint(name: string): Paint | null;
  public paint(id: number | string): Paint | null {
    const Module = getModule();

    let numericId: number;
    if (typeof id === 'string') {
      const namePtr = allocString(Module, id);
      try {
        numericId = Module._tvg_accessor_generate_id(namePtr);
      } finally {
        Module._free(namePtr);
      }
    } else {
      numericId = id;
    }

    const ptr = Module._tvg_picture_get_paint(this.ptr, numericId);
    if (!ptr) return null;

    return Paint.fromPtr(ptr);
  }

  /**
   * Set the image filtering method used when this picture is scaled or transformed.
   *
   * @param method - The filtering method to apply (default: FilterMethod.Bilinear)
   *
   * @example
   * ```typescript
   * // Keep hard pixel edges when upscaling pixel art
   * picture.filter(TVG.FilterMethod.Nearest);
   * picture.size(256, 256);
   * ```
   */
  public filter(method: FilterMethod = FilterMethod.Bilinear): this {
    const Module = getModule();
    const result = Module._tvg_picture_set_filter(this.ptr, method);
    checkResult(result, 'filter');
    return this;
  }
}

// Tvg_Type = 3 (TVG_TYPE_PICTURE)
Paint.registerType(3, (ptr) => new Picture(ptr, true));
