import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    root: '.',
    include: ['test/*.test.ts'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '../dist/thorvg': path.resolve(__dirname, 'dist/thorvg.js'),
    },
  },
});
