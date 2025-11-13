/**
 * Radial gradient fill
 * @category Gradients
 */

import { Fill } from './Fill';
import { getModule } from '../core/Module';
import { gradientRegistry } from '../core/Registry';

/**
 * Radial gradient for filling shapes
 * @category Gradients
 *
 * @example
 * ```typescript
 * // Basic radial gradient
 * const gradient = new TVG.RadialGradient(200, 200, 100);
 * gradient.addStop(0, [255, 255, 255, 255])  // White center
 *         .addStop(1, [100, 100, 255, 255]);  // Blue edge
 *
 * const shape = new TVG.Shape();
 * shape.appendCircle(200, 200, 100)
 *      .fillGradient(gradient);
 *
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Radial gradient with focal point
 * // Create gradient with offset focal point for lighting effect
 * const gradient = new TVG.RadialGradient(
 *   200, 200, 100,  // Center and radius
 *   170, 170, 0     // Focal point (offset)
 * );
 * gradient.addStop(0, [255, 255, 200, 255])
 *         .addStop(1, [255, 100, 100, 255]);
 *
 * const shape = new TVG.Shape();
 * shape.appendCircle(200, 200, 100)
 *      .fillGradient(gradient);
 *
 * canvas.add(shape);
 * ```
 */
export class RadialGradient extends Fill {
  constructor(cx: number, cy: number, r: number, fx: number = cx, fy: number = cy, fr: number = 0) {
    const Module = getModule();
    const ptr = Module._tvg_radial_gradient_new();
    super(ptr, gradientRegistry);
    Module._tvg_radial_gradient_set(ptr, cx, cy, r, fx, fy, fr);
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
