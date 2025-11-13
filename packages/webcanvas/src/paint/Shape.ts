/**
 * Shape class for creating and manipulating vector graphics paths.
 *
 * Shape is the fundamental drawing primitive in ThorVG WebCanvas. It provides methods for
 * creating paths using moveTo/lineTo/cubicTo commands, as well as convenience methods for
 * common shapes like rectangles and circles. Shapes can be filled with solid colors or
 * gradients, and stroked with customizable line styles.
 *
 * @category Shapes
 *
 * @example
 * ```typescript
 * // Basic triangle
 * const shape = new TVG.Shape();
 * shape.moveTo(100, 50)
 *      .lineTo(150, 150)
 *      .lineTo(50, 150)
 *      .close()
 *      .fill(255, 0, 0, 255);
 * canvas.add(shape).render();
 * ```
 *
 * @example
 * ```typescript
 * // Rectangle with rounded corners
 * const rect = new TVG.Shape();
 * rect.appendRect(50, 50, 200, 100, { rx: 10, ry: 10 })
 *     .fill(0, 120, 255, 255)
 *     .stroke({ width: 3, color: [0, 0, 0, 255] });
 * ```
 *
 * @example
 * ```typescript
 * // Circle with gradient fill
 * const circle = new TVG.Shape();
 * const gradient = new TVG.RadialGradient(150, 150, 50);
 * gradient.addStop(0, [255, 255, 255, 255])
 *         .addStop(1, [0, 100, 255, 255]);
 *
 * circle.appendCircle(150, 150, 50)
 *       .fill(gradient);
 * ```
 *
 * @example
 * ```typescript
 * // Complex path with bezier curves
 * const shape = new TVG.Shape();
 * shape.moveTo(50, 100)
 *      .cubicTo(50, 50, 150, 50, 150, 100)
 *      .cubicTo(150, 150, 50, 150, 50, 100)
 *      .close()
 *      .fill(255, 100, 0, 255);
 * ```
 */

import { Paint } from './Paint';
import { Fill } from '../fill/Fill';
import { getModule } from '../core/Module';
import { shapeRegistry } from '../core/Registry';
import { StrokeCap, StrokeJoin, FillRule } from '../constants';
import { checkResult } from '../core/errors';

/**
 * Options for creating rectangles with rounded corners.
 *
 * @category Shapes
 */
export interface RectOptions {
  /** Horizontal corner radius. Default: 0 */
  rx?: number;
  /** Vertical corner radius. Default: 0 */
  ry?: number;
  /** Path direction. true = clockwise, false = counter-clockwise. Default: true */
  clockwise?: boolean;
}

/**
 * Comprehensive stroke styling options.
 *
 * @category Shapes
 */
export interface StrokeOptions {
  /** Stroke width in pixels */
  width?: number;
  /** Stroke color as [r, g, b, a] with values 0-255. Alpha is optional, defaults to 255. */
  color?: readonly [number, number, number, number?];
  /** Gradient fill for the stroke */
  gradient?: Fill;
  /** Line cap style: StrokeCap.Butt, StrokeCap.Round, or StrokeCap.Square. Default: StrokeCap.Butt */
  cap?: StrokeCap;
  /** Line join style: StrokeJoin.Miter, StrokeJoin.Round, or StrokeJoin.Bevel. Default: StrokeJoin.Miter */
  join?: StrokeJoin;
  /** Miter limit for 'miter' joins. Default: 4 */
  miterLimit?: number;
  /** Dash pattern as array of dash/gap lengths. Empty array [] resets to solid line. */
  dash?: number[];
  /** Dash pattern offset. Use with dash to shift pattern start position. */
  dashOffset?: number;
}

