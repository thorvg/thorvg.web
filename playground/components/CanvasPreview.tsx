'use client';

import { useEffect, useRef, useState } from 'react';
import wasmUrl from "../node_modules/@thorvg/canvas-kit/dist/thorvg.wasm";

interface CanvasPreviewProps {
  code: string;
  autoRun?: boolean;
}

export default function CanvasPreview({ code, autoRun = true }: CanvasPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<{ message: string; type: 'info' | 'success' | 'error' }>({
    message: 'Initializing ThorVG...',
    type: 'info',
  });
  const [isRunning, setIsRunning] = useState(false);
  const [zoom, setZoom] = useState(100);
  const [showGrid, setShowGrid] = useState(false);
  const [darkCanvas, setDarkCanvas] = useState(false);
  const [TVG, setTVG] = useState<any>(null);
  const [canvas, setCanvas] = useState<any>(null);
  const animationIdRef = useRef<number | null>(null);

  // Initialize ThorVG once on mount
  useEffect(() => {
    let mounted = true;

    async function initThorVG() {
      try {
        setStatus({ message: 'Initializing ThorVG...', type: 'info' });

        // Dynamically import ThorVG Canvas Kit
        const { init } = await import('@thorvg/canvas-kit');

        if (!mounted) return;

        const TVGInstance = await init({
          renderer: 'gl',
          locateFile: (path: string) => wasmUrl,
        });

        const canvasInstance = new TVGInstance.Canvas('#canvas', {
          width: 600,
          height: 600,
          renderer: 'gl',
        });

        setTVG(TVGInstance);
        setCanvas(canvasInstance);
        setStatus({ message: 'Ready', type: 'success' });
      } catch (error) {
        console.error('Error initializing ThorVG:', error);
        setStatus({
          message: `Initialization error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          type: 'error',
        });
      }
    }

    initThorVG();

    return () => {
      mounted = false;
      // Cancel any ongoing animation
      if (animationIdRef.current !== null) {
        cancelAnimationFrame(animationIdRef.current);
        animationIdRef.current = null;
      }
    };
  }, []);

  // Auto-run when code changes and ThorVG is ready
  useEffect(() => {
    if (autoRun && code && TVG && canvas) {
      runCode();
    }
  }, [code, autoRun, TVG, canvas]);

  const runCode = async () => {
    if (!canvas || !TVG) {
      setStatus({ message: 'ThorVG not initialized yet', type: 'error' });
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

      // Clear the canvas
      canvas.clear();

      // Transform code: strip imports, init calls, and canvas creation
      // This is smart and works with any variable names
      const { transformCodeForExecution } = await import('@/lib/code-transformer');
      const executableCode = transformCodeForExecution(code);

      // Wrap requestAnimationFrame to track animation IDs
      const wrappedRAF = (callback: FrameRequestCallback) => {
        animationIdRef.current = requestAnimationFrame(callback);
        return animationIdRef.current;
      };

      // Create a function context with pre-loaded modules
      // The user code will have access to TVG, canvas, and requestAnimationFrame
      const executeFunction = new Function(
        'TVG',
        'canvas',
        'requestAnimationFrame',
        'performance',
        'console',
        executableCode
      );

      // Execute with pre-loaded context
      await executeFunction(TVG, canvas, wrappedRAF, performance, console);

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
            className={`border border-[#3e3e42] shadow-lg ${
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
            step="10"
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="w-24"
          />
          <span className="text-gray-400 w-12">{zoom}%</span>
        </div>

        <div className="w-px h-5 bg-[#3e3e42]" />

        <label className="flex items-center gap-2 text-gray-400 cursor-pointer">
          <input
            type="checkbox"
            checked={showGrid}
            onChange={(e) => setShowGrid(e.target.checked)}
            className="cursor-pointer"
          />
          Grid
        </label>

        <div className="w-px h-5 bg-[#3e3e42]" />

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
        className={`px-4 py-2 text-xs border-t border-[#3e3e42] ${
          status.type === 'error'
            ? 'bg-[#f48771] text-white'
            : status.type === 'success'
            ? 'bg-[#89d185] text-gray-900'
            : 'bg-[#007acc] text-white'
        }`}
      >
        {status.message}
      </div>
    </div>
  );
}
