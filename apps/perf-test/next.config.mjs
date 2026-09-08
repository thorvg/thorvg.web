import path from 'path';
import { fileURLToPath } from 'url';
import { readFileSync } from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const webcanvasPkg = JSON.parse(
  readFileSync(new URL('./node_modules/@thorvg/webcanvas/package.json', import.meta.url), 'utf-8'),
);

/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_PUBLIC_WEBCANVAS_VERSION: webcanvasPkg.version,
  },
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    if (typeof nextRuntime === 'undefined') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        module: false,
        url: false,
      };
    }

    config.module.rules.push({
      test: /\.wasm$/,
      loader: 'file-loader',
      options: {
        publicPath: '/_next/static/wasm/',
        outputPath: 'static/wasm/',
        name: '[name].[contenthash].[ext]',
      },
    });

    return config;
  },
};

export default nextConfig;
