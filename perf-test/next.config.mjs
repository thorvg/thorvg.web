import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  outputFileTracingRoot: __dirname,
  webpack: (config) => {
    if (typeof nextRuntime === "undefined") {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }

    config.module.rules.push({
      test: /\.wasm$/,
      loader: "file-loader",
      options: {
        publicPath: "/_next/static/wasm/",
        outputPath: "static/wasm/",
        name: "[name].[contenthash].[ext]",
      },
    });

    return config;
  },
};

export default nextConfig;
