/**
 * Base class for all Paint objects (Shape, Scene, Picture, Text)
 */

import { WasmObject } from '../core/WasmObject';
import { getModule } from '../core/Module';
import { checkResult } from '../core/errors';

/**
 * @category Shapes
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

export abstract class Paint extends WasmObject {
  protected _cleanup(ptr: number): void {
    const Module = getModule();
    Module._tvg_paint_unref(ptr, 1);
  }

  /**
   * Translate the paint by (x, y)
   */
  public translate(x: number, y: number): this {
    const Module = getModule();
    Module._tvg_paint_translate(this.ptr, x, y);
    return this;
  }

  /**
   * Rotate the paint by angle (in degrees)
   */
  public rotate(angle: number): this {
    const Module = getModule();
    Module._tvg_paint_rotate(this.ptr, angle);
    return this;
  }

  /**
   * Scale the paint by (sx, sy). If sy is not provided, use sx for both
   */
  public scale(sx: number, sy: number = sx): this {
    const Module = getModule();
    Module._tvg_paint_scale(this.ptr, sx, sy);
    return this;
  }

  /**
   * Get or set the opacity (0.0 to 1.0)
   */
  public opacity(): number;
  public opacity(value: number): this;
  public opacity(value?: number): number | this {
    const Module = getModule();

    if (value !== undefined) {
      Module._tvg_paint_set_opacity(this.ptr, Math.floor(value * 255));
      return this;
    }
    return Module._tvg_paint_get_opacity(this.ptr) / 255;
  }

  /**
   * Get or set the visibility
   */
  public visible(): boolean;
  public visible(value: boolean): this;
  public visible(value?: boolean): boolean | this {
    const Module = getModule();

    if (value !== undefined) {
      Module._tvg_paint_set_visible(this.ptr, value ? 1 : 0);
      return this;
    }
    return Boolean(Module._tvg_paint_get_visible(this.ptr));
  }

  /**
   * Get the axis-aligned bounding box of this paint
   */
  public bounds(): Bounds {
    const Module = getModule();
    const aabb = Module._malloc(16); // 4 floats

    try {
      Module._tvg_paint_get_aabb(this.ptr, aabb, aabb + 4, aabb + 8, aabb + 12);
      const view = new Float32Array(Module.HEAPF32.buffer, aabb, 4);
      return {
        x: view[0]!,
        y: view[1]!,
        width: view[2]!,
        height: view[3]!,
      };
    } finally {
      Module._free(aabb);
    }
  }

  /**
   * Duplicate this paint object
   */
  public duplicate<T extends Paint>(): T {
    const Module = getModule();
    const ptr = Module._tvg_paint_duplicate(this.ptr);
    return this._createInstance(ptr) as T;
  }

  /**
   * Sets a clipping path for this paint object.
   *
   * The clipping path restricts the area where the paint will be rendered.
   * Only the parts of the paint that overlap with the clipper shape will be visible.
   *
   * @param clipper - A Paint object (typically a Shape) to use as the clipping path
   * @returns The Paint instance for method chaining
   *
   * @example
   * ```typescript
   * const circle = new TVG.Shape();
   * circle.appendCircle(150, 150, 100);
   *
   * const rect = new TVG.Shape();
   * rect.appendRect(0, 0, 300, 300)
   *     .fill(255, 0, 0, 255)
   *     .clip(circle);
   *
   * canvas.add(rect);
   * ```
   */
  public clip(clipper: Paint): this {
    const Module = getModule();
    const result = Module._tvg_paint_set_clip(this.ptr, clipper.ptr);
    checkResult(result, 'clip');
    return this;
  }

  /**
   * Create a new instance of this paint type with the given pointer
   * Must be implemented by subclasses
   */
  protected abstract _createInstance(ptr: number): Paint;
}
