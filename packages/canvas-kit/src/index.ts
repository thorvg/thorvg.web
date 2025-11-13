/**
 * ThorVG Canvas Kit - TypeScript API for ThorVG
 *
 * @packageDocumentation
 *
 * A high-performance TypeScript Canvas API for ThorVG, providing an object-oriented
 * interface with fluent API pattern for vector graphics rendering using WebAssembly.
 *
 * ## Features
 *
 * - **Intuitive OOP API** - Fluent interface with method chaining
 * - **Type-Safe** - Full TypeScript support with strict typing
 * - **High Performance** - WebGPU, WebGL, and Software rendering backends
 * - **Automatic Memory Management** - FinalizationRegistry for garbage collection
 * - **Method Chaining** - Ergonomic fluent API design
 * - **Zero Overhead** - Direct WASM bindings with minimal abstraction
 * - **Animation Support** - Frame-based Lottie animation playback
 * - **Rich Primitives** - Shapes, scenes, pictures, text, and gradients
 *
 * @example
 * ```typescript
 * import ThorVG from '@thorvg/canvas-kit';
 *
 * // Initialize ThorVG
 * const TVG = await ThorVG.init({
 *   locateFile: (path) => `/wasm/${path}`,
 *   renderer: 'gl'
 * });
 *
 * // Create canvas and draw
 * const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });
 * const shape = new TVG.Shape();
 * shape.appendRect(100, 100, 200, 150)
 *      .fill(255, 0, 0, 255);
 * canvas.add(shape).render();
 * ```
 *
 * @module
 */

import type { ThorVGModule } from './types/emscripten';
import { Canvas } from './canvas/Canvas';
import { Shape } from './paint/Shape';
import { Scene } from './paint/Scene';
import { Picture } from './paint/Picture';
import { Text } from './paint/Text';
import { Animation } from './animation/Animation';
import { LinearGradient } from './fill/LinearGradient';
import { RadialGradient } from './fill/RadialGradient';
import { Font } from './core/Font';
import * as constants from './constants';
// @ts-ignore - thorvg.js is generated during build
import ThorVGModuleFactory from '../dist/thorvg.js';

/**
 * @category Initialization
 */
export interface InitOptions {
  /** Optional function to locate WASM files. If not provided, assumes WASM files are in the same directory as the JavaScript bundle. */
  locateFile?: (path: string) => string;
  /** Renderer type: 'sw' (Software), 'gl' (WebGL), or 'wg' (WebGPU). Default: 'gl'. WebGPU provides best performance but requires Chrome 113+ or Edge 113+. */
  renderer?: 'sw' | 'gl' | 'wg';
}

export interface ThorVGNamespace {
  Canvas: typeof Canvas;
  Shape: typeof Shape;
  Scene: typeof Scene;
  Picture: typeof Picture;
  Text: typeof Text;
  Animation: typeof Animation;
  LinearGradient: typeof LinearGradient;
  RadialGradient: typeof RadialGradient;
  Font: typeof Font;
  term(): void;
}

let Module: ThorVGModule | null = null;
let initialized = false;

/**
 * Internal function to initialize ThorVG engine
 * For WebGPU renderer, this handles async initialization
 * For SW/GL renderers, this is a no-op
 */
