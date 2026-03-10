/**
 * Module accessor for ThorVG WASM module
 */

import type { ThorVGModule } from '../types/emscripten';

/**
 * Gets the initialized ThorVG WASM module
 * @throws Error if module is not initialized
 */
export function getModule(): ThorVGModule {
  const Module = (globalThis as any).__ThorVGModule as ThorVGModule | undefined;

  if (!Module) {
    throw new Error('ThorVG module not initialized. Call ThorVG.init() first.');
  }

  return Module;
}

/**
 * Checks if the ThorVG WASM module is initialized
 */
export function hasModule(): boolean {
  return !!(globalThis as any).__ThorVGModule;
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
