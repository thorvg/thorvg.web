# ThorVG Performance Test

Performance benchmarking tool for ThorVG Lottie player.

> Hosted version: https://thorvg-perf-test.vercel.app/

## Overview
- Test with various animation files
- Measure FPS, memory usage, and load times
- Support for Software (SW), and WebGPU (WG) renderers

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn package manager
- ThorVG Lottie Player (`../packages/lottie-player`)

### Launch Perf Test

```bash
yarn install
yarn build
yarn start
```

### Using Local Version

To test with a local build of `@thorvg/lottie-player`:

1. **Build the lottie-player package:**

```bash
cd ../packages/lottie-player
pnpm install
pnpm run build
cd ../../perf-test
```

2. **Link to local package:**

```bash
yarn add ../packages/lottie-player
```
3. **Start the development server:**

```bash
yarn dev
# open http://localhost:3000
```
