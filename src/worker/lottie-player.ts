import { html, PropertyValueMap, LitElement, type TemplateResult } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';
import { WorkerManager } from './worker-manager';
import { 
  RpcRequest, 
  RpcResponse, 
  MethodParamsMap, 
  MethodResultMap,
  WorkerConfig
} from './types';
import { PlayerInstanceState, PlayerState, Renderer } from '../types';
import { EventManager } from '../event-manager.js';



export enum FileType {
  JSON = 'json',
  LOT = 'lot',
  JPG = 'jpg',
  PNG = 'png',
  SVG = 'svg',
}
export type EventType = 
  | 'load'
  | 'play'
  | 'pause'
  | 'stop'
  | 'complete'
  | 'frame'
  | 'error'
  | 'freeze'
  | 'unfreeze';
// @ts-ignore
export type EventListener<T extends EventType> = (event: any) => void;

function generateUniqueId(): string {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
}

@customElement('lottie-player-worker')
export class LottiePlayerWorker extends LitElement {
  @property({ type: String })
  public src?: string;

  @property({ type: String })
  public wasmUrl?: string;

  @property({ type: String })
  public fileType: FileType = FileType.JSON;

  @property({ type: Object })
  public renderConfig?: {
    enableDevicePixelRatio?: boolean;
    renderer?: Renderer;
    devicePixelRatio?: number;
    freezeOnOffscreen?: boolean;
    autoResize?: boolean;
  };

  @property({ type: Boolean })
  public autoPlay: boolean = false;

  private static readonly _workerManager = new WorkerManager();
  private readonly _eventManager = new EventManager();
  private readonly _id: string;
  private _worker?: Worker;
  private _canvas?: HTMLCanvasElement;
  private _created: boolean = false;
  private _observer?: IntersectionObserver;

  private _instanceState: PlayerInstanceState = {
    currentState: PlayerState.Loading,
    currentFrame: 0,
    totalFrame: 0,
    speed: 1,
    loop: false,
    direction: 1,
    backgroundColor: '',
    isLoaded: false,
    isPlaying: false,
    isPaused: false,
    isStopped: true,
    isFrozen: false,
  };

  public constructor() {
    super();
    this._id = `thorvg-${generateUniqueId()}`;
    console.log("constructor",this._id);
    
    // Initialize public properties
    this.currentState = PlayerState.Loading;
    this.currentFrame = 0;
    this.totalFrame = 0;
    this.speed = 1;
    this.loop = false;
    this.direction = 1;
    this.backgroundColor = '';
    this.isLoaded = false;
    this.isPlaying = false;
    this.isPaused = false;
    this.isStopped = true;
    this.isFrozen = false;
  }

  public static setWasmUrl(url: string): void {
    LottiePlayerWorker._workerManager.getWorker('defaultWorker').postMessage({
      id: `set-wasm-url-${generateUniqueId()}`,
      method: 'setWasmUrl',
      params: { url }
    });
  }

  private async _handleWorkerEvent(event: MessageEvent): Promise<void> {
    console.log("handleWorkerEvent",event);
    const rpcResponse: RpcResponse<any> = event.data;

    if (!rpcResponse.id) {
      console.log("rpcResponse",rpcResponse);
      const result = rpcResponse.result as any;
      if (rpcResponse.method === 'onReady' && result?.instanceId === this._id) {
        this._created = true;
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }
      
      if (rpcResponse.method === 'onLoad' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onPlay' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onPause' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onStop' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onComplete' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onFrame' && result?.instanceId === this._id) {
        this._instanceState.currentFrame = result.event.currentFrame;
        this.currentFrame = result.event.currentFrame;
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onError' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onFreeze' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }

      if (rpcResponse.method === 'onUnfreeze' && result?.instanceId === this._id) {
        await this._updateInstanceState();
        this._eventManager.dispatch(result.event);
      }
    }
  }

  private async _create(config: WorkerConfig): Promise<void> {
    if (!this._canvas) {
      throw new Error('Canvas not found');
    }

    let offscreen: OffscreenCanvas;

    if (this._canvas instanceof HTMLCanvasElement) {
      offscreen = this._canvas.transferControlToOffscreen();
    } else {
      offscreen = this._canvas;
    }

    const { instanceId } = await this._sendMessage('create', {
      instanceId: this._id,
      config: {
        ...config,
        canvas: offscreen,
      },
      width: this._canvas.width,
      height: this._canvas.height,
    }, [offscreen]);
    console.log('create instanceIdddddddddddddd',instanceId);

    if (instanceId !== this._id) {
      throw new Error('Instance ID mismatch');
    }

    this._created = true;
    await this._updateInstanceState();
  }

  private async _sendMessage<T extends keyof MethodParamsMap>(
    method: T,
    params: MethodParamsMap[T],
    transfer?: Transferable[],
  ): Promise<MethodResultMap[T]> {
    const rpcRequest: RpcRequest<T> = {
      id: `thorvg-request-${generateUniqueId()}`,
      method,
      params,
    };

    if (!this._worker) {
      throw new Error('Worker not initialized');
    }

    this._worker.postMessage(rpcRequest, transfer || []);

    return new Promise((resolve, reject) => {
      const onMessage = (event: MessageEvent): void => {
        const rpcResponse: RpcResponse<T> = event.data;
        console.log("onMessage",rpcResponse, 'rpcRequest',rpcRequest);
        if (rpcResponse.id === rpcRequest.id) {
                if (this._worker) {
          this._worker.removeEventListener('message', onMessage);
        }

        


      if (rpcResponse.error) {
        reject(new Error(`Failed to execute method ${method}: ${rpcResponse.error}`));
      } else {
        resolve(rpcResponse.result!);
      }
        }
      };

      if (this._worker) {
        this._worker.addEventListener('message', onMessage);
      }
    });
  }

