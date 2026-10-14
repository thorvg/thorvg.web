import { type Renderer } from './constants';

export interface GpuMemory {
  total: number;
  peak: number;
  breakdown: Record<string, number>;
  resources: Record<string, number>;
}

export interface MemorySample {
  js: number | null;
  wasm: number | null;
  gpu: GpuMemory | null;
}

interface GLMemoryInfo {
  memory: { buffer: number; texture: number; renderbuffer: number; drawingbuffer: number; total: number };
  resources: Record<string, number>;
}

type WebGPUMemory = typeof import('./webgpu-memory');

class Profiler {
  #renderer: Renderer | null = null;
  #webgpu: WebGPUMemory | null = null;
  #canvas: HTMLCanvasElement | null = null;
  #glPeak = 0;
  #frames = 0;
  #fpsFrames = 0;
  #fpsTime = 0;

  async install(renderer: Renderer): Promise<void> {
    if (this.#renderer) return;
    if (renderer === 'gl') await import('webgl-memory');
    else if (renderer === 'wg') {
      this.#webgpu = await import('./webgpu-memory');
      this.#webgpu.install();
    }
    this.#renderer = renderer;
  }

  attach(canvas: HTMLCanvasElement): void {
    this.#canvas = canvas;
  }

  detach(): void {
    this.#canvas = null;
  }

  get tracksGpu(): boolean {
    return this.#renderer === 'gl' || this.#renderer === 'wg';
  }

  frame(): void {
    this.#frames++;
  }

  fps(): number {
    const now = performance.now();
    const fps = this.#fpsTime ? ((this.#frames - this.#fpsFrames) * 1000) / (now - this.#fpsTime) : 0;
    this.#fpsTime = now;
    this.#fpsFrames = this.#frames;
    return fps;
  }

  memory(): MemorySample {
    return { js: this.#js(), wasm: this.#wasm(), gpu: this.#gpu() };
  }

  resetPeak(): void {
    this.#glPeak = 0;
    this.#webgpu?.resetPeak();
  }

  #js(): number | null {
    return (performance as any).memory?.usedJSHeapSize ?? null;
  }

  #wasm(): number | null {
    return (globalThis as any).__ThorVGModule?.HEAPU8?.buffer?.byteLength ?? null;
  }

  #gpu(): GpuMemory | null {
    if (this.#webgpu) {
      const { total, peak, breakdown, resources } = this.#webgpu.usage();
      return { total, peak, breakdown, resources: nonZero(resources) };
    }

    if (this.#renderer === 'gl' && this.#canvas) {
      const gl = (this.#canvas.getContext('webgl2') ?? this.#canvas.getContext('webgl')) as WebGLRenderingContext | null;
      const ext = gl?.getExtension('GMAN_webgl_memory') as { getMemoryInfo(): GLMemoryInfo } | null | undefined;
      if (!ext) return null;
      const { memory, resources } = ext.getMemoryInfo();
      this.#glPeak = Math.max(this.#glPeak, memory.total);
      return {
        total: memory.total,
        peak: this.#glPeak,
        breakdown: { buffer: memory.buffer, texture: memory.texture, renderbuffer: memory.renderbuffer, drawingbuffer: memory.drawingbuffer },
        resources: nonZero(resources),
      };
    }

    return null;
  }
}

export const profiler = new Profiler();

export function toMB(bytes: number): number {
  return bytes / 1048576;
}

function nonZero(counts: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(counts)) if (v) out[k] = v;
  return out;
}
