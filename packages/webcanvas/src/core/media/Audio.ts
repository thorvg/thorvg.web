import type { AudioInfo } from '../LottieAnimation';
import { handleError } from '../../common/errors';
import { getWorkletUrl } from '../../worker/audio.worklet';

export interface AudioFormat {
  sampleRate: number;
  channels: number;
}

const GESTURES = ['pointerdown', 'touchend', 'keydown'] as const;
const waiters = new Set<() => void>();

function listen(on: boolean): void {
  for (const event of GESTURES) {
    if (on) document.addEventListener(event, fire, { capture: true, passive: true });
    else document.removeEventListener(event, fire, { capture: true });
  }
}

function fire(): void {
  const pending = [...waiters];
  waiters.clear();
  listen(false);
  for (const waiter of pending) waiter();
}

export function onUserGesture(callback: () => void): () => void {
  if (typeof document === 'undefined') return () => {};
  if (waiters.size === 0) listen(true);
  waiters.add(callback);
  return () => {
    waiters.delete(callback);
    if (waiters.size === 0) listen(false);
  };
}

class AudioOutput {
  static #shared: AudioOutput | null = null;
  static #refs = 0;

  static acquire(): AudioOutput {
    if (!AudioOutput.#shared) AudioOutput.#shared = new AudioOutput();
    AudioOutput.#refs += 1;
    return AudioOutput.#shared;
  }

  static release(): void {
    AudioOutput.#refs -= 1;
    if (AudioOutput.#refs > 0) return;
    AudioOutput.#refs = 0;
    AudioOutput.#shared?.close();
    AudioOutput.#shared = null;
  }

  readonly ctx: AudioContext;

  constructor(sampleRate?: number) {
    this.ctx = sampleRate ? new AudioContext({ sampleRate }) : new AudioContext();
  }

  gain(): GainNode {
    const node = this.ctx.createGain();
    node.connect(this.ctx.destination);
    return node;
  }

  now(): number {
    return this.ctx.currentTime;
  }

  running(): boolean {
    return this.ctx.state === 'running';
  }

  resume(): void {
    void this.ctx.resume().catch(() => {});
  }

  suspend(): void {
    void this.ctx.suspend().catch(() => {});
  }

  close(): void {
    void this.ctx.close().catch(() => {});
  }
}

class GainControl {
  #node: GainNode | null = null;
  #volume = 1;
  #muted = false;

  attach(node: GainNode): void {
    this.#node = node;
    this.#apply();
  }

  get node(): GainNode | null {
    return this.#node;
  }

  volume(): number;
  volume(value: number): void;
  volume(value?: number): number | void {
    if (value === undefined) return this.#volume;
    this.#volume = Math.max(0, value);
    this.#apply();
  }

  mute(on: boolean): void {
    this.#muted = on;
    this.#apply();
  }

  muted(): boolean {
    return this.#muted;
  }

  disconnect(): void {
    this.#node?.disconnect();
    this.#node = null;
  }

  #apply(): void {
    if (this.#node) this.#node.gain.value = this.#muted ? 0 : this.#volume;
  }
}

export class AudioSink {
  #out: AudioOutput | null = null;
  #gain = new GainControl();
  #node: AudioWorkletNode | null = null;
  #feeder: MessagePort | null = null;
  #silent = false;

  #held = true;
  #media = 0;
  #ctxAt = 0;
  #readySent = false;

  #playing = false;
  #videoReady = false;
  #startedAt = 0;

  static async create(format: AudioFormat | null): Promise<AudioSink> {
    const sink = new AudioSink();
    if (format) {
      try {
        await sink.#initAudio(format);
        return sink;
      } catch (e) {
        handleError('Audio output unavailable: ' + String((e as Error)?.message ?? e), 'AudioSink');
      }
    }
    sink.#silent = true;
    return sink;
  }

  async #initAudio({ sampleRate, channels }: AudioFormat): Promise<void> {
    const out = new AudioOutput(sampleRate);
    await out.ctx.audioWorklet.addModule(getWorkletUrl());
    const node = new AudioWorkletNode(out.ctx, 'tvg-audio', { numberOfInputs: 0, outputChannelCount: [channels] });
    const gain = out.gain();
    this.#gain.attach(gain);
    node.connect(gain);

    node.port.onmessage = ({ data }: MessageEvent) => {
      this.#held = data.held;
      this.#media = data.media;
      if (!data.held) this.#ctxAt = data.ctxTime;
    };
    const channel = new MessageChannel();
    node.port.postMessage({ type: 'feeder', port: channel.port2 }, [channel.port2]);

    this.#out = out;
    this.#node = node;
    this.#feeder = channel.port1;
  }

  feederPort(): MessagePort | null {
    const port = this.#feeder; // take worker side port
    this.#feeder = null;
    return port;
  }

  now(): number | null {
    if (this.#held) return null;
    if (this.#silent) return this.#media + (performance.now() - this.#startedAt) / 1000;
    return this.#media + (this.#out!.now() - this.#ctxAt);
  }

  position(): number {
    return this.now() ?? this.#media;
  }

  play(): void {
    this.#playing = true;
    if (this.#silent) this.#start();
    else this.#out!.resume();
  }

  pause(): void {
    this.#playing = false;
    if (this.#silent) {
      if (!this.#held) {
        this.#media = this.now()!;
        this.#held = true;
      }
    } else {
      this.#out!.suspend();
    }
  }

  running(): boolean {
    if (this.#silent) return true;
    return this.#out?.running() ?? false;
  }

  audible(): boolean {
    return !this.#silent;
  }

  flush(gen: number, time: number): void {
    this.#media = time;
    this.#held = true;
    this.#readySent = false;
    this.#videoReady = false;
    this.#node?.port.postMessage({ type: 'flush', gen, time });
  }

  videoReady(): void {
    if (this.#silent) {
      this.#videoReady = true;
      this.#start();
      return;
    }
    if (this.#readySent) return;
    this.#readySent = true;
    this.#node?.port.postMessage({ type: 'videoReady' });
  }

  #start(): void {
    if (this.#playing && this.#videoReady && this.#held) {
      this.#held = false;
      this.#startedAt = performance.now();
    }
  }

  setVolume(value: number): void {
    this.#gain.volume(value);
  }

  setMuted(on: boolean): void {
    this.#gain.mute(on);
  }

  close(): void {
    this.#node?.disconnect();
    this.#gain.disconnect();
    this.#out?.close();
    this.#node = null;
    this.#out = null;
    this.#feeder = null;
  }
}

interface Voice {
  gain: GainNode;
  buffer: AudioBuffer | null;
  source: AudioBufferSourceNode | null;
  active: boolean;
  failed: boolean;
  /** Audio offset the running source started from */
  startOffset: number;
  /** Output clock reading when the source started */
  startedAt: number;
  /** Timeline frame matching baseOffset, from the last report */
  baseFrame: number;
  baseOffset: number;
}

const STALL_MS = 400; // stall threshold, milliseconds
const WATCH_MS = 200; // stall check interval, milliseconds
const RESYNC = 0.12; // drift threshold, seconds
const RATE_MIN = 0.25; // slowest playback rate
const RATE_MAX = 4; // fastest playback rate

export class LottieAudio {
  #out: AudioOutput | null = null;
  #gain = new GainControl();
  #voices = new Map<Uint8Array, Voice>();
  #gestureOff: (() => void) | null = null;
  #watchdog: ReturnType<typeof setInterval> | null = null;

  #frame = 0;
  #fps = 0;
  #lastAt = 0;
  #lastFrame = Number.NaN;

  #disposed = false;

  resolve(state: AudioInfo, frame: number): void {
    if (this.#disposed) return;
    if (typeof state.src === 'string') return;

    this.#frame = frame;
    const out = this.#attach();
    let voice = this.#voices.get(state.src);

    if (!voice) {
      if (!state.active) return;
      const gain = out.ctx.createGain();
      gain.connect(this.#gain.node!);
      voice = {
        gain,
        buffer: null,
        source: null,
        active: false,
        failed: false,
        startOffset: 0,
        startedAt: 0,
        baseFrame: frame,
        baseOffset: state.offset,
      };
      this.#voices.set(state.src, voice);
    }

    voice.gain.gain.value = state.volume;
    voice.active = state.active;
    voice.baseFrame = frame;
    voice.baseOffset = state.offset;

    if (!state.active) {
      this.#stop(voice);
      return;
    }
    if (voice.failed) return;
    if (voice.buffer) this.#start(voice, state.offset);
    else void this.#decode(voice, state.src);
  }

  tick(frame: number, fps: number, totalFrames: number): void {
    this.#frame = frame;
    this.#fps = fps;
    if (this.#disposed || !this.#out || this.#voices.size === 0) return;

    const at = performance.now();
    const elapsed = (at - this.#lastAt) / 1000;
    let advance = frame - this.#lastFrame;
    this.#lastAt = at;
    this.#lastFrame = frame;

    if (totalFrames > 0 && advance < -totalFrames / 2) advance += totalFrames;

    if (elapsed > STALL_MS / 1000) {
      this.hold();
      return;
    }

    const rate = elapsed > 0 && fps > 0 ? advance / fps / elapsed : Number.NaN;
    if (!Number.isFinite(rate)) return;
    if (rate < RATE_MIN || rate > RATE_MAX) {
      this.hold();
      return;
    }

    for (const voice of this.#voices.values()) {
      if (!voice.active || !voice.buffer) continue;
      const expected = this.#expected(voice);
      const actual = this.#position(voice);
      if (actual === null || Math.abs(expected - actual) > RESYNC) this.#start(voice, expected);
    }
  }

  /** Silence every voice, keeping what each one needs to resume in place */
  hold(): void {
    for (const voice of this.#voices.values()) this.#stop(voice);
    this.#unwatch();
  }

  /** Get or set the volume of this animation, in the range [0.0, 1.0]. */
  volume(): number;
  volume(value: number): void;
  volume(value?: number): number | void {
    if (value === undefined) return this.#gain.volume();
    this.#gain.volume(value);
  }

  mute(on: boolean): void {
    this.#gain.mute(on);
  }

  muted(): boolean {
    return this.#gain.muted();
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;

    this.hold();
    for (const voice of this.#voices.values()) voice.gain.disconnect();
    this.#voices.clear();

    this.#gestureOff?.();
    this.#gestureOff = null;
    this.#gain.disconnect();

    if (this.#out) {
      this.#out = null;
      AudioOutput.release();
    }
  }

  #attach(): AudioOutput {
    if (this.#out) return this.#out;

    const out = AudioOutput.acquire();
    this.#gain.attach(out.gain());
    this.#out = out;
    this.#lastAt = performance.now();

    out.resume();
    this.#gestureOff = onUserGesture(() => {
      this.#gestureOff = null;
      this.#out?.resume();
    });
    return out;
  }

  async #decode(voice: Voice, bytes: Uint8Array): Promise<void> {
    const out = this.#out;
    if (!out) return;

    try {
      const buffer = await out.ctx.decodeAudioData(bytes.slice().buffer);

      if (this.#disposed || this.#out !== out) return;
      voice.buffer = buffer;
      if (voice.active) this.#start(voice, this.#expected(voice));
    } catch (e) {
      voice.failed = true;
      handleError('Failed to decode an audio layer: ' + String((e as Error)?.message ?? e), 'LottieAudio');
    }
  }

  /** Where the audio should be, going by the timeline */
  #expected(voice: Voice): number {
    if (this.#fps <= 0) return voice.baseOffset;
    return voice.baseOffset + (this.#frame - voice.baseFrame) / this.#fps;
  }

  /** Where the audio actually is, going by the audio clock */
  #position(voice: Voice): number | null {
    if (!voice.source || !this.#out) return null;
    return voice.startOffset + (this.#out.now() - voice.startedAt);
  }

  #start(voice: Voice, offset: number): void {
    const out = this.#out;
    const buffer = voice.buffer;
    if (!out || !buffer) return;

    this.#stop(voice);
    if (offset < 0 || offset >= buffer.duration) return;

    const source = out.ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(voice.gain);
    source.onended = () => {
      if (voice.source === source) voice.source = null;
    };
    source.start(0, offset);

    voice.source = source;
    voice.startOffset = offset;
    voice.startedAt = out.now();
    this.#watch();
  }

  #stop(voice: Voice): void {
    const source = voice.source;
    if (!source) return;
    voice.source = null;
    source.onended = null;
    source.stop();
    source.disconnect();
  }

  #watch(): void {
    if (this.#watchdog !== null) return;
    this.#watchdog = setInterval(() => {
      if (performance.now() - this.#lastAt > STALL_MS) this.hold();
    }, WATCH_MS);
  }

  #unwatch(): void {
    if (this.#watchdog === null) return;
    clearInterval(this.#watchdog);
    this.#watchdog = null;
  }
}
