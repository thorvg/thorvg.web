'use client';

import { type Renderer, RENDERER_LABELS } from '../lib/constants';
import { type BenchPhase, type BenchmarkResult, BENCH_WARMUP_MS, BENCH_MEASURE_MS, formatReport } from '../lib/benchmark';
import { getParam } from '../lib/url-params';

interface Props {
  renderer: Renderer;
  count: number;
  size: number;
  phase: BenchPhase;
  progress: number;
  result: BenchmarkResult | null;
  onStart: () => void;
  onCancel: () => void;
  onClose: () => void;
}

export function BenchmarkModal({ renderer, count, size, phase, progress, result, onStart, onCancel, onClose }: Props) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-2xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <svg className="w-4 h-4 text-brand" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6" /><path d="M8 5v3.5l2 1.5" />
            </svg>
            <span className="font-semibold text-sm">Benchmark</span>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-lg leading-none">
            ×
          </button>
        </div>

        <div className="px-5 py-4 space-y-1 text-xs text-gray-400 border-b border-white/10">
          <div className="flex gap-2 flex-wrap">
            <span className="px-2 py-0.5 bg-white/5 rounded font-mono">{RENDERER_LABELS[renderer]}</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">{count} animations</span>
            <span className="px-2 py-0.5 bg-white/5 rounded">{size}px</span>
            <span className="px-2 py-0.5 bg-white/5 rounded font-mono truncate max-w-[160px]">
              {getParam('seed', '').slice(0, 20)}…
            </span>
          </div>
        </div>

        <div className="px-5 py-5">
          {phase === 'idle' && (
            <button
              onClick={onStart}
              className="w-full py-2.5 bg-brand text-gray-900 rounded-lg font-bold text-sm hover:opacity-90 transition-opacity"
            >
              Start Benchmark
            </button>
          )}

          {(phase === 'warmup' || phase === 'measuring') && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className={phase === 'warmup' ? 'text-gray-400' : 'text-brand font-semibold'}>
                  {phase === 'warmup' ? 'Warming up…' : 'Measuring…'}
                </span>
                <span className="text-gray-500">{Math.round(progress)}%</span>
              </div>
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full flex">
                  <div className="h-full bg-white/30 transition-all duration-100" style={{ width: `${Math.min(50, progress)}%` }} />
                  <div className="h-full bg-brand transition-all duration-100" style={{ width: `${Math.max(0, progress - 50)}%` }} />
                </div>
              </div>
              <div className="flex justify-between text-xs text-gray-600">
                <span>Warmup</span>
                <span>Measure</span>
              </div>
              <button onClick={onCancel} className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-400 transition-colors">
                Cancel
              </button>
            </div>
          )}

          {phase === 'done' && result && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div className="bg-white/5 rounded-lg p-3 col-span-2 flex items-center justify-between">
                  <span className="text-xs text-gray-500">FPS</span>
                  <span className="text-2xl font-bold text-brand">{result.fps}</span>
                </div>
                <StatCell label="Avg (ms)" value={result.frameTime.avg.toFixed(2)} size="lg" />
                <StatCell label="P95 (ms)" value={result.frameTime.p95.toFixed(2)} size="lg" color="text-yellow-400" />
                <StatCell label="Min (ms)" value={result.frameTime.min.toFixed(2)} color="text-green-400" />
                <StatCell label="Max (ms)" value={result.frameTime.max.toFixed(2)} color="text-red-400" />
                {result.memory && (
                  <>
                    <StatCell label="Mem avg (MB)" value={result.memory.avg.toFixed(1)} />
                    <StatCell label="Mem peak (MB)" value={result.memory.peak.toFixed(1)} color="text-orange-400" />
                  </>
                )}
              </div>
              <p className="text-xs text-gray-600 text-center">
                {result.totalFrames} frames · {result.measureMs / 1000}s window
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => navigator.clipboard.writeText(formatReport(result))}
                  className="flex-1 py-2 bg-brand text-gray-900 rounded font-bold text-xs hover:opacity-90 transition-opacity"
                >
                  Copy Report
                </button>
                <button
                  onClick={onStart}
                  className="flex-1 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 transition-colors"
                >
                  Run Again
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatCell({ label, value, size = 'sm', color = '' }: { label: string; value: string; size?: 'sm' | 'lg'; color?: string }) {
  return (
    <div className="bg-white/5 rounded-lg p-3">
      <div className="text-xs text-gray-500 mb-1">{label}</div>
      <div className={`${size === 'lg' ? 'text-lg' : 'text-sm'} font-bold ${color}`}>{value}</div>
    </div>
  );
}
