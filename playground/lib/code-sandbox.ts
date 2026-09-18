import type { ThorVGNamespace } from '@thorvg/webcanvas';
import type { CachedResponse, PlaygroundWindow } from '@/types/window';

interface Disposable {
  dispose(): void;
}

type DisposableClass = new (...args: unknown[]) => Disposable;

type Method = (this: unknown, ...args: unknown[]) => unknown;

const isDisposable = (value: unknown): value is Disposable =>
  typeof value === 'object' && value !== null && 'dispose' in value && typeof value.dispose === 'function';

const isDisposableClass = (value: unknown): value is DisposableClass =>
  typeof value === 'function' && isDisposable(value.prototype);

const isMethod = (value: unknown): value is Method =>
  typeof value === 'function' && !Object.prototype.hasOwnProperty.call(value, 'prototype');

const cachedFetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
  const playgroundWindow = window as PlaygroundWindow;
  if (!playgroundWindow.__playgroundFetchCache) {
    playgroundWindow.__playgroundFetchCache = new Map<string, CachedResponse>();
  }

  const cache = playgroundWindow.__playgroundFetchCache;
  const urlString = url.toString();

  const method = init?.method?.toUpperCase() || 'GET';
  if (method !== 'GET') {
    return fetch(url, init);
  }

  const cached = cache.get(urlString);
  if (cached) {
    return new Response(cached.data, {
      status: cached.status,
      statusText: cached.statusText + ' (cached)',
      headers: cached.headers,
    });
  }

  const response = await fetch(url, init);
  const data = await response.arrayBuffer();

  cache.set(urlString, {
    data,
    headers: response.headers,
    status: response.status,
    statusText: response.statusText,
  });

  return new Response(data, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

interface CodeSandboxOptions {
  onPendingChange?: (pending: number) => void;
}

type ListenerEntry = [EventTarget, string, EventListenerOrEventListenerObject, boolean | EventListenerOptions | undefined];

export class CodeSandbox {
  #disposed = false;
  #owned = new Set<Disposable>();
  #frames = new Set<number>();
  #timeouts = new Set<ReturnType<typeof setTimeout>>();
  #intervals = new Set<ReturnType<typeof setInterval>>();
  #listeners: ListenerEntry[] = [];
  #pending = 0;
  #onPendingChange?: (pending: number) => void;

  constructor(options: CodeSandboxOptions = {}) {
    this.#onPendingChange = options.onPendingChange;
  }

  get disposed(): boolean {
    return this.#disposed;
  }

  own<T extends Disposable>(obj: T): T {
    if (this.#disposed) obj.dispose();
    else this.#owned.add(obj);
    return obj;
  }

  proxyNamespace(TVG: ThorVGNamespace): ThorVGNamespace {
    const wrapped = new Map<PropertyKey, unknown>();
    for (const name of Object.keys(TVG)) {
      const value: unknown = Reflect.get(TVG, name);
      if (!isDisposableClass(value)) continue;
      wrapped.set(name, new Proxy(value, {
        construct: (target, args, newTarget) => {
          const instance: unknown = Reflect.construct(target, args, newTarget);
          if (!isDisposable(instance)) throw new TypeError(`${name} did not construct a disposable object`);
          return this.own(instance);
        },
      }));
    }
    return new Proxy(TVG, {
      get: (target, prop, receiver) => {
        const value: unknown = wrapped.get(prop) ?? Reflect.get(target, prop, receiver);
        return value;
      },
    });
  }

  fetch = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
    this.#setPending(this.#pending + 1);
    try {
      return await cachedFetch(url, init);
    } finally {
      this.#setPending(this.#pending - 1);
    }
  };

  #setPending(pending: number): void {
    this.#pending = pending;
    if (!this.#disposed) this.#onPendingChange?.(pending);
  }

  requestAnimationFrame = (callback: FrameRequestCallback): number => {
    if (this.#disposed) return 0;
    const id = requestAnimationFrame((time) => {
      this.#frames.delete(id);
      callback(time);
    });
    this.#frames.add(id);
    return id;
  };

  cancelAnimationFrame = (id: number): void => {
    this.#frames.delete(id);
    cancelAnimationFrame(id);
  };

  setTimeout = (handler: () => void, timeout?: number): ReturnType<typeof setTimeout> | undefined => {
    if (this.#disposed) return undefined;
    const id = setTimeout(() => {
      this.#timeouts.delete(id);
      handler();
    }, timeout);
    this.#timeouts.add(id);
    return id;
  };

  clearTimeout = (id: ReturnType<typeof setTimeout>): void => {
    this.#timeouts.delete(id);
    clearTimeout(id);
  };

  setInterval = (handler: () => void, timeout?: number): ReturnType<typeof setInterval> | undefined => {
    if (this.#disposed) return undefined;
    const id = setInterval(handler, timeout);
    this.#intervals.add(id);
    return id;
  };

  clearInterval = (id: ReturnType<typeof setInterval>): void => {
    this.#intervals.delete(id);
    clearInterval(id);
  };

  proxyEventTarget<T extends EventTarget>(target: T): T {
    const addEventListener: EventTarget['addEventListener'] = (type, listener, options) => {
      if (this.#disposed || !listener) return;
      target.addEventListener(type, listener, options);
      this.#listeners.push([target, type, listener, options]);
    };
    return new Proxy(target, {
      get: (obj, prop) => {
        if (prop === 'addEventListener') return addEventListener;
        const value: unknown = Reflect.get(obj, prop, obj);
        return isMethod(value) ? value.bind(obj) : value;
      },
      set: (obj, prop, value) => Reflect.set(obj, prop, value, obj),
    });
  }

  dispose(): void {
    if (this.#disposed) return;
    this.#disposed = true;

    this.#frames.forEach((id) => cancelAnimationFrame(id));
    this.#timeouts.forEach((id) => clearTimeout(id));
    this.#intervals.forEach((id) => clearInterval(id));
    for (const [target, type, listener, options] of this.#listeners) {
      target.removeEventListener(type, listener, options);
    }
    for (const obj of this.#owned) {
      try {
        obj.dispose();
      } catch (e) {
        console.warn('Failed to dispose playground object:', e);
      }
    }

    this.#frames.clear();
    this.#timeouts.clear();
    this.#intervals.clear();
    this.#listeners = [];
    this.#owned.clear();
  }
}
