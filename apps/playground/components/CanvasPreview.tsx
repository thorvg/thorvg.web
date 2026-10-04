'use client';

import { useEffect, useRef, useState } from 'react';
import type { Canvas as TVGCanvas, ThorVGNamespace } from '@thorvg/webcanvas';
import wasmUrl from "../node_modules/@thorvg/webcanvas/dist/thorvg.wasm";
import { CodeSandbox } from '@/lib/code-sandbox';
import type { PlaygroundWindow } from '@/types/window';
import {
  CANVAS_SIZE,
  createCanvasPreviewController,
  type CanvasPreviewController,
} from "@/lib/canvas-preview-controller";

interface CanvasPreviewProps {
  code: string;
  requiresUserGesture?: boolean;
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
  const previewRef = useRef<CanvasPreviewController | null>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
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
  const [currentRenderer, setCurrentRenderer] = useState<'sw' | 'gl' | 'wg'>('gl');
  const [awaitingGesture, setAwaitingGesture] = useState(false);
  const [pendingRequests, setPendingRequests] = useState(0);
  const sandboxRef = useRef<CodeSandbox | null>(null);
  const zoomAnimationIdRef = useRef<number | null>(null);

  const endRun = () => {
    sandboxRef.current?.dispose();
    sandboxRef.current = null;
    setPendingRequests(0);
  };

