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

import { html, PropertyValueMap, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

// @ts-ignore: WASM Glue code doesn't have type & Only available on build progress
import Module from 'thorvg';

type LottieJson = Map<PropertyKey, any>;
type TvgModule = any;

const THORVG_VERSION = '__THORVG_VERSION__';
const DEFAULT_RENDERER = '__RENDERER__';
const _wasmUrl = 'https://unpkg.com/@thorvg/lottie-player@latest/dist/thorvg.wasm';
export let wasmModule: any;
let _moduleRequested: boolean = false;

// Define library version
export interface LibraryVersion {
  THORVG_VERSION: string
}

// Define renderer type
export enum Renderer {
  SW = 'sw',
  WG = 'wg',
  GL = 'gl',
}

// Define initialization status
export enum InitStatus {
  IDLE = 'idle',
  FAILED = 'failed',
  REQUESTED = 'requested',
  INITIALIZED = 'initialized',
}

// Define rendering configurations
export type RenderConfig = {
  enableDevicePixelRatio?: boolean;
  renderer?: Renderer;
}

// Define file type which player can load
export enum FileType {
  JSON = 'json',
  LOT = 'lot',
  JPG = 'jpg',
  PNG = 'png',
  SVG = 'svg',
}

// Define valid player states
export enum PlayerState {
  Destroyed = 'destroyed', // Player is destroyed by `destroy()` method
  Error = 'error', // An error occurred
  Loading = 'loading', // Player is loading
  Paused = 'paused', // Player is paused
  Playing = 'playing', // Player is playing
  Stopped = 'stopped',  // Player is stopped
  Frozen = 'frozen', // Player is paused due to player being invisible
}

// Define play modes
export enum PlayMode {
  Bounce = 'bounce',
  Normal = 'normal',
}

// Define player events
export enum PlayerEvent {
  Complete = 'complete',
  Destroyed = 'destroyed',
  Error = 'error',
  Frame = 'frame',
  Freeze = 'freeze',
  Load = 'load',
  Loop = 'loop',
  Pause = 'pause',
  Play = 'play',
  Ready = 'ready',
  Stop = 'stop',
}

const _parseLottieFromURL = async (url: string): Promise<LottieJson> => {
  if (typeof url !== 'string') {
    throw new Error(`The url value must be a string`);
  }

  try {
    const srcUrl: URL = new URL(url);
    const result = await fetch(srcUrl.toString());
    const json = await result.json();

    return json;
  } catch (err) {
    throw new Error(
      `An error occurred while trying to load the Lottie file from URL`
    );
  }
}

const _parseImageFromURL = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  return response.arrayBuffer();
}

const _parseJSON = async (data: string): Promise<string> => {
  try {
    data = JSON.parse(data);
  } catch (err) {
    const json = await _parseLottieFromURL(data as string);
    data = JSON.stringify(json);
  }

  return data;
}

export const parseSrc = async (src: string | object | ArrayBuffer, fileType: FileType): Promise<Uint8Array> => {
  const encoder = new TextEncoder();
  let data = src;

  switch (typeof data) {
    case 'object':
      if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
      }

      data = JSON.stringify(data);
      return encoder.encode(data);
    case 'string':
      if (fileType === FileType.JSON || fileType === FileType.LOT) {
        data = await _parseJSON(data);
        return encoder.encode(data);
      }

      const buffer = await _parseImageFromURL(data);
      return new Uint8Array(buffer);
    default:
      throw new Error('Invalid src type');
  }
}

const _wait = (timeToDelay: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeToDelay))
};

let _initStatus = InitStatus.IDLE;
const _initModule = async (engine: Renderer) => {
  if (engine !== Renderer.WG) {
    //NOTE: thorvg software/webgl renderer doesn't do anything in the module init(). Skip ASAP.
    return;
  }

  while (_initStatus === InitStatus.REQUESTED) {
    await _wait(100);
  }

  if (_initStatus === InitStatus.INITIALIZED) {
    return;
  }

  _initStatus = InitStatus.REQUESTED;
  while (true) {
    const res = wasmModule.init();
    switch (res) {
      case 0:
        _initStatus = InitStatus.INITIALIZED;
        return;
      case 1:
        _initStatus = InitStatus.FAILED;
        return;
      case 2:
        await _wait(100);
        break;
      default:
    }
  }
}

const _generateUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
}

