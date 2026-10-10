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

import { html, LitElement, type TemplateResult } from 'lit';
import { property } from 'lit/decorators.js';

import Module, { type MainModule, type TvgLottieAnimation } from '../dist/thorvg';

type LottieJson = Record<string, unknown>;

const THORVG_VERSION = '__THORVG_VERSION__';
const DEFAULT_RENDERER = '__RENDERER__';
const _wasmUrl = 'https://unpkg.com/@thorvg/lottie-player@__WASM_PATH__/thorvg.wasm';
export let wasmModule: MainModule | null = null;
let _moduleRequested: boolean = false;

// Define library version
export interface LibraryVersion {
  THORVG_VERSION: string
}

// Audio resolver event payload
export interface AudioInfo {
  id: number;
  active: boolean;
  offset: number;
  volume: number;
  path: string | null;
  data: Uint8Array | null;
  mimeType: string | null;
}

interface AudioVoice {
  info: AudioInfo;
  source?: AudioBufferSourceNode;
  baseFrame: number;
  baseOffset: number;
}

// Define renderer type
export type Renderer = 'sw' | 'wg' | 'gl';

// Define initialization status
export enum InitStatus {
  IDLE = 'idle',
  FAILED = 'failed',
  REQUESTED = 'requested',
  INITIALIZED = 'initialized',
}

// Define rendering configurations
export interface RenderConfig {
  enableDevicePixelRatio?: boolean;
  renderer?: Renderer;
}

// Define file type which player can load
export type FileType = 'json' | 'lot' | 'jpg' | 'png' | 'svg';

// Define valid player states
export type PlayerState =
  | 'destroyed' // Player is destroyed by `destroy()` method
  | 'error' // An error occurred
  | 'loading' // Player is loading
  | 'paused' // Player is paused
  | 'playing' // Player is playing
  | 'stopped' // Player is stopped
  | 'frozen'; // Player is paused due to player being invisible

// Define play modes
export type PlayMode = 'bounce' | 'normal';

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
  } catch {
    throw new Error(
      `An error occurred while trying to load the Lottie file from URL`
    );
  }
};

const _parseImageFromURL = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  return response.arrayBuffer();
};

const _parseJSON = async (data: string): Promise<string> => {
  try {
    data = JSON.parse(data);
  } catch {
    const json = await _parseLottieFromURL(data as string);
    data = JSON.stringify(json);
  }

  return data;
};

export const parseSrc = async (src: string | object | ArrayBuffer, fileType: FileType): Promise<Uint8Array> => {
  const encoder = new TextEncoder();
  let data = src;

  switch (typeof data) {
    case 'object': {
      if (data instanceof ArrayBuffer) {
        return new Uint8Array(data);
      }

      data = JSON.stringify(data);
      return encoder.encode(data);
    }
    case 'string': {
      if (fileType === 'json' || fileType === 'lot') {
        data = await _parseJSON(data);
        return encoder.encode(data);
      }

      const buffer = await _parseImageFromURL(data);
      return new Uint8Array(buffer);
    }
    default:
      throw new Error('Invalid src type');
  }
};

const _wait = (timeToDelay: number) => {
  return new Promise((resolve) => setTimeout(resolve, timeToDelay));
};

let _initStatus = InitStatus.IDLE;
const _initModule = async (engine: Renderer) => {
  if (engine !== 'wg') {
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
      case 0: {
        _initStatus = InitStatus.INITIALIZED;
        return;
      }
      case 1: {
        _initStatus = InitStatus.FAILED;
        return;
      }
      case 2: {
        await _wait(100);
        break;
      }
      default:
    }
  }
};