  // Initialize ThorVG with specified renderer
  const initThorVG = async (
    renderer: 'sw' | 'gl' | 'wg',
    isCancelled: () => boolean,
  ) => {
    try {
      setStatus({ message: `Initializing ThorVG with ${renderer.toUpperCase()} renderer...`, type: 'info' });

      const { init, ThorVGError, ThorVGResultCode } = await import('@thorvg/webcanvas');
      if (isCancelled()) return;
      const TVGInstance = await init({
        renderer,
        locateFile: () => wasmUrl,
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

      if (isCancelled()) return;

      const element = canvasRef.current;
      if (!element) return;

      const canvasInstance = new TVGInstance.Canvas('#canvas', {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      });

      previewRef.current = createCanvasPreviewController(
        canvasInstance,
        new TVGInstance.Scene(),
        element,
        (width, height) => {
          const wrapper = canvasWrapperRef.current;
          if (wrapper) {
            wrapper.style.width = `${width + 2}px`;
            wrapper.style.height = `${height + 2}px`;
          }
        },
        TVGInstance.Video,
      );

      setTVG(TVGInstance);
      setCanvas(canvasInstance);
      setCurrentRenderer(renderer);
      setStatus({ message: 'Ready', type: 'success' });
      return canvasInstance;
    } catch (error) {
      if (isCancelled()) return;
      console.error('Error initializing ThorVG:', error);
      setStatus({
        message: `Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    }
  };

  // Initialize ThorVG once on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlRenderer = params.get('renderer');
    const renderer = (urlRenderer && ['sw', 'gl', 'wg'].includes(urlRenderer)) ? urlRenderer : 'gl';

    let cancelled = false;
    let initializedCanvas: TVGCanvas | undefined;
    void initThorVG(renderer as 'sw' | 'gl' | 'wg', () => cancelled).then((instance) => {
      if (cancelled) instance?.destroy();
      else initializedCanvas = instance;
    });

    return () => {
      cancelled = true;
      endRun();
      if (zoomAnimationIdRef.current !== null) {
        cancelAnimationFrame(zoomAnimationIdRef.current);
        zoomAnimationIdRef.current = null;
      }
      previewRef.current = null;
      initializedCanvas?.destroy();
    };
  }, []);

  // Auto-run when code changes and ThorVG is ready
  useEffect(() => {
    if (!code || !TVG || !canvas) return;

    endRun();

    // The example needs audio, which is blocked until the page gets a gesture
    // (a plain refresh has none). Wait for a click instead of stalling.
    if (requiresUserGesture && !canStartAudio()) {
      setAwaitingGesture(true);
      setStatus({ message: 'Click the canvas to start playback', type: 'info' });
      return;
    }

    runCode();
  }, [code, TVG, canvas]);

  // Zoom the existing canvas without re-executing user code.
  useEffect(() => {
    const preview = previewRef.current;
    if (!canvas || !preview) return;

    zoomAnimationIdRef.current = requestAnimationFrame(() => {
      zoomAnimationIdRef.current = null;
      if (previewRef.current !== preview) return;
      const container = containerRef.current;
      const element = canvasRef.current;
      const wrapper = canvasWrapperRef.current;
      if (!container || !element || !wrapper) return;

      // Keep the artwork point at the visible center fixed while zooming.
      const containerBounds = container.getBoundingClientRect();
      const before = element.getBoundingClientRect();
      const centerX = containerBounds.left + container.clientLeft + container.clientWidth / 2;
      const centerY = containerBounds.top + container.clientTop + container.clientHeight / 2;
      const anchorX = (centerX - before.left) / before.width;
      const anchorY = (centerY - before.top) / before.height;

      preview.setZoom(zoom / 100);

      const after = element.getBoundingClientRect();
      container.scrollLeft += after.left + anchorX * after.width
        - (containerBounds.left + container.clientLeft + container.clientWidth / 2);
      container.scrollTop += after.top + anchorY * after.height
        - (containerBounds.top + container.clientTop + container.clientHeight / 2);
    });

    return () => {
      if (zoomAnimationIdRef.current !== null) {
        cancelAnimationFrame(zoomAnimationIdRef.current);
        zoomAnimationIdRef.current = null;
      }
    };
  }, [zoom, canvas]);

  const runCode = async () => {
    const preview = previewRef.current;
    if (!canvas || !TVG || !preview) {
      setStatus({ message: 'ThorVG not initialized yet', type: 'error' });
      return;
    }

    setAwaitingGesture(false);

    // Detect renderer from code
    const { extractInitConfig } = await import('@/lib/code-transformer');
    if (previewRef.current !== preview) return;
    const config = extractInitConfig(code);
    const detectedRenderer = (config.renderer as 'sw' | 'gl' | 'wg') || 'gl';

    // If renderer changed, update URL and reload
    if (detectedRenderer !== currentRenderer && ['sw', 'gl', 'wg'].includes(detectedRenderer)) {
      setStatus({
        message: `Switching to ${detectedRenderer.toUpperCase()} renderer...`,
        type: 'info'
      });

      const url = new URL(window.location.href);
      url.searchParams.set('renderer', detectedRenderer);

      setTimeout(() => {
        window.location.href = url.toString();
      }, 300);
      return;
    }

    endRun();
    const sandbox = new CodeSandbox({ onPendingChange: setPendingRequests });
    sandboxRef.current = sandbox;

    setIsRunning(true);
    setStatus({ message: 'Running code...', type: 'info' });

    try {
      // Clear the previous example and its clipping while retaining preview zoom.
      preview.resetForRun();

      // Transform code: strip imports, init calls, and canvas creation
      // This is smart and works with any variable names
      const { transformCodeForExecution } = await import('@/lib/code-transformer');
      if (sandbox.disposed || previewRef.current !== preview) return;
      const executableCode = transformCodeForExecution(code);

      const context = {
        TVG: sandbox.proxyNamespace(TVG),
        canvas,
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
      };
      const executeFunction = new Function(...Object.keys(context), executableCode);
      await executeFunction(...Object.values(context));

      if (sandbox.disposed) return;
      setStatus({ message: 'Code executed successfully', type: 'success' });
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
    <div data-canvas-preview className="h-full flex flex-col bg-[#252526]">
      {/* Allow both the containing split pane and its editor sibling to shrink. */}
      <style jsx global>{`
        div:has(> div > [data-canvas-preview]),
        div:has(> div > [data-canvas-preview]) + div {
          min-width: 0;
        }
      `}</style>
      {/* Canvas Container */}
      <div
        className="flex-1 min-h-0 flex p-5 overflow-auto"
        ref={containerRef}
        style={{ overflowAnchor: "none" }}
      >
        <div
          ref={canvasWrapperRef}
          className={`relative m-auto flex shrink-0 items-center justify-center ${showGrid ? 'show-grid' : ''}`}
          style={{ width: CANVAS_SIZE + 2, height: CANVAS_SIZE + 2 }}
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
            width={CANVAS_SIZE}
            height={CANVAS_SIZE}
            className="shrink-0 border border-[#3e3e42] shadow-lg bg-black"
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
            step="1"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
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
