/**
 * Base class for all Paint objects (Shape, Scene, Picture, Text)
 */

import { WasmObject } from '../core/WasmObject';
import { getModule } from '../core/Module';
import { checkResult } from '../core/errors';
import { BlendMethod, MaskMethod } from '../constants';

/**
 * @category Shapes
 */
export interface Bounds {
  x: number;
  y: number;
  width: number;
  height: number;
}

/**
 * @category Shapes
 */
export interface Point {
  x: number;
  y: number;
}

/**
 * A 3x3 transformation matrix for 2D transformations.
 *
 * The matrix elements represent:
 * - e11, e12: Rotation/scale in X
 * - e21, e22: Rotation/scale in Y
 * - e13, e23: Translation in X and Y
 * - e31, e32: Always 0 (reserved for 3D)
 * - e33: Always 1 (homogeneous coordinate)
 *
 * Matrix layout:
 * ```
 * | e11  e12  e13 |
 * | e21  e22  e23 |
 * | e31  e32  e33 |
 * ```
 *
 * @category Shapes
 */
export interface Matrix {
  e11: number;
  e12: number;
  e13: number;
  e21: number;
  e22: number;
  e23: number;
  e31: number;
  e32: number;
  e33: number;
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
   * Set the origin point for transformations (rotation, scale).
   * The origin is specified as normalized coordinates (0.0 to 1.0).
   * - (0, 0) = top-left corner
   * - (0.5, 0.5) = center (default)
   * - (1, 1) = bottom-right corner
   *
   * @param x - Normalized X coordinate (0.0 to 1.0)
   * @param y - Normalized Y coordinate (0.0 to 1.0)
   * @returns The Paint instance for method chaining
   *
   * @example
   * ```typescript
   * const picture = new TVG.Picture();
   * picture.loadData(svgData, { format: 'svg' });
   *
   * // Set origin to center for rotation around center
   * picture.origin(0.5, 0.5);
   * picture.translate(300, 300);
   * picture.rotate(45);
   * ```
   */
  public origin(x: number, y: number): this {
    const Module = getModule();
    const result = Module._tvg_picture_set_origin(this.ptr, x, y);
    checkResult(result, 'origin');
    return this;
  }

  /**
   * Set the blending method for this paint.
   * Blending determines how this paint is combined with the content below it.
   *
   * @param method - The blending method to use
   * @returns The Paint instance for method chaining
   *
   * @example
   * ```typescript
   * const scene = new TVG.Scene();
   * scene.blend(BlendMethod.Add);
   *
   * const shape = new TVG.Shape();
   * shape.appendCircle(100, 100, 50, 50);
   * shape.fill(255, 0, 0, 255);
   * shape.blend(BlendMethod.Multiply);
   * ```
   */
  public blend(method: BlendMethod): this {
    const Module = getModule();
    const result = Module._tvg_paint_set_blend_method(this.ptr, method);
    checkResult(result, 'blend');
    return this;
  }

