import { Input, BufferSource, MP4, QTFF, WEBM, VideoSampleSink, AudioSampleSink } from 'mediabunny';
import type { InputVideoTrack, InputAudioTrack } from 'mediabunny';

const MAX_QUEUE = 24; // Max video frames queues
const MAX_AUDIO_QUEUE = 64; // Max audio chunks queues

let bytes: Uint8Array | null = null;
let gen = 0;

interface Channel {
  free: number;
  release: (() => void) | null;
}

const video: Channel = { free: 0, release: null };
const audio: Channel = { free: 0, release: null };

function throwError(message: unknown): void {
  self.postMessage({ type: 'error', message: String((message as Error)?.message ?? message) });
}

function reserveSlot(ch: Channel): Promise<void> {
  if (ch.free > 0) {
    ch.free--;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    ch.release = () => {
      ch.release = null;
      resolve();
    };
  });
}

function ack(ch: Channel): void {
  if (ch.release) ch.release();
  else ch.free++;
}

async function pumpVideo(track: InputVideoTrack, myGen: number, startTime: number): Promise<void> {
  const sink = new VideoSampleSink(track);
  for await (const sample of sink.samples(startTime)) {
    if (myGen !== gen) { sample.close(); return; }
    await reserveSlot(video);
    if (myGen !== gen) { sample.close(); return; }

    const rgba = new ArrayBuffer(sample.allocationSize({ format: 'RGBA' }));
    await sample.copyTo(rgba, { format: 'RGBA' });
    // @ts-expect-error: postMessage signature mismatch in global types
    self.postMessage({ type: 'frame', rgba, timeSec: sample.timestamp, gen: myGen }, [rgba]);
    sample.close();
  }
}

async function pumpAudio(track: InputAudioTrack, myGen: number, startTime: number): Promise<void> {
  const sink = new AudioSampleSink(track);
  for await (const sample of sink.samples(startTime)) {
    if (myGen !== gen) {
      sample.close();
      return;
    }
    await reserveSlot(audio);
    if (myGen !== gen) {
      sample.close();
      return;
    }

    const channels = sample.numberOfChannels;
    const frames = sample.numberOfFrames;
    const planes: ArrayBuffer[] = [];
    for (let c = 0; c < channels; c++) {
      const plane = new ArrayBuffer(sample.allocationSize({ format: 'f32-planar', planeIndex: c }));
      sample.copyTo(plane, { format: 'f32-planar', planeIndex: c });
      planes.push(plane);
    }
    // @ts-expect-error: postMessage signature mismatch in global types
    self.postMessage({ type: 'audio', planes, channels, frames, sampleRate: sample.sampleRate, timeSec: sample.timestamp, gen: myGen }, planes);
    sample.close();
  }
}

async function run(myGen: number, announce: boolean, startTime = 0): Promise<void> {
  try {
    const input = new Input({ source: new BufferSource(bytes!.buffer), formats: [MP4, QTFF, WEBM] });
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) return throwError('no video track found');

    const audioTrack = await input.getPrimaryAudioTrack();
    const hasAudio = !!audioTrack && (await audioTrack.canDecode());

    if (announce) {
      if (!(await videoTrack.canDecode())) return throwError('unsupported video codec');
      const duration = await input.computeDuration();
      self.postMessage({ type: 'ready', width: videoTrack.displayWidth, height: videoTrack.displayHeight, duration, hasAudio });
    }

    const tasks = [pumpVideo(videoTrack, myGen, startTime)];
    if (hasAudio) tasks.push(pumpAudio(audioTrack!, myGen, startTime));
    await Promise.all(tasks);

    if (myGen === gen) {
      self.postMessage({ type: 'eos' });
    }
  } catch (e) {
    throwError(e);
  }
}

function resetSlots(): void {
  video.free = MAX_QUEUE;
  audio.free = MAX_AUDIO_QUEUE;
  if (video.release) video.release();
  if (audio.release) audio.release();
}

self.onmessage = ({ data }: MessageEvent) => {
  switch (data.type) {
    case 'load': {
      bytes = data.bytes;
      gen = 0;
      resetSlots();
      run(gen, true);
      break;
    }
    case 'ack': {
      ack(video);
      break;
    }
    case 'ackAudio': {
      ack(audio);
      break;
    }
    case 'restart': {
      gen = data.gen;
      resetSlots();
      run(gen, false, data.time ?? 0);
      break;
    }
  }
};
