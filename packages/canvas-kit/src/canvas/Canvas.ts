/**
 * Canvas class for rendering ThorVG content
 */

import { getModule } from '../core/Module';
import { Paint } from '../paint/Paint';
import type { RendererType } from '../constants';
import { checkResult } from '../core/errors';
import type { ThorVGEngineInstance } from '../types/emscripten';

const DEFAULT_RENDERER: RendererType = 'gl';

export interface CanvasOptions {
  renderer?: RendererType;
  width?: number;
  height?: number;
}

export class Canvas {
  #ptr: number = 0;
  #engine: ThorVGEngineInstance | null = null;
  #renderer: RendererType = DEFAULT_RENDERER;
  #htmlCanvas: HTMLCanvasElement | null = null;

  constructor(selector: RendererType, options: CanvasOptions = {}) {
    const { renderer = DEFAULT_RENDERER, width = 800, height = 600 } = options;

    // Module should already be initialized by ThorVG.init()
    const Module = getModule();

    // Create engine wrapper
    this.#engine = new Module.ThorVGEngine();
    this.#ptr = this.#engine.createCanvas(renderer, selector, width, height);

    if (this.#ptr === 0) {
      throw new Error(`Failed to create canvas with ${renderer} renderer`);
    }

    this.#renderer = renderer;
    this.#htmlCanvas = document.querySelector(selector);
  }

  /**
   * Add paints to the canvas
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
   * Remove paint(s) from the canvas
   * If no paint is provided, removes all paints
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
   * Clear all paints from the canvas
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
   * Update the canvas (required before rendering, especially for animations)
   * FIXME: Can be removed if we can call this in render()
   */
  public update(): this {
    const Module = getModule();
    const result = Module._tvg_canvas_update(this.#ptr);
    checkResult(result, 'update');
    return this;
  }

  /**
   * Render the canvas
   * Note: For animations, call update() first, then render()
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
   * Resize the canvas
   */
  public resize(width: number, height: number): this {
    if (this.#engine) {
      this.#engine.resize(width, height);
    }
    return this;
  }

  /**
   * Set viewport for rendering
   */
  public viewport(x: number, y: number, w: number, h: number): this {
    const Module = getModule();
    const result = Module._tvg_canvas_set_viewport(this.#ptr, x, y, w, h);
    checkResult(result, 'viewport');
    return this;
  }

  /**
   * Destroy this canvas and free its WASM memory
   * Module stays alive, you can create new canvas
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
   * Get the renderer being used
   */
  public get renderer(): string {
    return this.#renderer;
  }
}
