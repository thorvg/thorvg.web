import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  turbopack: {
    rules: {
      '*.wasm': { type: 'asset' },
      // Allow .d.ts files to be imported as raw strings
      '*.d.ts': { condition: { query: '?raw' }, loaders: ['raw-loader'], as: '*.js' },
      // Keep the thread build standalone (its pthread workers re-import it) and point the baked-in filename at the hashed asset URL.
      '*.js': {
        condition: { query: '?url' },
        loaders: [
          {
            loader: 'string-replace-loader',
            options: {
              search: 'new URL\\((["\'])\\./webcanvas\\.esm\\.js\\1\\s*,\\s*import\\.meta\\.url\\s*\\)',
              flags: '',
              replace: 'new URL(import.meta.url)',
              strict: true,
            },
          },
        ],
        type: 'asset',
      },
    },
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Cross-Origin-Opener-Policy', value: 'same-origin' },
          { key: 'Cross-Origin-Embedder-Policy', value: 'require-corp' },
        ],
      },
    ];
  },
};

export default nextConfig;
