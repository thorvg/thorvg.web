import { WasmObject } from '../interop/WasmObject';
import { Paint } from './Paint';
import { getModule, allocString, readString } from '../interop/module';
import { accessorRegistry } from '../interop/registry';
import { checkResult } from '../common/errors';

/**
 * Utility class for traversing and inspecting paint trees
 * @category Accessor
 */
export class Accessor extends WasmObject {
  constructor() {
    const Module = getModule();
    super(Module._tvg_accessor_new(), accessorRegistry);
  }

  protected _cleanup(ptr: number): void {
    const Module = getModule();
    Module._tvg_accessor_del(ptr);
  }

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
   * Traverse the scene tree of a paint and invoke a callback on the paint and each of its
   * descendants. The callback receives the correctly typed Paint subclass (Shape, Scene,
   * Picture, or Text). Return false from the callback to stop traversal early.
   *
   * @param paint - The root paint node to traverse, typically a Picture or Scene
   * @param callback - Called for the root and each descendant paint. Return false to stop.
   *
   * @note A bitmap-based Picture might not have a scene tree.
   *
   * @example
   * ```typescript
   * const accessor = new TVG.Accessor();
   *
   * accessor.set(picture, (paint) => {
   *   if (paint instanceof TVG.Shape) {
   *     paint.fill(0, 0, 255);
   *   }
   *   return true; // continue traversal
   * });
   * ```
   */
  public set(paint: Paint, callback: (paint: Paint) => boolean): void {
    const Module = getModule();

    // Signature: bool func(Tvg_Paint paint, void* data) → 'iii' (i32 return, i32 paint, i32 data)
    const funcPtr = Module.addFunction((paintPtr: number): number => {
      return callback(Paint.fromPtr(paintPtr)) ? 1 : 0;
    }, 'iii');

    try {
      checkResult(Module._tvg_accessor_set(this.ptr, paint.ptr, funcPtr, 0), 'Accessor.set');
    } finally {
      Module.removeFunction(funcPtr);
    }
  }

  /**
   * Retrieve the original name string for a given ID.
   *
   * @param id - The unique identifier, e.g. from {@link Paint.id}
   * @returns The corresponding name, or null if not found or unavailable
   *
   * @remarks
   * Only resolves while {@link set} is traversing, and only when the picture was marked
   * accessible *before* loading (see {@link Picture.accessible}). Returns null otherwise.
   *
   * @example
   * ```typescript
   * const picture = new TVG.Picture();
   * picture.accessible = true;
   * picture.load(svgData, { type: 'svg' });
   *
   * const accessor = new TVG.Accessor();
   * accessor.set(picture, (paint) => {
   *   if (accessor.name(paint.id) === 'background') paint.fill(255, 0, 0);
   *   return true;
   * });
   * ```
   */
  public name(id: number): string | null {
    const Module = getModule();
    return readString(Module, Module._tvg_accessor_get_name(this.ptr, id));
  }
}
