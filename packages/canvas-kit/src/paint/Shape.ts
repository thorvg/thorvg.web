/**
 * Shape class for vector graphics
 */

import { Paint } from './Paint';
import { Fill } from '../fill/Fill';
import { getModule } from '../core/Module';
import { shapeRegistry } from '../core/Registry';
import type { StrokeCapType, StrokeJoinType } from '../constants';
import { StrokeCap, StrokeJoin } from '../constants';
import { checkResult } from '../core/errors';

export interface RectOptions {
  rx?: number;
  ry?: number;
  clockwise?: boolean;
}

export interface StrokeOptions {
  width?: number;
  color?: readonly [number, number, number, number?];
  gradient?: Fill;
  cap?: StrokeCapType;
  join?: StrokeJoinType;
  miterLimit?: number;
}

export class Shape extends Paint {
  constructor() {
    const Module = getModule();
    const ptr = Module._tvg_shape_new();
    super(ptr, shapeRegistry);
  }

  protected _createInstance(ptr: number): Shape {
    // Create shape from existing pointer (for duplicate)
    const shape = Object.create(Shape.prototype) as Shape;
    // Manually initialize the shape with the new pointer
    Object.setPrototypeOf(shape, Shape.prototype);
    shape.ptr = ptr;
    return shape;
  }

  /**
   * Move to a point
   */
  public moveTo(x: number, y: number): this {
    const Module = getModule();
    const result = Module._tvg_shape_move_to(this.ptr, x, y);
    checkResult(result, 'moveTo');
    return this;
  }

  /**
   * Draw a line to a point
   */
  public lineTo(x: number, y: number): this {
    const Module = getModule();
    const result = Module._tvg_shape_line_to(this.ptr, x, y);
    checkResult(result, 'lineTo');
    return this;
  }

  /**
   * Draw a cubic bezier curve
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
   * Close the current path
   */
  public close(): this {
    const Module = getModule();
    const result = Module._tvg_shape_close(this.ptr);
    checkResult(result, 'close');
    return this;
  }

  /**
   * Append a rectangle to the shape
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
   * Append a circle/ellipse to the shape
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
   * Set fill color or gradient
   */
  public fill(gradient: Fill): this;
  public fill(r: number, g: number, b: number, a?: number): this;
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
   * Set stroke width or full stroke options
   */
  public stroke(width: number): this;
  public stroke(options: StrokeOptions): this;
  public stroke(widthOrOptions: number | StrokeOptions): this {
    const Module = getModule();

    if (typeof widthOrOptions === 'number') {
      // Just width
      const result = Module._tvg_shape_set_stroke_width(this.ptr, widthOrOptions);
      checkResult(result, 'stroke (width)');
    } else {
      const { width, color, cap, join, gradient, miterLimit } = widthOrOptions;

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
      if (cap) {
        const capMap: Record<StrokeCapType, number> = {
          butt: StrokeCap.Butt,
          round: StrokeCap.Round,
          square: StrokeCap.Square,
        };
        const result = Module._tvg_shape_set_stroke_cap(this.ptr, capMap[cap]);
        checkResult(result, 'stroke (cap)');
      }
      if (join) {
        const joinMap: Record<StrokeJoinType, number> = {
          miter: StrokeJoin.Miter,
          round: StrokeJoin.Round,
          bevel: StrokeJoin.Bevel,
        };
        const result = Module._tvg_shape_set_stroke_join(this.ptr, joinMap[join]);
        checkResult(result, 'stroke (join)');
      }
      if (miterLimit !== undefined) {
        const result = Module._tvg_shape_set_stroke_miterlimit(this.ptr, miterLimit);
        checkResult(result, 'stroke (miterLimit)');
      }
    }
    return this;
  }
}
