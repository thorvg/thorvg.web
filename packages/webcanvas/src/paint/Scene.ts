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
 * scene.add(background);
 * scene.add(circle);
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
 *   scene.add(shape);
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
   * Add a paint to the scene
   */
  public add(paint: Paint): this {
    const Module = getModule();
    const result = Module._tvg_scene_add(this.ptr, paint.ptr);
    checkResult(result, 'add');
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

  /**
   * Reset all previously applied scene effects, restoring the scene to its original state.
   *
   * @returns The Scene instance for method chaining
   *
   * @example
   * ```typescript
   * const scene = new TVG.Scene();
   * scene.dropShadow(128, 128, 128, 200, 45, 5, 2, 60);
   * scene.resetEffects(); // Remove all effects
   * ```
   */
  public resetEffects(): this {
    const Module = getModule();
    const result = Module._tvg_scene_clear_effects(this.ptr);
    checkResult(result, 'resetEffects');
    return this;
  }

  /**
   * Apply a Gaussian blur effect to the scene.
   *
   * @param sigma - Blur intensity (> 0)
   * @param direction - Blur direction: 0 (both), 1 (horizontal), 2 (vertical)
   * @param border - Border mode: 0 (duplicate), 1 (wrap)
   * @param quality - Blur quality (0-100)
   * @returns The Scene instance for method chaining
   *
   * @example
   * ```typescript
   * const scene = new TVG.Scene();
   * scene.add(shape1);
   * scene.add(shape2);
   * scene.gaussianBlur(1.5, 0, 0, 75); // Apply blur to entire scene
   * ```
   */
  public gaussianBlur(sigma: number, direction: number = 0, border: number = 0, quality: number = 75): this {
    const Module = getModule();
    const result = Module._tvg_scene_add_effect_gaussian_blur(this.ptr, sigma, direction, border, quality);
    checkResult(result, 'gaussianBlur');
    return this;
  }

  /**
   * Apply a drop shadow effect with Gaussian blur filter to the scene.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @param a - Alpha/opacity (0-255)
   * @param angle - Shadow angle in degrees (0-360)
   * @param distance - Shadow distance/offset
   * @param sigma - Blur intensity for the shadow (> 0)
   * @param quality - Blur quality (0-100)
   * @returns The Scene instance for method chaining
   *
   * @example
   * ```typescript
   * const scene = new TVG.Scene();
   * scene.add(shape);
   * // Add gray drop shadow at 45° angle, 5px distance, 2px blur
   * scene.dropShadow(128, 128, 128, 200, 45, 5, 2, 60);
   * ```
   */
  public dropShadow(r: number, g: number, b: number, a: number, angle: number, distance: number, sigma: number, quality: number = 60): this {
    const Module = getModule();
    const result = Module._tvg_scene_add_effect_drop_shadow(this.ptr, r, g, b, a, angle, distance, sigma, quality);
    checkResult(result, 'dropShadow');
    return this;
  }

  /**
   * Override the scene content color with a given fill color.
   *
   * @param r - Red component (0-255)
   * @param g - Green component (0-255)
   * @param b - Blue component (0-255)
   * @param a - Alpha/opacity (0-255)
   * @returns The Scene instance for method chaining
   *
   * @example
   * ```typescript
   * const scene = new TVG.Scene();
   * scene.add(shape1);
   * scene.add(shape2);
   * scene.fillEffect(255, 0, 0, 128); // Fill entire scene with semi-transparent red
   * ```
   */
  public fillEffect(r: number, g: number, b: number, a: number): this {
    const Module = getModule();
    const result = Module._tvg_scene_add_effect_fill(this.ptr, r, g, b, a);
    checkResult(result, 'fillEffect');
    return this;
  }

  /**
   * Apply a tint effect to the scene using black and white color parameters.
   *
   * @param blackR - Black tint red component (0-255)
   * @param blackG - Black tint green component (0-255)
   * @param blackB - Black tint blue component (0-255)
   * @param whiteR - White tint red component (0-255)
   * @param whiteG - White tint green component (0-255)
   * @param whiteB - White tint blue component (0-255)
   * @param intensity - Tint intensity (0-100)
   * @returns The Scene instance for method chaining
   *
   * @example
   * ```typescript
   * const scene = new TVG.Scene();
   * scene.add(picture);
   * // Apply sepia-like tint
   * scene.tint(112, 66, 20, 255, 236, 184, 50);
   * ```
   */
  public tint(blackR: number, blackG: number, blackB: number, whiteR: number, whiteG: number, whiteB: number, intensity: number): this {
    const Module = getModule();
    const result = Module._tvg_scene_add_effect_tint(this.ptr, blackR, blackG, blackB, whiteR, whiteG, whiteB, intensity);
    checkResult(result, 'tint');
    return this;
  }

  /**
   * Apply a tritone color effect to the scene using three color parameters for shadows, midtones, and highlights.
   * A blending factor determines the mix between the original color and the tritone colors.
   *
   * @param shadowR - Shadow red component (0-255)
   * @param shadowG - Shadow green component (0-255)
   * @param shadowB - Shadow blue component (0-255)
   * @param midtoneR - Midtone red component (0-255)
   * @param midtoneG - Midtone green component (0-255)
   * @param midtoneB - Midtone blue component (0-255)
   * @param highlightR - Highlight red component (0-255)
   * @param highlightG - Highlight green component (0-255)
   * @param highlightB - Highlight blue component (0-255)
   * @param blend - Blend factor (0-255)
   * @returns The Scene instance for method chaining
   *
   * @example
   * ```typescript
   * const scene = new TVG.Scene();
   * scene.add(picture);
   * // Apply tritone: dark blue shadows, gray midtones, yellow highlights
   * scene.tritone(0, 0, 128, 128, 128, 128, 255, 255, 0, 128);
   * ```
   */
  public tritone(shadowR: number, shadowG: number, shadowB: number, midtoneR: number, midtoneG: number, midtoneB: number, highlightR: number, highlightG: number, highlightB: number, blend: number): this {
    const Module = getModule();
    const result = Module._tvg_scene_add_effect_tritone(this.ptr, shadowR, shadowG, shadowB, midtoneR, midtoneG, midtoneB, highlightR, highlightG, highlightB, blend);
    checkResult(result, 'tritone');
    return this;
  }
}
