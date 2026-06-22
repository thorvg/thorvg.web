/**
 * Load and control video playback
 * @category Video
 */

import { getModule } from '../interop/module';
import { Picture } from './Picture';
import type { Canvas } from './Canvas';
import { checkResult, handleError } from '../common/errors';
import VideoWorker from 'web-worker:../worker/video.worker';

/**
 * @category Video
 */
interface VideoFrame {
  rgba: ArrayBuffer;
  timeSec: number;
}

/**
 * @category Video
 */
interface AudioChunk {
  planes: ArrayBuffer[];
  channels: number;
  frames: number;
  sampleRate: number;
  timeSec: number;
}

/**
 * @category Video
 */
class AudioPlayer {
  #ctx: AudioContext;
  #gain: GainNode;
  #sources = new Set<AudioBufferSourceNode>();
  #anchor = 0;
  #anchored = false;
  #volume = 1;
  #muted = false;

  constructor() {
    this.#ctx = new AudioContext();
    this.#gain = this.#ctx.createGain();
    this.#gain.connect(this.#ctx.destination);
    this.#applyGain();
  }

  get running(): boolean {
    return this.#ctx.state === 'running';
  }

  get anchored(): boolean {
    return this.#anchored;
  }

  resume(): void {
    void this.#ctx.resume();
  }

  suspend(): void {
    void this.#ctx.suspend();
  }

  anchorAt(mediaTime: number): void {
    this.#anchor = this.#ctx.currentTime - mediaTime;
    this.#anchored = true;
  }

  resetAnchor(): void {
    this.#anchored = false;
  }

  mediaTime(): number {
    return this.#ctx.currentTime - this.#anchor;
  }

  schedule(chunk: AudioChunk): void {
    const when = this.#anchor + chunk.timeSec;
    const now = this.#ctx.currentTime;

    const buffer = this.#ctx.createBuffer(chunk.channels, chunk.frames, chunk.sampleRate);
    for (let c = 0; c < chunk.channels; c++) {
      buffer.copyToChannel(new Float32Array(chunk.planes[c]!), c);
    }

    const source = this.#ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(this.#gain);
    source.onended = () => this.#sources.delete(source);

    if (when >= now) source.start(when);
    else if (when + buffer.duration > now) source.start(now, now - when); // partially late: start mid-buffer
    else return; // fully past
    this.#sources.add(source);
  }

  flush(): void {
    for (const source of this.#sources) {
      source.onended = null;
      try {
        source.stop();
      } catch {
        /* already stopped */
      }
    }
    this.#sources.clear();
  }

  setVolume(value: number): void {
    this.#volume = value;
    this.#applyGain();
  }

  setMuted(on: boolean): void {
    this.#muted = on;
    this.#applyGain();
  }

  #applyGain(): void {
    this.#gain.gain.value = this.#muted ? 0 : this.#volume;
  }

  close(): void {
    this.flush();
    void this.#ctx.close();
  }
}

/**
 * Video controller.
 * The Video owns a Picture internally and manages frame updates
 * @category Video
 *
 * @example
 * ```typescript
 * const video = new TVG.Video();
 * canvas.add(video);
 *
 * const bytes = new Uint8Array(await (await fetch('/clip.mp4')).arrayBuffer());
 * await video.load(bytes);
 * video.picture?.size(800, 600);
 * video.loop(true).play();
 * ```
 */
export class Video {
  #ptr: number;
  #picture: Picture | null = null;
  #loop = false;
  #volume = 1;
  #muted = false;

  public canvas: Canvas | null = null;
  #worker: Worker | null = null;
  #queue: VideoFrame[] = [];
  #audioQueue: AudioChunk[] = [];
  #audio: AudioPlayer | null = null;
  #mediaTime = 0;
  #isPlaying = false;
  #gen = 0;
  #rafId: number | null = null;
  #ready = false;
  #hasAudio = false;
  #onFrame?: (time: number) => void;

  constructor() {
    const Module = getModule();
    this.#ptr = Module._tvg_video_new();
    if (!this.#ptr) {
      handleError('Failed to create video', 'Video constructor');
      this.#ptr = 0;
    }
  }

  /**
   * Get the pointer (internal use)
   */
  public get ptr(): number {
    return this.#ptr;
  }

