// @ts-ignore
import Module from '../../dist/thorvg-wasm';
import { 
  RpcRequest, 
  RpcResponse, 
  MethodParamsMap, 
  MethodResultMap,
  WorkerInstance
} from './types';
import { PlayerInstanceState, PlayerState, FileType, Renderer, InitStatus } from '../types';

let _module: any;
let _moduleRequested: boolean = false;
let _initStatus = InitStatus.IDLE;
let _wasmUrl: string = 'https://unpkg.com/@thorvg/lottie-player@latest/dist/thorvg-wasm.wasm';

const _wait = (timeToDelay: number) => {
  return new Promise(resolve => setTimeout(resolve, timeToDelay));
};

// @ts-ignore
const _initModule = async (engine: Renderer) => {
  if(engine !== Renderer.WG) {
    return;
  }

  if (_initStatus === InitStatus.INITIALIZED) {
    return;
  }

  if (_initStatus === InitStatus.REQUESTED) {
    while (_initStatus === InitStatus.REQUESTED) {
      await _wait(100);
    }
    return;
  }

  _initStatus = InitStatus.REQUESTED;
  
  try {
    while (true) {
      const res = _module.init();
      console.log("init result",res);
      switch (res) {
        case 0:
          _initStatus = InitStatus.INITIALIZED;
          return;
        case 1:
          _initStatus = InitStatus.FAILED;
          throw new Error('Failed to initialize ThorVG module');
        case 2:
          await _wait(100);
          break;
        default:
          await _wait(100);
      }
    }
  } catch (error) {
    _initStatus = InitStatus.FAILED;
    throw error;
  }
};

const _parseLottieFromURL = async (url: string): Promise<any> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.json();
};

const _parseImageFromURL = async (url: string): Promise<ArrayBuffer> => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.arrayBuffer();
};

const _parseSrc = async (src: string | object | ArrayBuffer, fileType: FileType): Promise<Uint8Array> => {
  if (typeof src === 'string') {
    if (fileType === FileType.JSON) {
      const jsonData = await _parseLottieFromURL(src);
      return new TextEncoder().encode(JSON.stringify(jsonData));
    } else {
      const arrayBuffer = await _parseImageFromURL(src);
      return new Uint8Array(arrayBuffer);
    }
  } else if (src instanceof ArrayBuffer) {
    return new Uint8Array(src);
  } else {
    return new TextEncoder().encode(JSON.stringify(src));
  }
};

const instancesMap = new Map<string, WorkerInstance>();

const sendEvent = (instanceId: string, eventType: string, event: any) => {
  const response = {
    id: '',
    method: `on${eventType.charAt(0).toUpperCase() + eventType.slice(1)}` as any,
    result: {
      instanceId,
      event,
    },
  };
  self.postMessage(response);
};