/**
 * Shape class for creating and manipulating vector graphics paths.
 *
 * Extends {@link Paint} to inherit transformation and opacity methods.
 *
 * @category Shapes
 *
 * @example
 * ```typescript
 * // Drawing basic shapes
 * const shape = new TVG.Shape();
 *
 * // Rectangle with rounded corners
 * shape.appendRect(50, 50, 200, 100, 10)
 *      .fill(255, 100, 100, 255)
 *      .stroke(50, 50, 50, 255, 2);
 *
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Drawing paths with gradients
 * const shape = new TVG.Shape();
 * shape.moveTo(100, 100)
 *      .lineTo(200, 150)
 *      .lineTo(150, 250)
 *      .close();
 *
 * const gradient = new TVG.LinearGradient(100, 100, 200, 250);
 * gradient.addStop(0, [255, 0, 0, 255])
 *         .addStop(1, [0, 0, 255, 255]);
 *
 * shape.fillGradient(gradient);
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Complex path with transformations
 * const shape = new TVG.Shape();
 * shape.appendCircle(0, 0, 50)
 *      .fill(100, 200, 255, 255)
 *      .translate(400, 300)
 *      .scale(1.5)
 *      .rotate(45);
 *
 * canvas.add(shape);
 * ```
 */
export class Shape extends Paint {
  constructor(ptr?: number) {
    const Module = getModule();
    if (!ptr) {
      ptr = Module._tvg_shape_new();
    }
    super(ptr, shapeRegistry);
  }

  protected _createInstance(ptr: number): Shape {
    // Create shape from existing pointer (for duplicate)
    return new Shape(ptr);
  }

  /**
   * Moves the path cursor to a new point without drawing.
   *
   * This starts a new subpath at the specified coordinates. Subsequent drawing commands
   * will start from this point.
   *
   * @param x - X coordinate
   * @param y - Y coordinate
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * shape.moveTo(100, 100)
   *      .lineTo(200, 200);
   * ```
   */
  public moveTo(x: number, y: number): this {
    const Module = getModule();
    const result = Module._tvg_shape_move_to(this.ptr, x, y);
    checkResult(result, 'moveTo');
    return this;
  }

  /**
   * Draws a straight line from the current point to the specified coordinates.
   *
   * @param x - End X coordinate
   * @param y - End Y coordinate
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * // Draw a triangle
   * shape.moveTo(100, 50)
   *      .lineTo(150, 150)
   *      .lineTo(50, 150)
   *      .close();
   * ```
   */
  public lineTo(x: number, y: number): this {
    const Module = getModule();
    const result = Module._tvg_shape_line_to(this.ptr, x, y);
    checkResult(result, 'lineTo');
    return this;
  }

  /**
   * Draws a cubic Bézier curve from the current point to (x, y).
   *
   * @param cx1 - X coordinate of first control point
   * @param cy1 - Y coordinate of first control point
   * @param cx2 - X coordinate of second control point
   * @param cy2 - Y coordinate of second control point
   * @param x - End X coordinate
   * @param y - End Y coordinate
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * // Draw a smooth curve
   * shape.moveTo(50, 100)
   *      .cubicTo(50, 50, 150, 50, 150, 100);
   * ```
   */
  public cubicTo(
    cx1: number,
    cy1: number,
    cx2: number,
    cy2: number,
    x: number,
    y: number
  ): this {
    const Module = getModule();
    const result = Module._tvg_shape_cubic_to(this.ptr, cx1, cy1, cx2, cy2, x, y);
    checkResult(result, 'cubicTo');
    return this;
  }

  /**
   * Closes the current subpath by drawing a straight line back to the starting point.
   *
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * shape.moveTo(100, 50)
   *      .lineTo(150, 150)
   *      .lineTo(50, 150)
   *      .close(); // Completes the triangle
   * ```
   */
  public close(): this {
    const Module = getModule();
    const result = Module._tvg_shape_close(this.ptr);
    checkResult(result, 'close');
    return this;
  }

  /**
   * Appends a rectangle path to the shape.
   *
   * Creates a rectangular path with optional rounded corners. Multiple rectangles
   * can be added to the same shape.
   *
   * @param x - X coordinate of the top-left corner
   * @param y - Y coordinate of the top-left corner
   * @param w - Width of the rectangle
   * @param h - Height of the rectangle
   * @param options - Optional corner rounding and path direction
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * // Simple rectangle
   * shape.appendRect(50, 50, 200, 100);
   * ```
   *
   * @example
   * ```typescript
   * // Rounded rectangle
   * shape.appendRect(50, 50, 200, 100, { rx: 10, ry: 10 });
   * ```
   */
  public appendRect(
    x: number,
    y: number,
    w: number,
    h: number,
    options: RectOptions = {}
  ): this {
    const Module = getModule();
    const { rx = 0, ry = 0, clockwise = true } = options;
    const result = Module._tvg_shape_append_rect(
      this.ptr,
      x,
      y,
      w,
      h,
      rx,
      ry,
      clockwise ? 1 : 0
    );
    checkResult(result, 'appendRect');
    return this;
  }

