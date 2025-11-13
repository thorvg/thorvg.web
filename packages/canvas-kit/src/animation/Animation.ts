/**
 * Animation class for loading and controlling Lottie animations
 * @category Animation
 */

import { getModule } from '../core/Module';
import { Picture } from '../paint/Picture';
import { checkResult } from '../core/errors';

/**
 * @category Animation
 */
export interface AnimationInfo {
  totalFrames: number;
  duration: number; // in seconds
  fps: number;
}

/**
 * @category Animation
 */
export interface AnimationSegment {
  start: number;
  end: number;
}

/**
 * Animation controller for Lottie animations
 * The Animation owns a Picture internally and manages frame updates
 * @category Animation
 *
 * @example
 * ```typescript
 * // Loading and playing a Lottie animation
 * const animation = new TVG.Animation();
 *
 * fetch('/animations/loader.json')
 *   .then(res => res.text())
 *   .then(lottieData => {
 *     animation.load(lottieData);
 *     const picture = animation.picture();
 *
 *     // Center and scale animation
 *     const size = picture.size();
 *     picture.translate(400 - size.width / 2, 300 - size.height / 2);
 *
 *     canvas.add(picture);
 *     animation.play();
 *   });
 * ```
 *
 * @example
 * ```typescript
 * // Controlling animation playback
 * const animation = new TVG.Animation();
 * animation.load(lottieData);
 *
 * const info = animation.getInfo();
 * console.log(`Duration: ${info.duration}s, FPS: ${info.fps}`);
 *
 * // Play with custom loop and speed
 * animation.loop(true).play();
 *
 * // Pause after 2 seconds
 * setTimeout(() => animation.pause(), 2000);
 *
 * // Jump to specific frame
 * animation.frame(30).render();
 * ```
 *
 * @example
 * ```typescript
 * // Animation segments and callbacks
 * const animation = new TVG.Animation();
 * animation.load(lottieData);
 *
 * // Play specific segment
 * animation.segment({ start: 0, end: 60 });
 *
 * // Listen to frame updates
 * animation.onFrame((frame) => {
 *   console.log(`Current frame: ${frame}`);
 * });
 *
 * animation.play();
 * ```
 */
export class Animation {
  #ptr: number;
  #picture: Picture | null = null;
  #info: AnimationInfo | null = null;
  #isPlaying = false;
  #currentFrame = 0;
  #animationFrameId: number | null = null;
  #lastTime = 0;
  #onFrame?: (frame: number) => void;
  #loop = true;

  constructor() {
    const Module = getModule();
    this.#ptr = Module._tvg_animation_new();

    if (!this.#ptr) {
      throw new Error('Failed to create animation');
    }
  }

  /**
   * Get the pointer (internal use)
   */
  public get ptr(): number {
    return this.#ptr;
  }

