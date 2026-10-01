import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { initMedia } from '../src/core/media/Player';
import type { ThorVGModule, WebMediaPlayer } from '../src/types/emscripten';


const WIDTH = 4;
const HEIGHT = 2;
const DURATION = 10;
const FRAME_BYTES = WIDTH * HEIGHT * 4;

const READY = {
  type: 'ready', width: WIDTH, height: HEIGHT, decodeWidth: WIDTH, decodeHeight: HEIGHT,
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

// the audio sink attaches on a promise, so the player needs a turn after 'ready'
function settle(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
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

  beforeEach(() => {
    workers().length = 0;
  });

  afterEach(() => {
    for (const player of opened) player.dispose();
    opened = [];
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
