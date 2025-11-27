/**
 * Radial gradient fill
 */

import { Fill } from './Fill';
import { getModule } from '../core/Module';
import { gradientRegistry } from '../core/Registry';

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