export class BaseLottiePlayer extends LitElement {
  /**
  * Lottie animation JSON data or URL to JSON.
  * @since 1.0
  */
  @property({ type: String })
  public src?: string;

  /**
   * Custom WASM URL for ThorVG engine
   * @since 1.0
   */
  @property({ type: String })
  public wasmUrl?: string;

  /**
  * File type.
  * @since 1.0
  */
  @property({ type: FileType })
  public fileType: FileType = FileType.JSON;

  /**
   * Animation speed.
   * @since 1.0
   */
  @property({ type: Number })
  public speed: number = 1.0;

  /**
   * Autoplay animation on load.
   * @since 1.0
   */
  @property({ type: Boolean })
  public autoPlay: boolean = false;

  /**
   * Number of times to loop animation.
   * @since 1.0
   */
  @property({ type: Number })
  public count?: number;

  /**
   * Whether to loop animation.
   * @since 1.0
   */
  @property({ type: Boolean })
  public loop: boolean = false;

  /**
   * Direction of animation.
   * @since 1.0
   */
  @property({ type: Number })
  public direction: number = 1;

  /**
   * Play mode.
   * @since 1.0
   */
  @property()
  public mode: PlayMode = PlayMode.Normal;

  /**
   * Intermission
   * @since 1.0
   */
  @property()
  public intermission: number = 1;

  /**
   * total frame of current animation (readonly)
   * @since 1.0
   */
  @property({ type: Number })
  public totalFrame: number = 0;

  /**
   * current frame of current animation (readonly)
   * @since 1.0
   */
  @property({ type: Number })
  public currentFrame: number = 0;

  /**
   * Player state
   * @since 1.0
   */
  @property({ type: Number })
  public currentState: PlayerState = PlayerState.Loading;

  /**
   * original size of the animation (readonly)
   * @since 1.0
   */
  @property({ type: Float32Array })
  public get size(): Float32Array {
    return Float32Array.from(this.TVG?.size() || [0, 0]);
  }

  protected TVG?: TvgModule;
  protected canvas?: HTMLCanvasElement;
  protected config?: RenderConfig;
  private _imageData?: ImageData;
  private _beginTime: number = Date.now();
  private _counter: number = 1;
  private _timer?: ReturnType<typeof setInterval>;
  private _observer?: IntersectionObserver;
  private _observable: boolean = false;

  private async _init(): Promise<void> {
    // Ensure module is loaded only once
    if (_moduleRequested) {
      while (!wasmModule) {
        await _wait(100);
      }
    }

    if (!wasmModule) {
      _moduleRequested = true;
      wasmModule = await Module({
        locateFile: (path: string, prefix: string) => {
          if (path.endsWith('.wasm')) {
            return this.wasmUrl || _wasmUrl;
          }
          return prefix + path;
        }
      });
    }

    if (!this._timer) {
      //NOTE: ThorVG Module has loaded, but called this function again
      return;
    }

    clearInterval(this._timer);
    this._timer = undefined;

    const engine = this.config?.renderer || (DEFAULT_RENDERER as Renderer);

    await _initModule(engine);
    if (_initStatus === InitStatus.FAILED) {
      this.currentState = PlayerState.Error;
      this.dispatchEvent(new CustomEvent(PlayerEvent.Error));
      return;
    }

    this.TVG = new wasmModule.TvgLottieAnimation(engine, `#${this.canvas!.id}`);

    if (this.src) {
      this.load(this.src, this.fileType);
    }
  }

  private _viewport(): void {
    const { left, right, top, bottom } = this.getBoundingClientRect();
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;

    let x = 0;
    let y = 0;
    let width = this.canvas!.width;
    let height = this.canvas!.height;

    if (left < 0) {
      x = Math.abs(left);
      width -= x;
    }

    if (top < 0) {
      y = Math.abs(top);
      height -= y;
    }

    if (right > windowWidth) {
      width -= right - windowWidth;
    }

    if (bottom > windowHeight) {
      height -= bottom - windowHeight;
    }

    this.TVG.viewport(x, y, width, height);
  }