  /**
   * Get or set the opacity (0 to 255)
   * @param value - The opacity value in the range [0 ~ 255], where 0 is completely transparent and 255 is opaque.
   * @returns When setting, returns the Paint instance for method chaining. When getting, returns the opacity value (0-255).
   *
   * @example
   * ```typescript
   * // Set opacity to 50% (half transparent)
   * shape.opacity(128);
   *
   * // Set to fully opaque
   * shape.opacity(255);
   *
   * // Get current opacity value
   * const currentOpacity = shape.opacity(); // returns 0-255
   * ```
   */
  public opacity(): number;
  public opacity(value: number): this;
  public opacity(value?: number): number | this {
    const Module = getModule();

    if (value !== undefined) {
      Module._tvg_paint_set_opacity(this.ptr, value);
      return this;
    }
    return Module._tvg_paint_get_opacity(this.ptr);
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
   * Get the axis-aligned bounding box (AABB) of this paint
   */
  public bounds(): Bounds;

  /**
   * Get the oriented bounding box (OBB) of this paint as 4 corner points
   * @param options - Options object with oriented flag
   */
  public bounds(options: { oriented: true }): Point[];

  /**
   * Get the bounding box of this paint
   * @param options - Optional options object with oriented flag
   * @returns AABB (Bounds) by default, or OBB (Point[]) if oriented is true
   */
  public bounds(options?: { oriented?: boolean }): Bounds | Point[] {
    const Module = getModule();

    if (options?.oriented) {
      // Get OBB (Oriented Bounding Box) - 4 corner points
      const pts = Module._malloc(32); // 4 points * 2 floats * 4 bytes = 32 bytes

      try {
        const result = Module._tvg_paint_get_obb(this.ptr, pts);
        if (result !== 0) {
          // Failed to get OBB
          return [];
        }

        const view = new Float32Array(Module.HEAPF32.buffer, pts, 8);
        return [
          { x: view[0]!, y: view[1]! },
          { x: view[2]!, y: view[3]! },
          { x: view[4]!, y: view[5]! },
          { x: view[6]!, y: view[7]! },
        ];
      } finally {
        Module._free(pts);
      }
    } else {
      // Get AABB (Axis-Aligned Bounding Box)
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
   * Applies a custom transformation matrix to the paint.
   *
   * This method allows you to apply complex transformations that combine
   * translation, rotation, scaling, and skewing in a single operation.
   * The matrix is multiplied with any existing transformations.
   *
   * @param matrix - A 3x3 transformation matrix
   * @returns The Paint instance for method chaining
   *
   * @example
   * ```typescript
   * // Apply a combined transformation
   * const shape = new TVG.Shape();
   * shape.appendRect(0, 0, 100, 100);
   *
   * // Create a matrix for: scale(2, 1.5) + rotate(45deg) + translate(100, 50)
   * const rad = (45 * Math.PI) / 180;
   * const cos = Math.cos(rad);
   * const sin = Math.sin(rad);
   *
   * shape.transform({
   *   e11: 2 * cos,   e12: -2 * sin,  e13: 100,
   *   e21: 1.5 * sin, e22: 1.5 * cos, e23: 50,
   *   e31: 0,         e32: 0,         e33: 1
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Create a skew transformation
   * const shape = new TVG.Shape();
   * shape.appendRect(0, 0, 100, 100);
   *
   * // Skew in X direction
   * shape.transform({
   *   e11: 1,   e12: 0.5, e13: 0,
   *   e21: 0,   e22: 1,   e23: 0,
   *   e31: 0,   e32: 0,   e33: 1
   * });
   * ```
   */
  public transform(matrix: Matrix): this {
    const Module = getModule();

    // Allocate memory for the matrix (9 floats)
    const matrixPtr = Module._malloc(36); // 9 * 4 bytes

    try {
      const view = new Float32Array(Module.HEAPF32.buffer, matrixPtr, 9);
      view[0] = matrix.e11;
      view[1] = matrix.e12;
      view[2] = matrix.e13;
      view[3] = matrix.e21;
      view[4] = matrix.e22;
      view[5] = matrix.e23;
      view[6] = matrix.e31;
      view[7] = matrix.e32;
      view[8] = matrix.e33;

      const result = Module._tvg_paint_set_transform(this.ptr, matrixPtr);
      checkResult(result, 'transform');
    } finally {
      Module._free(matrixPtr);
    }

    return this;
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
   * Sets a masking target object and the masking method.
   *
   * The masking restricts the transparency of the source paint using the target paint.
   *
   * @param target - A Paint object to use as the masking target
   * @param method - The method used to mask the source object with the target
   * @returns The Paint instance for method chaining
   *
   * @example
   * ```typescript
   * const mask = new TVG.Shape();
   * mask.appendCircle(200, 200, 125);
   * mask.fill(255, 255, 255);
   *
   * const shape = new TVG.Shape();
   * shape.appendRect(0, 0, 400, 400)
   *     .fill(255, 0, 0, 255)
   *     .mask(mask, MaskMethod.Alpha);
   *
   * canvas.add(shape);
   * ```
   */
  public mask(target: Paint, method: MaskMethod): this {
    const Module = getModule();
    const result = Module._tvg_paint_set_mask_method(this.ptr, target.ptr, method);
    checkResult(result, 'mask');
    return this;
  }

  /**
   * Checks if the paint intersects with the given rectangular region.
   *
   * @param x - The x-coordinate of the region's top-left corner
   * @param y - The y-coordinate of the region's top-left corner
   * @param width - The width of the region
   * @param height - The height of the region
   * @returns true if the paint intersects with the region, false otherwise
   *
   * @example
   * ```typescript
   * const shape = new TVG.Shape();
   * shape.appendRect(100, 100, 200, 200);
   *
   * // Check if shape intersects with a region
   * if (shape.intersects(150, 150, 100, 100)) {
   *   console.log('Shape intersects with region');
   * }
   * ```
   */
  public intersects(x: number, y: number, width: number, height: number): boolean {
    const Module = getModule();
    return Boolean(Module._tvg_paint_intersects(this.ptr, x, y, width, height));
  }

  /**
   * Create a new instance of this paint type with the given pointer
   * Must be implemented by subclasses
   */
  protected abstract _createInstance(ptr: number): Paint;
}
