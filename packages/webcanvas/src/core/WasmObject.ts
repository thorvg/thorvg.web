/**
 * Base class for all WASM-backed objects
 */

import type { RegistryToken } from './Registry';

export abstract class WasmObject {
  #ptr: number = 0;
  #disposed: boolean = false;

  constructor(ptr: number, registry?: FinalizationRegistry<RegistryToken>) {
    this.#ptr = ptr;

    // Register for automatic cleanup
    if (registry) {
      registry.register(this, {
        ptr,
        cleanup: this._cleanup.bind(this),
      });
    }
  }

  /**
   * Gets the WASM pointer for this object
   * @throws Error if object has been disposed
   */
  public get ptr(): number {
    if (this.#disposed) {
      throw new Error('Object has been disposed');
    }
    return this.#ptr;
  }

  public set ptr(ptr: number) {
    this.#ptr = ptr;
  }

  /**
   * Manually dispose of this object and free its WASM memory
   */
  public dispose(): void {
    if (!this.#disposed) {
      this._cleanup(this.#ptr);
      this.#disposed = true;
    }
  }

  /**
   * Check if this object has been disposed
   */
  public get isDisposed(): boolean {
    return this.#disposed;
  }

  /**
   * Cleanup function to be implemented by subclasses
   * @param ptr - The WASM pointer to clean up
   */
  protected abstract _cleanup(ptr: number): void;
}
