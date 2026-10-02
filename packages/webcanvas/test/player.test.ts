import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { initMedia } from '../src/core/media/Player';
import type { ThorVGModule, WebMediaPlayer } from '../src/types/emscripten';


const WIDTH = 4;
const HEIGHT = 2;
const DURATION = 10;
const FRAME_BYTES = WIDTH * HEIGHT * 4;

// the worker reports the source size alongside the smaller size it decodes at
const READY = {
  type: 'ready', width: WIDTH * 2, height: HEIGHT * 2, decodeWidth: WIDTH, decodeHeight: HEIGHT,
  duration: DURATION, hasAudio: false, sampleRate: 0, channels: 0,
};

interface Message {
  type: string;
  [key: string]: unknown;
}

// the fake worker from test/worker-stub.ts, which records what the player posts
interface StubWorker {
  messages: Message[];
  onmessage: ((event: { data: unknown }) => void) | null;
  terminated: boolean;
}

function workers(): StubWorker[] {
  const holder = globalThis as unknown as { __WORKERS?: StubWorker[] };
  return (holder.__WORKERS ??= []);
}

function frame(timeSec: number, gen = 0): Message {
  return { type: 'frame', gen, rgba: new ArrayBuffer(FRAME_BYTES), width: WIDTH, height: HEIGHT, timeSec };
}

function deliver(worker: StubWorker, data: Message): void {
  worker.onmessage?.({ data });
}

function countOf(worker: StubWorker, type: string): number {
  return worker.messages.filter((message) => message.type === type).length;
}

function lastOf(worker: StubWorker, type: string): Message {
  return worker.messages.filter((message) => message.type === type).pop()!;
}

// the generation the player is on, which a seek or a resync bumps
function generation(worker: StubWorker): number {
  const bumps = worker.messages.filter((message) => message.type === 'restart' || message.type === 'resync');
  return (bumps[bumps.length - 1]?.videoGen as number | undefined) ?? 0;
}

// the audio sink attaches on a promise, so the player needs a turn after 'ready'
async function settle(): Promise<void> {
  if (vi.isFakeTimers()) await vi.advanceTimersByTimeAsync(0);
  else await new Promise((resolve) => setTimeout(resolve, 0));
}

// the silent clock reads performance.now(), and the stall watchdog runs on an interval
function useClock(): void {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'] });
}

// a host that keeps rendering, so the watchdog leaves the clock running
async function pump(player: WebMediaPlayer, ms: number): Promise<void> {
  for (let elapsed = 0; elapsed < ms; elapsed += 100) {
    await vi.advanceTimersByTimeAsync(100);
    player.sync();
  }
}

