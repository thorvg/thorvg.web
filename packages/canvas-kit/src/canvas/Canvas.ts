/**
 * Canvas rendering context for ThorVG vector graphics.
 *
 * The Canvas class manages the rendering context and provides methods for drawing
 * vector graphics to an HTML canvas element. It supports multiple rendering backends
 * (Software, WebGL, WebGPU) and handles the render loop.
 *
 * @category Canvas
 *
 * @example
 * Basic usage
 * ```typescript
 * const TVG = await ThorVG.init();
 * const canvas = new TVG.Canvas('#canvas', {
 *   renderer: 'gl',
 *   width: 800,
 *   height: 600
 * });
 *
 * const shape = new TVG.Shape();
 * shape.appendCircle(400, 300, 100)
 *      .fill(255, 0, 0, 255);
 *
 * canvas.add(shape).render();
 * ```
 *
 * @example
 * Rendering with animation loop
 * ```typescript
 * const canvas = new TVG.Canvas('#canvas');
 * const animation = new TVG.Animation();
 * await animation.load(lottieData);
 *
 * canvas.add(animation.picture);
 *
 * function animate() {
 *   animation.frame(currentFrame++);
 *   canvas.update().render();
 *   requestAnimationFrame(animate);
 * }
 * animate();
 * ```
 */

import { getModule } from '../core/Module';
import { Paint } from '../paint/Paint';
import type { RendererType } from '../constants';
import { checkResult } from '../core/errors';
import type { TvgCanvasInstance } from '../types/emscripten';

const DEFAULT_RENDERER: RendererType = 'gl';

/**
 * Configuration options for Canvas initialization.
 *
 * @category Canvas
 */
export interface CanvasOptions {
  /** Rendering backend: 'sw' (Software), 'gl' (WebGL), or 'wg' (WebGPU). Default: 'gl' */
  renderer?: RendererType;
  /** Canvas width in pixels. Default: 800 */
  width?: number;
  /** Canvas height in pixels. Default: 600 */
  height?: number;
}

/**
 * Canvas rendering context for ThorVG vector graphics.
 *
 * Manages the rendering pipeline and provides methods for adding/removing Paint objects
 * and controlling the render loop.
 *
 * @category Canvas
 *
 * @example
 * ```typescript
 * // Basic canvas setup with shapes
 * const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });
 *
 * const shape = new TVG.Shape();
 * shape.appendRect(100, 100, 200, 150, 10)
 *      .fill(255, 100, 50, 255);
 *
 * canvas.add(shape).render();
 * ```
 *
 * @example
 * ```typescript
 * // Animation loop
 * const canvas = new TVG.Canvas('#canvas');
 * const shape = new TVG.Shape();
 *
 * let rotation = 0;
 * function animate() {
 *   shape.reset()
 *        .appendRect(0, 0, 100, 100)
 *        .fill(100, 150, 255, 255)
 *        .rotate(rotation++)
 *        .translate(400, 300);
 *
 *   canvas.update().render();
 *   requestAnimationFrame(animate);
 * }
 * animate();
 * ```
 */
export class Canvas {
  #ptr: number = 0;
  #engine: TvgCanvasInstance | null = null;
  #renderer: RendererType = DEFAULT_RENDERER;
  #htmlCanvas: HTMLCanvasElement | null = null;

  /**
   * Creates a new Canvas rendering context.
   *
   * @param selector - CSS selector for the target HTML canvas element (e.g., '#canvas', '.my-canvas')
   * @param options - Configuration options for the canvas
   *
   * @throws {Error} If the canvas element is not found or renderer initialization fails
   *
   * @example
   * ```typescript
   * // Basic canvas with default options
   * const canvas = new TVG.Canvas('#canvas');
   * ```
   *
   * @example
   * ```typescript
   * // Canvas with WebGPU renderer and custom size
   * const canvas = new TVG.Canvas('#myCanvas', {
   *   renderer: 'wg',
   *   width: 1920,
   *   height: 1080
   * });
   * ```
   */
  constructor(selector: string, options: CanvasOptions = {}) {
    const { renderer = DEFAULT_RENDERER, width = 800, height = 600 } = options;

    // Module should already be initialized by ThorVG.init()
    const Module = getModule();

    // Create TvgCanvas with constructor (engine type, selector, width, height)
    this.#engine = new Module.TvgCanvas(renderer, selector, width, height);

    // Check for errors
    const error = this.#engine.error();
    if (error !== 'None') {
      throw new Error(`Failed to create canvas with ${renderer} renderer: ${error}`);
    }

    // Get canvas pointer
    this.#ptr = this.#engine.ptr();

    if (this.#ptr === 0) {
      throw new Error(`Failed to create canvas with ${renderer} renderer`);
    }

    this.#renderer = renderer;
    this.#htmlCanvas = document.querySelector(selector);
  }