  private _observerCallback(entries: IntersectionObserverEntry[]) {
    const entry = entries[0];
    const target = entry.target as BaseLottiePlayer;
    target._observable = entry.isIntersecting;

    if (entry.isIntersecting) {
      if (target.currentState === PlayerState.Frozen) {
        target.play();
      }
    } else if (target.currentState === PlayerState.Playing) {
      target.freeze();
      target.dispatchEvent(new CustomEvent(PlayerEvent.Freeze));
    }
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this.canvas = this.querySelector('.thorvg') as HTMLCanvasElement;
    
    this.canvas.id = `thorvg-${_generateUID()}`;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this._observer = new IntersectionObserver(this._observerCallback);
    this._observer.observe(this);

    if (!this.TVG) {
      this._timer = setInterval(this._init.bind(this), 100);
      return;
    }

    if (this.src) {
      this.load(this.src, this.fileType);
    }
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    this.style.display = 'block';
    return this;
  }

  private async _animLoop(){
    if (!this.TVG) {
      return;
    }

    if (await this._update()) {
      this._render();
      window.requestAnimationFrame(this._animLoop.bind(this));
    }
  }

  private _loadBytes(data: Uint8Array): void {
    const isLoaded = this.TVG.load(data, this.fileType, this.canvas!.width, this.canvas!.height, '');
    if (!isLoaded) {
      throw new Error(`Unable to load an image. Error: ${this.TVG.error()}`);
    }

    function dataUriToUint8Array(dataUri: string) {
      const split = dataUri.split(',');
      const byteString = atob(split[1]);
      const len = byteString.length;
      const bytes = new Uint8Array(len);
      for (let i = 0; i < len; i++) {
        bytes[i] = byteString.charCodeAt(i);
      }
      return bytes;
    }
    
    this.TVG.setAssetResolver(function (path: any) {
      console.log('[web] asset resolver', path);
      const binary = dataUriToUint8Array('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAfQAAAH0CAYAAADL1t+KAAAQAElEQVR4Aey9C7QsWVnn+cUpZjmnbt1Ru6fb9oEL7QYZV69pHRFQ0JtHoVoBbewBREVAh1YaoSyRR12gzEx5FHaDQMksH6AioPJavESEAjlZCFKNRQ/SNCDPal4j7bNX9a1TXVUno///fTLyRubJRzz2jtgR+c+K70ZmZOxv7++3v73/sSPzZO2ZHiIgAiIgAiIgAp0nIEHvfBcqABEQAREQAREwCyvoIiwCIiACIiACItAIAQl6I5hViQiIgAiIgAiEJdBlQQ9LRt5FQAREQAREoEMEJOgd6iw1VQREQAREQATWEZCgryOj4yIgAiIgAiLQIQIS9A51lpoqAiIgAiIgAusISNDXkQl7XN5FQAREQAREwCsBCbpXnHImAiIgAiIgAu0QkKC3wz1srfIuAiIgAiKwcwQk6DvX5QpYBERABESgjwQk6H3s1bAxybsIiIAIiECEBCToEXaKmiQCIiACIiACZQlI0MsS0/lhCci7CIiACIhAJQIS9ErYVEgEREAEREAE4iIgQY+rP9SasATkXQREQAR6S0CC3tuuVWAiIAIiIAK7RECCvku9rVjDEpB3ERABEWiRgAS9RfiqWgREQAREQAR8EZCg+yIpPyIQloC8i4AIiMBGAhL0jXj0pgiIgAiIgAh0g4AEvRv9pFaKQFgC8i4CItB5AhL0znehAhABERABERABMwm6skAERCA0AfkXARFogIAEvQHIqkIEREAEREAEQhOQoIcmLP8iIAJhCci7CIiAIyBBdxj0jwiIgAiIgAh0m4AEvdv9p9aLgAiEJSDvItAZAhL0znSVGioCIiACIiAC6wlI0Nez0TsiIAIiEJaAvIuARwISdI8w5UoEREAEREAE2iIgQW+LvOoVAREQgbAE5H3HCEjQd6zDFa4IiIAIiEA/CUjQ+9mvikoEREAEwhKQ9+gISNCj6xI1SAREQAREQATKE5Cgl2emEiIgAiIgAmEJyHsFAhL0CtBURAREQAREQARiIyBBj61H1B4REAEREIGwBHrqXYLe045VWCIgAiIgArtFQIK+W/2taEVABERABMISaM27BL019KpYBERABERABPwRkKD7YylPIiACIiACIhCWwAbvEvQNcPSWCIiACIiACHSFgAS9Kz2ldoqACIiACIjABgIeBH2Dd70lAiIgAiIgAiLQCAEJeiOYVYkIiIAIiIAIhCUQvaCHDV/eRUAEREAERKAfBCTo/ehHRSECIiACIrDjBHZc0He89xW+CIiACIhAbwhI0HvTlQpEBERABERglwlI0AP2vlyLgAiIgAiIQFMEJOhNkVY9IiACIiACIhCQgAQ9INywruVdBERABERABC4SkKBfZKFnIiACIiACItBZAhL0znZd2IbLuwiIgAiIQLcISNC71V9qrQiIgAiIgAisJCBBX4lFB8MSkHcREAEREAHfBCTovonKnwiIgAiIgAi0QECC3gJ0VRmWgLyLgAiIwC4SkKDvYq8rZhEQAREQgd4RkKD3rksVUFgC8i4CIiACcRKQoMfZL2qVCIiACIiACJQiIEEvhUsni0BYAvIuAiIgAlUJSNCrklM5ERABERABEYiIgAQ9os5QU0QgLAF5FwER6DMBCXqfe1exiYAIiIAI7AwBCfrOdLUCFYGwBORdBESgXQIS9Hb5q3YREAEREAER8EJAgu4Fo5yIgAiEJSDvIiAC2whI0LcR0vsiIAIiIAIi0AECEvQOdJKaKAIiEJaAvItAHwhI0PvQi4pBBERABERg5wlI0Hc+BQRABEQgLAF5F4FmCEjQm+GsWkRABERABEQgKAEJelC8ci4CIiACYQnIuwhkBCToGQntRUAEREAERKDDBCToHe48NV0EREAEwhKQ9y4RkKB3qbfUVhEQAREQARFYQ0CCvgaMDouACIiACIQlIO9+CUjQ/fKUNxEQAREQARFohYAEvRXsqlQEREAERCAsgd3zLkHfvT5XxCIgAiIgAj0kIEHvYacqJBEQAREQgbAEYvQuQY+xV9QmERABERABEShJQIJeEphOFwEREAEREIGwBKp5l6BX46ZSIiACIiACIhAVAQl6VN2hxoiACIiACIhANQJFBb2ad5USAREQAREQARFohIAEvRHMqkQEREAEREAEwhKIQ9DDxijvIiACIiACItB7AhL03nexAhQBERABEdgFArsg6LvQj4pRBERABERgxwlI0Hc8ARS+CIiACIhAPwhI0Ov2o8qLgAiIgAiIQAQEJOgRdIKaIAIiIAIiIAJ1CUjQ6xIMW17eRUAEREAERKAQAQl6IUw6SQREQAREQATiJiBBj7t/wrZO3kVABERABHpDQILem65UICIgAiIgArtMQIK+y70fNnZ5FwEREAERaJCABL1B2KpKBERABERABEIRkKCHIiu/YQnIuwiIgAiIwAIBCfoCDr0QAREQAREQgW4SkKB3s9/U6rAE5F0EREAEOkdAgt65LlODRUAEREAEROA0AQn6aSY6IgJhCci7CIiACAQgIEEPAFUuRUAEREAERKBpAhL0pomrPhEIS0DeRUAEdpSABH1HO15hi4AIiIAI9IuABL1f/aloRCAsAXkXARGIloAEPdquUcNEQAREQAREoDgBCXpxVjpTBEQgLAF5FwERqEFAgl4DnoqKgAiIgAiIQCwEJOix9ITaIQIiEJaAvItAzwlI0HvewQpPBERABERgNwhI0HejnxWlCIhAWALyLgKtE5Cgt94FaoAIiIAIiIAI1CcgQa/PUB5EQAREICwBeReBAgQk6AUg6RQREAEREAERiJ2ABD32HlL7REAERCAsAXnvCQEJek86UmGIgAiIgAjsNgEJ+m73v6IXAREQgbAE5L0xAhL0xlCrIhEQAREQAREIR0CCHo6tPIuACIiACIQlIO85AhL0HAw9FQEREAEREIGuEpCgd7Xn1G4REAEREIGwBDrmXYLesQ5Tc0VABERABERgFQEJ+ioqOiYCIiACIiACYQl49y5B945UDkVABERABESgeQIS9OaZq0YREAEREAER8E5gQdC9e5dDERABERABERCBRghI0BvBrEpEQAREQAREICyBBgU9bCDyLgIiIAIiIAK7TECCvsu9r9hFQAREQAR6Q6A3gt6bHlEgIiACIiACIlCBgAS9AjQVEQEREAEREIHYCEjQC/WIThIBERABERCBuAlI0OPuH7VOBERABERABAoRkKAXwhT2pBi9p2k6mNkh9nkb4TVtEGO71SYREAER2FUCEvRd7fk1cUOsKeSHeDszCnfehniPRpGnsI/wWpsIiIAIiEDLBCToLXdA+OqL1bAk5BTwIgUp7EOUlagXoaVzREAERCAgAQl6QLhdcQ1Bzq/GqzSbok4fVcqqjAiIgAiIgAcCEnQPELvqAkKe3V4vuiI/FWruQOYrd0hPRUAEREAEmiIgQW+KdGT1UMzRJK6qfYg5XLmNou7t9jvbCONn9ZnhZcrn+uze4dY/IiACInCRgAT9Iotde0YxDxEzb7/XukhIT75hf2hmbCN9Zcb28nn22T1OTSnuPMb3ZCIgAiKwswQk6DvY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BMISkHcREAERCEFAgh6CqnyKgAiIgAiIQMMEJOgNA1d1IhCWgLyLgAjsKgEJ+q72vOIWAREQARHoFQEJeq+6U8GIQFgC8i4CIhAvAQl6vH2jlomACIiACIhAYQIS9MKodKIIiEBYAvIuAiJQh4AEvQ49lRUBERABERCBSAhI0CPpCDVDBEQgLAF5F4G+E5Cg972HFZ8IiIAIiMBOEJCg70Q3K0gREIGwBORdBNonIEFvvw/UAhEQAREQARGoTUCCXhuhHIiACIhAWALyLgJFCEjQi1DSOSIgAiIgAiIQOQEJeuQdpOaJgAiIQFgC8t4XAhL0vvSk4hABERABEdhpAhL0ne5+BS8CIiACYQnIe3MEJOjNsVZNIiACIiACIhCMgAQ9GFo5FgEREAERCEtA3vMEJOh5GnouAiIgAiIgAh0lIEHvaMep2SIgAiIgAmEJdM27BL1rPab2ioAIiIAIiMAKAhL0FVB0SAREQAREQATCEvDvXYLun6k8ioAIiIAIiEDjBCTojSNXhSIgAiIgAiLgn0Be0P17l0cREAEREAEREIFGCEjQG8GsSkRABERABEQgLIHmBD1sHPIuAiIgAiIgAjtNQIK+092v4EVABERABPpCoC+C3pf+UBwiIAIiIAIiUImABL0SNhUSAREQAREQgbgISNCL9IfOEQEREAEREIHICUjQI+8gNU8EREAEREAEihCQoBehFPYceRcBERABERCB2gQk6LURyoEIiIAIiIAItE9Agt5+H4RtgbyLgAiIgAjsBAEJ+k50s4IUAREQARHoOwEJet97OGx88i4CIiACIhAJAQl6JB2hZoiACIiACIhAHQIS9Dr0VDYsAXkXAREQAREoTECCXhiVThQBERABERCBeAlI0OPtG7UsLAF5FwEREIFeEZCg96o7FYwIiIAIiMCuEpCg72rPK+6wBORdBERABBomIEFvGLiqEwEREAEREIEQBCToIajKpwiEJSDvIiACInCKgAT9FBIdEAEREAEREIHuEZCgd6/P1GIRCEtA3kVABDpJQILeyW5To0VABERABERgkYAEfZGHXomACIQlIO8iIAKBCEjQA4GVWxEQAREQARFokoAEvUnaqksERCAsAXkXgR0mIEHf4c5X6CIgAiIgAv0hIEHvT18qEhEQgbAE5F0EoiYgQY+6e9Q4ERABERABEShGQIJejJPOEgEREIGwBORdBGoSkKDXBKjiIiACIiACIhADAQl6DL2gNoiACIhAWALyvgMEJOg70MkKUQREQAREoP8EJOj972NFKAIiIAJhCch7FAQk6FF0gxohAiIgAiIgAvUISNDr8VNpERABERCBsATkvSABCXpBUDpNBERABERABGImIEGPuXfUNhEQAREQgbAEeuRdgt6jzlQoIiACIiACu0tAgr67fa/IRUAEREAEwhJo1LsEvVHcqkwEREAEREAEwhCQoIfhKq8iIAIiIAIiEJbAkncJ+hIQvRQBERABERCBLhKQoHex19RmERABERABEVgi4FnQl7zrpQiIgAiIgAiIQCMEJOiNYFYlIiACIiACIhCWQKcEPSwKeRcBERABERCB7hKQoHe379RyERABERABEZgTkKDPUeiJCIiACIiACHSXgAS9u32nlouACIiACIjAnIAEfY4i7BN5FwEREAEREIGQBCToIenKtwiIgAiIgAg0RECC3hDosNWSFPDDAAAAtUlEQVTIuwiIgAiIwK4TkKDvegYofhEQAREQgV4QkKD3ohvDBiHvIiACIiAC8ROQoMffR2qhCIiACIiACGwlIEHfikgnhCUg7yIgAiIgAj4ISNB9UJQPERABERABEWiZgAS95Q5Q9WEJyLsIiIAI7AoBCfqu9LTiFAEREAER6DUBCXqvu1fBhSUg7yIgAiIQDwEJejx9oZaIgAiIgAiIQGUCEvTK6FRQBMISkHcREAERKEPgfwIAAP//TvjPxgAAAAZJREFUAwBMOQs7HuViGwAAAABJRU5ErkJggg==');

      console.log(binary);
      return binary;
    })

    this._render();
    this.dispatchEvent(new CustomEvent(PlayerEvent.Load));
    
    if (this.autoPlay) {
      this.play();
    }
  }

