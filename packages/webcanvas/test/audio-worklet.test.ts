import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { getWorkletUrl } from '../src/worker/audio.worklet';


const SAMPLE_RATE = 48000;
const QUANTUM = 128;
const PRIME_FRAMES = 7200; // the processor buffers 150ms at 48kHz before it starts

interface WorkletPort {
  onmessage: ((event: { data: unknown }) => void) | null;
  postMessage: (data: unknown, transfer?: unknown[]) => void;
  sent: unknown[];
}

interface Processor {
  port: WorkletPort;
  process(inputs: Float32Array[][], outputs: Float32Array[][]): boolean;
}

function port(): WorkletPort {
  const sent: unknown[] = [];
  return { onmessage: null, postMessage: (data: unknown) => { sent.push(data); }, sent };
}

// there is no audio thread here, so the worklet is loaded the way the browser does it:
// its module source runs with the audio globals in place and registers the processor
async function loadProcessorClass(): Promise<new () => Processor> {
  const blobs: Blob[] = [];
  const createObjectURL = URL.createObjectURL;
  URL.createObjectURL = (object: Blob | MediaSource): string => {
    if (object instanceof Blob) blobs.push(object);
    return createObjectURL.call(URL, object);
  };
  try {
    getWorkletUrl();
  } finally {
    URL.createObjectURL = createObjectURL;
  }

  const source = await blobs[blobs.length - 1]!.text();
  let registered: (new () => Processor) | null = null;

  const scope = globalThis as unknown as Record<string, unknown>;
  scope.AudioWorkletProcessor = class {
    port = port();
  };
  scope.registerProcessor = (_name: string, ctor: new () => Processor): void => { registered = ctor; };
  scope.sampleRate = SAMPLE_RATE;
  scope.currentTime = 0;

  new Function(source)();
  return registered!;
}

function pcm(frames: number, channels = 1, value = 0.5): { gen: number; planes: ArrayBuffer[] } {
  const planes = Array.from({ length: channels }, () => {
    const plane = new Float32Array(frames).fill(value);
    return plane.buffer;
  });
  return { gen: 0, planes };
}

function outputs(channels = 1): Float32Array[][] {
  return [Array.from({ length: channels }, () => new Float32Array(QUANTUM))];
}

