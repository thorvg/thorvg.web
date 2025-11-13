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
