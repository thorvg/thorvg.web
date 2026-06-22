import { Input, BufferSource, MP4, QTFF, MATROSKA, WEBM, MPEG_TS, VideoSampleSink, AudioSampleSink } from 'mediabunny';
import type { VideoSample } from 'mediabunny';

const MAX_FRAMES = 3;
const MIN_LATE_INTERVAL = 0.25; // min delivery interval, seconds
const PACE_HEADROOM = 1.2; // pacing margin
const FEED_AHEAD_SECONDS = 2; // PCM buffered ahead, seconds

let bytes: Uint8Array | null = null;
let videoGen = 0;
let audioGen = 0;
let audioStartTime = 0;
let target: { width: number; height: number } | null = null;
let playhead = 0;
let copyToUsable = true;
let feederPort: MessagePort | null = null;
let audioWake: (() => void) | null = null;

const video = { items: 0, pending: null as (() => void) | null };

let surface: OffscreenCanvas | null = null;
let surfaceCtx: OffscreenCanvasRenderingContext2D | null = null;

function frameSurface(w: number, h: number): OffscreenCanvasRenderingContext2D {
  if (!surface || surface.width !== w || surface.height !== h) {
    surface = new OffscreenCanvas(w, h);
    surfaceCtx = surface.getContext('2d', { willReadFrequently: true });
  }
  if (!surfaceCtx) throw new Error('failed to acquire a 2d context for video frames');
  return surfaceCtx;
}

function throwError(message: unknown): void {
  self.postMessage({ type: 'error', message: String((message as Error)?.message ?? message) });
}

function reserve(): Promise<void> {
  if (video.items < MAX_FRAMES) {
    video.items++;
    return Promise.resolve();
  }
  return new Promise<void>((resolve) => {
    video.pending = resolve;
  });
}

function ack(): void {
  video.items = Math.max(0, video.items - 1);
  const pending = video.pending;
  if (pending && video.items < MAX_FRAMES) {
    video.pending = null;
    video.items++;
    pending();
  }
}

function resetSlots(): void {
  video.items = 0;
  const pending = video.pending;
  video.pending = null;
  pending?.();
}

function decodeDims(srcW: number, srcH: number): { w: number; h: number } {
  if (!target) return { w: srcW, h: srcH };
  const scale = Math.min(1, Math.max(target.width / srcW, target.height / srcH));
  return { w: Math.max(1, Math.round(srcW * scale)), h: Math.max(1, Math.round(srcH * scale)) };
}

async function convert(sample: VideoSample, w: number, h: number): Promise<ArrayBuffer> {
  if (copyToUsable && sample.rotation === 0 && w === sample.codedWidth && h === sample.codedHeight) {
    try {
      if (sample.allocationSize({ format: 'RGBA' }) === w * h * 4) {
        const rgba = new ArrayBuffer(w * h * 4);
        await sample.copyTo(rgba, { format: 'RGBA', colorSpace: 'srgb' });
        return rgba;
      }
    } catch {
      copyToUsable = false;
    }
  }
  const ctx = frameSurface(w, h);
  ctx.clearRect(0, 0, w, h);
  sample.draw(ctx, 0, 0, w, h);
  return ctx.getImageData(0, 0, w, h).data.buffer;
}

function openInput(): Input {
  return new Input({ source: new BufferSource(bytes!.buffer), formats: [MP4, QTFF, MATROSKA, WEBM, MPEG_TS] });
}

async function videoLoop(myGen: number, startTime: number): Promise<void> {
  try {
    const track = await openInput().getPrimaryVideoTrack();
    if (!track) return;
    const sink = new VideoSampleSink(track);
    let lastSent = -Infinity;
    let convertCost = 0; // EMA of seconds spent converting a delivered frame

    for await (const sample of sink.samples(startTime)) {
      if (myGen !== videoGen) { sample.close(); return; }

      // pace deliveries to the measured conversion capacity
      const timeSec = sample.timestamp;
      const pace = Math.max(convertCost * PACE_HEADROOM, timeSec < playhead ? MIN_LATE_INTERVAL : 0);
      if (timeSec < lastSent + pace) {
        sample.close();
        continue;
      }

      const { w, h } = decodeDims(sample.displayWidth, sample.displayHeight);
      await reserve();
      if (myGen !== videoGen) { sample.close(); return; }

      const started = performance.now();
      const rgba = await convert(sample, w, h);
      convertCost = convertCost * 0.9 + ((performance.now() - started) / 1000) * 0.1;
      sample.close();
      if (myGen !== videoGen) return;
      // @ts-expect-error: postMessage signature mismatch in global types
      self.postMessage({ type: 'frame', rgba, width: w, height: h, timeSec, gen: myGen }, [rgba]);
      lastSent = timeSec;
    }
  } catch (e) {
    throwError(e);
  }
}

