import { TextDecoder, TextEncoder } from 'util';
import { join } from 'path';
import { ImageData } from 'canvas';
import { readFileSync } from 'fs';

// Mock createRequire to avoid URL parsing issues in Jest
require('module').createRequire = function() {
  // Return a custom require that mocks fs for WASM loading
  const originalRequire = require;
  const customRequire = function(id: string) {
    if (id === 'fs') {
      const originalFs = originalRequire('fs');
      return {
        ...originalFs,
        readFileSync: function(path: string, options?: any) {
          // Redirect CDN WASM requests to local file
          if (path.includes('unpkg.com') && path.includes('thorvg.wasm')) {
            const localWasmPath = originalRequire('path').join(__dirname, '../dist/thorvg.wasm');
            return originalFs.readFileSync(localWasmPath, options);
          }
          return originalFs.readFileSync(path, options);
        }
      };
    }
    return originalRequire(id);
  };
  return customRequire;
};

// Cast global to any to replace its TextDecoder and TextEncoder with the Node.js types.
(global as any).TextDecoder = TextDecoder;
(global as any).TextEncoder = TextEncoder;

// Mock IntersectionObserver
class IntersectionObserver {
  root = null;
  rootMargin = "";
  thresholds = [];
 
  disconnect() {
    return null;
  }
 
  observe() {
    return null;
  }
 
  takeRecords() {
    return [];
  }
 
  unobserve() {
    return null;
  }
}
window.IntersectionObserver = IntersectionObserver;
global.IntersectionObserver = IntersectionObserver;

// Cast global to any to replace its ImageData with the ImageData type from Node.js Canvas
(global as any).ImageData = ImageData;

// Mock fetch to return local fixtures/test-animation.json for any JSON request
const mockAnimationPath = join(__dirname, 'fixtures/test-animation.json');
const mockAnimationData = JSON.parse(readFileSync(mockAnimationPath, 'utf-8'));

global.fetch = jest.fn((url: string) => {
  // Handle any JSON file requests
  if (url.includes('.json')) {
    return Promise.resolve({
      ok: true,
      status: 200,
      json: () => Promise.resolve(mockAnimationData)
    });
  }
  
  return Promise.reject(new Error('Fetch not mocked for: ' + url));
}) as jest.Mock

global.URL.createObjectURL = jest.fn(() => 'mock-url');

// Mock HTMLAnchorElement click to prevent navigation errors
HTMLAnchorElement.prototype.click = jest.fn();

