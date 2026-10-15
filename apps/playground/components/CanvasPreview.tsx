'use client';

import { useEffect, useRef, useState } from 'react';
import type { Canvas as TVGCanvas, ThorVGNamespace } from '@thorvg/webcanvas';
import type * as WebCanvasThread from '@thorvg/webcanvas/thread';
import wasmUrl from "../node_modules/@thorvg/webcanvas/dist/thorvg.wasm";
import threadWasmUrl from "../node_modules/@thorvg/webcanvas/dist/thread/thorvg.wasm";
import threadBuildUrl from "../node_modules/@thorvg/webcanvas/dist/thread/webcanvas.esm.js";
import { CodeSandbox } from '@/lib/code-sandbox';
import {
  isRenderer,
  normalizeThreads,
  readRendererFromUrl,
  readThreadsFromUrl,
  type Renderer,
} from '@/lib/url-params';
import type { PlaygroundWindow } from '@/types/window';

interface CanvasPreviewProps {
  code: string;
  requiresUserGesture?: boolean;
}

// Init config declared in the editor code, parsed by detectConfigFromCode
interface DetectedConfig {
  renderer: Renderer;
  threads: number;
  threadsIncomplete: boolean;
  threadsIgnored: boolean;
  declaredThreads: number;
}

const canStartAudio = (): boolean => {
  const AudioCtx = window.AudioContext || (window as PlaygroundWindow).webkitAudioContext;
  if (!AudioCtx) return true;

  try {
    const ctx = new AudioCtx();
    const running = ctx.state === 'running';
    void ctx.close();
    return running;
  } catch {
    return true;
  }
};

