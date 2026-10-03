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

/**
 * Value types of a C function signature. Pointers, bools and ints are all i32 in WASM.
 */
export type WasmType = 'void' | 'bool' | 'int' | 'ptr';

/**
 * Create a function pointer that C code can call, backed by a JS function.
 * Caller is responsible for calling deleteFunction() on the returned pointer.
 *
 * @param ret - Return type of the C signature
 * @param args - Argument types of the C signature, including ones the JS function ignores
 * @param fn - JS implementation.
 */
export function createFunction(
  Module: ThorVGModule,
  ret: WasmType,
  args: WasmType[],
  fn: (...args: number[]) => unknown
): number {
  const sig = (ret === 'void' ? 'v' : 'i') + 'i'.repeat(args.length);
  const impl = ret === 'bool' ? (...a: number[]): number => (fn(...a) ? 1 : 0) : fn;
  return Module.addFunction(impl, sig);
}

/**
 * Release a function pointer created by createFunction().
 */
export function deleteFunction(Module: ThorVGModule, ptr: number): void {
  Module.removeFunction(ptr);
}

// Module-level worker thread count.
let threadCount = 0;

export function setThreadCount(threads: number): void {
  threadCount = threads;
}

export function getThreadCount(): number {
  return threadCount;
}
