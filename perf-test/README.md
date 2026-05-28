# ThorVG Performance Test

Performance benchmarking tool for ThorVG WebCanvas.

> Hosted version: https://thorvg-perf-test.vercel.app/

## Overview

- Renders multiple Lottie animations on a single `<canvas>` using `@thorvg/webcanvas`
- Supports Software (SW), WebGL (GL), and WebGPU (WG) renderers
- Measures FPS, memory usage, and load times
- Seed-based reproducible animation sets (base64 encoded in URL)
- Headless benchmark automation via Playwright

## Pages

| Route | Description |
|-------|-------------|
| `/` | Multi-renderer grid test — single canvas with N animations, click any to open viewer |
| `/viewer` | Individual animation viewer with real-time perf chart, config panel, play/pause control |

### URL Parameters

**`/` (Grid test)**
- `renderer` — `sw` / `gl` / `wg`
- `count` — number of animations
- `size` — animation size in px
- `seed` — base64-encoded animation list

**`/viewer`**
- `url` — animation URL
- `name` — animation name
- `renderer` — `sw` / `gl` / `wg`
- `w`, `h` — width / height
- `loop` — loop playback

## Getting Started

### Prerequisites

- Node.js 20+
- Yarn package manager

### Launch

```bash
yarn install
yarn build
yarn start
```

### Development

```bash
yarn dev
# open http://localhost:3000
```

### Using Local WebCanvas Build

To test with a local build of `@thorvg/webcanvas`:

1. **Build the webcanvas package:**

```bash
cd ../packages/webcanvas
pnpm install
pnpm run build
cd ../../perf-test
```

2. **Link to local package:**

```bash
yarn add ../packages/webcanvas
```

3. **Start the development server:**

```bash
yarn dev
```

## Headless Benchmark

Run automated benchmarks using Playwright (headless Chromium):

```bash
# Install browser (first time only)
npx playwright install chromium

# Run with defaults (sw renderer, 20 animations, 150px)
yarn bench

# Customize
yarn bench --renderer gl --count 50 --size 200

# JSON output only
yarn bench --renderer sw --count 100 --json

# Reproducible set with seed
yarn bench --seed <base64>

# Use already-running server
yarn bench --url http://localhost:3000
```

### Bench Options

| Flag | Default | Description |
|------|---------|-------------|
| `--renderer`, `-r` | `sw` | Renderer: `sw`, `gl`, `wg` |
| `--count`, `-c` | `20` | Number of animations |
| `--size`, `-s` | `150` | Animation size (px) |
| `--seed` | — | Base64-encoded animation list |
| `--json` | `false` | JSON-only output |
| `--url` | — | Skip server startup, use given URL |
| `--warmup` | `3000` | Warmup duration (ms) |
| `--measure` | `10000` | Measurement duration (ms) |
| `--timeout` | `120000` | Overall timeout (ms) |

## Tech Stack

- **Framework:** Next.js 15, React 19, TypeScript
- **Styling:** Tailwind CSS v4
- **Charts:** Recharts
- **Rendering:** @thorvg/webcanvas (WASM)
- **Benchmark:** Playwright