  private _flush(): void {
    const context = this.canvas!.getContext('2d');
    context!.putImageData(this._imageData!, 0, 0);
  }

  private _render(): void {
    if (this.config?.enableDevicePixelRatio) {
      const dpr = 1 + ((window.devicePixelRatio - 1) * 0.75);
      const { width, height } = this.canvas!.getBoundingClientRect();
      this.canvas!.width = width * dpr;
      this.canvas!.height = height * dpr;
    }

    this.TVG.resize(this.canvas!.width, this.canvas!.height);
    this._viewport();
    const isUpdated = this.TVG.update();

    if (!isUpdated) {
      return;
    }

    // webgpu & webgl
    if (this.config?.renderer === Renderer.WG || this.config?.renderer === Renderer.GL) {
      this.TVG.render();
      return;
    }

    const buffer = this.TVG.render();
    const clampedBuffer = new Uint8ClampedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    if (clampedBuffer.length < 1) {
      return;
    }

    this._imageData = new ImageData(clampedBuffer, this.canvas!.width, this.canvas!.height);
    this._flush();
  }

  private async _update(): Promise<boolean> {
    if (this.currentState !== PlayerState.Playing) {
      return false;
    }

    const duration = this.TVG.duration();
    const currentTime = Date.now() / 1000;
    this.currentFrame = (currentTime - this._beginTime) / duration * this.totalFrame * this.speed;
    if (this.direction === -1) {
      this.currentFrame = this.totalFrame - this.currentFrame;
    }

    if (
      (this.direction === 1 && this.currentFrame >= this.totalFrame) ||
      (this.direction === -1 && this.currentFrame <= 0)
    ) {
      const totalCount = this.count ? this.mode === PlayMode.Bounce ? this.count * 2 : this.count : 0;
      if (this.loop || (totalCount && this._counter < totalCount)) {
        if (this.mode === PlayMode.Bounce) {
          this.direction = this.direction === 1 ? -1 : 1;
          this.currentFrame = this.direction === 1 ? 0 : this.totalFrame;
        }

        if (this.count) {
          this._counter += 1;
        }

        await _wait(this.intermission);
        this.play();
        return true;
      }

      this.dispatchEvent(new CustomEvent(PlayerEvent.Complete));
      this.currentState = PlayerState.Stopped;
    }

    this.dispatchEvent(new CustomEvent(PlayerEvent.Frame, {
      detail: {
        frame: this.currentFrame,
      },
    }));
    return this.TVG.frame(this.currentFrame);
  }

