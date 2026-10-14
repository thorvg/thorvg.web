import { type Renderer, RENDERER_LABELS } from './constants';
import { type MemorySample, toMB } from './profiler';

export type BenchPhase = 'idle' | 'warmup' | 'measuring' | 'done';

export const BENCH_WARMUP_MS = 3000;
export const BENCH_MEASURE_MS = 10000;

export interface MemoryStat { avg: number; peak: number }

export interface BenchmarkResult {
  timestamp: string;
  renderer: Renderer;
  version: string;
  count: number;
  size: number;
  seed: string;
  warmupMs: number;
  measureMs: number;
  totalFrames: number;
  fps: number;
  frameTime: { avg: number; min: number; max: number; p95: number };
  memory: {
    js: MemoryStat | null;
    wasm: MemoryStat | null;
    gpu: (MemoryStat & { breakdown: Record<string, number>; resources: Record<string, number> }) | null;
  };
}

export function computeBenchResult(
  timings: number[],
  memSamples: MemorySample[],
  config: { renderer: Renderer; version: string; count: number; size: number; seed: string },
  warmupMs = BENCH_WARMUP_MS,
  measureMs = BENCH_MEASURE_MS,
): BenchmarkResult {
  const sorted = [...timings].sort((a, b) => a - b);
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;

  const lastGpu = memSamples.at(-1)?.gpu ?? null;
  const gpuStat = memoryStat(memSamples.map((sample) => sample.gpu?.total ?? null));

  return {
    timestamp: new Date().toLocaleString(),
    ...config,
    warmupMs,
    measureMs,
    totalFrames: timings.length,
    fps: Math.round(timings.length / (measureMs / 1000)),
    frameTime: { avg, min: sorted[0], max: sorted[sorted.length - 1], p95: sorted[Math.floor(sorted.length * 0.95)] },
    memory: {
      js: memoryStat(memSamples.map((sample) => sample.js)),
      wasm: memoryStat(memSamples.map((sample) => sample.wasm)),
      gpu: gpuStat && lastGpu
        ? {
            avg: gpuStat.avg,
            peak: Math.max(gpuStat.peak, toMB(lastGpu.peak)),
            breakdown: Object.fromEntries(Object.entries(lastGpu.breakdown).map(([category, bytes]) => [category, toMB(bytes)])),
            resources: lastGpu.resources,
          }
        : null,
    },
  };
}

function memoryStat(bytes: (number | null)[]): MemoryStat | null {
  const values = bytes.filter((value): value is number => value !== null);
  if (values.length === 0) return null;
  return { avg: toMB(values.reduce((acc, value) => acc + value, 0) / values.length), peak: toMB(Math.max(...values)) };
}

export function formatReport(result: BenchmarkResult): string {
  const vLabel = result.version === 'local'
    ? `local (${process.env.NEXT_PUBLIC_WEBCANVAS_VERSION || ''})`
    : result.version;
  const lines = [
    'ThorVG Perf Benchmark',
    '─'.repeat(36),
    `Date:      ${result.timestamp}`,
    `Renderer:  ${RENDERER_LABELS[result.renderer]}`,
    `Version:   ${vLabel}`,
    `Count:     ${result.count} animations`,
    `Size:      ${result.size}px`,
    `Seed:      ${result.seed}`,
    '',
    `Warmup: ${result.warmupMs / 1000}s  |  Measure: ${result.measureMs / 1000}s  |  Frames: ${result.totalFrames}`,
    '',
    `FPS (avg):  ${result.fps}`,
    '',
    'Frame Time (ms)',
    `  avg:  ${result.frameTime.avg.toFixed(2)}`,
    `  min:  ${result.frameTime.min.toFixed(2)}`,
    `  max:  ${result.frameTime.max.toFixed(2)}`,
    `  p95:  ${result.frameTime.p95.toFixed(2)}`,
    '',
    ...formatMemoryLines(result.memory),
  ];
  lines.push('─'.repeat(36));
  return lines.join('\n');
}

export function formatMemoryLines(memory: BenchmarkResult['memory']): string[] {
  const row = (label: string, stat: MemoryStat | null) =>
    stat ? `  ${label.padEnd(11)}${stat.avg.toFixed(1).padStart(8)}${stat.peak.toFixed(1).padStart(8)}` : null;
  const lines = [
    'Memory (MB)       avg    peak',
    row('JS', memory.js),
    row('WASM', memory.wasm),
    row('GPU', memory.gpu),
  ].filter((line): line is string => line !== null);
  if (memory.gpu) {
    lines.push(
      '',
      'GPU breakdown (MB, end of run)',
      ...Object.entries(memory.gpu.breakdown).map(([category, mb]) => `  ${category}: ${mb.toFixed(1)}`),
      '',
      'GPU resources (end of run)',
      ...Object.entries(memory.gpu.resources).map(([type, count]) => `  ${type}: ${count}`),
    );
  }
  return lines;
}
