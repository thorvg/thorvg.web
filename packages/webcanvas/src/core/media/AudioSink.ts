import { handleError } from '../../common/errors';
import { getWorkletUrl } from '../../worker/audio.worklet';

export interface AudioFormat {
  sampleRate: number;
  channels: number;
}

export class AudioSink {
  #ctx: AudioContext | null = null;
  #gain: GainNode | null = null;
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

  #volume = 1;
  #muted = false;

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
    const ctx = new AudioContext({ sampleRate });
    await ctx.audioWorklet.addModule(getWorkletUrl());
    const node = new AudioWorkletNode(ctx, 'tvg-audio', { numberOfInputs: 0, outputChannelCount: [channels] });
    const gain = ctx.createGain();
    node.connect(gain).connect(ctx.destination);

    node.port.onmessage = ({ data }: MessageEvent) => {
      this.#held = data.held;
      this.#media = data.media;
      if (!data.held) this.#ctxAt = data.ctxTime;
    };
    const channel = new MessageChannel();
    node.port.postMessage({ type: 'feeder', port: channel.port2 }, [channel.port2]);

    this.#ctx = ctx;
    this.#node = node;
    this.#gain = gain;
    this.#feeder = channel.port1;
    this.#applyGain();
  }

  feederPort(): MessagePort | null {
    const port = this.#feeder; // take worker side port
    this.#feeder = null;
    return port;
  }

  now(): number | null {
    if (this.#held) return null;
    if (this.#silent) return this.#media + (performance.now() - this.#startedAt) / 1000;
    return this.#media + (this.#ctx!.currentTime - this.#ctxAt);
  }

  position(): number {
    return this.now() ?? this.#media;
  }

  play(): void {
    this.#playing = true;
    if (this.#silent) this.#start();
    else void this.#ctx!.resume();
  }

  pause(): void {
    this.#playing = false;
    if (this.#silent) {
      if (!this.#held) {
        this.#media = this.now()!;
        this.#held = true;
      }
    } else {
      void this.#ctx!.suspend();
    }
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
    this.#volume = value;
    this.#applyGain();
  }

  setMuted(on: boolean): void {
    this.#muted = on;
    this.#applyGain();
  }

  #applyGain(): void {
    if (this.#gain) this.#gain.gain.value = this.#muted ? 0 : this.#volume;
  }

  close(): void {
    this.#node?.disconnect();
    this.#gain?.disconnect();
    if (this.#ctx) void this.#ctx.close();
    this.#node = null;
    this.#gain = null;
    this.#ctx = null;
    this.#feeder = null;
  }
}
