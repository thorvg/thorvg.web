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

import Module, { type MainModule, type TvgLottieAnimation } from '../dist/thorvg';

type LottieJson = Map<PropertyKey, any>;

const THORVG_VERSION = '__THORVG_VERSION__';
const DEFAULT_RENDERER = '__RENDERER__';
const _wasmUrl = 'https://unpkg.com/@thorvg/lottie-player@latest/dist/thorvg.wasm';
export let wasmModule: MainModule | null = null;
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

  if(!wasmModule) {
    return;
  }

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

  protected TVG: TvgLottieAnimation | null = null;
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

    this.TVG!.viewport(x, y, width, height);
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
    if (!this.TVG) {
      throw new Error(`TVG is not initialized`);
    }

    const isLoaded = this.TVG.load(data, this.fileType, this.canvas!.width, this.canvas!.height);
    if (!isLoaded) {
      throw new Error(`Unable to load an image. Error: ${this.TVG.error()}`);
    }

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
    if (!this.TVG) {
      return;
    }

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
    const clampedBuffer = new Uint8ClampedArray(buffer, 0, buffer.byteLength);
    if (clampedBuffer.length < 1) {
      return;
    }

    this._imageData = new ImageData(clampedBuffer, this.canvas!.width, this.canvas!.height);
    this._flush();
  }

  private async _update(): Promise<boolean> {
    if (!this.TVG) {
      return false;
    }

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
    if (!this.TVG) {
      return;
    }
    
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
    if (!this.TVG) {
      return;
    }

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
    if (!wasmModule) {
      return;
    }

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
   * Set rendering quality.
   * @param value Quality value (1-100). Higher values are likely to support better quality but may impact performance.
   * @since 1.0
   */
  public setQuality(value: number): void {
    if (!this.TVG) {
      return;
    }

    if (this.TVG.quality(value) && this.currentState !== PlayerState.Playing) {
      this._render();
    }
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
