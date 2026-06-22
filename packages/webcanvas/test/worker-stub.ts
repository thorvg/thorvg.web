import type { Plugin } from 'vite';

export function webWorkerStub(): Plugin {
  const PREFIX = 'web-worker:';
  return {
    name: 'web-worker-stub',
    enforce: 'pre',
    resolveId(id) {
      if (id.startsWith(PREFIX)) return '\0' + id;
    },
    load(id) {
      if (id.startsWith('\0' + PREFIX)) {
        return 'export default class { postMessage() {} terminate() {} addEventListener() {} removeEventListener() {} };';
      }
    },
  };
}
