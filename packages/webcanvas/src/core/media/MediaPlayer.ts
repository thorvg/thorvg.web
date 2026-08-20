import { createVideoWorker } from '../../worker/worker';
import { handleError } from '../../common/errors';
import { AudioSink, onUserGesture } from './AudioSink';
import type { AudioFormat } from './AudioSink';
import type { ThorVGModule, WebMediaPlayer, WebMediaState } from '../../types/emscripten';

const END_GAP = 0.05; // end-of-media threshold, seconds
const WATCH_MS = 200; // stall check interval, milliseconds
const STALL_MS = 400; // stall threshold, milliseconds
const AUDIO_START_MS = 400; // audio start grace, milliseconds
const RESYNC_GAP = 1; // jump threshold, seconds
const RESYNC_LEAD = 0.3; // jump margin, seconds
const PIN_GAP = 0.05; // same-target seek window, seconds
const PIN_DRIFT = 0.5; // parked host drift, seconds

interface QueuedFrame {
  rgba: ArrayBuffer;
  width: number;
  height: number;
  timeSec: number;
}

class MediaPlayer implements WebMediaPlayer {
  #worker: Worker | null;
  #queue: QueuedFrame[] = [];
  #metadata: { width: number; height: number; duration: number } | null = null;
  #format: AudioFormat | null = null;
  #audio: AudioSink | null = null;
  #disposed = false;

  #playing = false;
  #autoplay = true;
  #looping = true;
  #stalled = false; // host stopped pulling frames
  #pinned = false; // host parked on a fixed position
  #posterPending = true;

  #time = 0;
  #frameTime: number | null = null;
  #lastSeek = Number.NaN;
  #lastSync = 0;
  #videoGen = 0;
  #audioGen = 0;

  #volume = 1;
  #muted = false;
  #fallback = false; // silent clock, audio context blocked
  #watchdog: ReturnType<typeof setInterval> | null = null;
  #probe: ReturnType<typeof setTimeout> | null = null;
  #gestureOff: (() => void) | null = null;

  constructor(bytes: Uint8Array) {
    this.#lastSync = performance.now();
    this.#worker = createVideoWorker();
    this.#worker.onmessage = (event: MessageEvent) => this.#onMessage(event);
    this.#worker.postMessage({ type: 'load', bytes }, [bytes.buffer]);
  }

