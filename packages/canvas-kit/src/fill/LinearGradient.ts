/**
 * Linear gradient fill
 */

import { Fill } from './Fill';
import { getModule } from '../core/Module';
import { gradientRegistry } from '../core/Registry';

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
