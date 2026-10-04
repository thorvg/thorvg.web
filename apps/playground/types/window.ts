export interface CachedResponse {
  data: ArrayBuffer;
  headers: Headers;
  status: number;
  statusText: string;
}

export type PlaygroundWindow = Window &
  typeof globalThis & {
    webkitAudioContext?: typeof AudioContext;
    __playgroundFetchCache?: Map<string, CachedResponse>;
  };
