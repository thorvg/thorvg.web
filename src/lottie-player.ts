/*
 * Copyright (c) 2023 - 2024 the ThorVG project. All rights reserved.

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
import { customElement, property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';

// @ts-ignore: WASM Glue code doesn't have type & Only available on build progress
import Module from '../dist/thorvg-wasm';
import { THORVG_VERSION } from './version';

type LottieJson = Map<PropertyKey, any>;
type TvgModule = any;

const _wasmUrl = 'https://unpkg.com/@thorvg/lottie-player@latest/dist/thorvg-wasm.wasm';
let _module: any;
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

const _parseSrc = async (src: string | object | ArrayBuffer, fileType: FileType): Promise<Uint8Array> => {
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

const _downloadFile = (fileName: string, blob: Blob) => {
  const link = document.createElement('a');
  link.setAttribute('href', URL.createObjectURL(blob));
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

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
    const res = _module.init();
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

@customElement('lottie-player')
export class LottiePlayer extends LitElement {
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
  * Rendering configurations.
  * @since 1.0
  */
  @property({ type: Object })
  public renderConfig?: RenderConfig;

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
    return Float32Array.from(this._TVG?.size() || [0, 0]);
  }

  private _TVG?: TvgModule;
  private _canvas?: HTMLCanvasElement;
  private _imageData?: ImageData;
  private _beginTime: number = Date.now();
  private _counter: number = 1;
  private _timer?: ReturnType<typeof setInterval>;
  private _observer?: IntersectionObserver;
  private _observable: boolean = false;

  private async _init(): Promise<void> {
    // Ensure module is loaded only once
    if (_moduleRequested) {
      while (!_module) {
        await _wait(100);
      }
    }

    if (!_module) {
      _moduleRequested = true;
      _module = await Module({
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

    const engine = this.renderConfig?.renderer || Renderer.SW;

    await _initModule(engine);
    if (_initStatus === InitStatus.FAILED) {
      this.currentState = PlayerState.Error;
      this.dispatchEvent(new CustomEvent(PlayerEvent.Error));
      return;
    }

    this._TVG = new _module.TvgLottieAnimation(engine, `#${this._canvas!.id}`);

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
    let width = this._canvas!.width;
    let height = this._canvas!.height;

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

    this._TVG.viewport(x, y, width, height);
  }

  private _observerCallback(entries: IntersectionObserverEntry[]) {
    const entry = entries[0];
    const target = entry.target as LottiePlayer;
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
    this._canvas = this.querySelector('.thorvg') as HTMLCanvasElement;
    
    this._canvas.id = `thorvg-${uuidv4().replaceAll('-', '').substring(0, 6)}`;
    this._canvas.width = this._canvas.offsetWidth;
    this._canvas.height = this._canvas.offsetHeight;

    this._observer = new IntersectionObserver(this._observerCallback);
    this._observer.observe(this);

    if (!this._TVG) {
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
    if (!this._TVG) {
      return;
    }

    if (await this._update()) {
      this._render();
      window.requestAnimationFrame(this._animLoop.bind(this));
    }
  }

  private _loadBytes(data: Uint8Array, rPath: string = ''): void {
    const isLoaded = this._TVG.load(data, this.fileType, this._canvas!.width, this._canvas!.height, rPath);
    if (!isLoaded) {
      throw new Error(`Unable to load an image. Error: ${this._TVG.error()}`);
    }

    this._render();
    this.dispatchEvent(new CustomEvent(PlayerEvent.Load));
    
    if (this.autoPlay) {
      this.play();
    }
  }

  private _flush(): void {
    const context = this._canvas!.getContext('2d');
    context!.putImageData(this._imageData!, 0, 0);
  }

  private _render(): void {
    if (this.renderConfig?.enableDevicePixelRatio) {
      const dpr = 1 + ((window.devicePixelRatio - 1) * 0.75);
      const { width, height } = this._canvas!.getBoundingClientRect();
      this._canvas!.width = width * dpr;
      this._canvas!.height = height * dpr;
    }

    this._TVG.resize(this._canvas!.width, this._canvas!.height);
    this._viewport();
    const isUpdated = this._TVG.update();

    if (!isUpdated) {
      return;
    }

    // webgpu & webgl
    if (this.renderConfig?.renderer === Renderer.WG || this.renderConfig?.renderer === Renderer.GL) {
      this._TVG.render();
      return;
    }

    const buffer = this._TVG.render();
    const clampedBuffer = new Uint8ClampedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength);
    if (clampedBuffer.length < 1) {
      return;
    }

    this._imageData = new ImageData(clampedBuffer, this._canvas!.width, this._canvas!.height);
    this._flush();
  }

  private async _update(): Promise<boolean> {
    if (this.currentState !== PlayerState.Playing) {
      return false;
    }

    const duration = this._TVG.duration();
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
    return this._TVG.frame(this.currentFrame);
  }

  private _frame(curFrame: number): void {
    this.pause();
    this.currentFrame = curFrame;
    this._TVG.frame(curFrame);
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
      const bytes = await _parseSrc(src, fileType);
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

    this.totalFrame = this._TVG.totalFrame();
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
    this._canvas!.width = width;
    this._canvas!.height = height;

    if (this.currentState !== PlayerState.Playing) {
      this._render();
    }
  }

  /**
   * Destroy animation and lottie-player element.
   * @since 1.0
   */
  public destroy(): void {
    if (!this._TVG) {
      return;
    }

    this._TVG.delete();
    this._TVG = null;
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
    _module.term();
    _module = null;
  }

  /**
   * Sets the repeating of the animation.
   * @param value Whether to enable repeating. Boolean true enables repeating.
   * @since 1.0
   */
  public setLooping(value: boolean): void {
    if (!this._TVG) {
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
    if (!this._TVG) {
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
    if (!this._TVG) {
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
    if (!this._TVG) {
      return;
    }

    this._canvas!.style.backgroundColor = value;
  }

  /**
   * Save current animation to png image
   * @since 1.0
   */
  public save2png(): void {
    if (!this._TVG) {
      return;
    }

    this._canvas!.toBlob((blob: Blob | null) => {
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
    const saver = new _module.TvgLottieAnimation(Renderer.SW, `#${this._canvas!.id}`);
    const bytes = await _parseSrc(src, FileType.JSON);
    const isExported = saver.save(bytes, 'gif');
    if (!isExported) {
      const error = saver.error();
      saver.delete();
      throw new Error(`Unable to save. Error: ${error}`);
    }

    const data = _module.FS.readFile('output.gif');
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