  /** Pulled by the core loader on every render sync */
  sync(): WebMediaState | null {
    if (this.#disposed) return null;
    this.#lastSync = performance.now();
    if (this.#stalled) this.#wake();
    if (!this.#metadata) return null;

    const due = this.#advance();
    if (!due) return this.#metadata;
    return { ...this.#metadata, data: new Uint8Array(due.frame.rgba), time: due.time };
  }

  play(): void {
    if (this.#disposed) return;
    this.#autoplay = true;
    this.#pinned = false;
    if (!this.#metadata || this.#playing) return;
    this.#playing = true;
    this.#lastSync = performance.now();
    this.#audio?.play();
    this.#probeAudio();
    this.#watch();
  }

  pause(): void {
    this.#autoplay = false;
    if (!this.#playing) return;
    this.#now();
    this.#playing = false;
    this.#audio?.pause();
    this.#unwatch();
  }

  stop(): void {
    this.#autoplay = false;
    this.#playing = false;
    this.#pinned = false;
    this.#lastSeek = Number.NaN;
    this.#unwatch();
    if (this.#metadata) this.#restart(0);
    else this.#time = 0;
    this.#audio?.pause();
  }

  seek(seconds: number): void {
    if (this.#disposed) return;
    const time = this.#clamp(seconds);

    // same target while the clock ran past it (parked host)
    if (this.#playing && Math.abs(time - this.#lastSeek) < PIN_GAP && Math.abs(this.#now() - time) > PIN_DRIFT) {
      this.#pin(time);
      return;
    }
    this.#lastSeek = time;
    this.#pinned = false;

    if (!this.#metadata) {
      this.#time = time; // applied when metadata arrives
      return;
    }
    this.#restart(time);
    if (this.#playing) {
      this.#audio?.play();
      this.#probeAudio();
    }
  }

  loop(on: boolean): void {
    this.#looping = on;
  }

  volume(volume: number): void {
    this.#volume = Math.min(1, Math.max(0, volume));
    this.#audio?.setVolume(this.#volume);
  }

  mute(on: boolean): void {
    this.#muted = on;
    this.#audio?.setMuted(on);
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;
    this.#unwatch();
    if (this.#probe) clearTimeout(this.#probe);
    this.#probe = null;
    this.#gestureOff?.();
    this.#gestureOff = null;
    if (this.#worker) {
      this.#worker.onmessage = null;
      this.#worker.terminate();
      this.#worker = null;
    }
    this.#audio?.close();
    this.#audio = null;
    this.#queue = [];
  }

  #onMessage({ data }: MessageEvent): void {
    if (this.#disposed) return;
    switch (data.type) {
      case 'ready': {
        this.#metadata = { width: data.decodeWidth, height: data.decodeHeight, duration: data.duration };
        this.#format = data.hasAudio ? { sampleRate: data.sampleRate, channels: data.channels } : null;
        void this.#attach(this.#format);
        if (this.#time > 0) this.#restart(this.#time);
        if (this.#autoplay) this.play();
        break;
      }
      case 'frame': {
        if (data.gen !== this.#videoGen) {
          this.#ack(data.rgba.byteLength);
          return;
        }
        this.#queue.push({ rgba: data.rgba, width: data.width, height: data.height, timeSec: data.timeSec });
        break;
      }
      case 'error': {
        this.dispose();
        handleError('Media decode failed: ' + data.message, 'MediaPlayer');
        break;
      }
    }
  }

  /** The audio output owns the clock, a silent sink when there is no audio */
  #now(): number {
    const time = this.#audio?.now();
    if (typeof time === 'number') this.#time = time;
    return this.#time;
  }

  #clamp(seconds: number): number {
    const time = Math.max(0, seconds);
    if (!this.#metadata?.duration) return time;
    return Math.min(time, this.#metadata.duration);
  }

  /** Advance the clock, handling end-of-media, and return the latest due frame */
  #advance(): { frame: QueuedFrame; time: number } | null {
    const running = this.#playing && !this.#pinned;
    if (running && this.#queue.length > 0) this.#audio?.videoReady();

    let now = this.#now();
    const duration = this.#metadata!.duration;
    if (running && duration && now >= duration - END_GAP) {
      if (this.#looping) {
        this.#restart(0);
        now = 0;
      } else {
        this.#playing = false;
        this.#audio?.pause();
        this.#unwatch();
        this.#time = now = duration;
      }
    }

    // fell behind the clock (video-only jump)
    if (running && this.#queue.length === 0 && this.#frameTime !== null && now - this.#frameTime > RESYNC_GAP) {
      this.#resync(this.#clamp(now + RESYNC_LEAD));
      return null;
    }

    let frame: QueuedFrame | null = null;
    const upTo = now + (this.#posterPending ? END_GAP : 0);
    while (this.#queue.length > 0 && this.#queue[0]!.timeSec <= upTo) {
      frame = this.#queue.shift()!;
      this.#ack(frame.rgba.byteLength);
    }
    if (!frame) return null;
    if (frame.width !== this.#metadata!.width || frame.height !== this.#metadata!.height) return null;

    this.#posterPending = false;
    this.#frameTime = frame.timeSec;
    return { frame, time: now };
  }

  #ack(bytes: number): void {
    this.#worker?.postMessage({ type: 'ack', bytes, time: this.#time });
  }

  /** Restart both streams at the given position */
  #restart(time: number): void {
    this.#time = time;
    this.#queue = [];
    this.#frameTime = null;
    this.#posterPending = true;
    this.#videoGen++;
    this.#audioGen++;
    this.#audio?.flush(this.#audioGen, time);
    this.#worker?.postMessage({ type: 'restart', videoGen: this.#videoGen, audioGen: this.#audioGen, time });
  }

  /** Restart the audio alone, keep the decoded video */
  #restartAudio(time: number): void {
    this.#audioGen++;
    this.#audio?.flush(this.#audioGen, time);
    this.#worker?.postMessage({ type: 'audioRestart', audioGen: this.#audioGen, time });
  }

  /** Restart the video alone, keep the audio running */
  #resync(time: number): void {
    this.#queue = [];
    this.#frameTime = null;
    this.#posterPending = true;
    this.#videoGen++;
    this.#worker?.postMessage({ type: 'resync', videoGen: this.#videoGen, time });
  }

  #pin(time: number): void {
    if (this.#pinned) return;
    this.#pinned = true;
    this.#restart(time);
    this.#audio?.pause();
  }

  /** Attach an audio output, a null format yields a silent sink */
  async #attach(format: AudioFormat | null): Promise<void> {
    let sink: AudioSink;
    try {
      sink = await AudioSink.create(format);
    } catch {
      this.#format = null;
      if (format) void this.#attach(null);
      return;
    }

    if (this.#disposed) {
      sink.close();
      return;
    }

    const previous = this.#audio;
    this.#audio = sink;
    sink.setVolume(this.#volume);
    sink.setMuted(this.#muted);

    const port = sink.feederPort();
    this.#worker?.postMessage({ type: 'audioPort', port }, port ? [port] : []);
    previous?.close();

    // an untouched stream already decodes from the start
    if (this.#videoGen > 0 || this.#time > 0) this.#restartAudio(this.#time);
    if (this.#playing && !this.#pinned) {
      sink.play();
      this.#probeAudio();
    }
  }

  /** Blocked audio context falls back to a silent clock until the next gesture */
  #probeAudio(): void {
    if (!this.#format || this.#probe !== null || !this.#playing || !this.#audio?.audible()) return;
    this.#probe = setTimeout(() => {
      this.#probe = null;
      if (this.#disposed || this.#fallback || !this.#playing || this.#stalled || this.#pinned) return;
      if (this.#audio?.running() !== false) return;
      this.#fallback = true;
      void this.#attach(null);
      this.#armGesture();
    }, AUDIO_START_MS);
  }

  #armGesture(): void {
    if (this.#gestureOff || !this.#format) return;
    this.#gestureOff = onUserGesture(() => {
      this.#gestureOff = null;
      if (this.#disposed || !this.#format) return;
      this.#fallback = false;
      void this.#attach(this.#format);
    });
  }

  #watch(): void {
    if (this.#watchdog === null) this.#watchdog = setInterval(() => this.#checkStall(), WATCH_MS);
  }

  #unwatch(): void {
    if (this.#watchdog === null) return;
    clearInterval(this.#watchdog);
    this.#watchdog = null;
  }

  /** Hold the clock while the host is not rendering, a hidden tab for instance */
  #checkStall(): void {
    if (!this.#playing || this.#stalled) return;
    if (performance.now() - this.#lastSync < STALL_MS) return;
    this.#stalled = true;
    this.#now();
    this.#audio?.pause();
  }

  #wake(): void {
    this.#stalled = false;
    if (!this.#playing || this.#pinned) return;
    this.#audio?.play();
    this.#probeAudio();
  }
}

export function initMedia(Module: ThorVGModule): void {
  Module.createMediaPlayer = (_loader: number, bytes: Uint8Array) => new MediaPlayer(bytes);
}