  private async _updateInstanceState(): Promise<void> {
    if (!this._created) return;

    const result = await this._sendMessage('getInstanceState', { instanceId: this._id });
    this._instanceState = result.state;
    console.log("updateInstanceState",this._instanceState);
    
    // Update public properties
    this.currentState = this._instanceState.currentState;
    this.currentFrame = this._instanceState.currentFrame;
    this.totalFrame = this._instanceState.totalFrame;
    this.speed = this._instanceState.speed;
    this.loop = this._instanceState.loop;
    this.direction = this._instanceState.direction;
    this.backgroundColor = this._instanceState.backgroundColor;
    this.isLoaded = this._instanceState.isLoaded;
    this.isPlaying = this._instanceState.isPlaying;
    this.isPaused = this._instanceState.isPaused;
    this.isStopped = this._instanceState.isStopped;
    this.isFrozen = this._instanceState.isFrozen;
  }

  public async load(src: string | object | ArrayBuffer, fileType: FileType): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('load', { 
      instanceId: this._id, 
      src, 
      fileType 
    });
    await this._updateInstanceState();
  }

  public async play(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('play', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async pause(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('pause', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async stop(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('stop', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async seek(frame: number): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('seek', { instanceId: this._id, frame });
    await this._updateInstanceState();
  }

  public async resize(width: number, height: number): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('resize', { instanceId: this._id, width, height });
    await this._updateInstanceState();
  }

  public async setSpeed(speed: number): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('setSpeed', { instanceId: this._id, speed });
    await this._updateInstanceState();
  }

  public async setLoop(loop: boolean): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('setLoop', { instanceId: this._id, loop });
    await this._updateInstanceState();
  }

  public async setDirection(direction: number): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('setDirection', { instanceId: this._id, direction });
    await this._updateInstanceState();
  }

  public async setBgColor(color: string): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('setBgColor', { instanceId: this._id, color });
    await this._updateInstanceState();
  }

  public async freeze(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('freeze', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async unfreeze(): Promise<void> {
    if (!this._created) return;

    await this._sendMessage('unfreeze', { instanceId: this._id });
    await this._updateInstanceState();
  }

  public async destroy(): Promise<void> {
    if (!this._created) return;

    this._created = false;
    await this._sendMessage('destroy', { instanceId: this._id });

    LottiePlayerWorker._workerManager.unassignAnimationFromWorker(this._id);
    this._eventManager.removeAllEventListeners();
  }

  public currentState: PlayerState = PlayerState.Loading;
  public currentFrame: number = 0;
  public totalFrame: number = 0;
  public speed: number = 1;
  public loop: boolean = false;
  public direction: number = 1;
  public backgroundColor: string = '';
  public isLoaded: boolean = false;
  public isPlaying: boolean = false;
  public isPaused: boolean = false;
  public isStopped: boolean = true;
  public isFrozen: boolean = false;

  public addEventListener<T extends EventType>(type: T, listener: EventListener<T>): void {
    this._eventManager.addEventListener(type, listener);
  }

  public removeCustomEventListener<T extends EventType>(type: T, listener?: EventListener<T>): void {
    this._eventManager.removeEventListener(type, listener);
  }

  protected firstUpdated(_changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>): void {
    this._canvas = this.querySelector('.thorvg') as HTMLCanvasElement;
    
    this._canvas.id = `thorvg-${uuidv4().replaceAll('-', '').substring(0, 6)}`;
    this._canvas.width = this._canvas.offsetWidth;
    this._canvas.height = this._canvas.offsetHeight;

    this._observer = new IntersectionObserver(this._observerCallback.bind(this));
    this._observer.observe(this);

    this._init();
  }

  protected createRenderRoot(): HTMLElement | DocumentFragment {
    return this;
  }

  private _observerCallback(entries: IntersectionObserverEntry[]) {
    const entry = entries[0];
    const target = entry.target as LottiePlayerWorker;

    if (entry.isIntersecting) {
      if (target.currentState === PlayerState.Frozen) {
        target.play();
      }
    } else if (target.currentState === PlayerState.Playing) {
      target.freeze();
    }
  }

  private async _init(): Promise<void> {
    console.log(this._canvas,this._worker);
    if (!this._canvas) {
      return;
    }

    try {
      const workerId = 'defaultWorker';
      this._worker = LottiePlayerWorker._workerManager.getWorker(workerId);
      LottiePlayerWorker._workerManager.assignAnimationToWorker(this._id, workerId);

      this._worker.addEventListener('message', this._handleWorkerEvent.bind(this));

      if (!this._canvas) {
        throw new Error('Canvas not found');
      }
      LottiePlayerWorker.setWasmUrl(this.wasmUrl || '');
      console.log('before create');
      await this._create({
        canvas: this._canvas,
        renderConfig: {
          ...this.renderConfig,
        },
        autoPlay: this.autoPlay,
        loop: this.loop,
        speed: this.speed,
        direction: this.direction,
        backgroundColor: this.backgroundColor || '',
        wasmUrl: this.wasmUrl,
      });
      console.log('after create',this.src);

      console.log('autoPlay1',this.autoPlay);
      if (this.src) {
        await this.load(this.src, this.fileType);
      }
      console.log('autoPlay',this.autoPlay);
      if(this.autoPlay) {
        
        this.play();
      }
    } catch (error) {
      this._instanceState.currentState = PlayerState.Error;
    }
  }

  public render(): TemplateResult {
    return html`
      <canvas class="thorvg" style="width: 100%; height: 100%;"></canvas>
    `;
  }
} 