/**
 * Scene class for grouping and managing multiple Paint objects
 * @category Scene
 */

import { Paint } from './Paint';
import { getModule } from '../core/Module';
import { sceneRegistry } from '../core/Registry';
import { checkResult } from '../core/errors';

/**
 * Scene class for hierarchical grouping of Paint objects
 * @category Scene
 *
 * @example
 * ```typescript
 * // Grouping shapes in a scene
 * const scene = new TVG.Scene();
 *
 * const background = new TVG.Shape();
 * background.appendRect(0, 0, 800, 600).fill(240, 240, 240, 255);
 *
 * const circle = new TVG.Shape();
 * circle.appendCircle(100, 100, 50).fill(255, 100, 100, 255);
 *
 * scene.push(background, circle);
 * canvas.add(scene);
 * ```
 *
 * @example
 * ```typescript
 * // Scene transformations affect all children
 * const scene = new TVG.Scene();
 *
 * for (let i = 0; i < 5; i++) {
 *   const shape = new TVG.Shape();
 *   shape.appendRect(i * 60, 100, 50, 50)
 *        .fill(100 + i * 30, 150, 255 - i * 30, 255);
 *   scene.push(shape);
 * }
 *
 * // Transform entire group
 * scene.translate(200, 200).rotate(30);
 * canvas.add(scene);
 * ```
 */
export class Scene extends Paint {
  constructor(ptr?: number) {
    const Module = getModule();
    if (!ptr) {
      ptr = Module._tvg_scene_new();
    }
    super(ptr, sceneRegistry);
  }

  protected _createInstance(ptr: number): Scene {
    // Create scene from existing pointer (for duplicate)
    return new Scene(ptr);
  }

  /**
   * Add paints to the scene
   */
  public add(...paints: Paint[]): this {
    const Module = getModule();
    for (const paint of paints) {
      const result = Module._tvg_scene_push(this.ptr, paint.ptr);
      checkResult(result, 'add');
    }
    return this;
  }

  /**
   * Remove paint(s) from the scene
   * If no paint is provided, removes all paints
   */
  public remove(paint?: Paint): this {
    const Module = getModule();

    if (paint) {
      const result = Module._tvg_scene_remove(this.ptr, paint.ptr);
      checkResult(result, 'remove');
    } else {
      // Remove all
      const result = Module._tvg_scene_remove(this.ptr, 0);
      checkResult(result, 'remove (all)');
    }
    return this;
  }

  /**
   * Clear all paints from the scene (alias for remove())
   */
  public clear(): this {
    return this.remove();
  }
}
