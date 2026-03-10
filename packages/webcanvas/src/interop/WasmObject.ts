/**
 * Base class for all WASM-backed objects
 */

import type { RegistryToken } from './registry';
import { handleError } from '../common/errors';

export abstract class WasmObject {
  #ptr: number = 0;
  #disposed: boolean = false;
  #registryToken: RegistryToken | null = null;

  constructor(ptr: number, registry?: FinalizationRegistry<RegistryToken>) {
    this.#ptr = ptr;

    // Register for automatic cleanup
    if (registry) {
      this.#registryToken = { ptr, cleanup: this._cleanup };
      registry.register(this, this.#registryToken);
    }
  }

  /**
   * Gets the WASM pointer for this object
   * Returns 0 if object has been disposed (error handled by global handler)
   */
  public get ptr(): number {
    if (this.#disposed) {
      handleError('Object has been disposed', 'ptr getter');
      return 0;
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
    if (this.#disposed) {
      return;
    }

    this._cleanup(this.#ptr);
    this.#disposed = true;
    if (this.#registryToken) {
      this.#registryToken.ptr = 0;
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
