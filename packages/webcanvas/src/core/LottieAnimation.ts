/**
 * Control advanced Lottie features on top of Animation
 * @category LottieAnimation
 */

import { getModule } from '../interop/module';
import { callbackRegistry } from '../interop/registry';
import { Animation } from './Animation';
import { LottieAudio } from './media/Audio';
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
 * Describes the current state of a Lottie audio layer.
 *
 * This structure is provided to the audio resolver callback and contains
 * the information required to synchronize audio playback with the animation
 * timeline.
 *
 * @category LottieAnimation
 * @see {@link AudioResolver}
 * @beta
 */
export interface AudioInfo {
  /** Audio source: a file path/URL, or the embedded raw bytes. */
  src: string | Uint8Array;
  /** MIME type string; valid when the source is embedded; may be `null`. */
  mimeType: string | null;
  /** Position within the audio file in seconds; valid when `active`. */
  offset: number;
  /** Volume [0, 1]; valid when `active`. */
  volume: number;
  /** `true` while the layer is within its playback range. */
  active: boolean;
}

/**
 * Audio resolver callback
 *
 * @param info - Current state of the audio layer.
 *
 * @category LottieAnimation
 * @beta
 */
export type AudioResolver = (info: AudioInfo) => void;

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
  #audio: LottieAudio | null = null;
  #resolver: AudioResolver | null = null;
  #resolverPtr: number | null = null;
  #audioData = new Map<number, Uint8Array>();

  constructor() {
    const Module = getModule();
    super(Module._tvg_lottie_animation_new());
  }

  /**
   * Load Lottie animation from raw data
   * @param data - Lottie JSON data as Uint8Array or string
   */
  public override load(data: Uint8Array | string): this {
    super.load(data);
    this.#attachAudio();
    return this;
  }

  /**
   * Get or set the current frame
   */
  public override frame(): number;
  public override frame(frameNumber: number): this;
  public override frame(frameNumber?: number): number | this {
    if (frameNumber === undefined) return super.frame();

    super.frame(frameNumber);
    this.#syncAudio(frameNumber);
    return this;
  }

  /**
   * Play the animation
   * @param onFrame - Optional callback called on each frame update
   */
  public override play(onFrame?: (frame: number) => void): this {
    return super.play((frame) => {
      this.#syncAudio(frame);
      onFrame?.(frame);
    });
  }

  /**
   * Pause the animation
   */
  public override pause(): this {
    super.pause();
    this.#audio?.hold();
    return this;
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

  /**
   * Get or set the audio volume level in the range [0.0, 1.0].
   * @beta
   */
  public volume(): number;
  public volume(value: number): this;
  public volume(value?: number): number | this {
    if (value === undefined) return this.#audio?.volume() ?? 1;
    this.#audio?.volume(value);
    return this;
  }

  /**
   * Mute or unmute the audio layers.
   * @beta
   */
  public mute(on: boolean): this {
    this.#audio?.mute(on);
    return this;
  }

  /**
   * Whether the audio layers are currently muted.
   * @beta
   */
  public muted(): boolean {
    return this.#audio?.muted() ?? false;
  }

  /**
   * Sets the audio resolver callback for the Lottie audio layers.
   *
   * The built-in backend stops while a resolver is set, so the resolver takes
   * on every audio layer of the animation.
   *
   * @param callback - The resolver, or `null` to hand the layers back to the
   *                   built-in backend.
   *
   * @example
   * ```typescript
   * animation.resolver((info) => {
   *   if (info.active) {
   *     //Start or seek playback of info.src.
   *   } else {
   *     //Stop playback of info.src.
   *   }
   * });
   * ```
   *
   * @see {@link AudioResolver}
   * @beta
   */
  public resolver(callback: AudioResolver | null): this {
    this.#resolver = callback;

    if (callback) {
      this.#audio?.dispose();
      this.#audio = null;
    } else if (!this.#audio && this.#resolverPtr) {
      this.#audio = new LottieAudio();
    }

    return this;
  }

  public override dispose(): void {
    if (this.isDisposed) {
      return;
    }

    this.#audio?.dispose();
    this.#audio = null;
    this.#audioData.clear();

    if (this.#resolverPtr) {
      const Module = getModule();
      Module._tvg_lottie_animation_set_audio_resolver(this.ptr, 0, 0);
      Module.removeFunction(this.#resolverPtr);
      callbackRegistry.unregister(this);
      this.#resolverPtr = null;
    }

    super.dispose();
  }

  #syncAudio(frame: number): void {
    const audio = this.#audio;
    if (!audio) return;

    const info = this.info();
    audio.tick(frame, info?.fps ?? 0, info?.totalFrames ?? 0);
  }

  #readAudio(ptr: number): AudioInfo | null {
    const Module = getModule();

    //Tvg_Audio_Info
    const srcPtr = Module.HEAPU32[ptr >> 2]!; // const char*, a path or the embedded bytes
    const mime = Module.HEAPU32[(ptr + 4) >> 2]!; // const char*
    const size = Module.HEAPU32[(ptr + 8) >> 2]!; // uint32_t
    const offset = Module.HEAPF32[(ptr + 12) >> 2]!; // float, seconds into the audio
    const volume = Module.HEAPF32[(ptr + 16) >> 2]!; // float, 0 to 100
    const active = Module.HEAPU8[ptr + 20] !== 0; // bool
    const embedded = Module.HEAPU8[ptr + 21] !== 0; // bool

    if (!srcPtr || (embedded && size === 0)) return null;

    const path = embedded ? null : Module.UTF8ToString(srcPtr);
    if (path !== null && !path) return null;

    let src: string | Uint8Array;
    if (path !== null) {
      src = path;
    } else {
      let data = this.#audioData.get(srcPtr);
      if (!data) {
        data = Module.HEAPU8.slice(srcPtr, srcPtr + size);
        this.#audioData.set(srcPtr, data);
      }
      src = data;
    }

    return {
      active,
      offset,
      volume: volume / 100,
      src,
      mimeType: embedded && mime ? Module.UTF8ToString(mime) : null,
    };
  }

  #attachAudio(): void {
    const Module = getModule();

    this.#audio?.dispose();
    this.#audio = this.#resolver ? null : new LottieAudio();
    this.#audioData.clear();

    if (!this.#resolverPtr) {
      const self = new WeakRef(this);

      const funcPtr = Module.addFunction((infoPtr: number): void => {
        const anim = self.deref();
        if (!anim) return;

        const info = anim.#readAudio(infoPtr);
        if (!info) return;

        if (anim.#resolver) anim.#resolver(info);
        else anim.#audio?.resolve(info, anim.frame());
      }, 'vii');

      this.#resolverPtr = funcPtr;
      callbackRegistry.register(this, funcPtr, this);
    }

    const result = Module._tvg_lottie_animation_set_audio_resolver(this.ptr, this.#resolverPtr, 0);
    if (result !== ThorVGResultCode.Success && result !== ThorVGResultCode.InsufficientCondition) {
      checkResult(result, 'audio resolver');
    }
  }
}
