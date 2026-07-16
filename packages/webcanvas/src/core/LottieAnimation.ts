/**
 * Control advanced Lottie features on top of Animation
 * @category LottieAnimation
 */

import { getModule } from '../interop/module';
import { Animation } from './Animation';
import { checkResult, handleError, ThorVGResultCode } from '../common/errors';

/**
 * Lottie slot data, keyed by the `sid` the Lottie exposes.
 *
 * @category LottieAnimation
 * @see {@link LottieAnimation.gen}
 *
 * @example
 * ```typescript
 * const slot: LottieSlotData = {
 *   ball_col: { p: { a: 0, k: [0, 1, 0, 1] } },
 * };
 * ```
 */
export type LottieSlotData = Record<string, unknown>;

/**
 * A named frame range embedded in the Lottie file at design time.
 * @category LottieAnimation
 * @see {@link LottieAnimation.marker}
 */
export interface LottieMarker {
  /** The marker name, as authored in the Lottie file */
  name: string;
  /** Starting frame of the marker */
  begin: number;
  /** Ending frame of the marker */
  end: number;
}

/**
 * Animation controller with the Lottie extensions: markers, slots, etc.
 *
 * Extends {@link Animation}, so loading and playback work identically.
 *
 * @category LottieAnimation
 *
 * @example
 * ```typescript
 * // Play a named range (Marker)
 * const animation = new TVG.LottieAnimation();
 * animation.load(lottieData);
 * canvas.add(animation.picture);
 *
 * animation.segment('walk-cycle');
 * animation.play(() => canvas.update().render());
 * ```
 *
 * @example
 * ```typescript
 * // Override a property of the Lottie (Slot)
 * const animation = new TVG.LottieAnimation();
 * animation.load(lottieData);
 *
 * const id = animation.gen({
 *   ball_col: { p: { a: 0, k: [0, 1, 0, 1] } },
 * });
 * animation.apply(id);
 * canvas.update().render();
 * ```
 */
export class LottieAnimation extends Animation {
  constructor() {
    const Module = getModule();
    super(Module._tvg_lottie_animation_new());
  }

  /**
   * Set the playback segment by marker name.
   *
   * Markers are designated at the design level, so the caller must know the
   * marker name in advance. Setting a marker discards any previously set segment.
   *
   * @param marker - The marker name, or `null` to reset to the full timeline
   *
   * @example
   * ```typescript
   * animation.segment('walk-cycle').play();
   * animation.segment(null); // back to the whole animation
   * ```
   */
  public override segment(marker: string | null): this;
  /**
   * Set animation segment/marker (for partial playback)
   * @param segment - Segment index (0-based)
   */
  public override segment(segment: number): this;
  public override segment(arg: string | null | number): this {
    if (typeof arg === 'number') {
      return super.segment(arg);
    }

    const Module = getModule();
    const markerPtr = arg === null ? 0 : Module.stringToNewUTF8(arg);

    try {
      const result = Module._tvg_lottie_animation_set_marker(this.ptr, markerPtr);
      checkResult(result, 'segment (marker)');
    } finally {
      if (markerPtr) Module._free(markerPtr);
    }

    return this;
  }

  /**
   * Get the number of markers in the loaded animation
   * @returns The marker count, or 0 if the animation has no markers
   */
  public markersCnt(): number {
    const Module = getModule();
    const cntPtr = Module._malloc(4);

    try {
      const result = Module._tvg_lottie_animation_get_markers_cnt(this.ptr, cntPtr);
      if (result !== ThorVGResultCode.Success) {
        checkResult(result, 'markersCnt');
        return 0;
      }
      return Module.HEAPU32[cntPtr >> 2]!;
    } finally {
      Module._free(cntPtr);
    }
  }

  /**
   * Get the name and frame range of a marker by index
   * @param idx - Zero-based marker index
   * @returns The marker, or null if the index is out of range
   *
   * @example
   * ```typescript
   * for (let i = 0; i < animation.markersCnt(); i++) {
   *   const marker = animation.marker(i);
   *   console.log(`${marker.name}: ${marker.begin} - ${marker.end}`);
   * }
   * ```
   */
  public marker(idx: number): LottieMarker | null {
    const Module = getModule();
    const namePtr = Module._malloc(4);
    const beginPtr = Module._malloc(4);
    const endPtr = Module._malloc(4);

    try {
      const result = Module._tvg_lottie_animation_get_marker_info(
        this.ptr,
        idx,
        namePtr,
        beginPtr,
        endPtr,
      );
      if (result !== ThorVGResultCode.Success) {
        checkResult(result, 'marker');
        return null;
      }

      // belongs to the animation (don't free).
      const strPtr = Module.HEAPU32[namePtr >> 2]!;
      if (!strPtr) return null;

      return {
        name: Module.UTF8ToString(strPtr),
        begin: Module.HEAPF32[beginPtr >> 2]!,
        end: Module.HEAPF32[endPtr >> 2]!,
      };
    } finally {
      Module._free(namePtr);
      Module._free(beginPtr);
      Module._free(endPtr);
    }
  }

  /**
   * Generate a slot from Lottie slot data, for overriding animation properties
   *
   * @param slot - The slot data. Pass an object and it is serialized for you, or a
   *               raw JSON string to hand through untouched - useful when the data
   *               already arrives as text.
   * @returns A non-zero slot ID on success
   *
   * @remarks
   * The slot format requires each entry to wrap its value in `p`. An entry without
   * it parses to an empty property, so `gen()` still returns a valid ID but the
   * override does nothing.
   *
   * @example
   * ```typescript
   * const id = animation.gen({
   *   fill_color: { p: { a: 0, k: [1, 0, 0] } },
   * });
   * animation.apply(id);
   * ```
   *
   * @see {@link apply}
   * @see {@link del}
   */
  public gen(slot: LottieSlotData | string): number {
    const Module = getModule();
    const json = typeof slot === 'string' ? slot : JSON.stringify(slot);
    const slotPtr = Module.stringToNewUTF8(json);

    try {
      const id = Module._tvg_lottie_animation_gen_slot(this.ptr, slotPtr) >>> 0;
      if (id === 0) {
        handleError('Failed to generate slot', 'gen');
      }
      return id;
    } finally {
      Module._free(slotPtr);
    }
  }

  /**
   * Apply a previously generated slot to the animation
   * @param id - The slot ID from {@link gen}, or 0 to reset all applied slots
   */
  public apply(id: number): this {
    const Module = getModule();
    const result = Module._tvg_lottie_animation_apply_slot(this.ptr, id);
    checkResult(result, 'apply');
    return this;
  }

  /**
   * Delete a previously generated slot
   * @param id - The slot ID from {@link gen}
   */
  public del(id: number): this {
    const Module = getModule();
    const result = Module._tvg_lottie_animation_del_slot(this.ptr, id);
    checkResult(result, 'del');
    return this;
  }

  /**
   * Set the quality level for Lottie effects such as blur and shadows
   * @param value - Quality level from 0 (fastest) to 100 (best), default 50.
   *                Values outside the range are clamped.
   */
  public quality(value: number): this {
    const Module = getModule();
    const clamped = Math.round(Math.max(0, Math.min(100, value)));
    const result = Module._tvg_lottie_animation_set_quality(this.ptr, clamped);
    checkResult(result, 'quality');
    return this;
  }
}
