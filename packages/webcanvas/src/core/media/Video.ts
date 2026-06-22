/**
 * Load and control video playback
 * @category Video
 */

import { getModule } from '../../interop/module';
import { videoRegistry } from '../../interop/registry';
import { Picture } from '../Picture';
import type { Canvas } from '../Canvas';
import { AudioSink } from './AudioSink';
import { checkResult, handleError } from '../../common/errors';
import VideoWorker from 'web-worker:../../worker/video.worker';

const RESYNC_GAP = 1; // jump threshold, seconds
const RESYNC_LEAD = 1; // jump margin, seconds
const END_GAP = 0.05; // audio sample stops this duration
const HEARTBEAT_MS = 500; // end/loop handling, milliseconds

type PlaybackState = 'idle' | 'loading' | 'paused' | 'playing' | 'disposed';

interface VideoFrame {
  rgba: ArrayBuffer;
  width: number;
  height: number;
  timeSec: number;
}

export interface VideoResource {
  ptr: number;
  bufPtr: number;
  worker: Worker | null;
  audio: AudioSink | null;
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
  #picture: Picture | null = null;
  #loop = false;
  #muted = false;
  #volume = 1;
  #duration = 0;
  #currentTime = 0;

  public canvas: Canvas | null = null;
  #queue: VideoFrame[] = [];
  #state: PlaybackState = 'idle';
  #rafId: number | null = null;
  #videoGen = 0;
  #audioGen = 0;
  #targetWidth = 0;
  #targetHeight = 0;
  #frameWidth = 0;
  #frameHeight = 0;
  #frameTime: number | null = null;
  #heartbeat: ReturnType<typeof setInterval> | null = null;
  #abortLoad: ((error: Error) => void) | null = null;
  #onFrame?: (time: number) => void;

  #res: VideoResource = { ptr: 0, bufPtr: 0, worker: null, audio: null };
  get #ptr(): number { return this.#res.ptr; }
  set #ptr(value: number) { this.#res.ptr = value; }
  get #bufPtr(): number { return this.#res.bufPtr; }
  set #bufPtr(value: number) { this.#res.bufPtr = value; }
  get #worker(): Worker | null { return this.#res.worker; }
  set #worker(value: Worker | null) { this.#res.worker = value; }
  get #audio(): AudioSink | null { return this.#res.audio; }
  set #audio(value: AudioSink | null) { this.#res.audio = value; }

