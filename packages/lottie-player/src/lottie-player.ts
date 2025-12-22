/*
 * Copyright (c) 2023 - 2025 the ThorVG project. All rights reserved.

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
import { BaseLottiePlayer, FileType, RenderConfig, Renderer, parseSrc, wasmModule } from './base-lottie-player';

const _downloadFile = (fileName: string, blob: Blob) => {
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

@customElement('lottie-player')
export class LottiePlayer extends BaseLottiePlayer {
  /**
   * Sets the rendering configurations.
   * @since 1.0
   */
  @property({ type: Object })
  public set renderConfig(value: RenderConfig) {
    this.config = value;
  }

  /**
   * Gets the current rendering configuration.
   * @since 1.0
   */
  public get renderConfig(): RenderConfig {
    return this.config || {};
  }

  /**
   * Save current animation to png image
   * @since 1.0
   */
  public save2png(): void {
    if (!this.TVG) {
      return;
    }

    this.canvas!.toBlob((blob: Blob | null) => {
      if (!blob) {
        return;
      }

      _downloadFile('output.png', blob);
    }, 'image/png');
  }

  /**
   * Save current animation to gif image
   * @since 1.0
   */
  public async save2gif(src: string): Promise<void> {
    if (!wasmModule) {
      throw new Error(`Unable to save. Module is not initialized.`);
    }

    const saver = new wasmModule.TvgLottieAnimation(Renderer.SW, `#${this.canvas!.id}`);
    const bytes = await parseSrc(src, FileType.JSON);
    const isExported = saver.save(bytes, 'gif');
    if (!isExported) {
      const error = saver.error();
      saver.delete();
      throw new Error(`Unable to save. Error: ${error}`);
    }

    const data = wasmModule.FS.readFile('output.gif');
    if (data.length < 6) {
      saver.delete();
      throw new Error(
        `Unable to save the GIF data. The generated file size is invalid.`
      );
    }

    const blob = new Blob([data], {type: 'application/octet-stream'});
    _downloadFile('output.gif', blob);
    saver.delete();
  }
}
