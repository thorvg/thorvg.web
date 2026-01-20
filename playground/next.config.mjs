/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'require-corp',
          },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    config.experiments = { ...config.experiments, asyncWebAssembly: true };

    config.module.rules.push({
      test: /\.wasm$/,
      type: 'asset/resource',
    });

    // Allow .d.ts files to be imported as raw strings
    config.module.rules.push({
      test: /\.d\.ts$/,
      type: 'asset/source',
    });

    // Add fallbacks for node modules not available in browser
    config.resolve.fallback = {
      ...config.resolve.fallback,
      module: false,
      fs: false,
      path: false,
      worker_threads: false,
    };

    return config;
  },
};

export default nextConfig;