  /**
   * Appends a circle or ellipse path to the shape.
   *
   * Creates a circular or elliptical path. If only one radius is provided,
   * creates a perfect circle. If two radii are provided, creates an ellipse.
   *
   * @param cx - X coordinate of the center
   * @param cy - Y coordinate of the center
   * @param rx - Horizontal radius
   * @param ry - Vertical radius (defaults to rx for perfect circle)
   * @param clockwise - Path direction. Default: true
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * // Perfect circle
   * shape.appendCircle(150, 150, 50)
   *      .fill(255, 0, 0, 255);
   * ```
   *
   * @example
   * ```typescript
   * // Ellipse
   * shape.appendCircle(150, 150, 80, 50)
   *      .fill(0, 100, 255, 255);
   * ```
   */
  public appendCircle(
    cx: number,
    cy: number,
    rx: number,
    ry: number = rx,
    clockwise: boolean = true
  ): this {
    const Module = getModule();
    const result = Module._tvg_shape_append_circle(this.ptr, cx, cy, rx, ry, clockwise ? 1 : 0);
    checkResult(result, 'appendCircle');
    return this;
  }

  /**
   * Sets the fill rule for the shape.
   *
   * The fill rule determines how the interior of a shape is calculated when the path
   * intersects itself or when multiple subpaths overlap.
   *
   * @param rule - Fill rule: 'winding' (non-zero) or 'evenodd'
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * const star = new TVG.Shape();
   * // Draw a self-intersecting star
   * star.moveTo(100, 10)
   *     .lineTo(40, 180)
   *     .lineTo(190, 60)
   *     .lineTo(10, 60)
   *     .lineTo(160, 180)
   *     .close()
   *     .fillRule(FillRule.EvenOdd)  // Use even-odd rule for star shape
   *     .fill(255, 200, 0, 255);
   * ```
   */
  public fillRule(rule: FillRule): this {
    const Module = getModule();
    const result = Module._tvg_shape_set_fill_rule(this.ptr, rule);
    checkResult(result, 'fillRule');
    return this;
  }

  /**
   * Sets the trim of the shape along the defined path segment, controlling which part is visible.
   *
   * This method allows you to trim/cut paths, showing only a portion from the begin to end point.
   * This is particularly useful for animations (e.g., drawing a line progressively) or creating
   * partial shapes like arcs from circles.
   *
   * If the values exceed the 0-1 range, they wrap around (similar to angle wrapping).
   *
   * @param begin - Start of the segment to display (0.0 to 1.0, where 0 is the path start)
   * @param end - End of the segment to display (0.0 to 1.0, where 1 is the path end)
   * @param simultaneous - How to handle multiple paths within the shape:
   *   - `true` (default): Trimming applied simultaneously to all paths
   *   - `false`: All paths treated as one entity with combined length
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * // Draw half a circle (arc)
   * const arc = new TVG.Shape();
   * arc.appendCircle(150, 150, 100)
   *    .trimPath(0, 0.5)  // Show only first half
   *    .stroke({ width: 5, color: [255, 0, 0, 255] });
   * ```
   *
   * @example
   * ```typescript
   * // Animated line drawing effect
   * const line = new TVG.Shape();
   * line.moveTo(50, 100)
   *     .lineTo(250, 100)
   *     .trimPath(0, progress)  // progress from 0 to 1
   *     .stroke({ width: 3, color: [0, 100, 255, 255] });
   * ```
   *
   * @example
   * ```typescript
   * // Trim multiple paths separately
   * const shape = new TVG.Shape();
   * shape.appendRect(50, 50, 100, 100)
   *      .appendCircle(200, 100, 50)
   *      .trimPath(0.25, 0.75, true)  // Trim each path separately
   *      .stroke({ width: 2, color: [0, 0, 0, 255] });
   * ```
   */
  public trimPath(begin: number, end: number, simultaneous: boolean = true): this {
    const Module = getModule();
    const result = Module._tvg_shape_set_trimpath(this.ptr, begin, end, simultaneous ? 1 : 0);
    checkResult(result, 'trimPath');
    return this;
  }