export default function CanvasPreview({
  code,
  requiresUserGesture = false,
}: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' }>({
    message: 'Initializing ThorVG...',
    type: 'info',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [TVG, setTVG] = useState<ThorVGNamespace | null>(null);
  const [canvas, setCanvas] = useState<TVGCanvas | null>(null);
  const [currentRenderer, setCurrentRenderer] = useState<Renderer>('gl');
  const [currentThreads, setCurrentThreads] = useState(0);
  const [isZoomDragging, setIsZoomDragging] = useState(false);
  const [awaitingGesture, setAwaitingGesture] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const sandboxRef = useRef<CodeSandbox | null>(null);
  const originalDPRRef = useRef<number | null>(null);
  const lastCodeRef = useRef<string | null>(null);

  const endRun = () => {
    sandboxRef.current?.dispose();
    sandboxRef.current = null;
    setPendingRequests(0);
  };

  // Initialize ThorVG with specified renderer
  const initThorVG = async (renderer: Renderer, threads: number) => {
    try {
      const presetLabel = threads > 0 ? ` (${threads} threads)` : '';
      setStatus({
        message: `Initializing ThorVG with ${renderer.toUpperCase()} renderer${presetLabel}...`,
        type: 'info',
      });

      if (originalDPRRef.current === null) {
        originalDPRRef.current = window.devicePixelRatio;
      }

      const { init, ThorVGError, ThorVGResultCode } =
        threads > 0
          ? ((await import(
              /* webpackIgnore: true */ threadBuildUrl
            )) as typeof WebCanvasThread)
          : await import('@thorvg/webcanvas');
      const TVGInstance = await init({
        renderer,
        threads,
        locateFile: () => threads > 0 ? threadWasmUrl : wasmUrl,
        onError: (error, context) => {
          console.log(error.message);
          console.log('Error operation:', context.operation);

          // Check error type
          if (error instanceof ThorVGError) {
            // WASM error from native ThorVG
            console.log('Type: ThorVGError (WASM)');
            switch (error.code) {
              case ThorVGResultCode.InvalidArguments:
                console.log('Invalid arguments');
                break;
              case ThorVGResultCode.InsufficientCondition:
                console.log('Insufficient condition');
                break;
              case ThorVGResultCode.FailedAllocation:
                console.log('Failed allocation');
                break;
              case ThorVGResultCode.MemoryCorruption:
                console.log('Memory corruption');
                break;
              case ThorVGResultCode.NotSupported:
                console.log('Not supported');
                break;
              case ThorVGResultCode.SystemError:
                console.log('System error');
                break;
              case ThorVGResultCode.Unknown:
                console.log('Unknown error');
                break;
            }
          } else {
            // JavaScript error from WebCanvas
            console.log('Type: Error (JavaScript)');
          }
        },
      });

      const canvasInstance = new TVGInstance.Canvas('#canvas', {
        width: 600,
        height: 600,
      });

      setTVG(TVGInstance);
      setCanvas(canvasInstance);
      setCurrentRenderer(renderer);
      setCurrentThreads(threads);
      setStatus({ message: 'Ready', type: 'success' });
    } catch (error) {
      console.error('Error initializing ThorVG:', error);
      setStatus({
        message: `Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  // Initialize ThorVG once on mount
  useEffect(() => {
    const renderer = readRendererFromUrl(window.location.search);
    const threads = readThreadsFromUrl(window.location.search);

    initThorVG(renderer, threads);

    return () => {
      endRun();
      if (originalDPRRef.current !== null) {
        try {
          Object.defineProperty(window, 'devicePixelRatio', {
            get: () => originalDPRRef.current!,
            configurable: true,
          });
        } catch (e) {
          console.warn('Failed to restore DPR:', e);
        }
      }
    };
  }, []);

  // Auto-run when code changes and ThorVG is ready
  useEffect(() => {
    if (!code || !TVG || !canvas) return;

    const codeChanged = lastCodeRef.current !== null && lastCodeRef.current !== code;
    lastCodeRef.current = code;

    const start = () => {
      endRun();

      // The example needs audio, which is blocked until the page gets a gesture
      // (a plain refresh has none). Wait for a click instead of stalling.
      if (requiresUserGesture && !canStartAudio()) {
        setAwaitingGesture(true);
        setStatus({ message: 'Click the canvas to start playback', type: 'info' });
        return;
      }

      runCode();
    };

    if (!codeChanged) {
      start();
      return;
    }

    const settleTimer = setTimeout(start, 500);
    return () => clearTimeout(settleTimer);
  }, [code, TVG, canvas]);

  // Re-run code when zoom changes to apply new DPR (only when not dragging)
  useEffect(() => {
    if (awaitingGesture) return;
    if (originalDPRRef.current !== null && TVG && canvas && code && !isZoomDragging) {
      // Re-run code to apply new DPR (DPR is set in runCode)
      runCode();
    }
  }, [zoom, isZoomDragging]);

  // Detect the renderer and threads declared in the code
  const detectConfigFromCode = async (): Promise<DetectedConfig> => {
    const { extractInitConfig, importsFromThreadEntry } = await import('@/lib/code-transformer');
    const config = extractInitConfig(code);
    const importsThread = importsFromThreadEntry(code);
    const declaredThreads = normalizeThreads(config.threads);

    return {
      renderer: (config.renderer as Renderer) || 'gl',
      threads: importsThread ? declaredThreads : 0,
      threadsIncomplete: /threads\s*:(?!\s*\d)/.test(code),
      threadsIgnored: !importsThread && declaredThreads > 0,
      declaredThreads,
    };
  };

  // If renderer or threads changed, update URL and reload
  const reloadIfConfigChanged = (detected: DetectedConfig): boolean => {
    const rendererChanged =
      detected.renderer !== currentRenderer && isRenderer(detected.renderer);
    const threadsChanged = !detected.threadsIncomplete && detected.threads !== currentThreads;
    if (!rendererChanged && !threadsChanged) return false;

    const url = new URL(window.location.href);
    url.searchParams.set('renderer', detected.renderer);
    url.searchParams.set('threads', String(detected.threads));

    window.location.href = url.toString();
    return true;
  };

  // Update DPR based on the current zoom level before running code
  const applyZoomDPR = () => {
    if (originalDPRRef.current === null) return;

    const newDPR = originalDPRRef.current * (zoom / 100);
    try {
      Object.defineProperty(window, 'devicePixelRatio', {
        get: () => newDPR,
        configurable: true,
      });
    } catch (e) {
      console.warn('Failed to override devicePixelRatio:', e);
    }
  };

  const buildSandboxContext = (sandbox: CodeSandbox, tvg: ThorVGNamespace, target: TVGCanvas) => ({
    TVG: sandbox.proxyNamespace(tvg),
    canvas: target,
    requestAnimationFrame: sandbox.requestAnimationFrame,
    cancelAnimationFrame: sandbox.cancelAnimationFrame,
    setTimeout: sandbox.setTimeout,
    clearTimeout: sandbox.clearTimeout,
    setInterval: sandbox.setInterval,
    clearInterval: sandbox.clearInterval,
    window: sandbox.proxyEventTarget(window),
    document: sandbox.proxyEventTarget(document),
    performance,
    console,
    fetch: sandbox.fetch,
  });

  const runCode = async () => {
    if (!canvas || !TVG) {
      setStatus({ message: 'ThorVG not initialized yet', type: 'error' });
      return;
    }

    setAwaitingGesture(false);

    const detected = await detectConfigFromCode();
    if (reloadIfConfigChanged(detected)) return;

    applyZoomDPR();

    endRun();
    const sandbox = new CodeSandbox({ onPendingChange: setPendingRequests });
    sandboxRef.current = sandbox;

    setIsRunning(true);
    setStatus({ message: 'Running code...', type: 'info' });

    try {
      // Clear the canvas
      canvas.clear();

      // Transform code: strip imports, init calls, and canvas creation
      // This is smart and works with any variable names
      const { transformCodeForExecution } = await import('@/lib/code-transformer');
      const executableCode = transformCodeForExecution(code);

      const context = buildSandboxContext(sandbox, TVG, canvas);
      const executeFunction = new Function(...Object.keys(context), executableCode);
      await executeFunction(...Object.values(context));

      if (sandbox.disposed) return;
      setStatus(
        detected.threadsIgnored
          ? {
              message: `threads: ${detected.declaredThreads} ignored — import from '@thorvg/webcanvas/thread' to enable multi-threading`,
              type: 'info',
            }
          : { message: 'Code executed successfully', type: 'success' }
      );
    } catch (error) {
      if (sandbox.disposed) return;
      console.error('Error executing code:', error);
      setStatus({
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      if (sandboxRef.current === sandbox || sandboxRef.current === null) {
        setIsRunning(false);
      }
    }
  };

  const isLoading =
    !awaitingGesture && status.type !== 'error' && (!TVG || isRunning || pendingRequests > 0);
  const statusType = isLoading ? 'info' : status.type;
  const statusMessage = isLoading ? 'Loading...' : status.message;

  return (
    <div className="h-full flex flex-col bg-[#252526]">
      {/* Canvas Container */}
      <div className="flex-1 flex items-center justify-center p-5 overflow-auto" ref={containerRef}>
        <div
          className={`relative transition-transform ${showGrid ? 'show-grid' : ''}`}
          style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'center center',
          }}
        >
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255, 255, 255, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 255, 255, 0.1) 1px, transparent 1px)',
                backgroundSize: '20px 20px',
              }}
            />
          )}
          <canvas
            ref={canvasRef}
            id="canvas"
            width={600}
            height={600}
            className="border border-[#3e3e42] shadow-lg bg-black"
          />

          {isLoading && (
            <div
              className="canvas-loading absolute inset-0 flex flex-col items-center justify-center gap-3 pointer-events-none bg-white/70 text-gray-600"
            >
              <span className="w-8 h-8 rounded-full border-2 border-current border-t-transparent opacity-70 animate-spin" />
              <span className="text-sm font-medium">Loading...</span>
            </div>
          )}

          {awaitingGesture && (
            <button
              type="button"
              onClick={runCode}
              className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/60 text-white transition-colors hover:bg-black/50"
            >
              <span className="w-16 h-16 rounded-full bg-white/15 border border-white/40 flex items-center justify-center">
                <svg className="w-7 h-7 ml-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z" />
                </svg>
              </span>
              <span className="text-sm font-medium">Click to play</span>
            </button>
          )}
        </div>
      </div>

      {/* Toolbar */}
      <div className="bg-[#2d2d30] border-t border-[#3e3e42] px-4 py-2 flex items-center gap-4 text-sm">
        <div className="flex items-center gap-2">
          <label className="text-gray-400">Zoom:</label>
          <input
            type="range"
            min="50"
            max="200"
            step="10"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            onMouseDown={() => setIsZoomDragging(true)}
            onMouseUp={() => setIsZoomDragging(false)}
            onTouchStart={() => setIsZoomDragging(true)}
            onTouchEnd={() => setIsZoomDragging(false)}
            className="w-24"
          />
          <span className="text-gray-400 w-12">{zoom}%</span>
        </div>

        {/* <div className="w-px h-5 bg-[#3e3e42]" />

        <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="cursor-pointer"
          />
          Grid
        </label>

        <div className="w-px h-5 bg-[#3e3e42]" /> */}

        <div className="flex-1" />

        <button
          onClick={runCode}
          disabled={isRunning || !TVG}
          className="px-4 py-1 bg-[#0e639c] hover:bg-[#1177bb] rounded text-white font-medium transition-colors disabled:opacity-50"
        >
          {isRunning ? 'Running...' : 'Run'}
        </button>
      </div>

      {/* Status Bar */}
      <div
        className={`px-4 py-2 text-xs border-t border-[#3e3e42] flex items-center justify-between ${
          statusType === 'error'
            ? 'bg-[#f48771] text-white'
            : statusType === 'success'
            ? 'bg-[#89d185] text-gray-900'
            : 'bg-[#007acc] text-white'
        }`}
      >
        <span>{statusMessage}</span>
        {TVG?.version && (
          <span className="opacity-70">
            ThorVG v{TVG.version} · {currentRenderer.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
