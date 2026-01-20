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
 * const TVG = await ThorVG.init({ renderer: 'gl' });
 * const canvas = new TVG.Canvas('#canvas', {
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
import { Scene } from '../paint/Scene';
import type { RendererType } from '../constants';
import { checkResult } from '../core/errors';
import type { TvgCanvasInstance } from '../types/emscripten';
import { getGlobalRenderer, getGlobalThreadCount } from '../index';

/**
 * Configuration options for Canvas initialization.
 *
 * @category Canvas
 */
export interface CanvasOptions {
  /** Canvas width in pixels. Default: 800 */
  width?: number;
  /** Canvas height in pixels. Default: 600 */
  height?: number;
  /** Enable device pixel ratio for high-DPI displays. Default: true */
  enableDevicePixelRatio?: boolean;
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
 * // Initialize with renderer
 * const TVG = await ThorVG.init({ renderer: 'gl' });
 *
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
  #renderer: RendererType;
  #htmlCanvas: HTMLCanvasElement | null = null;
  #enableDevicePixelRatio: boolean;
  #mainScene: Scene | null = null;
  #logicalWidth: number = 0;
  #logicalHeight: number = 0;
  #currentDPR: number = 1;
  #needsUpdate: boolean = false;

  /**
   * Creates a new Canvas rendering context.
   *
   * The renderer is determined by the global setting from ThorVG.init().
   *
   * @param selector - CSS selector for the target HTML canvas element (e.g., '#canvas', '.my-canvas')
   * @param options - Configuration options for the canvas
   *
   * @throws {Error} If the canvas element is not found or renderer initialization fails
   *
   * @example
   * ```typescript
   * // Initialize with renderer
   * const TVG = await ThorVG.init({ renderer: 'gl' });
   *
   * // Basic canvas with default options (DPR enabled by default)
   * const canvas = new TVG.Canvas('#canvas');
   * ```
   *
   * @example
   * ```typescript
   * // Canvas with custom size
   * const TVG = await ThorVG.init({ renderer: 'wg' });
   * const canvas = new TVG.Canvas('#myCanvas', {
   *   width: 1920,
   *   height: 1080
   * });
   * ```
   *
   * @example
   * ```typescript
   * // Canvas with DPR disabled for consistent rendering across devices
   * const canvas = new TVG.Canvas('#canvas', {
   *   width: 800,
   *   height: 600,
   *   enableDevicePixelRatio: false
   * });
   * ```
   */
  constructor(selector: string, options: CanvasOptions = {}) {
    const { width = 800, height = 600, enableDevicePixelRatio = true } = options;

    // Store logical dimensions
    this.#logicalWidth = width;
    this.#logicalHeight = height;
    this.#enableDevicePixelRatio = enableDevicePixelRatio;

    // Get the global renderer set during ThorVG.init()
    const renderer = getGlobalRenderer();
    this.#renderer = renderer;

    // Get the global thread count set during ThorVG.init()
    const threadCount = getGlobalThreadCount();

    // Module should already be initialized by ThorVG.init()
    const Module = getModule();

    // Calculate DPR and physical dimensions
    const dpr = enableDevicePixelRatio ? this._calculateDPR() : 1;
    this.#currentDPR = dpr;

    const physicalWidth = width * dpr;
    const physicalHeight = height * dpr;

    // Create TvgCanvas with physical dimensions and thread count
    this.#engine = new Module.TvgCanvas(renderer, selector, physicalWidth, physicalHeight, threadCount);

    // Check for errors
    const error = this.#engine.error();
    if (error !== 'None') {
      throw new Error(`Failed to create canvas with ${renderer} renderer: ${error}`);
    }

    // Get canvas pointer
    this.#ptr = this.#engine.ptr();

    if (this.#ptr === 0) {
      throw new Error(`Failed to create canvas with ${renderer} renderer: engine pointer is 0`);
    }

    this.#htmlCanvas = document.querySelector(selector);
    if (!this.#htmlCanvas) {
      throw new Error(`Failed to create canvas with ${renderer} renderer: HTML canvas element not found`);
    }

    // Set CSS dimensions to logical size
    this.#htmlCanvas.style.width = `${width}px`;
    this.#htmlCanvas.style.height = `${height}px`;

    // Set canvas pixel dimensions to physical size
    this.#htmlCanvas.width = physicalWidth;
    this.#htmlCanvas.height = physicalHeight;

    // Create main Scene
    this.#mainScene = new Scene();

    // Apply DPR scale transform if enabled
    if (enableDevicePixelRatio) {
      this.#mainScene.scale(dpr, dpr);
    }

    // Add main Scene to canvas
    const result = Module._tvg_canvas_add(this.#ptr, this.#mainScene.ptr);
    checkResult(result, 'add main scene');
  }

  /**
   * Adds a Paint object to the canvas for rendering.
   *
   * Paint objects include Shape, Scene, Picture, Text, and Animation.picture.
   * Objects are rendered in the order they are added (painter's algorithm).
   *
   * @param paint - A Paint object to add to the canvas
   * @returns The canvas instance for method chaining
   *
   * @example
   * ```typescript
   * const shape = new TVG.Shape();
   * const text = new TVG.Text();
   * canvas.add(shape);
   * canvas.add(text);
   * ```
   *
   * @example
   * ```typescript
   * // Method chaining
   * canvas.add(shape1)
   *       .add(shape2)
   *       .render();
   * ```
   */
  public add(paint: Paint): this {
    if (!this.#mainScene) {
      throw new Error('Main scene not initialized');
    }

    // Add paint to main Scene instead of directly to canvas
    this.#mainScene.add(paint);
    this.#needsUpdate = true;
    return this;
  }

  /**
   * Removes one or all Paint objects from the canvas.
   *
   * @param paint - Optional Paint object to remove. If omitted, removes all Paint objects.
   * @returns The canvas instance for method chaining
   *
   * @example
   * ```typescript
   * // Remove a specific paint
   * canvas.remove(shape);
   * ```
   *
   * @example
   * ```typescript
   * // Remove all paints
   * canvas.remove();
   * ```
   */
  public remove(paint?: Paint): this {
    if (!this.#mainScene) {
      throw new Error('Main scene not initialized');
    }

    if (paint) {
      this.#mainScene.remove(paint);
    } else {
      this.#mainScene.remove();
    }
    this.#needsUpdate = true;
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
    if (!this.#engine || !this.#mainScene) {
      return this;
    }

    const Module = getModule();

    // Clear all paints from main Scene
    this.#mainScene.clear();

    // Render empty frame
    Module._tvg_canvas_draw(this.#ptr, 1);
    Module._tvg_canvas_sync(this.#ptr);

    // For SW backend, also clear the HTML canvas
    if (this.#renderer === 'sw' && this.#htmlCanvas) {
      const ctx = this.#htmlCanvas.getContext('2d') as CanvasRenderingContext2D;
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
   * ```typescript
   * // Animation loop pattern
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
   * ```typescript
   * // Static rendering
   * canvas.add(shape).add(text).render();
   * ```
   *
   * @example
   * ```typescript
   * // Animation loop
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
    if (!this.#engine || !this.#htmlCanvas || !this.#mainScene) {
      return this;
    }

    const Module = getModule();

    // Auto-update if main Scene contents changed
    if (this.#needsUpdate) {
      Module._tvg_canvas_update(this.#ptr);
      this.#needsUpdate = false;
    }

    if (this.#enableDevicePixelRatio) {
      const dpr = this._calculateDPR();

      // Apply new DPR when it's changed
      if (dpr !== this.#currentDPR) {
        this.#currentDPR = dpr;

        // Update main Scene scale with new DPR
        const matrix = {
          e11: dpr, e12: 0, e13: 0,
          e21: 0, e22: dpr, e23: 0,
          e31: 0, e32: 0, e33: 1,
        };
        this.#mainScene.transform(matrix);
      }

      // Calculate physical dimensions
      const physicalWidth = this.#logicalWidth * dpr;
      const physicalHeight = this.#logicalHeight * dpr;

      // Update canvas pixel dimensions if changed
      if (
        this.#htmlCanvas.width !== physicalWidth ||
        this.#htmlCanvas.height !== physicalHeight
      ) {
        this.#htmlCanvas.width = physicalWidth;
        this.#htmlCanvas.height = physicalHeight;
        this.#engine.resize(physicalWidth, physicalHeight);
      }
    }

    Module._tvg_canvas_draw(this.#ptr, 1);
    Module._tvg_canvas_sync(this.#ptr);

    // For SW backend, copy to HTML canvas
    if (this.#renderer === 'sw') {
      this._updateHTMLCanvas();
    }

    return this;
  }

  private _calculateDPR(): number {
    // ThorVG DPR formula: interpolate between 1.0 and devicePixelRatio using a 0.75 factor
    return 1 + ((window.devicePixelRatio - 1) * 0.75);
  }

  private _updateHTMLCanvas(): void {
    if (!this.#engine || !this.#htmlCanvas) return;

    const buffer = this.#engine.render();
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
   * ```typescript
   * // Responsive canvas
   * window.addEventListener('resize', () => {
   *   canvas.resize(window.innerWidth, window.innerHeight).render();
   * });
   * ```
   */
  public resize(width: number, height: number): this {
    // Update logical dimensions
    this.#logicalWidth = width;
    this.#logicalHeight = height;

    if (this.#htmlCanvas) {
      // Update CSS dimensions to logical size
      this.#htmlCanvas.style.width = `${width}px`;
      this.#htmlCanvas.style.height = `${height}px`;

      // Calculate physical dimensions
      const dpr = this.#enableDevicePixelRatio ? this.#currentDPR : 1;
      const physicalWidth = width * dpr;
      const physicalHeight = height * dpr;

      // Set canvas pixel dimensions to physical size
      this.#htmlCanvas.width = physicalWidth;
      this.#htmlCanvas.height = physicalHeight;

      if (this.#engine) {
        this.#engine.resize(physicalWidth, physicalHeight);
      }
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
    // Clear main Scene first
    if (this.#mainScene) {
      this.#mainScene.clear();
      this.#mainScene.dispose();
      this.#mainScene = null;
    }

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

  /**
   * Gets the current device pixel ratio applied to this canvas.
   *
   * ThorVG uses an optimized DPR formula for best performance:
   * `1 + ((window.devicePixelRatio - 1) * 0.75)`
   *
   * This provides a balance between visual quality and rendering performance,
   * especially on high-DPI displays.
   *
   * @category Canvas
   * @returns The current effective DPR value, or 1.0 if DPR scaling is disabled
   *
   * @example
   * ```typescript
   * // Getting the current DPR
   * const canvas = new TVG.Canvas('#canvas', {
   *   enableDevicePixelRatio: true
   * });
   *
   * console.log(canvas.dpr); // e.g., 1.75 on a 2x display
   * console.log(window.devicePixelRatio); // e.g., 2.0
   * ```
   *
   * @example
   * ```typescript
   * // Using DPR for responsive calculations
   * const canvas = new TVG.Canvas('#canvas');
   * const shape = new TVG.Shape();
   *
   * // Adjust stroke width based on DPR for consistent appearance
   * const strokeWidth = 2 / canvas.dpr;
   * shape.appendCircle(100, 100, 50)
   *      .stroke(255, 0, 0, 255)
   *      .strokeWidth(strokeWidth);
   * ```
   *
   * @see {@link CanvasOptions.enableDevicePixelRatio} for controlling DPR scaling
   */
  public get dpr(): number {
    return this.#currentDPR;
  }
}