async function initEngine(engineType: 'sw' | 'gl' | 'wg' = 'gl'): Promise<void> {
  if (!Module) {
    throw new Error('ThorVG module not loaded. Call init() first.');
  }

  // SW and GL renderers don't need module initialization
  if (engineType !== 'wg') {
    return;
  }

  // WebGPU requires async initialization
  let status: number;
  let attempts = 0;
  const MAX_ATTEMPTS = 50;

  do {
    status = Module.init();
    if (status === 2) {
      // WebGPU initialization pending, wait and retry
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
  } while (status === 2 && attempts < MAX_ATTEMPTS);

  if (status === 1) {
    throw new Error('ThorVG WebGPU initialization failed');
  }
}

/**
 * Initialize ThorVG WASM module and rendering engine.
 *
 * This is the entry point for using ThorVG Canvas Kit. It loads the WebAssembly module
 * and initializes the rendering engine with the specified backend (Software, WebGL, or WebGPU).
 *
 * @category Initialization
 * @param options - Initialization options
 * @param options.locateFile - Optional function to locate WASM files. If not provided, assumes
 *                              WASM files are in the same directory as the JavaScript bundle.
 * @param options.renderer - Renderer type: 'sw' (Software), 'gl' (WebGL), or 'wg' (WebGPU).
 *                           Default: 'gl'. WebGPU provides best performance but requires
 *                           Chrome 113+ or Edge 113+.
 *
 * @returns Promise that resolves to ThorVG namespace containing all classes and utilities
 *
 * @example
 * ```typescript
 * // Initialize with default WebGL renderer
 * const TVG = await ThorVG.init();
 * const canvas = new TVG.Canvas('#canvas');
 * ```
 *
 * @example
 * ```typescript
 * // Initialize with custom WASM file location
 * const TVG = await ThorVG.init({
 *   locateFile: (path) => `/public/wasm/${path}`,
 *   renderer: 'gl'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Initialize with WebGPU for maximum performance
 * const TVG = await ThorVG.init({
 *   locateFile: (path) => '../dist/' + path.split('/').pop(),
 *   renderer: 'wg'
 * });
 * ```
 *
 * @example
 * ```typescript
 * // Initialize with Software renderer for maximum compatibility
 * const TVG = await ThorVG.init({
 *   renderer: 'sw'
 * });
 * ```
 *
 * @throws {Error} If WASM module fails to load or engine initialization fails
 */
async function init(options: InitOptions = {}): Promise<ThorVGNamespace> {
  if (initialized) {
    console.warn('ThorVG already initialized');
    return createNamespace();
  }

  const { locateFile, renderer = 'gl' } = options;

  // Load WASM module
  Module = await ThorVGModuleFactory({
    locateFile: locateFile ?? ((path: string) => path),
  }) as unknown as ThorVGModule;

  // Make Module globally available for class constructors
  (globalThis as any).__ThorVGModule = Module;
  initialized = true;

  const namespace = createNamespace();

  // Automatically initialize the engine with specified renderer
  await initEngine(renderer);

  return namespace;
}

/**
 * Terminate ThorVG WASM module
 * After calling this, you must call init() again to use ThorVG
 */
function term(): void {
  if (!initialized || !Module) {
    console.warn('ThorVG not initialized, nothing to terminate');
    return;
  }

  // Terminate ThorVG engine
  Module.term();

  // Clear global reference
  if ((globalThis as any).__ThorVGModule) {
    delete (globalThis as any).__ThorVGModule;
  }

  // Reset state
  Module = null;
  initialized = false;
}

/**
 * Create namespace with all classes
 */
function createNamespace(): ThorVGNamespace {
  return {
    Canvas,
    Shape,
    Scene,
    Picture,
    Text,
    Animation,
    LinearGradient,
    RadialGradient,
    Font,
    term,
  };
}

// Main export object
const ThorVG = {
  init,
};

export default ThorVG;

// Named exports for advanced usage
export { init, Canvas, Shape, Scene, Picture, Text, Animation, LinearGradient, RadialGradient, Font, constants };

// Re-export types
export type { CanvasOptions } from './canvas/Canvas';
export type { Bounds } from './paint/Paint';
export type { RectOptions, StrokeOptions } from './paint/Shape';
export type { LoadDataOptions, PictureFormat, PictureSize } from './paint/Picture';
export type { TextAlign, TextLayout, TextOutline } from './paint/Text';
export type { AnimationInfo, AnimationSegment } from './animation/Animation';
export type { LoadFontOptions, FontFormat } from './core/Font';
export type { ColorStop } from './fill/Fill';
/** @category Canvas */
export type { RendererType } from './constants';
/** @category Shape */
export type { StrokeCapType, StrokeJoinType, FillRuleType } from './constants';
/** @category Gradients */
export type { GradientSpreadType } from './constants';
/** @category Text */
export type { TextWrapModeType } from './constants';

// Re-export enums with categories
/** @category Constants */
export { BlendMethod } from './constants';
/** @category Constants */
export { CompositeMethod } from './constants';
/** @category Shape */
export { StrokeCap } from './constants';
/** @category Shape */
export { StrokeJoin } from './constants';
/** @category Shape */
export { FillRule } from './constants';
/** @category Gradients */
export { GradientSpread } from './constants';
/** @category Text */
export { TextWrapMode } from './constants';