describe('MediaPlayer', () => {
  let opened: WebMediaPlayer[] = [];

  function create(bytes = new Uint8Array([1, 2, 3])): { player: WebMediaPlayer; worker: StubWorker } {
    const Module = {} as ThorVGModule;
    initMedia(Module);

    const player = Module.createMediaPlayer!(0, bytes)!;
    opened.push(player);
    return { player, worker: workers()[workers().length - 1]! };
  }

  async function createReady(duration = DURATION): Promise<{ player: WebMediaPlayer; worker: StubWorker }> {
    const created = create();
    deliver(created.worker, { ...READY, duration });
    await settle();
    return created;
  }

  // the clock only starts once a frame has been taken
  async function createPlaying(duration = DURATION): Promise<{ player: WebMediaPlayer; worker: StubWorker }> {
    const created = await createReady(duration);
    deliver(created.worker, frame(0));
    created.player.sync();
    return created;
  }

  beforeEach(() => {
    workers().length = 0;
  });

  afterEach(() => {
    for (const player of opened) player.dispose();
    opened = [];
    vi.useRealTimers();
  });

  it('constructor posts the media bytes to the worker', () => {
    const bytes = new Uint8Array([1, 2, 3]);
    const { worker } = create(bytes);

    expect(worker.messages[0]!.type).toBe('load');
    expect(worker.messages[0]!.bytes).toBe(bytes);
  });

  it('sync returns null before the media is ready', () => {
    const { player } = create();
    expect(player.sync()).toBeNull();
  });

  it('sync reports the decoded size and duration', async () => {
    const { player } = await createReady();
    expect(player.sync()).toEqual({ width: WIDTH, height: HEIGHT, duration: DURATION });
  });

  it('sync takes the latest due frame and acks each one', async () => {
    const { player, worker } = await createReady();
    const first = frame(0);
    const latest = frame(0.01);
    new Uint8Array(first.rgba as ArrayBuffer)[0] = 1;
    new Uint8Array(latest.rgba as ArrayBuffer)[0] = 2;

    deliver(worker, first);
    deliver(worker, latest);

    expect(player.sync()?.data?.[0]).toBe(2);
    expect(countOf(worker, 'ack')).toBe(2);
  });

  it('sync leaves a frame that is not due yet', async () => {
    const { player, worker } = await createReady();
    deliver(worker, frame(DURATION / 2));

    expect(player.sync()?.data).toBeUndefined();
    expect(countOf(worker, 'ack')).toBe(0);
  });

  it('sync drops a frame of an old generation but acks it', async () => {
    const { player, worker } = await createReady();
    deliver(worker, frame(0, 7));

    expect(countOf(worker, 'ack')).toBe(1);
    expect(player.sync()?.data).toBeUndefined();
  });

  it('sync ignores a frame of the wrong size but acks it', async () => {
    const { player, worker } = await createReady();
    deliver(worker, { ...frame(0), width: WIDTH + 1 });

    expect(player.sync()?.data).toBeUndefined();
    expect(countOf(worker, 'ack')).toBe(1);
  });

  it('seek restarts both streams', async () => {
    const { player, worker } = await createReady();
    player.seek(3);

    const restart = lastOf(worker, 'restart');
    expect(restart.videoGen).toBe(1);
    expect(restart.audioGen).toBe(1);
    expect(restart.time).toBe(3);
  });

  it('seek clamps to the duration', async () => {
    const { player, worker } = await createReady();
    player.seek(DURATION + 5);

    expect(lastOf(worker, 'restart').time).toBe(DURATION);
  });

  it('seek before ready is applied when the media arrives', async () => {
    const { player, worker } = create();
    player.seek(2);
    expect(countOf(worker, 'restart')).toBe(0);

    deliver(worker, READY);
    await settle();

    expect(lastOf(worker, 'restart').time).toBe(2);
    expect(lastOf(worker, 'audioRestart').time).toBe(2);
  });

  it('stop rewinds to the start', async () => {
    const { player, worker } = await createReady();
    player.stop();

    expect(lastOf(worker, 'restart').time).toBe(0);
  });

  it('the clock follows the host while playing', async () => {
    useClock();
    const { player, worker } = await createPlaying();

    await pump(player, 500);
    deliver(worker, frame(0.4));

    expect(player.sync()?.time).toBeCloseTo(0.5, 2);
  });

  it('pause freezes the clock', async () => {
    useClock();
    const { player, worker } = await createPlaying();
    player.pause();

    await vi.advanceTimersByTimeAsync(1000);
    deliver(worker, frame(0));

    expect(player.sync()?.time).toBeCloseTo(0, 2);
  });

  it('the clock holds while the host stops syncing', async () => {
    useClock();
    const { player, worker } = await createPlaying();

    await vi.advanceTimersByTimeAsync(1000); // no sync, so the watchdog parks the clock
    deliver(worker, frame(0.3));

    expect(player.sync()?.time).toBeCloseTo(0.4, 2); // STALL_MS, not the full second
  });

  it('the end restarts the media while looping', async () => {
    useClock();
    const { player, worker } = await createPlaying(0.2);

    await vi.advanceTimersByTimeAsync(300);
    player.sync();

    expect(lastOf(worker, 'restart').time).toBe(0);
  });

  it('the end pauses the media when looping is off', async () => {
    useClock();
    const { player, worker } = await createPlaying(0.2);
    player.loop(false);

    await vi.advanceTimersByTimeAsync(300);
    player.sync();

    expect(countOf(worker, 'restart')).toBe(0);
  });

  it('falling behind the clock resyncs the video alone', async () => {
    useClock();
    const { player, worker } = await createPlaying();

    await pump(player, 1500); // the frame on screen is more than a second behind

    const resync = lastOf(worker, 'resync');
    expect(resync.videoGen).toBe(1);
    expect(resync.time as number).toBeGreaterThan(1); // it picks up where the clock is
    expect(countOf(worker, 'restart')).toBe(0); // the audio keeps running
  });

  it('seeking twice to the same spot parks the clock there', async () => {
    useClock();
    const { player, worker } = await createPlaying();
    player.seek(0.5);
    deliver(worker, frame(0.5, generation(worker)));
    await pump(player, 1500); // the clock runs well past the target

    player.seek(0.5); // the same spot again, so the clock stays put from here
    deliver(worker, frame(0.5, generation(worker)));
    await pump(player, 500);

    deliver(worker, frame(0.5, generation(worker)));
    expect(player.sync()?.time).toBeCloseTo(0.5, 2);
  });

  it('dispose terminates the worker', async () => {
    const { player, worker } = await createReady();
    player.dispose();

    expect(worker.terminated).toBe(true);
    expect(player.sync()).toBeNull();
  });

  it('ready hands the worker an audio port', async () => {
    const { player, worker } = create();
    deliver(worker, { ...READY, hasAudio: true, sampleRate: 48000, channels: 2 });

    // the sink opens on a promise, and falls back to a silent one where there is no
    // Web Audio, which still hands the worker a port, an empty one
    for (let turn = 0; turn < 500 && countOf(worker, 'audioPort') === 0; turn++) await settle();
    const audible = typeof AudioContext === 'function';

    expect(countOf(worker, 'audioPort')).toBe(1);
    expect(lastOf(worker, 'audioPort').port !== null).toBe(audible);
    expect(player.sync()?.duration).toBe(DURATION);
  });

  it('an error from the worker disposes the player', async () => {
    const { player, worker } = await createReady();

    expect(() => deliver(worker, { type: 'error', message: 'boom' })).toThrow(/boom/);
    expect(worker.terminated).toBe(true);
    expect(player.sync()).toBeNull();
  });
});
