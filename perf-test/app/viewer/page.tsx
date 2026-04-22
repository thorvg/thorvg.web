'use client';

import { useEffect, useRef, useState, useCallback, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BarChart, Bar, Cell, XAxis, YAxis, ResponsiveContainer, Tooltip, CartesianGrid } from 'recharts';
import wasmUrl from '../../node_modules/@thorvg/webcanvas/dist/thorvg.wasm';
import { loadThorVGModule, getWasmUrl, type ThorVGVersion } from '../../lib/thorvg-loader';
import { type Renderer, RENDERER_LABELS, JANK_MS, SEVERE_JANK_MS, jankColor } from '../../lib/constants';
import { VersionSelector } from '../../components/VersionSelector';
import { DragOverlay } from '../../components/DragOverlay';

interface FrameSample { frame: number; duration: number }
interface PerfStats { fps: number; avg: number; min: number; max: number; total: number }

const ChartTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  const ms = Number(payload[0].value);
  const isSevere = ms > SEVERE_JANK_MS;
  const isJank = ms > JANK_MS;
  return (
    <div className="bg-gray-800 border border-white/10 rounded px-2 py-1.5 text-xs">
      <p className="text-gray-400 mb-0.5">Window {label}</p>
      <p className="font-semibold" style={{ color: jankColor(ms) }}>{ms.toFixed(3)} ms</p>
      {isJank && (
        <p className="mt-0.5" style={{ color: isSevere ? '#ef4444' : '#f59e0b' }}>
          {isSevere ? 'Severe jank (< 30fps)' : 'Jank (< 60fps)'}
        </p>
      )}
    </div>
  );
};

function ViewerContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const animUrl = searchParams.get('url') || '';
  const animName = searchParams.get('name') || 'Animation';
  const rendererParam = (searchParams.get('renderer') || 'gl') as Renderer;
  const versionParam = (searchParams.get('v') || 'local') as ThorVGVersion;
  const widthParam = Math.min(2048, Math.max(64, parseInt(searchParams.get('w') || '400')));
  const heightParam = Math.min(2048, Math.max(64, parseInt(searchParams.get('h') || '400')));
  const loopParam = searchParams.get('loop') !== '0';

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tvgRef = useRef<any>(null);
  const tvgCanvasRef = useRef<any>(null);
  const animRef = useRef<any>(null);
  const rafRef = useRef<number>(0);
  const isPausedRef = useRef(false);
  const elapsedRef = useRef(0);
  const lastTsRef = useRef(0);
  const sampleBufferRef = useRef<FrameSample[]>([]);
  const frameIndexRef = useRef(0);
  const windowSamplesRef = useRef<number[]>([]);
  const statsRingRef = useRef<number[]>([]);

  const [isDragging, setIsDragging] = useState(false);
  const isLocal = animUrl === 'local';

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [totalFrames, setTotalFrames] = useState(0);
  const [animFps, setAnimFps] = useState(0);
  const [chartData, setChartData] = useState<FrameSample[]>([]);
  const [perfStats, setPerfStats] = useState<PerfStats>({ fps: 0, avg: 0, min: 0, max: 0, total: 0 });

  useEffect(() => {
    const statsEls = document.querySelectorAll<HTMLElement>('[data-profiler="true"]');
    statsEls.forEach((el) => { el.style.display = 'none'; });
    return () => { statsEls.forEach((el) => { el.style.display = ''; }); };
  }, []);

  const [pendingRenderer, setPendingRenderer] = useState<Renderer>(rendererParam);
  const [pendingWidth, setPendingWidth] = useState(widthParam);
  const [pendingHeight, setPendingHeight] = useState(heightParam);
  const [pendingLoop, setPendingLoop] = useState(loopParam);

  const setupTVG = useCallback(async () => {
    if (!canvasRef.current || !animUrl) return;

    let cancelled = false;
    cancelAnimationFrame(rafRef.current);
    if (animRef.current) { try { animRef.current.dispose(); } catch { /* */ } animRef.current = null; }
    if (tvgCanvasRef.current) { try { tvgCanvasRef.current.destroy(); } catch { /* */ } tvgCanvasRef.current = null; }
    if (tvgRef.current) { try { tvgRef.current.term(); } catch { /* */ } tvgRef.current = null; }

    sampleBufferRef.current = [];
    frameIndexRef.current = 0;
    windowSamplesRef.current = [];
    statsRingRef.current = [];
    elapsedRef.current = 0;
    lastTsRef.current = 0;
    isPausedRef.current = false;
    setIsLoading(true);
    setError(null);
    setIsPlaying(true);
    setCurrentFrame(0);
    setChartData([]);
    setPerfStats({ fps: 0, avg: 0, min: 0, max: 0, total: 0 });

    try {
      const ThorVGModule = await loadThorVGModule(versionParam);
      if (cancelled) return;

      const TVG = await ThorVGModule.init({
        renderer: rendererParam,
        locateFile: () => getWasmUrl(versionParam, wasmUrl),
        onError: (error: Error) => {
          // console.error('TVG initialization error:', error);
        },
      });
      if (cancelled) return;
      tvgRef.current = TVG;

      const canvasEl = canvasRef.current!;
      const tvgDpr = 1 + ((window.devicePixelRatio - 1) * 0.75);
      const canvasW = widthParam / tvgDpr;
      const canvasH = heightParam / tvgDpr;
      canvasEl.width = canvasW;
      canvasEl.height = canvasH;

      const tvgCanvas = new TVG.Canvas('#tvg-viewer-canvas', {
        width: canvasW,
        height: canvasH,
        enableDevicePixelRatio: true,
      });
      tvgCanvasRef.current = tvgCanvas;

      const data: string = isLocal
        ? sessionStorage.getItem('tvg-viewer-data')!
        : await fetch(animUrl).then((r) => r.text());
      if (cancelled) return;

      let naturalW = canvasW;
      let naturalH = canvasH;
      try {
        const json = JSON.parse(data);
        if (json.w > 0 && json.h > 0) { naturalW = json.w; naturalH = json.h; }
      } catch { /* */ }

      const containerW = canvasEl.parentElement!.parentElement!.clientWidth - 48;
      const maxH = window.innerHeight * 0.55;
      const displayScale = Math.min(1, containerW / canvasW, maxH / canvasH);
      canvasEl.style.width = `${Math.round(canvasW * displayScale)}px`;
      canvasEl.style.height = `${Math.round(canvasH * displayScale)}px`;

      const anim = new TVG.Animation();
      anim.load(data);
      const info = anim.info();
      const pic = anim.picture;
      if (pic) {
        const scale = Math.min(canvasW / naturalW, canvasH / naturalH);
        const displayW = naturalW * scale;
        const displayH = naturalH * scale;
        pic.size(displayW, displayH).translate((canvasW - displayW) / 2, (canvasH - displayH) / 2);
        tvgCanvas.add(pic);
      }
      animRef.current = anim;

      setTotalFrames(info?.totalFrames ?? 0);
      setAnimFps(Math.round(info?.fps ?? 0));
      setIsLoading(false);

      let fpsFrameCount = 0;
      let windowStart = performance.now();
      const WINDOW_MS = 250;
      const MAX_CHART_BARS = 120;
      const MAX_STATS_SAMPLES = 300;

      const tick = (ts: number) => {
        const dt = lastTsRef.current > 0 ? ts - lastTsRef.current : 0;
        lastTsRef.current = ts;
        if (!isPausedRef.current) elapsedRef.current += dt / 1000;

        if (info?.totalFrames > 0) {
          const frame = loopParam
            ? (elapsedRef.current * info.fps) % info.totalFrames
            : Math.min(elapsedRef.current * info.fps, info.totalFrames - 1);
          anim.frame(frame);
          setCurrentFrame(Math.floor(frame));
        }

        const t0 = performance.now();
        tvgCanvas.update().render();
        const renderMs = performance.now() - t0;

        if (!isPausedRef.current) {
          windowSamplesRef.current.push(renderMs);
          statsRingRef.current.push(renderMs);
          if (statsRingRef.current.length > MAX_STATS_SAMPLES) statsRingRef.current.shift();
          fpsFrameCount++;
        }

        const now = performance.now();
        if (now - windowStart >= WINDOW_MS) {
          const samples = windowSamplesRef.current;
          windowSamplesRef.current = [];

          if (samples.length > 0) {
            const avg = samples.reduce((a, b) => a + b, 0) / samples.length;
            const newBar: FrameSample = { frame: frameIndexRef.current++, duration: avg };
            const next = sampleBufferRef.current.slice(-(MAX_CHART_BARS - 1));
            next.push(newBar);
            sampleBufferRef.current = next;
            setChartData([...next]);
          }

          const raw = statsRingRef.current;
          if (raw.length > 0) {
            setPerfStats({
              fps: Math.round((fpsFrameCount * 1000) / (now - windowStart)),
              avg: raw.reduce((a, b) => a + b, 0) / raw.length,
              min: Math.min(...raw),
              max: Math.max(...raw),
              total: frameIndexRef.current,
            });
          }

          fpsFrameCount = 0;
          windowStart = now;
        }

        rafRef.current = requestAnimationFrame(tick);
      };
      rafRef.current = requestAnimationFrame(tick);
    } catch (err: any) {
      if (!cancelled) { setError(err?.message || 'Failed to initialize'); setIsLoading(false); }
    }

    return () => { cancelled = true; };
  }, [animUrl, rendererParam, versionParam, widthParam, heightParam, loopParam]);

  useEffect(() => {
    const cleanup = setupTVG();
    return () => {
      cleanup.then((fn) => fn?.());
      cancelAnimationFrame(rafRef.current);
      if (animRef.current) { try { animRef.current.dispose(); } catch { /* */ } }
      if (tvgCanvasRef.current) { try { tvgCanvasRef.current.destroy(); } catch { /* */ } }
      if (tvgRef.current) { try { tvgRef.current.term(); } catch { /* */ } }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [animUrl, rendererParam, versionParam, widthParam, heightParam, loopParam]);

  const togglePlayPause = () => { isPausedRef.current = !isPausedRef.current; setIsPlaying(!isPausedRef.current); };

  const handleApply = () => {
    const params = new URLSearchParams({
      url: animUrl, name: animName, renderer: pendingRenderer, v: versionParam,
      w: pendingWidth.toString(), h: pendingHeight.toString(), loop: pendingLoop ? '1' : '0',
    });
    window.location.href = `/viewer?${params}`;
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); setIsDragging(true); }, []);
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDragging(false);
  }, []);
  const handleDrop = useCallback(async (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = Array.from(e.dataTransfer.files).find((f) => f.name.endsWith('.json'));
    if (!file) return;
    sessionStorage.setItem('tvg-viewer-data', await file.text());
    const params = new URLSearchParams(window.location.search);
    params.set('url', 'local');
    params.set('name', file.name.replace(/\.json$/, ''));
    window.location.href = `/viewer?${params}`;
  }, []);

  const handleDownload = async () => {
    try {
      let blob: Blob;
      if (isLocal) {
        blob = new Blob([sessionStorage.getItem('tvg-viewer-data')!], { type: 'application/json' });
      } else {
        blob = await fetch(animUrl).then((r) => r.blob());
      }
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${animName}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch { /* */ }
  };

  const progressPercent = totalFrames > 0 ? (currentFrame / totalFrames) * 100 : 0;
  const chartInterval = Math.max(1, Math.floor(chartData.length / 8));
  const sizeSliderVal = Math.round((pendingWidth + pendingHeight) / 2);
  const sizeSliderPct = ((sizeSliderVal - 64) / (2048 - 64)) * 100;
  const effectiveAnimUrl = isLocal ? '' : animUrl;
  const displayName = animName;
  const thorvgViewerUrl = effectiveAnimUrl.startsWith('http')
    ? `https://thorvg.github.io/thorvg.viewer/?s=${encodeURIComponent(effectiveAnimUrl)}`
    : null;

  const jankCounts = chartData.length > 0
    ? { janks: chartData.filter((d) => d.duration > JANK_MS && d.duration <= SEVERE_JANK_MS).length,
        severes: chartData.filter((d) => d.duration > SEVERE_JANK_MS).length }
    : null;

  return (
    <div
      className="min-h-screen bg-gray-900 text-white flex flex-col relative"
      onDragOver={handleDragOver} onDragLeave={handleDragLeave} onDrop={handleDrop}
    >
      {isDragging && <DragOverlay message="Drop .json to load animation" />}

      {/* Header */}
      <div className="border-b border-white/10 px-4 py-3 flex items-center gap-3 shrink-0">
        <button onClick={() => router.push('/')} className="text-gray-400 hover:text-white transition-colors text-sm">← Back</button>
        <h1 className="font-semibold text-sm text-white truncate max-w-xs">{displayName}</h1>
        <span className="px-2 py-0.5 bg-white/10 rounded text-xs text-gray-300 shrink-0">{RENDERER_LABELS[rendererParam]}</span>
        <div className="ml-auto flex items-center gap-3">
          <VersionSelector
            current={versionParam}
            localVersion={process.env.NEXT_PUBLIC_WEBCANVAS_VERSION || ''}
            onChange={(v) => { const p = new URLSearchParams(window.location.search); p.set('v', v); window.location.href = `/viewer?${p}`; }}
          />
          {animUrl && (
            <button onClick={handleDownload} className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 hover:text-white transition-colors shrink-0" title="Download JSON">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 2v8M5 7l3 3 3-3" /><path d="M2 12v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1v-1" />
              </svg>
              Download
            </button>
          )}
          {effectiveAnimUrl.startsWith('http') && (
            <a href={`https://thorvg-test-automation.vercel.app?files=${encodeURIComponent(effectiveAnimUrl)}&autoPdf=on`} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 hover:text-white transition-colors shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2 4h12v8a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V4z" /><path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" /><path d="M5.5 8.5l1.5 1.5 3-3" />
              </svg>
              Compatibility Check
            </a>
          )}
          {thorvgViewerUrl && (
            <a href={thorvgViewerUrl} target="_blank" rel="noopener noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 hover:text-white transition-colors shrink-0">
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M6.5 3H3a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h9a1 1 0 0 0 1-1v-3.5" strokeLinecap="round" />
                <path d="M9.5 2H14v4.5" strokeLinecap="round" strokeLinejoin="round" /><path d="M14 2L8 8" strokeLinecap="round" />
              </svg>
              ThorVG Viewer
            </a>
          )}
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-col lg:flex-row flex-1 min-h-0">
        {/* Canvas */}
        <div className="flex-1 flex flex-col items-center justify-center p-6 gap-4 min-h-[320px]">
          {isLoading && (
            <div className="flex flex-col items-center gap-3 text-gray-400">
              <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
              <span className="text-sm">Loading…</span>
            </div>
          )}
          {error && <div className="text-red-400 text-sm bg-red-950/30 rounded-lg px-4 py-3 border border-red-800/40">{error}</div>}
          {!animUrl && !isLoading && <div className="text-gray-500 text-sm">No animation URL provided. Go back and click an animation.</div>}

          <div
            className={`rounded-lg overflow-hidden bg-gray-800/50 ${isLoading ? 'hidden' : 'inline-block'}`}
          >
            <canvas ref={canvasRef} id="tvg-viewer-canvas" className="block" />
          </div>

          {!isLoading && !error && (
            <div className="w-full max-w-md flex flex-col gap-2">
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-brand rounded-full" style={{ width: `${progressPercent}%` }} />
              </div>
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Frame {currentFrame}</span>
                <span>{totalFrames} total</span>
              </div>
              <div className="flex items-center justify-center gap-3 mt-1">
                <button onClick={togglePlayPause} className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors" title={isPlaying ? 'Pause' : 'Play'}>
                  {isPlaying ? (
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="currentColor"><rect x="3" y="2" width="4" height="12" rx="1" /><rect x="9" y="2" width="4" height="12" rx="1" /></svg>
                  ) : (
                    <svg className="w-4 h-4 ml-0.5" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2l11 6-11 6V2z" /></svg>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 xl:w-96 border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col overflow-y-auto shrink-0">
          {/* Config */}
          <div className="p-4 border-b border-white/10 shrink-0">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Configuration</h2>
            <div className="space-y-3">
              <div>
                <label className="text-xs text-gray-500 block mb-1">Renderer</label>
                <div className="flex bg-white/5 rounded-lg p-0.5">
                  {(['sw', 'gl', 'wg'] as Renderer[]).map((r) => (
                    <button key={r} onClick={() => setPendingRenderer(r)}
                      className={`flex-1 py-1.5 rounded text-xs font-semibold transition-colors ${pendingRenderer === r ? 'bg-brand text-gray-900' : 'text-gray-300 hover:text-white'}`}>
                      {r.toUpperCase()}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="text-xs text-gray-500">Size</label>
                  <span className="text-xs text-gray-400">{pendingWidth} × {pendingHeight}</span>
                </div>
                <input type="range" min={64} max={2048} value={sizeSliderVal}
                  onChange={(e) => { const v = Number(e.target.value); setPendingWidth(v); setPendingHeight(v); }}
                  className="slider w-full"
                  style={{ background: `linear-gradient(to right, #00deb5 0%, #00deb5 ${sizeSliderPct}%, #444 ${sizeSliderPct}%, #444 100%)` }}
                />
              </div>
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div onClick={() => setPendingLoop(!pendingLoop)} className={`w-9 h-5 rounded-full transition-colors relative ${pendingLoop ? 'bg-brand' : 'bg-white/20'}`}>
                  <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${pendingLoop ? 'translate-x-4' : 'translate-x-0.5'}`} />
                </div>
                <span className="text-sm text-gray-300">Loop</span>
              </label>
              <button onClick={handleApply} className="w-full py-2 bg-brand text-gray-900 rounded font-bold text-sm hover:opacity-90 transition-opacity">Apply</button>
            </div>
          </div>

          {/* Stats */}
          <div className="p-4 border-b border-white/10 shrink-0">
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Performance</h2>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white/5 rounded-lg p-3"><div className="text-xl font-bold text-brand">{perfStats.fps}</div><div className="text-xs text-gray-500 mt-0.5">FPS</div></div>
              <div className="bg-white/5 rounded-lg p-3"><div className="text-xl font-bold">{perfStats.avg.toFixed(2)}</div><div className="text-xs text-gray-500 mt-0.5">Avg (ms)</div></div>
              <div className="bg-white/5 rounded-lg p-3"><div className="text-sm font-bold text-green-400">{perfStats.min.toFixed(2)}</div><div className="text-xs text-gray-500 mt-0.5">Min (ms)</div></div>
              <div className="bg-white/5 rounded-lg p-3"><div className="text-sm font-bold text-red-400">{perfStats.max.toFixed(2)}</div><div className="text-xs text-gray-500 mt-0.5">Max (ms)</div></div>
            </div>
          </div>

          {/* Chart */}
          <div className="p-4 flex flex-col flex-1 min-h-[220px]">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Performance Chart</h2>
              <div className="flex items-center gap-2.5">
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-brand" /><span className="text-[10px] text-gray-500">OK</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-amber-500" /><span className="text-[10px] text-gray-500">Jank</span></div>
                <div className="flex items-center gap-1"><div className="w-2 h-2 rounded-sm bg-red-500" /><span className="text-[10px] text-gray-500">Severe</span></div>
              </div>
            </div>
            {jankCounts && (jankCounts.janks > 0 || jankCounts.severes > 0) && (
              <div className="flex items-center gap-3 mb-2 text-xs">
                {jankCounts.janks > 0 && <span className="text-amber-500">{jankCounts.janks} jank</span>}
                {jankCounts.severes > 0 && <span className="text-red-500">{jankCounts.severes} severe</span>}
                <span className="text-gray-600">/ {chartData.length} windows</span>
              </div>
            )}
            {chartData.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-xs text-gray-600">Collecting data…</div>
            ) : (
              <div className="flex-1 min-h-[160px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={chartData} margin={{ top: 4, right: 4, left: -28, bottom: 4 }} barCategoryGap="1%">
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="frame" tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false} interval={chartInterval - 1} />
                    <YAxis tick={{ fill: '#4b5563', fontSize: 9 }} tickLine={false} axisLine={false} tickFormatter={(v) => v.toFixed(2)} domain={[0, 'auto']} />
                    <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(255,255,255,0.04)' }} />
                    <Bar dataKey="duration" radius={[1, 1, 0, 0]} maxBarSize={12} isAnimationActive={false}>
                      {chartData.map((entry, i) => <Cell key={i} fill={jankColor(entry.duration)} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ViewerPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-brand/30 border-t-brand rounded-full animate-spin" />
      </div>
    }>
      <ViewerContent />
    </Suspense>
  );
}