  private _frame(curFrame: number): void {
    this.pause();
    this.currentFrame = curFrame;
    this.TVG.frame(curFrame);
  }

  /**
   * Configure and load
   * @param src Lottie animation JSON data or URL to JSON.
   * @param fileType The file type of the data to be loaded, defaults to JSON
   * @since 1.0
   */
  public async load(src: string | object, fileType: FileType = FileType.JSON): Promise<void> {
    try {
      await this._init();
      const bytes = await parseSrc(src, fileType);
      this.dispatchEvent(new CustomEvent(PlayerEvent.Ready));

      this.fileType = fileType;
      await this._loadBytes(bytes);
    } catch (err) {
      this.currentState = PlayerState.Error;
      this.dispatchEvent(new CustomEvent(PlayerEvent.Error));
    }
  }

  /**
   * Start playing animation.
   * @since 1.0
   */
  public play(): void {
    if (this.fileType !== FileType.JSON && this.fileType !== FileType.LOT) {
      return;
    }

    this.totalFrame = this.TVG.totalFrame();
    if (this.totalFrame < 1) {
      return;
    }

    this._beginTime = Date.now() / 1000;
    if (this.currentState === PlayerState.Playing) {
      return;
    }

    if (this._observable) {
      this.currentState = PlayerState.Playing;
      window.requestAnimationFrame(this._animLoop.bind(this));
      return;
    }

    this.currentState = PlayerState.Frozen;
  }

