/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  webpack: (config, { isServer }) => {
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