  /**
   * Get the Picture object that contains the animation content
   * The Picture is owned by the Animation and should not be manually disposed
   */
  public get picture(): Picture | null {
    if (!this.#picture && this.#ptr) {
      const Module = getModule();
      const picturePtr = Module._tvg_animation_get_picture(this.#ptr);

      if (picturePtr) {
        // Create Picture instance from existing pointer
        // skipRegistry = true because Animation owns this picture
        this.#picture = new Picture(picturePtr, true);
      }
    }
    return this.#picture;
  }

  /**
   * Load Lottie animation from raw data
   * @param data - Lottie JSON data as Uint8Array or string
   * @param options - Load options
   */
  public load(data: Uint8Array | string, options: { resourcePath?: string; copy?: boolean } = {}): this {
    const picture = this.picture;
    if (!picture) {
      throw new Error('Failed to get picture from animation');
    }

    // Load data into the picture
    picture.loadData(data, {
      format: 'json',
      resourcePath: options.resourcePath,
      copy: options.copy,
    });

    // Get animation info
    this.#updateInfo();

    return this;
  }

  /**
   * Get animation information (frames, duration, fps)
   */
  public info(): AnimationInfo | null {
    return this.#info;
  }

  /**
   * Get or set the current frame
   */
  public frame(): number;
  public frame(frameNumber: number): this;
  public frame(frameNumber?: number): number | this {
    const Module = getModule();

    if (frameNumber !== undefined) {
      // Setter
      this.#currentFrame = frameNumber;
      const result = Module._tvg_animation_set_frame(this.#ptr, frameNumber);
      checkResult(result, 'frame (set)');
      return this;
    }

    // Getter
    return this.#currentFrame;
  }

  /**
   * Set animation segment/marker (for partial playback)
   * @param segment - Segment index (0-based)
   */
  public segment(segment: number): this {
    const Module = getModule();
    const result = Module._tvg_animation_set_segment(this.#ptr, segment);
    checkResult(result, 'segment');
    return this;
  }

  /**
   * Play the animation
   * @param onFrame - Optional callback called on each frame update
   */
  public play(onFrame?: (frame: number) => void): this {
    if (this.#isPlaying) {
      return this;
    }

    if (!this.#info) {
      throw new Error('No animation loaded');
    }

    this.#isPlaying = true;
    this.#onFrame = onFrame;
    this.#lastTime = 0;

    this.#animate(performance.now());

    return this;
  }

  /**
   * Pause the animation
   */
  public pause(): this {
    this.#isPlaying = false;
    if (this.#animationFrameId !== null) {
      cancelAnimationFrame(this.#animationFrameId);
      this.#animationFrameId = null;
    }
    return this;
  }

  /**
   * Stop the animation and reset to frame 0
   */
  public stop(): this {
    this.pause();
    this.frame(0);
    return this;
  }

  /**
   * Check if animation is currently playing
   */
  public isPlaying(): boolean {
    return this.#isPlaying;
  }

  /**
   * Set whether animation should loop
   */
  public setLoop(loop: boolean): this {
    this.#loop = loop;
    return this;
  }

  /**
   * Get loop status
   */
  public getLoop(): boolean {
    return this.#loop;
  }

  /**
   * Seek to a specific time (in seconds)
   */
  public seek(time: number): this {
    if (!this.#info) {
      throw new Error('No animation loaded');
    }

    const frame = (time / this.#info.duration) * this.#info.totalFrames;
    this.frame(Math.max(0, Math.min(this.#info.totalFrames - 1, frame)));
    return this;
  }

  /**
   * Get current time (in seconds)
   */
  public getCurrentTime(): number {
    if (!this.#info) {
      return 0;
    }
    return (this.#currentFrame / this.#info.totalFrames) * this.#info.duration;
  }

  /**
   * Dispose of the animation and free resources
   */
  public dispose(): void {
    this.pause();

    if (this.#ptr) {
      const Module = getModule();
      Module._tvg_animation_del(this.#ptr);
      this.#ptr = 0;
      this.#picture = null;
      this.#info = null;
    }
  }

  /**
   * Internal animation loop
   * Note: User must call canvas.update() and canvas.render() in the frame callback
   */
  #animate = (time: number): void => {
    if (!this.#isPlaying || !this.#info) {
      return;
    }

    if (this.#lastTime === 0) {
      this.#lastTime = time;
    }

    const deltaTime = (time - this.#lastTime) / 1000; // Convert to seconds
    this.#lastTime = time;

    // Calculate frame increment based on FPS
    const frameIncrement = this.#info.fps * deltaTime;
    this.#currentFrame += frameIncrement;

    // Handle looping
    if (this.#currentFrame >= this.#info.totalFrames) {
      if (this.#loop) {
        this.#currentFrame = this.#currentFrame % this.#info.totalFrames;
      } else {
        this.#currentFrame = this.#info.totalFrames - 1;
        this.pause();
        return;
      }
    }

    // Update animation frame
    const Module = getModule();
    Module._tvg_animation_set_frame(this.#ptr, this.#currentFrame);

    // Call frame callback (user should call canvas.update() and canvas.render() here)
    if (this.#onFrame) {
      this.#onFrame(this.#currentFrame);
    }

    // Continue animation
    this.#animationFrameId = requestAnimationFrame(this.#animate);
  };

  /**
   * Update animation info from WASM
   */
  #updateInfo(): void {
    const Module = getModule();

    const totalFramePtr = Module._malloc(4);
    const durationPtr = Module._malloc(4);

    try {
      Module._tvg_animation_get_total_frame(this.#ptr, totalFramePtr);
      Module._tvg_animation_get_duration(this.#ptr, durationPtr);

      const totalFrames = new Float32Array(Module.HEAPF32.buffer, totalFramePtr, 1)[0]!;
      const duration = new Float32Array(Module.HEAPF32.buffer, durationPtr, 1)[0]!;
      const fps = totalFrames / duration;

      this.#info = {
        totalFrames,
        duration,
        fps,
      };
    } finally {
      Module._free(totalFramePtr);
      Module._free(durationPtr);
    }
  }
}
