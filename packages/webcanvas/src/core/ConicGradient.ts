/**
 * Conic gradient fill
 * @category Gradients
 */

import { Fill } from './Fill';
import { getModule } from '../interop/module';


/**
 * Conic gradient for filling shapes
 *
 * The gradient color transitions by the angle measured around a center point,
 * completing a full clockwise turn from the start angle.
 *
 * Spread options are ignored because the gradient always sweeps a full turn.
 * @category Gradients
 *
 * @example
 * ```typescript
 * // Color wheel
 * const gradient = new TVG.ConicGradient(200, 200);
 * gradient.addStop(0, [255, 0, 0, 255])       // Red
 *         .addStop(1 / 3, [0, 255, 0, 255])   // Green
 *         .addStop(2 / 3, [0, 0, 255, 255])   // Blue
 *         .addStop(1, [255, 0, 0, 255]);      // Back to red for a seamless loop
 *
 * const shape = new TVG.Shape();
 * shape.appendCircle(200, 200, 100)
 *      .fill(gradient);
 *
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Sweep starting from 12 o'clock
 * const gradient = new TVG.ConicGradient(200, 200, -90);
 * gradient.addStop(0, [255, 255, 255, 0])
 *         .addStop(1, [0, 150, 255, 255]);
 *
 * const shape = new TVG.Shape();
 * shape.appendCircle(200, 200, 100)
 *      .fill(gradient);
 *
 * canvas.add(shape);
 * ```
 *
 * @beta
 */
export class ConicGradient extends Fill {
  /**
   * The gradient sweeps a full turn clockwise around the center (cx, cy), beginning at angle.
   * Color stop offsets from 0 to 1 map clockwise over one full turn from angle.
   *
   * @param cx - The horizontal coordinate of the center of the gradient
   * @param cy - The vertical coordinate of the center of the gradient
   * @param angle - The initial angle in degrees, measured clockwise from the 3 o'clock direction (positive x-axis). Default: 0
   */
  constructor(cx: number, cy: number, angle: number = 0) {
    const Module = getModule();
    const ptr = Module._tvg_conic_gradient_new();
    super(ptr);
    Module._tvg_conic_gradient_set(ptr, cx, cy, angle);
  }

  /**
   * Build the gradient (apply all color stops)
   * This should be called after all addStop() calls
   */
  public build(): this {
    this._applyStops();
    return this;
  }
}