describe('TvgAudioProcessor', () => {
  let TvgAudioProcessor: new () => Processor;
  let processor: Processor;
  let feeder: WorkletPort;

  beforeAll(async () => {
    TvgAudioProcessor = await loadProcessorClass();
  });

  beforeEach(() => {
    processor = new TvgAudioProcessor();
    feeder = port();
    tell({ type: 'feeder', port: feeder });
  });

  function tell(message: Record<string, unknown>): void {
    processor.port.onmessage?.({ data: message });
  }

  function feed(data: { gen: number; planes: ArrayBuffer[] }): void {
    feeder.onmessage?.({ data });
  }

  // one render quantum
  function render(channels = 1): Float32Array[] {
    const out = outputs(channels);
    processor.process([], out);
    return out[0]!;
  }

  function play(quanta: number): void {
    for (let i = 0; i < quanta; i++) render();
  }

  function silent(channel: Float32Array): boolean {
    return channel.every((sample) => sample === 0);
  }

  // get past the priming gate
  function start(channels = 1, frames = PRIME_FRAMES): void {
    tell({ type: 'videoReady' });
    feed(pcm(frames, channels));
    render(channels);
  }

  function heldMessages(): { held: boolean; media: number; ctxTime?: number }[] {
    return processor.port.sent as { held: boolean; media: number; ctxTime?: number }[];
  }

  it('process stays silent until the video is ready', () => {
    feed(pcm(PRIME_FRAMES));

    expect(silent(render()[0]!)).toBe(true);
    expect(processor.port.sent).toHaveLength(0);
  });

  it('process stays silent until the priming amount is buffered', () => {
    tell({ type: 'videoReady' });
    feed(pcm(PRIME_FRAMES - QUANTUM));

    expect(silent(render()[0]!)).toBe(true);
    expect(processor.port.sent).toHaveLength(0);
  });

  it('process starts when the video is ready and primed', () => {
    tell({ type: 'videoReady' });
    feed(pcm(PRIME_FRAMES));

    expect(render()[0]![0]).toBeCloseTo(0.5);
    expect(heldMessages()[0]!.held).toBe(false);
    expect(heldMessages()[0]!.media).toBe(0);
    expect(heldMessages()[0]!.ctxTime).toBe(0); // the player anchors its clock on this
  });

  it('media follows the frames it has played', () => {
    start(); // exactly the priming amount, so it runs dry after playing all of it
    play(Math.ceil(PRIME_FRAMES / QUANTUM));

    const held = heldMessages().find((message) => message.held)!;
    expect(held.media).toBeCloseTo(0.15, 5); // 7200 frames at 48kHz
  });

  it('process holds when the buffer runs dry', () => {
    start();
    play(Math.ceil(PRIME_FRAMES / QUANTUM) + 2);

    expect(heldMessages().some((message) => message.held)).toBe(true);
  });

  it('process primes again after the buffer has run dry', () => {
    start();
    play(Math.ceil(PRIME_FRAMES / QUANTUM) + 1); // drain everything it had
    feed(pcm(QUANTUM)); // far short of the priming amount

    expect(silent(render()[0]!)).toBe(true);
  });

  it('process copies a mono chunk to both channels', () => {
    tell({ type: 'videoReady' });
    feed(pcm(PRIME_FRAMES, 1, 0.25));

    const out = render(2);
    expect(out[0]![0]).toBeCloseTo(0.25);
    expect(out[1]![0]).toBeCloseTo(0.25);
  });

  it('process keeps stereo channels apart', () => {
    tell({ type: 'videoReady' });
    feed({ gen: 0, planes: [
      new Float32Array(PRIME_FRAMES).fill(0.5).buffer,
      new Float32Array(PRIME_FRAMES).fill(-0.5).buffer,
    ] });

    const out = render(2);
    expect(out[0]![0]).toBeCloseTo(0.5);
    expect(out[1]![0]).toBeCloseTo(-0.5);
  });

  it('process continues across a chunk boundary', () => {
    tell({ type: 'videoReady' });
    const first = PRIME_FRAMES + QUANTUM / 2;
    feed({ gen: 0, planes: [new Float32Array(first).fill(0.5).buffer] });
    feed({ gen: 0, planes: [new Float32Array(QUANTUM).fill(-0.5).buffer] });

    play(Math.floor(first / QUANTUM)); // until what is left is shorter than one quantum
    const tail = first % QUANTUM;
    const out = render()[0]!;

    expect(out[tail - 1]).toBeCloseTo(0.5);   // end of the first chunk
    expect(out[tail]).toBeCloseTo(-0.5);      // start of the second one
  });

  it('process reports consumed frames to the feeder', () => {
    start();
    play(Math.ceil(2048 / QUANTUM));

    const report = feeder.sent.at(-1) as { gen: number; frames: number };
    expect(report.gen).toBe(0);
    expect(report.frames).toBeGreaterThanOrEqual(2048);
  });

  it('flush drops the buffer and rebases the clock', () => {
    start();
    tell({ type: 'flush', gen: 1, time: 7 });

    expect(silent(render()[0]!)).toBe(true);
    expect(heldMessages().at(-1)!.held).toBe(true);
    expect(heldMessages().at(-1)!.media).toBe(7);
  });

  it('flush drops the audio it had buffered', () => {
    start(); // primed with 0.5
    tell({ type: 'flush', gen: 1, time: 0 });
    tell({ type: 'videoReady' });
    feed({ gen: 1, planes: [new Float32Array(PRIME_FRAMES).fill(-0.25).buffer] });

    expect(render()[0]![0]).toBeCloseTo(-0.25); // the new chunk, not what was queued before
  });

  it('flush waits for the video to be ready again', () => {
    start();
    tell({ type: 'flush', gen: 1, time: 0 });
    feed({ gen: 1, planes: [new Float32Array(PRIME_FRAMES).fill(0.5).buffer] });

    expect(silent(render()[0]!)).toBe(true); // no videoReady has arrived since the flush
  });

  it('flush ignores audio from an older generation', () => {
    tell({ type: 'flush', gen: 1, time: 0 });
    tell({ type: 'videoReady' });

    feed(pcm(PRIME_FRAMES)); // generation 0, stale

    expect(silent(render()[0]!)).toBe(true);
  });
});