  /**
   * Pause animation.
   * @since 1.0
   */
  public pause(): void {
    this.currentState = PlayerState.Paused;
    this.dispatchEvent(new CustomEvent(PlayerEvent.Pause));
  }

  /**
   * Stop animation.
   * @since 1.0
   */
  public stop(): void {
    this.currentState = PlayerState.Stopped;
    this.currentFrame = 0;
    this._counter = 1;
    this.seek(0);

    this.dispatchEvent(new CustomEvent(PlayerEvent.Stop));
  }

  /**
   * Freeze animation.
   * @since 1.0
   */
  public freeze(): void {
    this.currentState = PlayerState.Frozen;
    this.dispatchEvent(new CustomEvent(PlayerEvent.Freeze));
  }

  /**
   * Seek to a given frame
   * @param frame Frame number to move
   * @since 1.0
   */
  public async seek(frame: number): Promise<void> {
    this._frame(frame);
    await this._update();
    this._render();
  }

  /**
   * Adjust the canvas size.
   * @param width The width to resize
   * @param height The height to resize
   * @since 1.0
   */
  public resize(width: number, height: number) {
    this.canvas!.width = width;
    this.canvas!.height = height;

    if (this.currentState !== PlayerState.Playing) {
      this._render();
    }
  }

  /**
   * Destroy animation and lottie-player element.
   * @since 1.0
   */
  public destroy(): void {
    if (!this.TVG) {
      return;
    }

    this.TVG.delete();
    this.TVG = null;
    this.currentState = PlayerState.Destroyed;

    if (this._observer) {
      this._observer.disconnect();
      this._observer = undefined;
    }
    
    this.dispatchEvent(new CustomEvent(PlayerEvent.Destroyed));
    this.remove();
  }

