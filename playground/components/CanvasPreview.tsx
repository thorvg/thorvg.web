'use client';

import { useEffect, useRef, useState } from 'react';
import wasmUrl from "../node_modules/@thorvg/webcanvas/dist/thorvg.wasm";
import type { Paint, Scene } from '@thorvg/webcanvas';

type Canvas = import('@thorvg/webcanvas').Canvas;

const CANVAS_SIZE = 600;

interface CanvasPreviewProps {
  code: string;
  autoRun?: boolean;
  useDarkCanvas?: boolean;
}

export default function CanvasPreview({ code, autoRun = true, useDarkCanvas = false }: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasWrapperRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' }>({
    message: 'Initializing ThorVG...',
    type: 'info',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [darkCanvas, setDarkCanvas] = useState(useDarkCanvas);
  const [TVG, setTVG] = useState<any>(null);
  const [canvas, setCanvas] = useState<Canvas | null>(null);
  const [currentRenderer, setCurrentRenderer] = useState<'sw' | 'gl' | 'wg'>('gl');
  const animationIdRef = useRef<number | null>(null);
  const zoomAnimationIdRef = useRef<number | null>(null);
  const previewRef = useRef<{
    setZoom(factor: number): void;
    resetForRun(): void;
  } | null>(null);

  // Initialize ThorVG with specified renderer
  const initThorVG = async (renderer: 'sw' | 'gl' | 'wg') => {
    try {
      setStatus({ message: `Initializing ThorVG with ${renderer.toUpperCase()} renderer...`, type: 'info' });

      const { init, ThorVGError, ThorVGResultCode } = await import('@thorvg/webcanvas');
      const TVGInstance = await init({
        renderer,
        locateFile: (path: string) => wasmUrl,
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

      const canvasInstance: Canvas = new TVGInstance.Canvas('#canvas', {
        width: CANVAS_SIZE,
        height: CANVAS_SIZE,
      });
      const rootScene: Scene = new TVGInstance.Scene();
      const element = canvasRef.current!;
      const nativeUpdate = canvasInstance.update.bind(canvasInstance);
      const nativeRender = canvasInstance.render.bind(canvasInstance);
      const nativeResize = canvasInstance.resize.bind(canvasInstance);
      const nativeViewport = canvasInstance.viewport.bind(canvasInstance);
      let previewZoom = 1;
      let viewport: [number, number, number, number] | null = null;
      let sceneDirty = true;
      // Canvas construction/root attachment can also leave native updates pending.
      let updatePending = true;

      canvasInstance.add(rootScene);

      function update(): Canvas {
        nativeUpdate();
        sceneDirty = false;
        updatePending = true;
        return canvasInstance;
      }

      function applyViewport(): void {
        if (viewport) {
          const [x, y, width, height] = viewport;
          // Existing viewport arguments are render-target pixels, without DPR conversion.
          nativeViewport(
            Math.trunc(x * previewZoom), Math.trunc(y * previewZoom),
            Math.trunc(width * previewZoom), Math.trunc(height * previewZoom),
          );
        } else {
          nativeViewport(0, 0, element.width, element.height);
        }
        sceneDirty = true;
      }

      function render(): Canvas {
        if (sceneDirty) update();
        const previousDPR = canvasInstance.dpr;
        const previousWidth = element.width;
        const previousHeight = element.height;
        nativeRender();
        updatePending = false;

        // WebCanvas may resize its target and change its DPR transform during render().
        // Restore clipping and process that transform before presenting the final frame.
        if (canvasInstance.dpr !== previousDPR || element.width !== previousWidth || element.height !== previousHeight) {
          applyViewport();
          update();
          nativeRender();
          updatePending = false;
        }
        return canvasInstance;
      }

      function finishPendingUpdate(): void {
        // ThorVG requires pending updates to finish before changing the viewport.
        if (updatePending) render();
      }

      // Override only this preview instance, preserving native identity and chaining.
      const methods = {
        add(paint: Paint): Canvas {
          rootScene.add(paint);
          sceneDirty = true;
          return canvasInstance;
        },
        remove(paint?: Paint): Canvas {
          rootScene.remove(paint);
          sceneDirty = true;
          return canvasInstance;
        },
        clear(): Canvas {
          finishPendingUpdate();
          rootScene.clear();
          sceneDirty = true;
          return render();
        },
        update,
        render,
        viewport(x: number, y: number, width: number, height: number): Canvas {
          finishPendingUpdate();
          viewport = [x, y, width, height];
          applyViewport();
          return canvasInstance;
        },
      };
      for (const [name, value] of Object.entries(methods)) {
        Object.defineProperty(canvasInstance, name, { configurable: true, writable: true, value });
      }

      previewRef.current = {
        setZoom(factor: number): void {
          if (!Number.isFinite(factor) || factor <= 0) {
            throw new Error('Preview zoom must be finite and positive');
          }
          finishPendingUpdate();
          if (factor !== previewZoom) {
            previewZoom = factor;
            rootScene.scale(factor);
            nativeResize(CANVAS_SIZE * factor, CANVAS_SIZE * factor);
            applyViewport();
          }
          render();
        },
        resetForRun(): void {
          finishPendingUpdate();
          viewport = null;
          rootScene.clear();
          applyViewport();
          render();
        },
      };

      setTVG(TVGInstance);
      setCanvas(canvasInstance);
      setCurrentRenderer(renderer);
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
    const params = new URLSearchParams(window.location.search);
    const urlRenderer = params.get('renderer');
    const renderer = (urlRenderer && ['sw', 'gl', 'wg'].includes(urlRenderer)) ? urlRenderer : 'gl';

    initThorVG(renderer as 'sw' | 'gl' | 'wg');

    return () => {
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
      }
    };
  }, []);

  // Auto-run when code changes and ThorVG is ready
  useEffect(() => {
    if (autoRun && code && TVG && canvas) {
      runCode();
    }
  }, [code, autoRun, TVG, canvas]);

  // Zoom the existing canvas without re-executing user code.
  useEffect(() => {
    const preview = previewRef.current;
    if (!canvas || !preview) {
      return;
    }

    zoomAnimationIdRef.current = requestAnimationFrame(() => {
      const container = containerRef.current;
      const element = canvasRef.current;
      const wrapper = canvasWrapperRef.current;
      if (!container || !element || !wrapper) return;

      // Keep the artwork point at the visible center fixed while zooming.
      // Measure before resizing either the canvas or its scrollable wrapper.
      const containerBounds = container.getBoundingClientRect();
      const before = element.getBoundingClientRect();
      const centerX = containerBounds.left + container.clientLeft + container.clientWidth / 2;
      const centerY = containerBounds.top + container.clientTop + container.clientHeight / 2;
      const anchorX = (centerX - before.left) / before.width;
      const anchorY = (centerY - before.top) / before.height;

      preview.setZoom(zoom / 100);
      wrapper.style.width = `${CANVAS_SIZE * zoom / 100 + 2}px`;
      wrapper.style.height = `${CANVAS_SIZE * zoom / 100 + 2}px`;

      const after = element.getBoundingClientRect();
      container.scrollLeft += after.left + anchorX * after.width
        - (containerBounds.left + container.clientLeft + container.clientWidth / 2);
      container.scrollTop += after.top + anchorY * after.height
        - (containerBounds.top + container.clientTop + container.clientHeight / 2);
      zoomAnimationIdRef.current = null;
    });

    return () => {
      if (zoomAnimationIdRef.current !== null) {
        cancelAnimationFrame(zoomAnimationIdRef.current);
        zoomAnimationIdRef.current = null;
      }
    };
  }, [zoom, canvas]);

  const runCode = async () => {
    if (!canvas || !TVG || !previewRef.current) {
      setStatus({ message: 'ThorVG not initialized yet', type: 'error' });
      return;
    }

    // Detect renderer from code
    const { extractInitConfig } = await import('@/lib/code-transformer');
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

    setIsRunning(true);
    setStatus({ message: 'Running code...', type: 'info' });

    try {
      // Cancel any ongoing animation
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }

      // Clear the previous example and its clipping while retaining preview zoom.
      previewRef.current.resetForRun();

      // Transform code: strip imports, init calls, and canvas creation
      // This is smart and works with any variable names
      const { transformCodeForExecution } = await import('@/lib/code-transformer');
      const executableCode = transformCodeForExecution(code);

      // Wrap requestAnimationFrame to track animation IDs
      const wrappedRAF = (callback: FrameRequestCallback) => {
        animationIdRef.current = requestAnimationFrame(callback);
        return animationIdRef.current;
      };

      // Initialize global fetch cache if not exists
      if (!(window as any).__playgroundFetchCache) {
        (window as any).__playgroundFetchCache = new Map<string, { data: ArrayBuffer; headers: Headers; status: number; statusText: string }>();
      }

      // Create cached fetch wrapper
      const cachedFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
        const urlString = url.toString();
        const cache = (window as any).__playgroundFetchCache;

        // Only cache GET requests (default method)
        const method = init?.method?.toUpperCase() || 'GET';
        if (method !== 'GET') {
          return fetch(url, init);
        }

        // Check cache
        if (cache.has(urlString)) {
          const cached = cache.get(urlString);
          return new Response(cached.data, {
            status: cached.status,
            statusText: cached.statusText + ' (cached)',
            headers: cached.headers
          });
        }

        // Fetch and cache
        const response = await fetch(url, init);
        const data = await response.arrayBuffer();

        cache.set(urlString, {
          data,
          headers: response.headers,
          status: response.status,
          statusText: response.statusText
        });

        return new Response(data, {
          status: response.status,
          statusText: response.statusText,
          headers: response.headers
        });
      };

      // Create a function context with pre-loaded modules
      // The user code will have access to TVG, canvas, and requestAnimationFrame
      const executeFunction = new Function(
        'TVG',
        'canvas',
        'requestAnimationFrame',
        'performance',
        'console',
        'fetch',
        executableCode
      );

      // Execute with pre-loaded context
      await executeFunction(TVG, canvas, wrappedRAF, performance, console, cachedFetch);

      setStatus({ message: 'Code executed successfully', type: 'success' });
    } catch (error) {
      console.error('Error executing code:', error);
      setStatus({
        message: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
        type: 'error',
      });
    } finally {
      setIsRunning(false);
    }
  };

  const clearCanvas = () => {
    if (!canvas) return;

    // Cancel any ongoing animation
    if (animationIdRef.current !== null) {
      cancelAnimationFrame(animationIdRef.current);
      animationIdRef.current = null;
    }

    canvas.clear();
    setStatus({ message: 'Canvas cleared', type: 'success' });
  };

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
      <div className="flex-1 min-h-0 flex p-5 overflow-auto" ref={containerRef} style={{ overflowAnchor: 'none' }}>
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
            className={`shrink-0 border border-[#3e3e42] shadow-lg ${
              darkCanvas ? 'bg-[#2d2d30]' : 'bg-white'
            }`}
          />
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

        <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={darkCanvas}
            onChange={(e) => setDarkCanvas(e.target.checked)}
            className="cursor-pointer"
          />
          Dark Canvas
        </label>

        <div className="flex-1" />

        <button
          onClick={clearCanvas}
          disabled={isRunning || !TVG}
          className="px-3 py-1 bg-[#3c3c3c] hover:bg-[#505050] rounded text-gray-300 transition-colors disabled:opacity-50"
        >
          Clear
        </button>

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
          status.type === 'error'
            ? 'bg-[#f48771] text-white'
            : status.type === 'success'
            ? 'bg-[#89d185] text-gray-900'
            : 'bg-[#007acc] text-white'
        }`}
      >
        <span>{status.message}</span>
        {TVG?.version && (
          <span className="opacity-70">
            ThorVG v{TVG.version} · {currentRenderer.toUpperCase()}
          </span>
        )}
      </div>
    </div>
  );
}