const createInstance = async (instanceId: string, config: any, width: number, height: number): Promise<WorkerInstance> => {
  console.log("createInstance",instanceId,config,width,height);
  if (!_module) {
    if (_moduleRequested) {
      while (!_module) {
        console.log("wait for module");
        await _wait(100);
      }
    } else {
      _moduleRequested = true;
      _module = await Module({
        locateFile: (path: string, prefix: string) => {
          if (path.endsWith('.wasm')) {
            return _wasmUrl;
          }
          return prefix + path;
        }
      });
    }
  }

  const engine = config.renderConfig?.renderer || Renderer.SW;
  // await _initModule(engine);
  console.log('initModule',_initStatus);
  
  if (_initStatus === InitStatus.FAILED) {
    throw new Error('Failed to initialize ThorVG module');
  }

  const tvgInstance = new _module.TvgLottieAnimation(engine, `#${instanceId}`);
  
  const mockInstance = {
    canvas: config.canvas,
    config,
    width,
    height,
    currentState: PlayerState.Loading,
    currentFrame: 0,
    totalFrame: 0,
    speed: config.speed || 1,
    loop: config.loop || false,
    direction: 1,
    backgroundColor: config.backgroundColor || '',
    isLoaded: false,
    isPlaying: false,
    isPaused: false,
    isStopped: true,
    isFrozen: false,
    tvgInstance,
    beginTime: Date.now(),
    counter: 1,
    timer: null as any,
    
    async load(src: any, fileType: FileType) {
      try {
        const data = await _parseSrc(src, fileType);
        const isLoaded = this.tvgInstance.load(data, fileType, this.width, this.height, '');
        
        if (!isLoaded) {
          throw new Error('Unable to load animation. Error: ' + this.tvgInstance.error());
        }
        
        this.isLoaded = true;
        this.currentState = PlayerState.Stopped;
        this.totalFrame = this.tvgInstance.totalFrame();
        
        sendEvent(instanceId, 'load', { type: 'load' });
      } catch (error) {
        this.currentState = PlayerState.Error;
        sendEvent(instanceId, 'error', { type: 'error', error: (error as Error).message });
      }
    },
    
    play() {
      this.isPlaying = true;
      this.isPaused = false;
      this.isStopped = false;
      this.currentState = PlayerState.Playing;
      this.beginTime = Date.now();
      
      if (!this.timer) {
        this.timer = setInterval(() => {
          this.update();
        }, 16);
      }
      
      sendEvent(instanceId, 'play', { type: 'play' });
    },
    
    pause() {
      this.isPlaying = false;
      this.isPaused = true;
      this.isStopped = false;
      this.currentState = PlayerState.Paused;
      
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      sendEvent(instanceId, 'pause', { type: 'pause' });
    },
    
    stop() {
      this.isPlaying = false;
      this.isPaused = false;
      this.isStopped = true;
      this.currentState = PlayerState.Stopped;
      this.currentFrame = 0;
      
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      this.tvgInstance.frame(0);
      this.render();
      
      sendEvent(instanceId, 'stop', { type: 'stop' });
    },
    
    seek(frame: number) {
      this.currentFrame = Math.max(0, Math.min(this.totalFrame, frame));
      this.tvgInstance.frame(this.currentFrame);
      this.render();
      
      sendEvent(instanceId, 'frame', { 
        type: 'frame', 
        currentFrame: this.currentFrame 
      });
    },
    
    resize(width: number, height: number) {
      this.width = width;
      this.height = height;
      this.tvgInstance.resize(width, height);
      this.render();
    },
    
    setSpeed(speed: number) {
      this.speed = speed;
    },
    
    setLoop(loop: boolean) {
      this.loop = loop;
    },
    
    setDirection(direction: number) {
      this.direction = direction;
    },
    
    setBgColor(color: string) {
      this.backgroundColor = color;
      this.tvgInstance.setBgColor(color);
    },
    
    freeze() {
      this.isFrozen = true;
      this.currentState = PlayerState.Frozen;
      
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      sendEvent(instanceId, 'freeze', { type: 'freeze' });
    },
    
    unfreeze() {
      this.isFrozen = false;
      this.currentState = PlayerState.Stopped;
      
      sendEvent(instanceId, 'unfreeze', { type: 'unfreeze' });
    },
    
    update() {
      if (this.currentState !== PlayerState.Playing) {
        return;
      }
      
      const currentTime = Date.now();
      const elapsed = (currentTime - this.beginTime) / 1000;
      const duration = this.tvgInstance.duration();
      
      if (duration <= 0) {
        return;
      }
      
      this.currentFrame = (elapsed / duration) * this.totalFrame * this.speed;
      
      if (this.direction === -1) {
        this.currentFrame = this.totalFrame - this.currentFrame;
      }
      
      // Clamp frame to valid range
      this.currentFrame = Math.max(0, Math.min(this.totalFrame, this.currentFrame));
      
      if (
        (this.direction === 1 && this.currentFrame >= this.totalFrame) ||
        (this.direction === -1 && this.currentFrame <= 0)
      ) {
        if (this.loop) {
          this.currentFrame = this.direction === 1 ? 0 : this.totalFrame;
          this.beginTime = currentTime;
          sendEvent(instanceId, 'loop', { type: 'loop' });
        } else {
          sendEvent(instanceId, 'complete', { type: 'complete' });
          this.currentState = PlayerState.Stopped;
          if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
          }
          return;
        }
      }
      
      sendEvent(instanceId, 'frame', { 
        type: 'frame', 
        currentFrame: Math.floor(this.currentFrame)
      });
      
      this.tvgInstance.frame(Math.floor(this.currentFrame));
      this.render();
    },
    
    render() {
      if (this.config.renderConfig?.enableDevicePixelRatio) {
        const dpr = 1 + ((1 - 1) * 0.75);
        this.tvgInstance.resize(this.width * dpr, this.height * dpr);
      }
      
      this.tvgInstance.update();
      
      if (this.config.renderConfig?.renderer === Renderer.WG || this.config.renderConfig?.renderer === Renderer.GL) {
        this.tvgInstance.render();
        return;
      }
      
      const buffer = this.tvgInstance.render();
      const clampedBuffer = new Uint8ClampedArray(buffer.buffer, buffer.byteOffset, buffer.byteLength);
      
      if (clampedBuffer.length < 1) {
        return;
      }
      
      const imageData = new ImageData(clampedBuffer, this.width, this.height);
      const context = this.canvas.getContext('2d');
      context.putImageData(imageData, 0, 0);
      
      sendEvent(instanceId, 'render', { type: 'render' });
    },
    
    destroy() {
      if (this.timer) {
        clearInterval(this.timer);
        this.timer = null;
      }
      
      if (this.tvgInstance) {
        this.tvgInstance.destroy();
      }
    },
  };

  instancesMap.set(instanceId, mockInstance);
  return mockInstance;
};

