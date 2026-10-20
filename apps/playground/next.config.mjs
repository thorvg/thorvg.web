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
    },
  },
};

export default nextConfig;