  /**
   * Sets the fill for the shape with a gradient.
   *
   * @param gradient - LinearGradient or RadialGradient to use as fill
   * @returns The Shape instance for method chaining
   */
  public fill(gradient: Fill): this;

  /**
   * Sets the fill for the shape with a solid color.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @param a - Alpha component (0-255). Default: 255 (opaque)
   * @returns The Shape instance for method chaining
   */
  public fill(r: number, g: number, b: number, a?: number): this;

  /**
   * Sets the fill for the shape with either a solid color or gradient.
   *
   * This method supports two calling patterns:
   * 1. Solid color: `fill(r, g, b, a?)`
   * 2. Gradient: `fill(gradient)`
   *
   * @example
   * ```typescript
   * // Solid color fill
   * shape.fill(255, 0, 0, 255); // Red
   * shape.fill(0, 255, 0);      // Green (alpha defaults to 255)
   * ```
   *
   * @example
   * ```typescript
   * // Gradient fill
   * const gradient = new TVG.LinearGradient(0, 0, 200, 0);
   * gradient.addStop(0, [255, 0, 0, 255])
   *         .addStop(1, [0, 0, 255, 255]);
   * shape.fill(gradient);
   * ```
   */
  public fill(
    gradientOrR: Fill | number,
    g?: number,
    b?: number,
    a: number = 255
  ): this {
    const Module = getModule();

    if (gradientOrR instanceof Fill) {
      // Gradient fill - apply pending stops before setting
      gradientOrR['_applyStops']();
      const result = Module._tvg_shape_set_gradient(this.ptr, gradientOrR.ptr);
      checkResult(result, 'fill (gradient)');
    } else if (typeof gradientOrR === 'number' && g !== undefined && b !== undefined) {
      // RGB or RGBA color
      const result = Module._tvg_shape_set_fill_color(this.ptr, gradientOrR, g, b, a);
      checkResult(result, 'fill (color)');
    } else {
      throw new TypeError('Invalid fill arguments');
    }
    return this;
  }

  /**
   * Sets the stroke width for the shape.
   *
   * @param width - Stroke width in pixels
   * @returns The Shape instance for method chaining
   */
  public stroke(width: number): this;

  /**
   * Sets comprehensive stroke styling options for the shape.
   *
   * @param options - Stroke configuration including width, color, gradient, caps, joins, and miter limit
   * @returns The Shape instance for method chaining
   */
  public stroke(options: StrokeOptions): this;

