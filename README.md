[![Discord](https://img.shields.io/badge/Community-5865f2?style=flat&logo=discord&logoColor=white)](https://discord.gg/n25xj6J6HM)
[![ThorVGPT](https://img.shields.io/badge/ThorVGPT-76A99C?style=flat&logo=openai&logoColor=white)](https://chat.openai.com/g/g-Ht3dYIwLO-thorvgpt)
[![OpenCollective](https://img.shields.io/badge/OpenCollective-84B5FC?style=flat&logo=opencollective&logoColor=white)](https://opencollective.com/thorvg)
[![License](https://img.shields.io/badge/licence-MIT-green.svg?style=flat)](LICENSE)
[![npm](https://img.shields.io/npm/v/@thorvg/lottie-player)](https://www.npmjs.com/package/@thorvg/lottie-player)

# ThorVG for Web

<p align="center">
  <img width="800" height="auto" src="https://github.com/thorvg/thorvg.site/blob/main/readme/logo/512/thorvg-banner.png">
</p>

**High-performance vector graphics rendering for the modern web**

ThorVG Web provides WebAssembly-powered vector graphics rendering with multiple APIs designed for different use cases. From declarative Lottie animations to imperative canvas drawing, ThorVG delivers native-like performance directly in your browser.

## What is ThorVG?

[ThorVG](https://github.com/thorvg/thorvg) is a lightweight, cross-platform vector graphics engine that powers this web implementation. ThorVG Web brings its performance and flexibility to JavaScript/TypeScript through WebAssembly bindings, supporting Software, WebGL, and WebGPU rendering backends.

## 📦 Packages

This monorepo contains two complementary packages:

### [@thorvg/lottie-player](./packages/lottie-player)
[![npm](https://img.shields.io/npm/v/@thorvg/lottie-player)](https://www.npmjs.com/package/@thorvg/lottie-player)

**Declarative Lottie animation player** - Web component for embedding Lottie animations

```html
<script src="https://unpkg.com/@thorvg/lottie-player@latest/dist/lottie-player.js"></script>

<lottie-player
  autoPlay
  loop
  src="animation.json"
  style="width: 500px; height: 500px;">
</lottie-player>
```

[→ Read lottie-player documentation](./packages/lottie-player/README.md)

---

### [@thorvg/canvas-kit](./packages/canvas-kit)
[![npm](https://img.shields.io/npm/v/@thorvg/canvas-kit)](https://www.npmjs.com/package/@thorvg/canvas-kit)

**Imperative TypeScript Canvas API** - Fluent Interface for vector graphics

```typescript
import ThorVG from '@thorvg/canvas-kit';

const TVG = await ThorVG.init({ renderer: 'sw' });
const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });

const shape = new TVG.Shape();
shape.appendRect(100, 100, 200, 150, { rx: 10, ry: 10 });
shape.fill(255, 0, 0, 255);

canvas.add(shape);
canvas.render();
```

[→ Read canvas-kit documentation](./packages/canvas-kit/README.md)


## Rendering Backends

All packages support multiple rendering backends:

| Backend | Description |
|---------|-------------|
| **Software (sw)** | CPU-based rendering |
| **WebGL (gl)** | GPU-accelerated | 
| **WebGPU (wg)** | WebGPU API |

## Examples

### Basic Examples

**Lottie Player Examples:**
- [Software Renderer](./examples/software.html) - Full Lottie support with CPU rendering
- [WebGL Renderer](./examples/webgl.html) - GPU-accelerated Lottie rendering
- [Software Lite](./examples/software-lite.html) - Lightweight CPU rendering
- [WebGL Lite](./examples/webgl-lite.html) - Lightweight GPU rendering
- [WebGPU Renderer](./examples/webgpu.html) - Next-gen GPU acceleration

**Canvas Kit Examples:**
- [Basic Usage](./examples/basic-usage.html) - Getting started with shapes
- [Animation](./examples/animation-example.html) - Frame-based animations
- [Scene Composition](./examples/scene.html) - Hierarchical object grouping
- [Picture Loading](./examples/picture-example.html) - SVG and image rendering
- [Text Rendering](./examples/text-example.html) - Typography and fonts
- [Live Editor](./examples/live-editor.html) - Interactive code playground

### Framework Integration

See framework-specific examples:

- [React Example](./examples/react/)
- [Vue Example](./examples/vue/)
- [Svelte Example](./examples/svelte/)

## Monorepo Structure

[→ Read monorepo documentation](./MONOREPO.md)

## Development

### Prerequisites

- Node.js 18+
- pnpm 8+
- Emscripten SDK (for WASM builds)
- Meson & Ninja (for native builds)

### Building from Source

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Run linter
pnpm run lint

# Clean build artifacts
pnpm run clean
```

### Building WASM Bindings

Each package has its own WASM build script:

```bash
# Build lottie-player WASM
cd packages/lottie-player
sh ./wasm_setup.sh

# Build canvas-kit WASM
cd packages/canvas-kit
sh ./wasm_setup.sh
```

### Testing Framework Integration

Test compatibility across different frameworks:

```bash
pnpm run test:build
```

## Documentation

- **Getting Started**
  - [Lottie Player Guide](./packages/lottie-player/README.md)
  - [Canvas Kit Guide](./packages/canvas-kit/README.md)

- **API Reference**
  - [Lottie Player API](./packages/lottie-player/README.md#api)
  - [Canvas Kit API Reference](./packages/canvas-kit/API_REFERENCE.md)

- **Examples & Integration**
  - [Framework Integration Examples](./examples/)
  - [Live Interactive Examples](./examples/)
