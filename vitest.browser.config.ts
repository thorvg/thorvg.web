import { defineConfig } from 'vitest/config';
import { playwright } from '@vitest/browser-playwright';
import path from 'path';

const renderer = (process.env.TEST_RENDERER || 'wg') as 'wg' | 'gl';

const launchArgs = renderer === 'wg'
  ? ['--enable-unsafe-webgpu', '--enable-features=Vulkan']
  : ['--ignore-gpu-blocklist', '--use-gl=angle'];

export default defineConfig({
  define: {
    __TEST_RENDERER: JSON.stringify(renderer),
  },
  test: {
    browser: {
      enabled: true,
      provider: playwright({
        launchOptions: { args: launchArgs },
      }),
      instances: [{ browser: 'chromium' }],
      headless: true,
    },
    globals: true,
    root: '.',
    include: ['test/*.test.ts'],
    setupFiles: ['./test/setup.browser.ts'],
    testTimeout: 30000,
  },
  resolve: {
    alias: {
      '../dist/thorvg': path.resolve(__dirname, 'dist/thorvg.js'),
    },
  },
});
