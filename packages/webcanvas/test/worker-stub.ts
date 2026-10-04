import type { Plugin } from 'vite';

export function webWorkerStub(): Plugin {
  const PREFIX = 'web-worker:';
  const STUB_ID = '\0web-worker-stub';
  return {
    name: 'web-worker-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith(PREFIX)) return STUB_ID;
    },
    load(id) {
      if (id === STUB_ID) {
        return `export default class {
          constructor() {
            this.messages = [];
            this.onmessage = null;
            this.terminated = false;
            (globalThis.__WORKERS ||= []).push(this);
          }
          postMessage(message) { this.messages.push(message); }
          terminate() { this.terminated = true; }
          addEventListener() {}
          removeEventListener() {}
        };`;
      }
    },
  };
}
