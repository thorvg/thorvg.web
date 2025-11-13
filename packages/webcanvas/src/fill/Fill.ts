/**
 * Base class for Fill objects (gradients)
 * @category Gradients
 */

import { WasmObject } from '../core/WasmObject';
import { getModule } from '../core/Module';
import type { GradientSpreadType } from '../constants';
import { GradientSpread } from '../constants';

/**
 * @category Gradients
 */
export type ColorStop = readonly [number, number, number, number];

interface ColorStopEntry {
  offset: number;
  color: ColorStop;
}

export abstract class Fill extends WasmObject {
  protected _stops: ColorStopEntry[] = [];

  protected _cleanup(ptr: number): void {
    const Module = getModule();
    Module._tvg_gradient_del(ptr);
  }

  /**
   * Add a color stop to the gradient
   * @param offset - Position of the stop (0.0 to 1.0)
   * @param color - RGBA color [r, g, b, a] where each value is 0-255
   */
  public addStop(offset: number, color: ColorStop): this {
    this._stops.push({ offset, color });
    return this;
  }

  /**
   * Apply collected color stops to the gradient
   * ColorStop struct: {float offset, uint8_t r, g, b, a} = 8 bytes per stop
   */
  protected _applyStops(): void {
    if (this._stops.length === 0) return;

    const Module = getModule();
    const count = this._stops.length;
    const stopsPtr = Module._malloc(count * 8); // 8 bytes per stop

    try {
      // Use DataView for proper cross-platform byte alignment
      const dataView = new DataView(Module.HEAPU8.buffer, stopsPtr, count * 8);

      for (let i = 0; i < count; i++) {
        const stop = this._stops[i]!;
        const offset = i * 8;

        // Write offset (float, 4 bytes, little-endian)
        dataView.setFloat32(offset, stop.offset, true);

        // Write color (4 bytes: r, g, b, a)
        dataView.setUint8(offset + 4, stop.color[0]);
        dataView.setUint8(offset + 5, stop.color[1]);
        dataView.setUint8(offset + 6, stop.color[2]);
        dataView.setUint8(offset + 7, stop.color[3]);
      }

      Module._tvg_gradient_set_color_stops(this.ptr, stopsPtr, count);
    } finally {
      Module._free(stopsPtr);
      this._stops = [];
    }
  }

  /**
   * Set the gradient spread method
   */
  public spread(type: GradientSpreadType): this {
    const Module = getModule();
    const spreadMap: Record<GradientSpreadType, number> = {
      pad: GradientSpread.Pad,
      reflect: GradientSpread.Reflect,
      repeat: GradientSpread.Repeat,
    };
    Module._tvg_gradient_set_spread(this.ptr, spreadMap[type]);
    return this;
  }
}