async function audioLoop(myGen: number, startTime: number): Promise<void> {
  const port = feederPort;
  if (!port) return;
  try {
    const track = await openInput().getPrimaryAudioTrack();
    if (!track || !(await track.canDecode())) return;

    const highWater = track.sampleRate * FEED_AHEAD_SECONDS;
    let sent = 0;
    let consumed = 0;
    let first = true;
    port.onmessage = ({ data }: MessageEvent) => {
      if (data.gen === myGen) consumed = data.frames;
      audioWake?.();
      audioWake = null;
    };

    const sink = new AudioSampleSink(track);
    for await (const sample of sink.samples(startTime)) {
      if (myGen !== audioGen) { sample.close(); return; }

      while (sent - consumed > highWater) {
        await new Promise<void>((resolve) => { audioWake = resolve; });
        if (myGen !== audioGen) { sample.close(); return; }
      }

      // trim the leading samples of the first chunk down to the start position
      const skip = first ? Math.max(0, Math.min(sample.numberOfFrames - 1, Math.round((startTime - sample.timestamp) * sample.sampleRate))) : 0;
      first = false;

      const planes: ArrayBuffer[] = [];
      for (let c = 0; c < sample.numberOfChannels; c++) {
        const plane = new ArrayBuffer(sample.allocationSize({ format: 'f32-planar', planeIndex: c }));
        sample.copyTo(plane, { format: 'f32-planar', planeIndex: c });
        planes.push(skip > 0 ? plane.slice(skip * 4) : plane);
      }
      port.postMessage({ gen: myGen, planes }, planes);
      sent += sample.numberOfFrames - skip;
      sample.close();
    }
  } catch (e) {
    throwError(e);
  }
}

async function announce(): Promise<void> {
  try {
    const input = openInput();
    const videoTrack = await input.getPrimaryVideoTrack();
    if (!videoTrack) return throwError('no video track found');
    if (!(await videoTrack.canDecode())) return throwError('unsupported video codec');

    const audioTrack = await input.getPrimaryAudioTrack();
    const hasAudio = !!audioTrack && (await audioTrack.canDecode());
    const duration = await input.computeDuration();
    const { w, h } = decodeDims(videoTrack.displayWidth, videoTrack.displayHeight);
    self.postMessage({
      type: 'ready',
      width: videoTrack.displayWidth,
      height: videoTrack.displayHeight,
      decodeWidth: w,
      decodeHeight: h,
      duration,
      hasAudio,
      sampleRate: hasAudio ? audioTrack!.sampleRate : 0,
      channels: hasAudio ? audioTrack!.numberOfChannels : 0,
    });
    videoLoop(videoGen, 0);
  } catch (e) {
    throwError(e);
  }
}

self.onmessage = ({ data }: MessageEvent) => {
  switch (data.type) {
    case 'load': {
      bytes = data.bytes;
      videoGen = 0;
      audioGen = 0;
      audioStartTime = 0;
      target = null;
      playhead = 0;
      resetSlots();
      announce();
      break;
    }
    case 'audioPort': {
      feederPort = data.port;
      audioLoop(audioGen, audioStartTime);
      break;
    }
    case 'ack': {
      if (typeof data.time === 'number') playhead = data.time;
      ack();
      break;
    }
    case 'resize': {
      target = data.width > 0 && data.height > 0 ? { width: data.width, height: data.height } : null;
      break;
    }
    case 'restart': {
      videoGen = data.videoGen;
      audioGen = data.audioGen;
      playhead = data.time ?? 0;
      audioStartTime = data.time ?? 0;
      resetSlots();
      audioWake?.();
      audioWake = null;
      videoLoop(videoGen, data.time ?? 0);
      audioLoop(audioGen, data.time ?? 0);
      break;
    }
    case 'audioRestart': {
      audioGen = data.audioGen;
      audioStartTime = data.time ?? 0;
      audioWake?.();
      audioWake = null;
      audioLoop(audioGen, audioStartTime);
      break;
    }
    case 'resync': {
      videoGen = data.videoGen;
      playhead = data.time ?? 0;
      resetSlots();
      videoLoop(videoGen, data.time ?? 0);
      break;
    }
  }
};
