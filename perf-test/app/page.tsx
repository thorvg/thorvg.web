'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import wasmUrl from '../node_modules/@thorvg/webcanvas/dist/thorvg.wasm';
import { initProfiler } from '../lib/profiler';
import { loadThorVGModule, getWasmUrl, type ThorVGVersion } from '../lib/thorvg-loader';
import { type Renderer, RENDERER_LABELS, COUNT_OPTIONS, MIN_SIZE, MAX_SIZE } from '../lib/constants';
import { type AnimEntry, encodeSeed, decodeSeed, buildAnimList, randomAnimList } from '../lib/seed';
import { getParam, setParam } from '../lib/url-params';
import {
  type BenchPhase,
  type BenchmarkResult,
  BENCH_WARMUP_MS,
  BENCH_MEASURE_MS,
  computeBenchResult,
} from '../lib/benchmark';
import { VersionSelector } from '../components/VersionSelector';
import { BenchmarkModal } from '../components/BenchmarkModal';
import { DragOverlay } from '../components/DragOverlay';

export default function Home() {
  const router = useRouter();

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tvgRef = useRef<any>(null);
  const tvgCanvasRef = useRef<any>(null);
  const animsRef = useRef<{ anim: any; info: any; name: string; url: string }[]>([]);
  const rafRef = useRef<number>(0);
  const colsRef = useRef<number>(1);
  const itemSizeRef = useRef<number>(150);

  const benchPhaseRef = useRef<'idle' | 'warmup' | 'measuring'>('idle');
  const benchTimingsRef = useRef<number[]>([]);
  const benchMemRef = useRef<number[]>([]);
  const benchTimeoutA = useRef<ReturnType<typeof setTimeout> | null>(null);
  const benchTimeoutB = useRef<ReturnType<typeof setTimeout> | null>(null);
  const benchIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const [renderer, setRenderer] = useState<Renderer>('gl');
  const [version, setVersion] = useState<ThorVGVersion>('local');
  const [count, setCount] = useState(20);
  const [size, setSize] = useState(150);
  const [seedInput, setSeedInput] = useState('');
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatus, setLoadingStatus] = useState('');
  const [animList, setAnimList] = useState<AnimEntry[]>([]);
  const blobUrlsRef = useRef<string[]>([]);

  const [showBench, setShowBench] = useState(false);
  const [benchPhase, setBenchPhase] = useState<BenchPhase>('idle');
  const [benchProgress, setBenchProgress] = useState(0);
  const [benchResult, setBenchResult] = useState<BenchmarkResult | null>(null);

  // Init from URL params
  useEffect(() => {
    const r = getParam('renderer', 'gl') as Renderer;
    const v = getParam('v', 'local') as ThorVGVersion;
    const c = Math.max(1, parseInt(getParam('count', '20')));
    const s = Math.min(MAX_SIZE, Math.max(MIN_SIZE, parseInt(getParam('size', '150'))));
    const seed = getParam('seed', '');

    setRenderer(r);
    setVersion(v);
    setCount(c);
    setSize(s);

    let list: AnimEntry[];
    if (seed) {
      list = buildAnimList(decodeSeed(seed));
      setCount(list.length);
    } else {
      list = randomAnimList(c);
      setParam('seed', encodeSeed(list.map((a) => a.name)));
    }

    setSeedInput(getParam('seed', ''));
    setAnimList(list);
    initProfiler();
  }, []);

  // TVG setup
  useEffect(() => {
    if (animList.length === 0 || !canvasRef.current || !containerRef.current) return;

    let cancelled = false;

    const setup = async () => {
      cancelAnimationFrame(rafRef.current);

      for (const { anim } of animsRef.current) {
        try { anim.dispose(); } catch { /* */ }
      }
      animsRef.current = [];
      if (tvgCanvasRef.current) { try { tvgCanvasRef.current.destroy(); } catch { /* */ } tvgCanvasRef.current = null; }
      if (tvgRef.current) { try { tvgRef.current.term(); } catch { /* */ } tvgRef.current = null; }

      setIsLoading(true);
      setLoadingStatus('Loading…');

      const containerW = containerRef.current!.clientWidth;
      const tvgDpr = 1 + ((window.devicePixelRatio - 1) * 0.75);
      const itemSize = size;
      const cellSize = itemSize / tvgDpr;
      itemSizeRef.current = cellSize;
      const cols = Math.max(1, Math.floor(containerW / cellSize));
      const rows = Math.ceil(animList.length / cols);
      const canvasW = cols * cellSize;
      const canvasH = rows * cellSize;
      colsRef.current = cols;

      const canvasEl = canvasRef.current!;
      canvasEl.width = canvasW;
      canvasEl.height = canvasH;

      try {
        const v = getParam('v', 'local') as ThorVGVersion;
        const ThorVGModule = await loadThorVGModule(v);
        if (cancelled) return;

        const TVG = await ThorVGModule.init({
          renderer,
          locateFile: () => getWasmUrl(v, wasmUrl),
          onError: (error: Error) => {
            // console.error('TVG initialization error:', error);
          },
        });
        if (cancelled) return;
        tvgRef.current = TVG;

        const tvgCanvas = new TVG.Canvas('#tvg-main-canvas', {
          width: canvasW,
          height: canvasH,
          enableDevicePixelRatio: true,
        });
        tvgCanvasRef.current = tvgCanvas;

        setLoadingStatus('Loading…');
        const fetchResults = await Promise.allSettled(
          animList.map((a) => fetch(a.url).then((r) => r.text())),
        );
        if (cancelled) return;

        const loaded: typeof animsRef.current = [];
        for (let i = 0; i < fetchResults.length; i++) {
          const result = fetchResults[i];
          if (result.status === 'rejected') continue;

          const col = i % cols;
          const row = Math.floor(i / cols);
          const anim = new TVG.Animation();
          anim.load(result.value);
          const info = anim.info();
          const pic = anim.picture;
          if (pic) {
            let naturalW = cellSize;
            let naturalH = cellSize;
            try {
              const json = JSON.parse(result.value);
              if (json.w > 0 && json.h > 0) { naturalW = json.w; naturalH = json.h; }
            } catch { /* */ }
            const scale = Math.min(cellSize / naturalW, cellSize / naturalH);
            const displayW = naturalW * scale;
            const displayH = naturalH * scale;
            pic.size(displayW, displayH).translate(
              col * cellSize + (cellSize - displayW) / 2,
              row * cellSize + (cellSize - displayH) / 2,
            );
            tvgCanvas.add(pic);
          }
          loaded.push({ anim, info, name: animList[i].name, url: animList[i].url });
        }

        if (cancelled) return;
        animsRef.current = loaded;
        setIsLoading(false);
        setLoadingStatus('');

        const startTime = performance.now();
        const tick = (ts: number) => {
          const elapsed = (ts - startTime) / 1000;
          for (const { anim, info } of animsRef.current) {
            if (info?.totalFrames > 0) anim.frame((elapsed * info.fps) % info.totalFrames);
          }
          const t0 = performance.now();
          tvgCanvas.update().render();
          const renderMs = performance.now() - t0;

          if (benchPhaseRef.current === 'measuring') {
            benchTimingsRef.current.push(renderMs);
            const mem = (self as any).performance?.memory;
            if (mem) benchMemRef.current.push(mem.usedJSHeapSize / 1048576);
          }

          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch (err) {
        console.error('TVG setup failed:', err);
        setLoadingStatus(`Error: ${(err as Error).message}`);
        setIsLoading(false);
      }
    };

    setup();
    return () => { cancelled = true; cancelAnimationFrame(rafRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animList]);

  const handleCanvasClick = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvas = canvasRef.current;
      if (!canvas || animsRef.current.length === 0) return;
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const idx = Math.floor(y / itemSizeRef.current) * colsRef.current + Math.floor(x / itemSizeRef.current);
      if (idx >= 0 && idx < animsRef.current.length) {
        const { name, url } = animsRef.current[idx];
        if (url.startsWith('blob:')) {
          fetch(url).then((r) => r.text()).then((data) => {
            sessionStorage.setItem('tvg-viewer-data', data);
            router.push(`/viewer?${new URLSearchParams({ url: 'local', name, renderer, v: getParam('v', 'local') })}`);
          });
        } else {
          router.push(`/viewer?${new URLSearchParams({ url, name, renderer, v: getParam('v', 'local') })}`);
        }
      }
    },
    [renderer, router],
  );

  const handleSet = () => {
    window.location.href = `/?${new URLSearchParams({ renderer, count: count.toString(), size: size.toString() })}`;
  };

  const handleSeedApply = () => {
    const trimmed = seedInput.trim();
    if (!trimmed) return;
    const params = new URLSearchParams(window.location.search);
    params.set('seed', trimmed);
    window.location.href = `/?${params}`;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (animList.length === 0) return;
    const files = Array.from(e.dataTransfer.files).filter((f) => f.name.endsWith('.json'));
    if (files.length === 0) return;

    blobUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    blobUrlsRef.current = [];

    const next = [...animList];
    files.forEach((file) => {
      const blobUrl = URL.createObjectURL(file);
      blobUrlsRef.current.push(blobUrl);
      const idx = Math.floor(Math.random() * next.length);
      next[idx] = { name: file.name.replace('.json', ''), url: blobUrl };
    });
    setAnimList(next);
  }, [animList]);

  // Benchmark
  const cancelBenchmark = useCallback(() => {
    if (benchTimeoutA.current) clearTimeout(benchTimeoutA.current);
    if (benchTimeoutB.current) clearTimeout(benchTimeoutB.current);
    if (benchIntervalRef.current) clearInterval(benchIntervalRef.current);
    benchTimeoutA.current = benchTimeoutB.current = benchIntervalRef.current = null;
    benchPhaseRef.current = 'idle';
    setBenchPhase('idle');
    setBenchProgress(0);
  }, []);

  const startBenchmark = useCallback(() => {
    cancelBenchmark();
    benchTimingsRef.current = [];
    benchMemRef.current = [];
    benchPhaseRef.current = 'warmup';
    setBenchPhase('warmup');
    setBenchProgress(0);
    setBenchResult(null);

    const runStart = performance.now();
    benchIntervalRef.current = setInterval(() => {
      const elapsed = performance.now() - runStart;
      setBenchProgress(elapsed < BENCH_WARMUP_MS
        ? (elapsed / BENCH_WARMUP_MS) * 50
        : 50 + Math.min(50, ((elapsed - BENCH_WARMUP_MS) / BENCH_MEASURE_MS) * 50));
    }, 100);

    benchTimeoutA.current = setTimeout(() => {
      benchPhaseRef.current = 'measuring';
      setBenchPhase('measuring');
    }, BENCH_WARMUP_MS);

    benchTimeoutB.current = setTimeout(() => {
      if (benchIntervalRef.current) clearInterval(benchIntervalRef.current);
      benchPhaseRef.current = 'idle';
      setBenchProgress(100);

      const timings = benchTimingsRef.current;
      if (timings.length === 0) { setBenchPhase('idle'); return; }

      setBenchResult(computeBenchResult(timings, benchMemRef.current, {
        renderer, version: getParam('v', 'local'), count, size, seed: getParam('seed', ''),
      }));
      setBenchPhase('done');
    }, BENCH_WARMUP_MS + BENCH_MEASURE_MS);
  }, [cancelBenchmark, renderer, count, size]);

  const sizePercent = ((size - MIN_SIZE) / (MAX_SIZE - MIN_SIZE)) * 100;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <div className="sticky top-0 z-20 bg-gray-900/95 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-screen-xl mx-auto px-4 py-3 flex flex-wrap items-center gap-3">
          <span className="font-bold text-brand mr-1 text-sm tracking-wide hidden sm:block">ThorVG Perf</span>

          <div className="flex bg-white/5 rounded-lg p-0.5">
            {(['sw', 'gl', 'wg'] as Renderer[]).map((r) => (
              <button
                key={r}
                onClick={() => {
                  if (r === renderer) return;
                  const params = new URLSearchParams(window.location.search);
                  params.set('renderer', r);
                  window.location.href = `/?${params}`;
                }}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-colors ${
                  renderer === r ? 'bg-brand text-gray-900' : 'text-gray-300 hover:text-white'
                }`}
              >
                {RENDERER_LABELS[r]}
              </button>
            ))}
          </div>

          <select
            value={count}
            onChange={(e) => setCount(Number(e.target.value))}
            className="bg-white/5 border border-white/10 rounded px-2 py-1.5 text-xs text-white appearance-none cursor-pointer"
          >
            {COUNT_OPTIONS.map((n) => (
              <option key={n} value={n} className="bg-gray-800">{n} animations</option>
            ))}
          </select>

          <div className="flex items-center gap-2 w-40 shrink-0">
            <span className="text-xs text-gray-400 w-12 shrink-0">{size}px</span>
            <input
              type="range" min={MIN_SIZE} max={MAX_SIZE} value={size}
              onChange={(e) => setSize(Number(e.target.value))}
              className="slider flex-1"
              style={{ background: `linear-gradient(to right, #00deb5 0%, #00deb5 ${sizePercent}%, #444 ${sizePercent}%, #444 100%)` }}
            />
          </div>

          <button onClick={handleSet} className="px-4 py-1.5 bg-brand text-gray-900 rounded text-xs font-bold hover:opacity-90 transition-opacity">
            Set
          </button>

          <button
            onClick={() => { setBenchResult(null); setBenchPhase('idle'); setShowBench(true); }}
            disabled={isLoading || animList.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="8" cy="8" r="6" /><path d="M8 5v3.5l2 1.5" />
            </svg>
            Benchmark
          </button>

          <div className="ml-auto">
            <VersionSelector
              current={version}
              localVersion={process.env.NEXT_PUBLIC_WEBCANVAS_VERSION || ''}
              onChange={(v) => {
                const params = new URLSearchParams(window.location.search);
                params.set('v', v);
                window.location.href = `/?${params}`;
              }}
            />
          </div>

          <div className="flex gap-2 w-full sm:w-auto sm:flex-1 min-w-0">
            <input
              type="text"
              placeholder="Paste a seed to restore a session…"
              value={seedInput}
              onChange={(e) => setSeedInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSeedApply()}
              spellCheck={false}
              className="min-w-0 flex-1 bg-white/5 border border-white/10 rounded px-3 py-1.5 text-xs text-white font-mono placeholder:text-gray-500 placeholder:font-sans focus:outline-none focus:ring-1 focus:ring-brand/50"
            />
            <button onClick={handleSeedApply} className="px-3 py-1.5 bg-white/10 rounded text-xs hover:bg-white/20 transition-colors shrink-0">
              Apply
            </button>
          </div>
        </div>
      </div>

      {showBench && (
        <BenchmarkModal
          renderer={renderer} count={count} size={size}
          phase={benchPhase} progress={benchProgress} result={benchResult}
          onStart={startBenchmark} onCancel={cancelBenchmark}
          onClose={() => { cancelBenchmark(); setShowBench(false); }}
        />
      )}

      <div
        ref={containerRef}
        className={`max-w-screen-xl mx-auto px-4 py-6 relative transition-colors ${isDragging ? 'bg-brand/5' : ''}`}
        onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
      >
        {isLoading && (
          <div className="flex flex-col items-center justify-center py-24 text-gray-400 gap-3">
            <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
            <div className="text-sm">{loadingStatus || 'Loading…'}</div>
            <div className="text-xs text-gray-500">{RENDERER_LABELS[renderer]} renderer</div>
          </div>
        )}

        {isDragging && <DragOverlay />}

        <canvas
          ref={canvasRef}
          id="tvg-main-canvas"
          onClick={handleCanvasClick}
          className={`cursor-pointer transition-opacity duration-300 block ${isLoading ? 'opacity-0 h-0' : 'opacity-100'}`}
          title="Click any animation to open the detailed viewer"
        />
      </div>
    </div>
  );
}