  /**
   * Get the Picture object that contains the video frames.
   * This Picture is owned by the Video and should not be manually disposed.
   */
  public get picture(): Picture | null {
    if (!this.#picture && this.#ptr) {
      const picturePtr = getModule()._tvg_video_get_picture(this.#ptr);
      if (picturePtr) this.#picture = new Picture(picturePtr, true); // skipRegistry: Video owns it
    }
    return this.#picture;
  }

  /**
   * Load video from raw data.
   *
   * @param data - Video file bytes
   * @returns A promise that resolves when the video is ready, or rejects on a decode error.
   */
  public load(data: Uint8Array | ArrayBuffer): Promise<void> {
    const bytes = data instanceof Uint8Array ? data : new Uint8Array(data);

    // reset state and (re)create the worker
    this.#disposeWorker();
    this.#queue = [];
    this.#audioQueue = [];
    this.#mediaTime = 0;
    this.#isPlaying = false;
    this.#gen = 0;
    this.#ready = false;
    this.#hasAudio = false;
    if (!this.#audio) this.#audio = new AudioPlayer();
    else this.#audio.flush();
    this.#audio.resetAnchor();

    return new Promise<void>((resolve, reject) => {
      const worker = new VideoWorker();
      this.#worker = worker;

      worker.onmessage = ({ data }: MessageEvent) => {
        switch (data.type) {
          case 'frame': {
            if (data.gen !== this.#gen) { // drop frames from a previous generation
              this.#ack();
              return;
            }
            this.#queue.push({ rgba: data.rgba, timeSec: data.timeSec });
            break;
          }
          case 'audio': {
            if (data.gen !== this.#gen) { // drop audio from a previous generation
              this.#ackAudio();
              return;
            }
            this.#audioQueue.push({
              planes: data.planes,
              channels: data.channels,
              frames: data.frames,
              sampleRate: data.sampleRate,
              timeSec: data.timeSec,
            });
            break;
          }
          case 'ready': {
            const Module = getModule();
            checkResult(Module._tvg_video_load_metadata(this.#ptr, data.width, data.height, data.duration), 'video load');
            this.#hasAudio = !!data.hasAudio;
            this.#ready = true;
            this.#syncState();
            resolve();
            break;
          }
          case 'error': {
            const message = 'Video decode failed: ' + data.message;
            if (this.#ready) {
              handleError(message, 'Video worker');
            } else {
              reject(new Error(message));
            }
            break;
          }
        }
      };

      worker.postMessage({ type: 'load', bytes }, [bytes.buffer]);
    });
  }

  /**
   * Start or resume playback.
   * @param onFrame - Optional callback invoked on each frame update
   */
  public play(onFrame?: (time: number) => void): this {
    if (this.#isPlaying) {
      return this;
    }

    if (!this.#ready) {
      handleError('Video not loaded', 'play');
      return this;
    }

    this.#isPlaying = true;
    this.#onFrame = onFrame;

    this.#audio?.resume();

    if (this.#rafId === null) this.#rafId = requestAnimationFrame(this.#tick);
    return this;
  }

  /** Pause playback */
  public pause(): this {
    this.#isPlaying = false;
    this.#audio?.suspend();
    return this;
  }

  /** Stop playback and rewind to the start. */
  public stop(): this {
    this.#isPlaying = false;
    this.#audio?.suspend();
    this.#restart(0);
    return this;
  }

  /** Enable or disable repeated playback. */
  public loop(on: boolean): this {
    this.#loop = on;
    if (this.#ready) checkResult(getModule()._tvg_video_loop(this.#ptr, on ? 1 : 0), 'loop');
    return this;
  }

  /**
   * Seek to a specific time (in seconds)
   */
  public seek(seconds: number): this {
    this.#restart(seconds);
    return this;
  }

  /** Get or set the audio volume level in the range [0.0, 1.0]. */
  public volume(): number;
  public volume(value: number): this;
  public volume(value?: number): number | this {
    if (value !== undefined) {
      this.#volume = value;
      this.#audio?.setVolume(value);
      if (this.#ready) checkResult(getModule()._tvg_video_set_volume(this.#ptr, value), 'volume (set)');
      return this;
    }
    return this.#volume;
  }

  /** Mute or unmute the audio without changing the volume level. */
  public mute(on: boolean): this {
    this.#muted = on;
    this.#audio?.setMuted(on);
    if (this.#ready) checkResult(getModule()._tvg_video_mute(this.#ptr, on ? 1 : 0), 'mute');
    return this;
  }

  /** Whether the audio is currently muted. */
  public muted(): boolean {
    return this.#muted;
  }

  /** Current playback position in seconds. */
  public time(): number {
    return getModule()._tvg_video_get_time(this.#ptr);
  }

  /** Total duration in seconds. */
  public duration(): number {
    return getModule()._tvg_video_get_duration(this.#ptr);
  }

  /** Dispose of the video, its worker and WASM resources. */
  public dispose(): void {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    this.#disposeWorker();
    if (this.#audio) {
      this.#audio.close();
      this.#audio = null;
    }
    if (this.#ptr) {
      getModule()._tvg_video_del(this.#ptr);
      this.#ptr = 0;
      this.#picture = null;
    }
  }

  #disposeWorker(): void {
    if (this.#worker) {
      this.#worker.terminate();
      this.#worker = null;
    }
  }

  #ack(): void {
    this.#worker?.postMessage({ type: 'ack' });
  }

  #ackAudio(): void {
    this.#worker?.postMessage({ type: 'ackAudio' });
  }

  /** Rewind/seek-back to a position */
  #restart(mediaTime: number): void {
    this.#mediaTime = mediaTime;
    this.#queue = [];
    this.#audioQueue = [];
    this.#audio?.flush();
    this.#audio?.resetAnchor();
    this.#gen++;
    this.#worker?.postMessage({ type: 'restart', gen: this.#gen, time: mediaTime });
  }

  /** Sync the state with the WASM module */
  #syncState(): void {
    const Module = getModule();
    this.#audio?.setVolume(this.#volume);
    this.#audio?.setMuted(this.#muted);
    checkResult(Module._tvg_video_loop(this.#ptr, this.#loop ? 1 : 0), 'loop');
    checkResult(Module._tvg_video_set_volume(this.#ptr, this.#volume), 'volume (set)');
    checkResult(Module._tvg_video_mute(this.#ptr, this.#muted ? 1 : 0), 'mute');
  }

  /**
   * Internal playback loop
   * Note: canvas.update() and canvas.render() is managed by this method
   */
  #tick = (): void => {
    const player = this.#audio;
    if (player && this.#isPlaying && player.running && this.#anchor(player)) {
      this.#mediaTime = player.mediaTime();

      // Present the latest video frame due by now.
      let frame: VideoFrame | null = null;
      while (this.#queue.length > 0 && this.#queue[0]!.timeSec <= this.#mediaTime) {
        frame = this.#queue.shift()!;
        this.#ack();
      }
      if (frame) {
        this.#push(frame.rgba);
        this.canvas?.update().render();
        this.#onFrame?.(this.#mediaTime);
      }

      // Schedule all decoded audio onto the same timeline
      while (this.#audioQueue.length > 0) {
        player.schedule(this.#audioQueue.shift()!);
        this.#ackAudio();
      }

      const duration = this.duration();
      if (duration && this.#mediaTime >= duration) {
        if (this.#loop) this.#restart(0);
        else this.pause();
      }
    }
    this.#rafId = requestAnimationFrame(this.#tick);
  };

  #anchor(player: AudioPlayer): boolean {
    if (player.anchored) return true;
    if (this.#hasAudio) {
      const first = this.#audioQueue[0];
      if (!first) return false; // wait for the first decoded chunk
      player.anchorAt(first.timeSec);
    } else {
      player.anchorAt(this.#mediaTime);
    }
    return true;
  }

  #push(rgba: ArrayBuffer): void {
    if (!this.#ready) return;
    const Module = getModule();
    const bytes = new Uint8Array(rgba);
    const ptr = Module._malloc(bytes.byteLength);
    if (!ptr) {
      handleError('Failed to allocate frame buffer', 'push');
      return;
    }

    try {
      Module.HEAPU8.set(bytes, ptr);
      checkResult(Module._tvg_video_update_frame(this.#ptr, ptr, this.#mediaTime), 'pushFrame');
    } finally {
      Module._free(ptr);
    }
  }
}
