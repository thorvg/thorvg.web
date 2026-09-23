/*
 * Copyright (c) 2025 - 2026 ThorVG project. All rights reserved.

 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

import { customElement, property } from 'lit/decorators.js';
import { BaseLottiePlayer, RenderConfig as BaseRenderConfig, Renderer } from './base-lottie-player';

/**
 * Sets the number of worker threads for the multi-threaded build.
 * Must be called before the WASM module is initialized.
 * @param threads Number of worker threads.
 * @beta
 */
export function setThreadCount(threads: number): void {
  globalThis.__THORVG_THREAD_COUNT = threads;
}

/**
 * Gets the configured worker thread count.
 * @beta
 */
export function getThreadCount(): number {
  return globalThis.__THORVG_THREAD_COUNT ?? 0;
}

export type RenderConfig = Omit<BaseRenderConfig, 'renderer'>;

@customElement('lottie-player')
export class LottiePlayer extends BaseLottiePlayer {
  /**
   * Sets the rendering configurations.
   * @since 1.0
   */
  @property({ type: Object })
  public set renderConfig(value: RenderConfig) {
    this.config = {
      renderer: '__RENDERER__' as Renderer,
      enableDevicePixelRatio: value.enableDevicePixelRatio
    };
  }

  /**
   * Gets the current rendering configuration.
   * @since 1.0
   */
  public get renderConfig(): RenderConfig {
    return this.config || {};
  }
}

export type { AudioInfo, FileType, LibraryVersion, PlayMode, PlayerState } from './base-lottie-player';
