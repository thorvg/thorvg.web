/**
 * Animation class for Lottie animations
 * Extends Picture since Animation is essentially a Picture with frame control
 */

import { getModule } from '../core/Module';
import { checkResult } from '../core/errors';
import { Picture } from './Picture';

export class Animation extends Picture {
  #animPtr: number = 0;

  constructor() {
    const Module = getModule();

    // Create animation which internally creates a picture
    const animPtr = Module._tvg_animation_new();
    if (animPtr === 0) {
      throw new Error('Failed to create animation');
    }

    // Get the underlying picture pointer
    const picturePtr = Module._tvg_animation_get_picture(animPtr);
    if (picturePtr === 0) {
      Module._tvg_animation_del(animPtr);
      throw new Error('Failed to get animation picture');
    }

    // Call Picture constructor with the existing picture pointer
    // The picture is owned by animation, so it won't create a new one
    super(picturePtr);

    // Store animation pointer (this is what we need to cleanup)
    this.#animPtr = animPtr;
  }

  /**
   * Load Lottie animation from JSON string
   * @param jsonString - Lottie JSON data as a string
   */
  public override load(jsonString: string): this {
    // Use parent's load method but force mimeType to 'lottie'
    return super.loadData(jsonString, { format: 'lottie' });
  }

  /**
   * Set the current frame of the animation
   */
  public frame(frameNumber: number): this {
    const Module = getModule();
    const result = Module._tvg_animation_set_frame(this.#animPtr, frameNumber);
    checkResult(result, 'frame');
    return this;
  }

  /**
   * Get the current frame number
   */
  public getFrame(): number {
    const Module = getModule();
    const framePtr = Module._malloc(4);
    const result = Module._tvg_animation_get_frame(this.#animPtr);
    checkResult(result, 'getFrame');

    const frame = Module.HEAPF32[framePtr / 4] ?? 0;
    Module._free(framePtr);
    return frame;
  }

  /**
   * Get total number of frames
   */
  public getTotalFrames(): number {
    const Module = getModule();
    const totalPtr = Module._malloc(4);
    const result = Module._tvg_animation_get_total_frame(this.#animPtr, totalPtr);
    checkResult(result, 'getTotalFrames');

    const total = Module.HEAPF32[totalPtr / 4] ?? 0;
    Module._free(totalPtr);
    return total;
  }

  /**
   * Get animation duration in seconds
   */
  public getDuration(): number {
    const Module = getModule();
    const durationPtr = Module._malloc(4);
    const result = Module._tvg_animation_get_duration(this.#animPtr, durationPtr);
    checkResult(result, 'getDuration');

    const duration = Module.HEAPF32[durationPtr / 4] ?? 0;
    Module._free(durationPtr);
    return duration;
  }

  /**
   * Set animation segment (start and end frames)
   */
  public segment(startFrame: number, endFrame: number): this {
    const Module = getModule();
    const segmentPtr = Module._malloc(8);
    Module.HEAPF32[segmentPtr / 4] = startFrame;
    Module.HEAPF32[(segmentPtr + 4) / 4] = endFrame;
    const result = Module._tvg_animation_set_segment(this.#animPtr, segmentPtr);
    Module._free(segmentPtr);
    checkResult(result, 'segment');
    return this;
  }

  /**
   * Get animation segment
   */
  public getSegment(): { start: number; end: number } {
    const Module = getModule();
    const segmentPtr = Module._malloc(8); // 2 floats

    const result = Module._tvg_animation_set_segment(this.#animPtr, segmentPtr);
    checkResult(result, 'getSegment');

    const start = Module.HEAPF32[segmentPtr / 4] ?? 0;
    const end = Module.HEAPF32[(segmentPtr + 4) / 4] ?? 0;

    Module._free(segmentPtr);
    return { start, end };
  }

  /**
   * Override dispose to also clean up animation pointer
   */
  public override dispose(): void {
    if (this.#animPtr) {
      const Module = getModule();
      Module._tvg_animation_del(this.#animPtr);
      this.#animPtr = 0;
    }
    // Picture's dispose will be called via parent
    super.dispose();
  }
}
