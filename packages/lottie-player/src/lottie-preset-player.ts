/*
 * Copyright (c) 2025 the ThorVG project. All rights reserved.

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
import { BaseLottiePlayer, RenderConfig, Renderer } from './base-lottie-player';

type PresetRenderConfig = Exclude<RenderConfig, 'renderer'>;

@customElement('lottie-player')
export class LottiePresetPlayer extends BaseLottiePlayer {
  /**
   * Sets the rendering configurations.
   * @since 1.0
   */
  @property({ type: Object })
  public set renderConfig(value: PresetRenderConfig) {
    this.config = {
      renderer: '__RENDERER__' as Renderer,
      enableDevicePixelRatio: value.enableDevicePixelRatio
    };
  }

  /**
   * Gets the current rendering configuration.
   * @since 1.0
   */
  public get renderConfig(): PresetRenderConfig {
    return this.config || {};
  }
}
