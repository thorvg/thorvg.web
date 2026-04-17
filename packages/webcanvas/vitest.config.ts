import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    environment: 'happy-dom',
    globals: true,
    root: '.',
    include: ['test/*.test.ts'],
    exclude: ['test/render.test.ts'],
    setupFiles: ['./test/setup.ts'],
    testTimeout: 30000,
    execArgv: ['--expose-gc'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts'],
      reportsDirectory: './coverage',
      all: true,
    },
  },
  resolve: {
    alias: {
      '../dist/thorvg': path.resolve(__dirname, 'dist/thorvg.js'),
    },
  },
});