const commands: Record<string, (request: any) => any> = {
  async create(request: any) {
    const instanceId = request.params.instanceId;
    const config = request.params.config;
    const width = request.params.width;
    const height = request.params.height;

    if (instancesMap.has(instanceId)) {
      throw new Error(`Instance with id ${instanceId} already exists.`);
    }
    console.log(request);

    await createInstance(instanceId, config, width, height);
    console.log("createInstance",instanceId);
    sendEvent(instanceId, 'ready', { type: 'ready' });
    return { instanceId };
  },

  destroy(request: any) {
    const instanceId = request.params.instanceId;
    const instance = instancesMap.get(instanceId);

    if (!instance) return;

    instance.destroy();
    instancesMap.delete(instanceId);
  },

  async load(request: any) {
    const instanceId = request.params.instanceId;
    const src = request.params.src;
    const fileType = request.params.fileType;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.load(src, fileType);
  },

  play(request: any) {
    const instanceId = request.params.instanceId;
    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.play();
  },

  pause(request: any) {
    const instanceId = request.params.instanceId;
    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.pause();
  },

  stop(request: any) {
    const instanceId = request.params.instanceId;
    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.stop();
  },

  seek(request: any) {
    const instanceId = request.params.instanceId;
    const frame = request.params.frame;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.seek(frame);
  },

  resize(request: any) {
    const instanceId = request.params.instanceId;
    const width = request.params.width;
    const height = request.params.height;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.resize(width, height);
  },

  setSpeed(request: any) {
    const instanceId = request.params.instanceId;
    const speed = request.params.speed;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.setSpeed(speed);
  },

  setLoop(request: any) {
    const instanceId = request.params.instanceId;
    const loop = request.params.loop;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.setLoop(loop);
  },

  setDirection(request: any) {
    const instanceId = request.params.instanceId;
    const direction = request.params.direction;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.setDirection(direction);
  },

  setBgColor(request: any) {
    const instanceId = request.params.instanceId;
    const color = request.params.color;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.setBgColor(color);
  },

  freeze(request: any) {
    const instanceId = request.params.instanceId;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.freeze();
  },

  unfreeze(request: any) {
    const instanceId = request.params.instanceId;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    return instance.unfreeze();
  },

  getInstanceState(request: any) {
    const instanceId = request.params.instanceId;

    const instance = instancesMap.get(instanceId);

    if (!instance) {
      throw new Error(`Instance with id ${instanceId} does not exist.`);
    }

    const state: PlayerInstanceState = {
      currentState: instance.currentState,
      currentFrame: instance.currentFrame,
      totalFrame: instance.totalFrame,
      speed: instance.speed,
      loop: instance.loop,
      direction: instance.direction,
      backgroundColor: instance.backgroundColor,
      isLoaded: instance.isLoaded,
      isPlaying: instance.isPlaying,
      isPaused: instance.isPaused,
      isStopped: instance.isStopped,
      isFrozen: instance.isFrozen,
    };

    return { state };
  },

  setWasmUrl(request: any) {
    _wasmUrl = request.params.url;
  },
};

function executeCommand(rpcRequest: RpcRequest<keyof MethodParamsMap>): any {
  const method = rpcRequest.method;

  if (typeof commands[method] === 'function') {
    return commands[method](rpcRequest);
  } else {
    throw new Error(`Method ${method} is not implemented in commands.`);
  }
}

self.onmessage = async (event: { data: RpcRequest<keyof MethodParamsMap> }) => {
  try {
    console.log("onmessage",event.data);
    const result = await executeCommand(event.data);

    const response: RpcResponse<keyof MethodResultMap> = {
      id: event.data.id,
      method: event.data.method,
      result,
    };

    self.postMessage(response);
  } catch (error) {
    const errorResponse: RpcResponse<keyof MethodResultMap> = {
      id: event.data.id,
      method: event.data.method,
      error: (error as Error).message,
    };

    self.postMessage(errorResponse);
    throw error;
  }
};
console.log("worker loaded");
export default '';