import { type Renderer, RENDERER_LABELS } from './constants';

export type BenchPhase = 'idle' | 'warmup' | 'measuring' | 'done';

export const BENCH_WARMUP_MS = 3000;
export const BENCH_MEASURE_MS = 10000;

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
  memory: { avg: number; peak: number } | null;
}

export function computeBenchResult(
  timings: number[],
  memSamples: number[],
  config: { renderer: Renderer; version: string; count: number; size: number; seed: string },
): BenchmarkResult {
  const sorted = [...timings].sort((a, b) => a - b);
  const avg = timings.reduce((a, b) => a + b, 0) / timings.length;

  return {
    timestamp: new Date().toLocaleString(),
    ...config,
    warmupMs: BENCH_WARMUP_MS,
    measureMs: BENCH_MEASURE_MS,
    totalFrames: timings.length,
    fps: Math.round(timings.length / (BENCH_MEASURE_MS / 1000)),
    frameTime: { avg, min: sorted[0], max: sorted[sorted.length - 1], p95: sorted[Math.floor(sorted.length * 0.95)] },
    memory: memSamples.length > 0
      ? { avg: memSamples.reduce((a, b) => a + b, 0) / memSamples.length, peak: Math.max(...memSamples) }
      : null,
  };
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
  ];
  if (result.memory) {
    lines.push('', 'Memory (MB)', `  avg:  ${result.memory.avg.toFixed(1)}`, `  peak: ${result.memory.peak.toFixed(1)}`);
  }
  lines.push('─'.repeat(36));
  return lines.join('\n');
}
