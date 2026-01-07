/**
 * Linear gradient fill
 * @category Gradients
 */

import { Fill } from './Fill';
import { getModule } from '../core/Module';
import { gradientRegistry } from '../core/Registry';

/**
 * Linear gradient for filling shapes
 * @category Gradients
 *
 * @example
 * ```typescript
 * // Basic linear gradient
 * const gradient = new TVG.LinearGradient(100, 100, 300, 100);
 * gradient.addStop(0, [255, 0, 0, 255])    // Red
 *         .addStop(0.5, [255, 255, 0, 255]) // Yellow
 *         .addStop(1, [0, 255, 0, 255]);    // Green
 *
 * const shape = new TVG.Shape();
 * shape.appendRect(100, 100, 200, 100)
 *      .fillGradient(gradient);
 *
 * canvas.add(shape);
 * ```
 *
 * @example
 * ```typescript
 * // Vertical gradient with transparency
 * const gradient = new TVG.LinearGradient(200, 100, 200, 300);
 * gradient.addStop(0, [100, 150, 255, 255])
 *         .addStop(1, [100, 150, 255, 0])
 *         .spread('pad');
 *
 * const shape = new TVG.Shape();
 * shape.appendRect(150, 100, 100, 200)
 *      .fillGradient(gradient);
 *
 * canvas.add(shape);
 * ```
 */
export class LinearGradient extends Fill {
  constructor(x1: number, y1: number, x2: number, y2: number) {
    const Module = getModule();
    const ptr = Module._tvg_linear_gradient_new();
    super(ptr, gradientRegistry);
    Module._tvg_linear_gradient_set(ptr, x1, y1, x2, y2);
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
