/**
 * Module accessor for ThorVG WASM module
 */

import type { ThorVGModule } from '../types/emscripten';

/**
 * Gets the initialized ThorVG WASM module
 * @throws Error if module is not initialized
 */
export function getModule(): ThorVGModule {
  const Module = globalThis.__ThorVGModule;

  if (!Module) {
    throw new Error('ThorVG module not initialized. Call ThorVG.init() first.');
  }

  return Module;
}

/**
 * Checks if the ThorVG WASM module is initialized
 */
export function hasModule(): boolean {
  return !!globalThis.__ThorVGModule;
}

/**
 * Allocate a null-terminated UTF-8 string in WASM memory.
 * Caller is responsible for calling Module._free() on the returned pointer.
 */
export function allocString(Module: ThorVGModule, str: string): number {
  const bytes = new TextEncoder().encode(str);
  const ptr = Module._malloc(bytes.length + 1);
  Module.HEAPU8.set(bytes, ptr);
  Module.HEAPU8[ptr + bytes.length] = 0;
  return ptr;
}

/**
 * Read a null-terminated UTF-8 string from WASM memory.
 * @returns The decoded string, or null for a null pointer.
 */
export function readString(Module: ThorVGModule, ptr: number): string | null {
  if (!ptr) return null;

  const heap = Module.HEAPU8;
  let end = ptr;
  while (heap[end] !== 0) end++;

  return new TextDecoder().decode(heap.subarray(ptr, end));
}

// Module-level worker thread count.
let threadCount = 0;

export function setThreadCount(threads: number): void {
  threadCount = threads;
}

export function getThreadCount(): number {
  return threadCount;
}
