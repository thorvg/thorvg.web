import { PlayerState, FileType, RenderConfig, PlayerInstanceState } from '../types';

export interface RpcRequest<T extends keyof MethodParamsMap> {
  id: string;
  method: T;
  params: MethodParamsMap[T];
}

export interface RpcResponse<T extends keyof MethodResultMap> {
  id: string;
  method: T;
  result?: MethodResultMap[T];
  error?: string;
}

export interface MethodParamsMap {
  create: {
    instanceId: string;
    config: WorkerConfig;
    width: number;
    height: number;
  };
  destroy: {
    instanceId: string;
  };
  load: {
    instanceId: string;
    src: string | object | ArrayBuffer;
    fileType: FileType;
  };
  play: {
    instanceId: string;
  };
  pause: {
    instanceId: string;
  };
  stop: {
    instanceId: string;
  };
  seek: {
    instanceId: string;
    frame: number;
  };
  resize: {
    instanceId: string;
    width: number;
    height: number;
  };
  setSpeed: {
    instanceId: string;
    speed: number;
  };
  setLoop: {
    instanceId: string;
    loop: boolean;
  };
  setDirection: {
    instanceId: string;
    direction: number;
  };
  setBgColor: {
    instanceId: string;
    color: string;
  };
  freeze: {
    instanceId: string;
  };
  unfreeze: {
    instanceId: string;
  };
  getInstanceState: {
    instanceId: string;
  };
  setWasmUrl: {
    url: string;
  };
}

export interface MethodResultMap {
  create: {
    instanceId: string;
  };
  destroy: void;
  load: void;
  play: void;
  pause: void;
  stop: void;
  seek: void;
  resize: void;
  setSpeed: void;
  setLoop: void;
  setDirection: void;
  setBgColor: void;
  freeze: void;
  unfreeze: void;
  getInstanceState: {
    state: PlayerInstanceState;
  };
  setWasmUrl: void;
  onLoad: {
    instanceId: string;
    event: any;
  };
  onPlay: {
    instanceId: string;
    event: any;
  };
  onPause: {
    instanceId: string;
    event: any;
  };
  onStop: {
    instanceId: string;
    event: any;
  };
  onComplete: {
    instanceId: string;
    event: any;
  };
  onFrame: {
    instanceId: string;
    event: any;
  };
  onError: {
    instanceId: string;
    event: any;
  };
  onFreeze: {
    instanceId: string;
    event: any;
  };
  onUnfreeze: {
    instanceId: string;
    event: any;
  };
  onLoop: {
    instanceId: string;
    event: any;
  };
  onRender: {
    instanceId: string;
    event: any;
  };
}

export interface WorkerConfig {
  canvas: HTMLCanvasElement | OffscreenCanvas;
  renderConfig?: RenderConfig;
  autoPlay?: boolean;
  loop?: boolean;
  speed?: number;
  direction?: number;
  backgroundColor?: string;
  wasmUrl?: string;
}

export interface TvgInstance {
  load: (data: Uint8Array, fileType: FileType, width: number, height: number, path: string) => boolean;
  error: () => string;
  totalFrame: () => number;
  frame: (frame: number) => void;
  update: (timestamp: number) => boolean;
  render: () => void;
  destroy: () => void;
}

export interface WorkerInstance {
  canvas: OffscreenCanvas;
  config: WorkerConfig;
  width: number;
  height: number;
  currentState: PlayerState;
  currentFrame: number;
  totalFrame: number;
  speed: number;
  loop: boolean;
  direction: number;
  backgroundColor: string;
  isLoaded: boolean;
  isPlaying: boolean;
  isPaused: boolean;
  isStopped: boolean;
  isFrozen: boolean;
  tvgInstance: TvgInstance;
  beginTime: number;
  counter: number;
  timer: any;
  load: (src: any, fileType: FileType) => Promise<void>;
  play: () => void;
  pause: () => void;
  stop: () => void;
  seek: (frame: number) => void;
  resize: (width: number, height: number) => void;
  setSpeed: (speed: number) => void;
  setLoop: (loop: boolean) => void;
  setDirection: (direction: number) => void;
  setBgColor: (color: string) => void;
  freeze: () => void;
  unfreeze: () => void;
  update: () => void;
  render: () => void;
  destroy: () => void;
}

export enum InitStatus {
  IDLE = 'idle',
  FAILED = 'failed',
  REQUESTED = 'requested',
  INITIALIZED = 'initialized',
}
