import 'webgl-memory';
import type { GpuMemory } from './types';

interface GLMemoryInfo {
  memory: { buffer: number; texture: number; renderbuffer: number; drawingbuffer: number; total: number };
  resources: Record<string, number>;
}

interface MemoryExtension {
  getMemoryInfo(): GLMemoryInfo;
}

type Context = WebGLRenderingContext | WebGL2RenderingContext;

const seen = new WeakSet<Context>();
let contexts: WeakRef<Context>[] = [];
let peak = 0;
let installed = false;

function wrap(Ctor: { prototype: { getContext(...args: unknown[]): unknown } }): void {
  const original = Ctor.prototype.getContext;
  Ctor.prototype.getContext = function (this: unknown, ...args: unknown[]) {
    const ctx = original.apply(this, args) as Context | null;
    if (ctx && 'bindTexture' in ctx && !seen.has(ctx)) {
      seen.add(ctx);
      contexts.push(new WeakRef(ctx));
    }
    return ctx;
  };
}

export function install(): void {
  if (installed || typeof WeakRef === 'undefined') return;
  installed = true;
  if (typeof HTMLCanvasElement !== 'undefined') wrap(HTMLCanvasElement);
  if (typeof OffscreenCanvas !== 'undefined') wrap(OffscreenCanvas);
}

export function active(): boolean {
  return contexts.length > 0;
}

export function usage(): GpuMemory | null {
  contexts = contexts.filter((ref) => ref.deref());
  if (!contexts.length) return null;

  const breakdown: Record<string, number> = { buffer: 0, texture: 0, renderbuffer: 0, drawingbuffer: 0 };
  const resources: Record<string, number> = {};
  let total = 0;
  let found = false;

  for (const ref of contexts) {
    const gl = ref.deref();
    if (!gl || gl.isContextLost()) continue;
    const ext = gl.getExtension('GMAN_webgl_memory') as MemoryExtension | null;
    if (!ext) continue;
    found = true;
    const { memory, resources: counts } = ext.getMemoryInfo();
    total += memory.total;
    for (const key of Object.keys(breakdown)) breakdown[key]! += memory[key as keyof GLMemoryInfo['memory']];
    for (const [key, value] of Object.entries(counts)) resources[key] = (resources[key] ?? 0) + value;
  }

  if (!found) return null;
  peak = Math.max(peak, total);
  return { total, peak, breakdown, resources };
}

export function resetPeak(): void {
  peak = 0;
  usage();
}
