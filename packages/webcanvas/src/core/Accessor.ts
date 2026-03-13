/**
 * Utility class for traversing and inspecting paint trees
 * @category Accessor
 */

import { Paint } from './Paint';
import { Picture } from './Picture';
import { getModule, allocString } from '../interop/module';
import { checkResult } from '../common/errors';

export class Accessor {
  /**
   * Generate a unique hash ID from a string name (DJB2 hash).
   *
   * @param name - The string name to hash
   * @returns The generated hash ID
   */
  static id(name: string): number {
    const Module = getModule();
    const namePtr = allocString(Module, name);
    try {
      return Module._tvg_accessor_generate_id(namePtr);
    } finally {
      Module._free(namePtr);
    }
  }

  /**
   * Traverse all descendant paint nodes of a picture and invoke a callback on each.
   * The callback receives the correctly typed Paint subclass (Shape, Scene, Picture, or Text).
   * Return false from the callback to stop traversal early.
   *
   * @param picture - The root picture to traverse
   * @param callback - Called for each descendant paint. Return false to stop.
   *
   * @example
   * ```typescript
   * Accessor.set(picture, (paint) => {
   *   if (paint instanceof TVG.Shape) {
   *     paint.fill(0, 0, 255);
   *   }
   *   return true; // continue traversal
   * });
   * ```
   */
  static set(picture: Picture, callback: (paint: Paint) => boolean): void {
    const Module = getModule();

    const accessor = Module._tvg_accessor_new();
    if (!accessor) return;

    // Create a C-callable function pointer from the JS callback.
    // Signature: bool func(Tvg_Paint paint, void* data) → 'iii' (i32 return, i32 paint, i32 data)
    const funcPtr = Module.addFunction((paintPtr: number, _data: number): number => {
      const paint = Paint.fromPtr(paintPtr);
      return callback(paint) ? 1 : 0;
    }, 'iii');

    try {
      checkResult(Module._tvg_accessor_set(accessor, picture.ptr, funcPtr, 0), 'Accessor.set');
    } finally {
      Module.removeFunction(funcPtr);
      Module._tvg_accessor_del(accessor);
    }
  }
}
