'use client';

import { useEffect, useRef, useState } from 'react';
import { type MemorySample, profiler, toMB } from '../lib/profiler';

const SAMPLE_MS = 1000;
const HISTORY = 60;

interface History { fps: number[]; js: number[]; wasm: number[]; gpu: number[]; total: number[] }

export function ProfilerPanel() {
  const [sample, setSample] = useState<{ fps: number; mem: MemorySample } | null>(null);
  const [open, setOpen] = useState(false);
  const hist = useRef<History>({ fps: [], js: [], wasm: [], gpu: [], total: [] });
  const avg = useRef<Record<keyof History, number>>({ fps: 0, js: 0, wasm: 0, gpu: 0, total: 0 });
  const sum = useRef<Record<keyof History, { acc: number; count: number }>>({
    fps: { acc: 0, count: 0 }, js: { acc: 0, count: 0 }, wasm: { acc: 0, count: 0 }, gpu: { acc: 0, count: 0 }, total: { acc: 0, count: 0 },
  });

  useEffect(() => {
    profiler.fps();
    const id = setInterval(() => {
      const fps = profiler.fps();
      const mem = profiler.memory();
      const add = (key: keyof History, value: number) => {
        push(hist.current[key], value);
        const running = sum.current[key];
        running.acc += value;
        running.count++;
        avg.current[key] = running.acc / running.count;
      };
      add('fps', fps);
      if (mem.js !== null) add('js', toMB(mem.js));
      if (mem.wasm !== null) add('wasm', toMB(mem.wasm));
      if (mem.gpu) add('gpu', toMB(mem.gpu.total));
      add('total', toMB((mem.js ?? 0) + (mem.wasm ?? 0) + (mem.gpu?.total ?? 0)));
      setSample({ fps, mem });
    }, SAMPLE_MS);
    return () => clearInterval(id);
  }, []);

  const history = hist.current;
  const average = avg.current;
  const mem = sample?.mem ?? null;
  const gpu = mem?.gpu ?? null;

  return (
    <div className="fixed bottom-3 left-3 max-w-[calc(100vw-1.5rem)] z-[10000] select-none text-xs">
      {open && sample && (
        <div className="mb-2 w-[320px] max-w-full bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-2xl p-3 space-y-3">
          <div className="space-y-2">
            <MemoryRow label="JS" value={mem?.js == null ? null : average.js} hist={history.js} color="#d1d5db" hint="Used JS heap (Chromium only)" />
            <MemoryRow label="WASM" value={mem?.wasm == null ? null : average.wasm} hist={history.wasm} color="#38bdf8" hint="Committed wasm memory, high-water mark" />
            {profiler.tracksGpu && (
              <MemoryRow label="GPU" value={gpu ? average.gpu : null} hist={history.gpu} color="#fbbf24" hint="GPU buffers, textures and canvas" />
            )}
          </div>
        </div>
      )}

      <div className="inline-flex max-w-full items-stretch bg-gray-900/95 backdrop-blur-sm border border-white/10 rounded-lg shadow-lg">
        <div className="w-[112px] sm:w-[172px] px-3 py-2">
          <Metric label="FPS" value={sample ? Math.round(average.fps) : null} className="text-brand">
            <Sparkline values={history.fps} color="#00deb5" min={0} />
          </Metric>
        </div>

        <div className="w-px self-stretch bg-white/10" />

        <button
          onClick={() => setOpen((isOpen) => !isOpen)}
          className="relative w-[112px] sm:w-[172px] pl-3 pr-7 py-2 rounded-r-lg hover:bg-white/5 transition-colors"
          title="Total memory in MB, JS + WASM + GPU (click for each source)"
        >
          <Metric label="MEM" value={history.total.length ? Math.round(average.total) : null} className="text-violet-400">
            <Sparkline values={history.total} color="#a78bfa" />
          </Metric>
          <span className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-500">{open ? '▾' : '▴'}</span>
        </button>
      </div>
    </div>
  );
}

function Metric({ label, value, className, children }: {
  label: string; value: number | null; className: string; children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col-reverse items-start gap-1 sm:flex-row sm:items-center sm:justify-between sm:gap-2">
      <div className="flex items-center gap-2">
        <span className="text-gray-500">{label}</span>
        <span className={`font-bold tabular-nums ${className}`}>{value ?? '–'}</span>
      </div>
      {children}
    </div>
  );
}

function MemoryRow({ label, value, hist, color, hint }: {
  label: string; value: number | null; hist: number[]; color: string; hint: string;
}) {
  return (
    <div className="flex items-center gap-3" title={hint}>
      <span className="w-14 shrink-0 text-gray-500">{label}</span>
      <span className="w-20 shrink-0 text-right font-semibold tabular-nums" style={{ color }}>
        {value === null ? 'n/a' : `${value.toFixed(1)} MB`}
      </span>
      <Sparkline values={hist} color={color} width={120} fluid />
    </div>
  );
}

function Sparkline({ values, color, width = 56, height = 18, min, fluid, className = '' }: {
  values: number[]; color: string; width?: number; height?: number; min?: number; fluid?: boolean; className?: string;
}) {
  const svgProps = {
    width: fluid ? '100%' : width, height, viewBox: `0 0 ${width} ${height}`, preserveAspectRatio: 'none',
    className: `${fluid ? 'flex-1 min-w-0' : 'shrink-0'} ${className}`,
  };
  if (values.length < 2) return <svg {...svgProps} />;
  const lo = min ?? Math.min(...values);
  const hi = Math.max(...values);
  const range = hi - lo || 1;
  const step = width / (values.length - 1);
  const x1 = (values.length - 1) * step;
  const pts = values.map((value, index) => `${(index * step).toFixed(1)},${(height - 1 - ((value - lo) / range) * (height - 2)).toFixed(1)}`);
  return (
    <svg {...svgProps}>
      <polygon points={`0,${height} ${pts.join(' ')} ${x1.toFixed(1)},${height}`} fill={color} fillOpacity={0.15} />
      <polyline points={pts.join(' ')} fill="none" stroke={color} strokeWidth={1.25} strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function push(values: number[], value: number) {
  values.push(value);
  if (values.length > HISTORY) values.shift();
}