  /**
   * Sets the stroke styling for the shape.
   *
   * This method supports two calling patterns:
   * 1. Simple width: `stroke(width)`
   * 2. Full options: `stroke({ width, color, gradient, cap, join, miterLimit })`
   *
   * @example
   * ```typescript
   * // Simple stroke
   * shape.appendCircle(150, 150, 50)
   *      .stroke(3);
   * ```
   *
   * @example
   * ```typescript
   * // Stroke with color and caps
   * shape.appendRect(50, 50, 200, 100)
   *      .stroke({
   *        width: 5,
   *        color: [0, 0, 0, 255],
   *        cap: StrokeCap.Round,
   *        join: StrokeJoin.Round
   *      });
   * ```
   *
   * @example
   * ```typescript
   * // Stroke with gradient
   * const gradient = new TVG.LinearGradient(0, 0, 200, 0);
   * gradient.addStop(0, [255, 0, 0, 255])
   *         .addStop(1, [0, 0, 255, 255]);
   *
   * shape.appendCircle(150, 150, 50)
   *      .stroke({
   *        width: 10,
   *        gradient: gradient,
   *        cap: StrokeCap.Round
   *      });
   * ```
   */
  public stroke(widthOrOptions: number | StrokeOptions): this {
    const Module = getModule();

    if (typeof widthOrOptions === 'number') {
      // Just width
      const result = Module._tvg_shape_set_stroke_width(this.ptr, widthOrOptions);
      checkResult(result, 'stroke (width)');
    } else {
      const { width, color, cap, join, gradient, miterLimit, dash, dashOffset } = widthOrOptions;

      if (width !== undefined) {
        const result = Module._tvg_shape_set_stroke_width(this.ptr, width);
        checkResult(result, 'stroke (width)');
      }
      if (color) {
        const [r, g, b, a = 255] = color;
        const result = Module._tvg_shape_set_stroke_color(this.ptr, r, g, b, a);
        checkResult(result, 'stroke (color)');
      }
      if (gradient) {
        // Apply pending stops before setting stroke gradient
        gradient['_applyStops']();
        const result = Module._tvg_shape_set_stroke_gradient(this.ptr, gradient.ptr);
        checkResult(result, 'stroke (gradient)');
      }
      if (cap !== undefined) {
        const result = Module._tvg_shape_set_stroke_cap(this.ptr, cap);
        checkResult(result, 'stroke (cap)');
      }
      if (join !== undefined) {
        const result = Module._tvg_shape_set_stroke_join(this.ptr, join);
        checkResult(result, 'stroke (join)');
      }
      if (miterLimit !== undefined) {
        const result = Module._tvg_shape_set_stroke_miterlimit(this.ptr, miterLimit);
        checkResult(result, 'stroke (miterLimit)');
      }

      // Handle dash pattern and offset
      if (dash !== undefined || dashOffset !== undefined) {
        let pattern = dash;
        let offset = dashOffset ?? 0;

        // If only dashOffset is provided, get current pattern from engine
        if (pattern === undefined && dashOffset !== undefined) {
          const cntPtr = Module._malloc(4); // uint32_t
          const offsetPtr = Module._malloc(4); // float
          const patternPtr = Module._malloc(4); // pointer to pattern array

          try {
            const getResult = Module._tvg_shape_get_stroke_dash(
              this.ptr,
              patternPtr,
              cntPtr,
              offsetPtr
            );

            if (getResult === 0) {
              // Successfully retrieved current pattern
              const cnt = Module.HEAPU32[cntPtr / 4]!;
              if (cnt > 0) {
                const patternArrayPtr = Module.HEAPU32[patternPtr / 4]!;
                pattern = [];
                for (let i = 0; i < cnt; i++) {
                  pattern.push(Module.HEAPF32[(patternArrayPtr / 4) + i]!);
                }
              }
            }
          } finally {
            Module._free(cntPtr);
            Module._free(offsetPtr);
            Module._free(patternPtr);
          }
        }

        // Set dash pattern (or reset if empty array)
        if (pattern !== undefined) {
          if (pattern.length === 0) {
            // Empty array resets to solid line
            const result = Module._tvg_shape_set_stroke_dash(this.ptr, 0, 0, 0);
            checkResult(result, 'stroke (dash reset)');
          } else {
            // Set dash pattern with offset
            const patternDataPtr = Module._malloc(pattern.length * 4); // 4 bytes per float

            try {
              // Write pattern to HEAPF32
              for (let i = 0; i < pattern.length; i++) {
                Module.HEAPF32[(patternDataPtr / 4) + i] = pattern[i]!;
              }

              const result = Module._tvg_shape_set_stroke_dash(
                this.ptr,
                patternDataPtr,
                pattern.length,
                offset
              );
              checkResult(result, 'stroke (dash)');
            } finally {
              Module._free(patternDataPtr);
            }
          }
        }
      }
    }
    return this;
  }

  /**
   * Resets the shape's path data while retaining fill and stroke properties.
   *
   * This method clears all path commands (moveTo, lineTo, cubicTo, appendRect, etc.)
   * but preserves the shape's fill color, gradient, stroke settings, and transformations.
   * This is useful for animations where you want to redraw the path while keeping
   * the same styling.
   *
   * @returns The Shape instance for method chaining
   *
   * @example
   * ```typescript
   * // Animating shape changes while keeping styles
   * const shape = new TVG.Shape();
   * shape.appendRect(0, 0, 100, 100);
   * shape.fill(255, 0, 0, 255);
   * shape.stroke({ width: 5, color: [0, 0, 255, 255] });
   *
   * // Later, change the shape but keep the fill/stroke
   * shape.reset();
   * shape.appendCircle(50, 50, 40);
   * // Still has red fill and blue stroke!
   * ```
   */
  public reset(): this {
    const Module = getModule();
    const result = Module._tvg_shape_reset(this.ptr);
    checkResult(result, 'reset');
    return this;
  }
}