const _generateUID = () => {
  return Date.now().toString(36) + Math.random().toString(36).substring(2);
};

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
  @property({ type: String })
  public fileType: FileType = 'json';

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
  public mode: PlayMode = 'normal';

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
  public currentState: PlayerState = 'loading';

  /**
   * original size of the animation (readonly)
   * @since 1.0
   */
  @property({ type: Float32Array })
  public get size(): Float32Array {
    return Float32Array.from(this.TVG?.size() || [0, 0]);
  }

  /**
   * The device pixel ratio applied to the canvas resolution (readonly)
   * @beta
   */
  @property({ type: Number })
  public get dpr(): number {
    if (this.config?.enableDevicePixelRatio === false) return 1;
    return 1 + ((window.devicePixelRatio - 1) * 0.75);
  }

  protected TVG: TvgLottieAnimation | null = null;
  protected canvas?: HTMLCanvasElement;
  protected config?: RenderConfig;
  #imageData?: ImageData;
  #beginTime: number = Date.now();
  #counter: number = 1;
  #timer?: ReturnType<typeof setInterval>;
  #observer?: IntersectionObserver;
  #observable: boolean = false;
  #rafId?: number;
  #assetResolverCallback?: (src: string, data: unknown) => { name: string, buffer: ArrayBuffer, mimetype: string };
  #assetResolverData?: unknown;
  //Audio
  #audioResolverCallback?: (info: AudioInfo, data: unknown) => void;
  #audioResolverData?: unknown;
  #audioCtx?: AudioContext;
  #audioMasterGain?: GainNode;
  #volume: number = 1;
  #muted: boolean = false;
  #audioBuffers = new Map<number, AudioBuffer>();
  #audioVoices = new Map<number, AudioVoice>();

  async #init(): Promise<void> {
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

    if (!this.#timer) {
      //NOTE: ThorVG Module has loaded, but called this function again
      return;
    }

    clearInterval(this.#timer);
    this.#timer = undefined;

    const engine = this.config?.renderer || (DEFAULT_RENDERER as Renderer);

    await _initModule(engine);
    if (_initStatus === InitStatus.FAILED) {
      this.currentState = 'error';
      this.dispatchEvent(new CustomEvent(PlayerEvent.Error));
      return;
    }

    this.TVG = new wasmModule.TvgLottieAnimation(engine, `#${this.canvas!.id}`, globalThis.__THORVG_THREAD_COUNT ?? 0);

    if (this.src) {
      this.load(this.src, this.fileType);
    }
  }

  #viewport(): void {
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

  #observerCallback(entries: IntersectionObserverEntry[]) {
    const entry = entries[0];
    const target = entry.target as BaseLottiePlayer;
    target.#observable = entry.isIntersecting;

    if (entry.isIntersecting) {
      if (target.currentState === 'frozen') {
        target.play();
      }
    } else if (target.currentState === 'playing') {
      target.freeze();
      target.dispatchEvent(new CustomEvent(PlayerEvent.Freeze));
    }
  }

  protected override firstUpdated(): void {
    this.canvas = this.querySelector('.thorvg') as HTMLCanvasElement;

    this.canvas.id = `thorvg-${_generateUID()}`;
    this.canvas.width = this.canvas.offsetWidth;
    this.canvas.height = this.canvas.offsetHeight;

    this.#observer = new IntersectionObserver(this.#observerCallback);
    this.#observer.observe(this);

    if (!this.TVG) {
      this.#timer = setInterval(this.#init.bind(this), 100);
      return;
    }

    if (this.src) {
      this.load(this.src, this.fileType);
    }
  }

  protected override createRenderRoot(): HTMLElement | DocumentFragment {
    this.style.display = 'block';
    return this;
  }

  #startLoop(): void {
    if (this.#rafId) {
      window.cancelAnimationFrame(this.#rafId);
    }
    this.#rafId = window.requestAnimationFrame(this.#animLoop.bind(this));
  }

  async #animLoop(){
    if (!this.TVG) {
      return;
    }

    if (await this.#update()) {
      this.#render();
      this.#rafId = window.requestAnimationFrame(this.#animLoop.bind(this));
    }
  }

  #loadBytes(data: Uint8Array): void {
    if (!this.TVG) {
      throw new Error(`TVG is not initialized`);
    }

    if (this.#assetResolverCallback) {
      this.TVG.setAssetResolver(this.#assetResolverCallback, this.#assetResolverData);
    }

    const isLoaded = this.TVG.load(data, this.fileType, this.canvas!.width, this.canvas!.height);
    if (!isLoaded) {
      throw new Error(`Unable to load an image. Error: ${this.TVG.error()}`);
    }

    for (const id of [...this.#audioVoices.keys()]) {
      this.#stopVoice(id);
    }
    const audioFn = this.#audioResolverCallback ?? this.#audioResolver.bind(this);
    this.TVG.setAudioResolver(audioFn, this.#audioResolverCallback ? this.#audioResolverData : null);

    this.#render();
    this.dispatchEvent(new CustomEvent(PlayerEvent.Load));

    if (this.autoPlay) {
      this.play();
    }
  }

  #stopVoice(id: number, keep = false): void {
    const voice = this.#audioVoices.get(id);
    if (!voice) return;
    voice.source?.stop();
    voice.source = undefined;
    if (!keep) this.#audioVoices.delete(id);
  }

  #resumeAudio(): void {
    for (const voice of this.#audioVoices.values()) {
      this.#audioResolver({ ...voice.info, active: true, offset: 0 });
    }
  }

  #fps(): number {
    if (!this.TVG) return 0;
    const duration = this.TVG.duration();
    return duration > 0 ? this.TVG.totalFrame() / duration : 0;
  }

  #syncAudioToFrame(): void {
    const fps = this.#fps();
    if (fps <= 0) return;

    for (const voice of this.#audioVoices.values()) {
      if (!voice.source) continue;
      const offset = voice.baseOffset + (this.currentFrame - voice.baseFrame) / fps;
      this.#audioResolver({ ...voice.info, active: true, offset });
    }
  }

  async #audioResolver(info: AudioInfo): Promise<void> {
    if (!this.#audioCtx) {
      this.#audioCtx = new AudioContext();
    }

    if (!this.#audioMasterGain) {
      this.#audioMasterGain = this.#audioCtx.createGain();
      this.#audioMasterGain.connect(this.#audioCtx.destination);
      this.#applyVolume();
    }

    if (!info.active) {
      this.#stopVoice(info.id);
      return;
    }

    let buffer = this.#audioBuffers.get(info.id);
    if (!buffer) {
      try {
        const data = info.data
          ? info.data.slice().buffer
          : await fetch(info.path!).then(r => r.arrayBuffer());
        buffer = await this.#audioCtx.decodeAudioData(data);
        this.#audioBuffers.set(info.id, buffer);
      } catch {
        this.currentState = 'error';
        this.dispatchEvent(new CustomEvent(PlayerEvent.Error));
        return;
      }
    }

    this.#stopVoice(info.id, true);

    const gain = this.#audioCtx.createGain();
    gain.gain.value = info.volume;
    gain.connect(this.#audioMasterGain);

    const source = this.#audioCtx.createBufferSource();
    source.buffer = buffer;
    source.loop = true;
    source.connect(gain);
    const startOffset = buffer.duration > 0
      ? ((info.offset % buffer.duration) + buffer.duration) % buffer.duration
      : 0;
    source.start(0, startOffset);

    this.#audioVoices.set(info.id, {
      info,
      source,
      baseFrame: this.currentFrame,
      baseOffset: info.offset,
    });
  }

  #flush(): void {
    const context = this.canvas!.getContext('2d');
    context!.putImageData(this.#imageData!, 0, 0);
  }

  #render(): void {
    if (!this.TVG) {
      return;
    }

    if (this.config?.enableDevicePixelRatio !== false) {
      const dpr = 1 + ((window.devicePixelRatio - 1) * 0.75);
      const { width, height } = this.canvas!.getBoundingClientRect();
      this.canvas!.width = width * dpr;
      this.canvas!.height = height * dpr;
    }

    this.TVG.resize(this.canvas!.width, this.canvas!.height);
    this.#viewport();
    const isUpdated = this.TVG.update();

    if (!isUpdated) {
      return;
    }

    // webgpu & webgl
    if (this.config?.renderer === 'wg' || this.config?.renderer === 'gl') {
      this.TVG.render();
      return;
    }

    const buffer = this.TVG.render();
    const clampedBuffer = new Uint8ClampedArray(buffer);
    if (clampedBuffer.length < 1) {
      return;
    }

    this.#imageData = new ImageData(clampedBuffer, this.canvas!.width, this.canvas!.height);
    this.#flush();
  }

  async #update(): Promise<boolean> {
    if (!this.TVG) {
      return false;
    }

    if (this.currentState !== 'playing') {
      return false;
    }

    const duration = this.TVG.duration();
    const currentTime = Date.now() / 1000;
    this.currentFrame = (currentTime - this.#beginTime) / duration * this.totalFrame * this.speed;
    if (this.direction === -1) {
      this.currentFrame = this.totalFrame - this.currentFrame;
    }

    if (
      (this.direction === 1 && this.currentFrame >= this.totalFrame) ||
      (this.direction === -1 && this.currentFrame <= 0)
    ) {
      const totalCount = this.count ? this.mode === 'bounce' ? this.count * 2 : this.count : 0;
      if (this.loop || (totalCount && this.#counter < totalCount)) {
        if (this.mode === 'bounce') {
          this.direction = this.direction === 1 ? -1 : 1;
        }
        this.currentFrame = this.direction === 1 ? 0 : this.totalFrame;

        if (this.count) {
          this.#counter += 1;
        }

        await _wait(this.intermission);
        this.play();
        this.#syncAudioToFrame();
        return true;
      }

      this.dispatchEvent(new CustomEvent(PlayerEvent.Complete));
      this.currentState = 'stopped';
    }

    this.dispatchEvent(new CustomEvent(PlayerEvent.Frame, {
      detail: {
        frame: this.currentFrame,
      },
    }));
    return this.TVG.frame(this.currentFrame);
  }

  #frame(curFrame: number): void {
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
  public async load(src: string | object, fileType: FileType = 'json'): Promise<void> {
    try {
      this.currentState = 'loading';
      await this.#init();
      const bytes = await parseSrc(src, fileType);
      this.dispatchEvent(new CustomEvent(PlayerEvent.Ready));

      this.fileType = fileType;
      this.#loadBytes(bytes);
    } catch {
      this.currentState = 'error';
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

    if (this.fileType !== 'json' && this.fileType !== 'lot') {
      return;
    }

    this.totalFrame = this.TVG.totalFrame();
    if (this.totalFrame < 1) {
      return;
    }

    //resume the AudioContext if suspended earlier
    if (this.#audioCtx?.state === 'suspended') this.#audioCtx.resume();

    this.#beginTime = Date.now() / 1000;
    if (this.currentState === 'paused') {
      const duration = this.TVG.duration();
      this.#beginTime -= this.currentFrame * duration / (this.totalFrame * this.speed);
    }

    if (this.currentState === 'playing') {
      return;
    }

    if (this.currentState === 'stopped') {
      const audioFn = this.#audioResolverCallback ?? this.#audioResolver.bind(this);
      this.TVG.setAudioResolver(audioFn, this.#audioResolverCallback ? this.#audioResolverData : null);
      this.#resumeAudio();
    }

    if (this.#observable) {
      this.currentState = 'playing';
      this.#startLoop();
      return;
    }

    this.currentState = 'frozen';
  }

  /**
   * Pause animation.
   * @since 1.0
   */
  public pause(): void {
    this.currentState = 'paused';
    this.dispatchEvent(new CustomEvent(PlayerEvent.Pause));
    if (this.#audioCtx?.state === 'running') this.#audioCtx.suspend();
  }

  /**
   * Stop animation.
   * @since 1.0
   */
  public stop(): void {
    for (const id of this.#audioVoices.keys()) {
      this.#stopVoice(id, true);
    }

    this.TVG?.setAudioResolver(null as unknown as (info: AudioInfo, data: unknown) => void, null);
    this.seek(0);

    this.currentState = 'stopped';
    this.currentFrame = 0;
    this.#counter = 1;

    this.dispatchEvent(new CustomEvent(PlayerEvent.Stop));
  }

  /**
   * Freeze animation.
   * @since 1.0
   */
  public freeze(): void {
    this.currentState = 'frozen';
    this.dispatchEvent(new CustomEvent(PlayerEvent.Freeze));
  }

  /**
   * Seek to a given frame
   * @param frame Frame number to move
   * @since 1.0
   */
  public async seek(frame: number): Promise<void> {
    this.#frame(frame);
    await this.#update();
    this.#render();
    this.#syncAudioToFrame();
  }

  /**
   * Adjust the canvas size.
   * @param width The width to resize
   * @param height The height to resize
   * @since 1.0
   */
  public resize(width: number, height: number): void {
    this.canvas!.width = width;
    this.canvas!.height = height;

    if (this.currentState !== 'playing') {
      this.#render();
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

    for (const id of [...this.#audioVoices.keys()]) this.#stopVoice(id);
    this.#audioBuffers.clear();
    this.#audioCtx?.close();
    this.#audioCtx = undefined;
    this.#audioMasterGain = undefined;

    this.TVG.delete();
    this.TVG = null;
    this.currentState = 'destroyed';

    if (this.#observer) {
      this.#observer.disconnect();
      this.#observer = undefined;
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

    if (this.TVG.quality(value) && this.currentState !== 'playing') {
      this.#render();
    }
  }

  public setAssetResolver(callback: (src: string, data: unknown) => { name: string, buffer: ArrayBuffer, mimetype: string }, data: unknown | null): void {
    this.#assetResolverCallback = callback;
    this.#assetResolverData = data;

    if (this.TVG) {
      this.TVG.setAssetResolver(callback, data);
    }
  }

  public setAudioResolver(callback: ((info: AudioInfo, data: unknown) => void) | null, data: unknown | null): void {
    this.#audioResolverCallback = callback ?? undefined;
    this.#audioResolverData = data;

    if (this.TVG) {
      const fn = callback ?? this.#audioResolver.bind(this);
      this.TVG.setAudioResolver(fn, callback ? data : null);
    }
  }

  #applyVolume(): void {
    if (this.#audioMasterGain) {
      this.#audioMasterGain.gain.value = this.#muted ? 0 : this.#volume;
    }
  }

  /**
   * Set the master playback volume for the built-in audio backend.
   * @param volume A multiplier applied on top of each layer's own volume. 0 mutes, 1 is the original level.
   * @beta
   */
  public setVolume(volume: number): void {
    this.#volume = Math.max(0, volume);
    this.#applyVolume();
  }

  /**
   * Return the master playback volume for the built-in audio backend.
   * @beta
   */
  public get volume(): number {
    return this.#volume;
  }

  /**
   * Mute or unmute the built-in audio backend without losing the current volume.
   * @param muted Pass true to silence audio, false to restore the previous volume.
   * @beta
   */
  public setMute(muted: boolean): void {
    this.#muted = muted;
    this.#applyVolume();
  }

  /**
   * Return whether the built-in audio backend is currently muted.
   * @beta
   */
  public get muted(): boolean {
    return this.#muted;
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

  public override render(): TemplateResult {
    return html`
      <canvas class="thorvg" style="width: 100%; height: 100%;" />
    `;
  }
}