  get #loaded(): boolean {
    return this.#state === 'paused' || this.#state === 'playing';
  }

  constructor() {
    const Module = getModule();
    this.#ptr = Module._tvg_video_new();
    if (!this.#ptr) {
      handleError('Failed to create video', 'Video constructor');
      this.#ptr = 0;
    }
    videoRegistry.register(this, this.#res, this);
  }

  /**
   * Get the Picture object that contains the video frames.
   * This Picture is owned by the Video and should not be manually disposed.
   */
  public get picture(): Picture | null {
    if (!this.#picture && this.#ptr) {
      const Module = getModule();
      const picturePtr = Module._tvg_video_get_picture(this.#ptr);

      if (picturePtr) {
        this.#picture = new Picture(picturePtr, true); // skipRegistry: Video owns it
      }
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
    this.#abortLoad?.(new Error('Video load superseded'));
    this.#abortLoad = null;
    this.#stopLoops();
    this.#disposeWorker();
    this.#audio?.close();
    this.#audio = null;
    this.#state = 'loading';
    this.#queue = [];
    this.#currentTime = 0;
    this.#videoGen = 0;
    this.#audioGen = 0;
    this.#frameWidth = 0;
    this.#frameHeight = 0;
    this.#duration = 0;
    this.#targetWidth = 0;
    this.#targetHeight = 0;
    this.#frameTime = null;

    return new Promise<void>((resolve, reject) => {
      const worker = new VideoWorker();
      this.#worker = worker;
      this.#abortLoad = reject;

      const ref = new WeakRef(this);
      worker.onmessage = ({ data }: MessageEvent) => {
        const self = ref.deref();
        if (!self) return;
        switch (data.type) {
          case 'frame': {
            if (data.gen !== self.#videoGen) { // drop frames from a previous generation
              self.#ack(data.rgba.byteLength);
              return;
            }
            self.#queue.push({ rgba: data.rgba, width: data.width, height: data.height, timeSec: data.timeSec });
            break;
          }
          case 'ready': {
            self.#duration = data.duration;
            self.#rebind(data.decodeWidth, data.decodeHeight, 'video load');
            self.#frameWidth = data.decodeWidth;
            self.#frameHeight = data.decodeHeight;
            self.#state = 'paused';
            self.#updateState();
            self.picture?.size(data.width, data.height);

            AudioSink.create(data.hasAudio ? { sampleRate: data.sampleRate, channels: data.channels } : null)
              .then((sink) => {
                if (self.#worker !== worker) { // reloaded or disposed in the meantime
                  sink.close();
                  return;
                }
                self.#audio = sink;
                sink.setVolume(self.#volume);
                sink.setMuted(self.#muted);
                const port = sink.feederPort();
                if (port) worker.postMessage({ type: 'audioPort', port }, [port]);
                self.#abortLoad = null;
                resolve();
              })
              .catch((e) => {
                if (self.#worker !== worker) return;
                self.#abortLoad = null;
                reject(e instanceof Error ? e : new Error(String(e)));
              });
            break;
          }
          case 'error': {
            const message = 'Video decode failed: ' + data.message;
            if (self.#state === 'loading') {
              self.#abortLoad = null;
              reject(new Error(message));
            } else {
              handleError(message, 'Video worker');
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
    if (this.#state === 'playing') {
      return this;
    }

    if (this.#state !== 'paused') {
      handleError('Video not loaded', 'play');
      return this;
    }

    this.#state = 'playing';
    this.#onFrame = onFrame;
    this.#audio?.play();

    if (this.#heartbeat === null) this.#heartbeat = setInterval(() => this.#control(), HEARTBEAT_MS);
    if (this.#rafId === null) this.#rafId = requestAnimationFrame(this.#tick);
    return this;
  }

  /** Pause playback */
  public pause(): this {
    if (this.#state === 'playing') this.#state = 'paused';
    this.#audio?.pause();
    this.#stopLoops();
    return this;
  }

  /** Stop playback and rewind to the start. */
  public stop(): this {
    this.pause();
    this.seek(0);
    return this;
  }

  /** Enable or disable repeated playback. */
  public loop(on: boolean): this {
    this.#loop = on;
    if (this.#loaded) checkResult(getModule()._tvg_video_set_loop(this.#ptr, on ? 1 : 0), 'loop');
    return this;
  }

  /** Seek to a specific time (in seconds) */
  public seek(time: number): this {
    this.#currentTime = time;
    this.#queue = [];
    this.#frameTime = null;
    this.#videoGen++;
    this.#audioGen++;
    this.#audio?.flush(this.#audioGen, time);
    this.#worker?.postMessage({ type: 'restart', videoGen: this.#videoGen, audioGen: this.#audioGen, time: time });
    return this;
  }

  /** Get or set the audio volume level in the range [0.0, 1.0]. */
  public volume(): number;
  public volume(value: number): this;
  public volume(value?: number): number | this {
    if (value !== undefined) {
      this.#volume = value;
      this.#audio?.setVolume(value);
      if (this.#loaded) checkResult(getModule()._tvg_video_set_volume(this.#ptr, value), 'volume (set)');
      return this;
    }
    return this.#volume;
  }

  /** Mute or unmute the audio. */
  public mute(on: boolean): this {
    this.#muted = on;
    this.#audio?.setMuted(on);
    if (this.#loaded) checkResult(getModule()._tvg_video_set_mute(this.#ptr, on ? 1 : 0), 'mute');
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
    this.#state = 'disposed';
    this.#abortLoad?.(new Error('Video disposed'));
    this.#abortLoad = null;
    this.#stopLoops();
    this.#disposeWorker();
    this.#queue = [];
    if (this.#audio) {
      this.#audio.close();
      this.#audio = null;
    }
    if (this.#ptr) {
      getModule()._tvg_video_del(this.#ptr);
      this.#ptr = 0;
      this.#picture = null;
    }
    if (this.#bufPtr) {
      getModule()._free(this.#bufPtr);
      this.#bufPtr = 0;
    }
    videoRegistry.unregister(this);
  }

  /**
   * Check if this object has been disposed
   */
  public get isDisposed(): boolean {
    return this.#state === 'disposed';
  }

  #stopLoops(): void {
    if (this.#rafId !== null) {
      cancelAnimationFrame(this.#rafId);
      this.#rafId = null;
    }
    if (this.#heartbeat !== null) {
      clearInterval(this.#heartbeat);
      this.#heartbeat = null;
    }
  }

  #disposeWorker(): void {
    if (this.#worker) {
      this.#worker.onmessage = null;
      this.#worker.terminate();
      this.#worker = null;
    }
  }

  #ack(bytes: number): void {
    this.#worker?.postMessage({ type: 'ack', bytes, time: this.#currentTime });
  }

  #resync(time: number): void {
    this.#queue = [];
    this.#frameTime = null;
    this.#videoGen++;
    this.#worker?.postMessage({ type: 'resync', videoGen: this.#videoGen, time: time });
  }

  /** Sync resolution between the video and the picture */
  #resize(): void {
    const size = this.picture?.size();
    if (!size || !size.width || !size.height) return;
    if (size.width === this.#targetWidth && size.height === this.#targetHeight) return;
    this.#targetWidth = size.width;
    this.#targetHeight = size.height;
    this.#worker?.postMessage({ type: 'resize', width: size.width, height: size.height });
  }

  /** Update the state to the WASM module */
  #updateState(): void {
    const Module = getModule();
    checkResult(Module._tvg_video_set_loop(this.#ptr, this.#loop ? 1 : 0), 'loop');
    checkResult(Module._tvg_video_set_volume(this.#ptr, this.#volume), 'volume (set)');
    checkResult(Module._tvg_video_set_mute(this.#ptr, this.#muted ? 1 : 0), 'mute');
  }

  /** Start gating and end-of-media handling; also runs on the heartbeat while rAF is suspended */
  #control(): void {
    if (!this.#audio || this.#state !== 'playing') return;
    if (this.#audio.now() === null && this.#queue.length > 0) this.#audio.videoReady();

    const duration = this.duration();
    if (duration && this.#audio.position() >= duration - END_GAP) {
      if (this.#loop) this.seek(0);
      else this.pause();
    }
  }

  /**
   * Internal playback loop
   * Note: canvas.update() and canvas.render() is managed by this method
   */
  #tick = (): void => {
    if (this.#loaded) this.#resize();
    this.#control();

    const now = this.#audio?.now() ?? null;
    if (this.#state === 'playing' && now !== null) {
      this.#currentTime = now;

      if (this.#frameTime !== null && now - this.#frameTime > RESYNC_GAP) {
        this.#resync(now + RESYNC_LEAD); // fell behind the clock (jump)
      } else {
        // Present the latest video frame due by now.
        let frame: VideoFrame | null = null;
        while (this.#queue.length > 0 && this.#queue[0]!.timeSec <= now) {
          frame = this.#queue.shift()!;
          this.#ack(frame.rgba.byteLength);
        }
        if (frame) {
          this.#push(frame);
          this.#frameTime = frame.timeSec;
          this.canvas?.update().render();
          this.#onFrame?.(now);
        }
      }
    }
    if (this.#state === 'playing') this.#rafId = requestAnimationFrame(this.#tick);
    else this.#rafId = null;
  };

  #push(frame: VideoFrame): void {
    if (!this.#loaded || !this.#ptr) return;

    const bytes = new Uint8Array(frame.rgba);
    if (bytes.byteLength !== frame.width * frame.height * 4) {
      handleError(`Frame size mismatch (${frame.width}x${frame.height}, ${bytes.byteLength} bytes)`, 'push');
      return;
    }

    if (frame.width !== this.#frameWidth || frame.height !== this.#frameHeight) {
      this.#rebuild(frame.width, frame.height);
    }
    if (!this.#bufPtr) return;

    const Module = getModule();
    Module.HEAPU8.set(bytes, this.#bufPtr);
    checkResult(Module._tvg_video_update_frame(this.#ptr, this.#currentTime), 'pushFrame');
  }

  #rebind(w: number, h: number, operation: string): void {
    const Module = getModule();
    const next = Module._malloc(w * h * 4);
    const ret = Module._tvg_video_load_metadata(this.#ptr, next, w, h, this.#duration);
    if (ret) {
      Module._free(next);
    } else {
      if (this.#bufPtr) Module._free(this.#bufPtr);
      this.#bufPtr = next;
    }
    checkResult(ret, operation);
  }

  /** Call when the decoding resolution changes */
  #rebuild(w: number, h: number): void {
    const size = this.picture?.size();
    this.#rebind(w, h, 'video resize');
    this.#frameWidth = w;
    this.#frameHeight = h;
    this.#updateState();
    if (size) this.picture?.size(size.width, size.height);
  }
}
