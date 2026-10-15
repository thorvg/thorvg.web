import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: path.join(__dirname, '../../'),
  webpack: (config) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Copy the thread build as an asset to enable worker spawning.
    config.module.rules.push({
      test: /dist[\\/]thread[\\/]webcanvas\.esm\.js$/,
      type: 'asset/resource',
      generator: {
        filename: 'static/media/webcanvas-thread-[contenthash:8]/[name][ext]',
      },
    });

    // Allow .d.ts files to be imported as raw strings
    config.module.rules.push({
      test: /\.d\.ts$/,
      type: 'asset/source',
    });

    // Keep the workspace symlink path so the raw webcanvas.d.ts import in CodeEditor is not transpiled
    config.module.rules.push({
      test: /components\/CodeEditor\.tsx$/,
      resolve: { symlinks: false },
    });

    // Keep the workspace symlink path so the raw webcanvas.esm.js import in CanvasPreview is not transpiled
    config.module.rules.push({
      test: /components\/CanvasPreview\.tsx$/,
      resolve: { symlinks: false },
    });

    return config;
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