  /**
   * Terminate module and release resources
   * @since 1.0
   */
  public term(): void {
    wasmModule.term();
    wasmModule = null;
  }

  /**
   * Sets the repeating of the animation.
   * @param value Whether to enable repeating. Boolean true enables repeating.
   * @since 1.0
   */
  public setLooping(value: boolean): void {
    if (!this.TVG) {
      return;
    }

    this.loop = value;
  }

  /**
   * Animation play direction.
   * @param value Direction values. (1: forward, -1: backward)
   * @since 1.0
   */
  public setDirection(value: number): void {
    if (!this.TVG) {
      return;
    }

    this.direction = value;
  }

  /**
   * Set animation play speed.
   * @param value Playback speed. (any positive number)
   * @since 1.0
   */
  public setSpeed(value: number): void {
    if (!this.TVG) {
      return;
    }

    this.speed = value;
  }

  /**
   * Set a background color. (default: 0x00000000)
   * @param value Hex(#fff) or string(red) of background color
   * @since 1.0
   */
  public setBgColor(value: string): void {
    if (!this.TVG) {
      return;
    }

    this.canvas!.style.backgroundColor = value;
  }

  /**
   * Return thorvg version
   * @since 1.0
   */
  public getVersion(): LibraryVersion {
    return {
      THORVG_VERSION,
    };
  }

  public render(): TemplateResult {
    return html`
      <canvas class="thorvg" style="width: 100%; height: 100%;" />
    `;
  }
}