  /**
   * Adds one or more Paint objects to the canvas for rendering.
   *
   * Paint objects include Shape, Scene, Picture, Text, and Animation.picture.
   * Objects are rendered in the order they are added (painter's algorithm).
   *
   * @param paints - One or more Paint objects to add to the canvas
   * @returns The canvas instance for method chaining
   *
   * @example
   * ```typescript
   * const shape = new TVG.Shape();
   * const text = new TVG.Text();
   * canvas.add(shape, text);
   * ```
   *
   * @example
   * Method chaining
   * ```typescript
   * canvas.add(shape1)
   *       .add(shape2)
   *       .render();
   * ```
   */
  public add(...paints: Paint[]): this {
    const Module = getModule();
    for (const paint of paints) {
      const result = Module._tvg_canvas_push(this.#ptr, paint.ptr);
      checkResult(result, 'add');
    }
    return this;
  }

  /**
   * Removes one or all Paint objects from the canvas.
   *
   * @param paint - Optional Paint object to remove. If omitted, removes all Paint objects.
   * @returns The canvas instance for method chaining
   *
   * @example
   * Remove a specific paint
   * ```typescript
   * canvas.remove(shape);
   * ```
   *
   * @example
   * Remove all paints
   * ```typescript
   * canvas.remove();
   * ```
   */
  public remove(paint?: Paint): this {
    if (paint) {
      const Module = getModule();
      const result = Module._tvg_canvas_remove(this.#ptr, paint.ptr);
      checkResult(result, 'remove');
    } else {
      if (this.#engine) {
        this.#engine.clear();
      }
    }
    return this;
  }

  /**
   * Clears all Paint objects from the canvas and renders an empty frame.
   *
   * This is equivalent to {@link remove | remove()} without arguments,
   * but also immediately renders the cleared canvas.
   *
   * @returns The canvas instance for method chaining
   *
   * @example
   * ```typescript
   * canvas.clear(); // Clears and renders empty canvas
   * ```
   */
  public clear(): this {
    if (!this.#engine) {
      return this;
    }

    const Module = getModule();

    this.#engine.clear();
    Module._tvg_canvas_draw(this.#ptr, 1);
    Module._tvg_canvas_sync(this.#ptr);

    // For SW backend, also clear the HTML canvas
    if (this.#renderer === 'sw' && this.#htmlCanvas) {
        const ctx = this.#htmlCanvas?.getContext('2d') as CanvasRenderingContext2D;
        ctx.clearRect(0, 0, this.#htmlCanvas.width, this.#htmlCanvas.height);
    }

    return this;
  }

  /**
   * Updates the canvas state before rendering.
   *
   * This method should be called before {@link render} when working with animations
   * or when Paint objects have been modified. It ensures all transformations and
   * changes are processed.
   *
   * @returns The canvas instance for method chaining
   *
   * @example
   * Animation loop pattern
   * ```typescript
   * function animate() {
   *   animation.frame(currentFrame++);
   *   canvas.update().render();
   *   requestAnimationFrame(animate);
   * }
   * ```
   *
   * @remarks
   * For static scenes, calling {@link render} alone is sufficient.
   * For animated content, always call update() before render().
   */
  public update(): this {
    const Module = getModule();
    const result = Module._tvg_canvas_update(this.#ptr);
    checkResult(result, 'update');
    return this;
  }

  /**
   * Renders all Paint objects to the canvas.
   *
   * This method draws all added Paint objects to the canvas using the configured
   * rendering backend (Software, WebGL, or WebGPU).
   *
   * @returns The canvas instance for method chaining
   *
   * @example
   * Static rendering
   * ```typescript
   * canvas.add(shape, text).render();
   * ```
   *
   * @example
   * Animation loop
   * ```typescript
   * function animate() {
   *   canvas.update().render();
   *   requestAnimationFrame(animate);
   * }
   * ```
   *
   * @remarks
   * For animated content, call {@link update} before render().
   * For static scenes, render() can be called directly.
   */
  public render(): this {
    const Module = getModule();

    Module._tvg_canvas_draw(this.#ptr, 1);
    Module._tvg_canvas_sync(this.#ptr);

    // For SW backend, copy to HTML canvas
    if (this.#renderer === 'sw') {
      this._updateHTMLCanvas();
    }

    return this;
  }

  private _updateHTMLCanvas(): void {
    if (!this.#engine || !this.#htmlCanvas) return;

    const buffer = this.#engine.render() as unknown as ArrayBuffer; //TODO: FIX
    const size = this.#engine.size();
    
    const ctx = this.#htmlCanvas.getContext('2d') as CanvasRenderingContext2D;
    const imageData = new ImageData(
      new Uint8ClampedArray(buffer),
      size.width,
      size.height
    );
    ctx.putImageData(imageData, 0, 0);
  }

  /**
   * Resizes the canvas to new dimensions.
   *
   * @param width - New width in pixels
   * @param height - New height in pixels
   * @returns The canvas instance for method chaining
   *
   * @example
   * ```typescript
   * canvas.resize(1920, 1080).render();
   * ```
   *
   * @example
   * Responsive canvas
   * ```typescript
   * window.addEventListener('resize', () => {
   *   canvas.resize(window.innerWidth, window.innerHeight).render();
   * });
   * ```
   */
  public resize(width: number, height: number): this {
    if (this.#engine) {
      this.#engine.resize(width, height);
    }
    return this;
  }

  /**
   * Sets the viewport for rendering a specific region of the canvas.
   *
   * The viewport defines the rectangular region where rendering occurs.
   * Useful for rendering to a portion of the canvas or implementing split-screen views.
   *
   * @param x - X coordinate of the viewport origin
   * @param y - Y coordinate of the viewport origin
   * @param w - Viewport width
   * @param h - Viewport height
   * @returns The canvas instance for method chaining
   *
   * @example
   * ```typescript
   * // Render to top-left quarter of canvas
   * canvas.viewport(0, 0, canvas.width / 2, canvas.height / 2);
   * ```
   */
  public viewport(x: number, y: number, w: number, h: number): this {
    const Module = getModule();
    const result = Module._tvg_canvas_set_viewport(this.#ptr, x, y, w, h);
    checkResult(result, 'viewport');
    return this;
  }

  /**
   * Destroys the canvas and frees its WASM memory.
   *
   * After calling destroy(), this canvas instance cannot be used.
   * The ThorVG module remains loaded and new canvases can be created.
   *
   * @example
   * ```typescript
   * canvas.destroy();
   * // Create a new canvas
   * const newCanvas = new TVG.Canvas('#canvas');
   * ```
   *
   * @remarks
   * This method should be called when you're done with a canvas to free memory.
   * It's particularly important in single-page applications where canvases
   * may be created and destroyed frequently.
   */
  public destroy(): void {
    // Clear all paints from canvas
    this.clear();

    // Delete canvas
    if (this.#ptr) {
      // Canvas is deleted automatically by ThorVGEngine
      this.#ptr = 0;
    }

    // Cleanup engine
    if (this.#engine) {
      this.#engine.delete();
      this.#engine = null;
    }

    // Clear HTML canvas if SW backend
    if (this.#htmlCanvas && this.#renderer === 'sw') {
      const ctx = this.#htmlCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, this.#htmlCanvas.width, this.#htmlCanvas.height);
      }
    }
  }

  /**
   * Gets the rendering backend type currently in use.
   *
   * @returns The renderer type: 'sw' (Software), 'gl' (WebGL), or 'wg' (WebGPU)
   *
   * @example
   * ```typescript
   * const canvas = new TVG.Canvas('#canvas', { renderer: 'wg' });
   * console.log(canvas.renderer); // 'wg'
   * ```
   */
  public get renderer(): string {
    return this.#renderer;
  }
}
