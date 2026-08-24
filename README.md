[![CodeFactor](https://www.codefactor.io/repository/github/thorvg/thorvg.web/badge)](https://www.codefactor.io/repository/github/thorvg/thorvg.web)
[![Socket Badge](https://badge.socket.dev/npm/package/@thorvg/webcanvas)](https://badge.socket.dev/npm/package/@thorvg/webcanvas)
[![License](https://img.shields.io/badge/licence-MIT-green.svg?style=flat)](LICENSE)
[![Wikipedia](https://img.shields.io/badge/Wikipedia-000000?style=flat&logo=wikipedia&logoColor=white)](https://en.wikipedia.org/wiki/Thor_Vector_Graphics)
[![Discord](https://img.shields.io/badge/Community-5865f2?style=flat&logo=discord&logoColor=white)](https://discord.gg/n25xj6J6HM)
[![OpenCollective](https://img.shields.io/badge/OpenCollective-84B5FC?style=flat&logo=opencollective&logoColor=white)](https://opencollective.com/thorvg)
<br>
[![WebCanvas](https://github.com/thorvg/thorvg.web/actions/workflows/build-wcanvas.yml/badge.svg)](https://github.com/thorvg/thorvg.web/actions/workflows/build-wcanvas.yml)
[![Lottie Player](https://github.com/thorvg/thorvg.web/actions/workflows/build-player.yml/badge.svg)](https://github.com/thorvg/thorvg.web/actions/workflows/build-player.yml)

# ThorVG for Web

<p align="center">
  <img width="550" height="auto" src="https://raw.githubusercontent.com/thorvg/thorvg.site/main/readme/logo/animated_brand.svg">
</p>

**ThorVG.Web** is a **WebAssembly (WASM)-based extension** of the ThorVG vector graphics engine, bringing ThorVG’s rendering capabilities to modern web environments. It provides a lightweight and flexible foundation for rendering vector graphics and Lottie animations directly in the browser, with hardware acceleration through **WebGL** and **WebGPU**.</br>

At the core of ThorVG.Web is **WebCanvas**, a **JavaScript/TypeScript API** that provides programmatic access to ThorVG’s drawing primitives, scene graph, animation, effects, and vector rendering pipeline. Developers can create, manipulate, and render dynamic graphics while sharing ThorVG’s core rendering architecture, assets, and graphics workflows across native and web platforms.</br>

The following diagram illustrates the architecture of ThorVG.Web, from the web application layer to the underlying rendering backends and web platform.</br>

The **WebCanvas API** is built on top of lower-level **WebAssembly bindings** generated using **Emscripten**, bridging the JavaScript environment with the native ThorVG engine. The engine handles scene composition and rendering through multiple backends, including the **CPU software renderer**, **WebGL**, and **WebGPU**.</br>

On the web platform, the rendered output is presented through an **HTML `<canvas>` element**, providing consistent rendering behavior while leveraging the appropriate rendering backend for the target environment. <br/>

<p align="center">
  <img width="600" height="auto" src="https://raw.githubusercontent.com/thorvg/thorvg.site/main/readme/example_webcanvas.png">
</p>

## Contents
- [Packages](#-packages)
  - [Lottie Player](#lottie-player)
  - [WebCanvas](#webcanvas)
- [Examples](#examples)
  - [Lottie Player](#lottie-player)
  - [WebCanvas](#webcanvas)
  - [Framework Integration](#framework-integration)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Building from Source](#building-from-source)
  - [Building WASM Bindings](#building-wasm-bindings)

## 📦 Packages

This monorepo contains two complementary packages:

### [Lottie Player](./packages/lottie-player)
[![npm](https://img.shields.io/npm/v/@thorvg/lottie-player)](https://www.npmjs.com/package/@thorvg/lottie-player)

**Lottie animation player** - [Web Components](https://developer.mozilla.org/en-US/docs/Web/API/Web_components) for embedding Lottie animations

```html
<lottie-player
  autoPlay
  loop
  src="animation.json"
  style="width: 500px; height: 500px;"
></lottie-player>
```

---

### [WebCanvas](./packages/webcanvas)
[![npm](https://img.shields.io/npm/v/@thorvg/webcanvas)](https://www.npmjs.com/package/@thorvg/webcanvas)

**ThorVG Canvas for Web** – A TypeScript API with a fluent interface for vector graphics rendering

```typescript
import ThorVG from '@thorvg/webcanvas';

const TVG = await ThorVG.init({ renderer: 'gl' });
const canvas = new TVG.Canvas('#canvas', { width: 800, height: 600 });

const shape = new TVG.Shape();
shape.appendRect(100, 100, 200, 150, { rx: 10, ry: 10 });
shape.fill(255, 0, 0, 255);

canvas.add(shape);
canvas.render();
```

[Back to contents](#contents)
<br />

## Examples

### Lottie Player
- [Software Renderer](./examples/software.html) - Full Lottie support with CPU rendering
- [WebGL Renderer](./examples/webgl.html) - GPU-accelerated Lottie rendering
- [WebGPU Renderer](./examples/webgpu.html) - Next-gen GPU acceleration
- [Software Lite](./examples/software-lite.html) - Lightweight CPU rendering
- [WebGL Lite](./examples/webgl-lite.html) - Lightweight GPU rendering
- [WebGPU Lite](./examples/webgpu-lite.html) - Lightweight WebGPU rendering

### WebCanvas
- [Basic Usage](./examples/basic-usage.html) - Getting started with shapes
- [Animation](./examples/animation-example.html) - Frame-based animations
- [Scene Composition](./examples/scene.html) - Hierarchical object grouping
- [Picture Loading](./examples/picture-example.html) - SVG and image rendering
- [Text Rendering](./examples/text-example.html) - Typography and fonts
- [Live Editor](./examples/live-editor.html) - Interactive code playground

### Framework Integration
- [React Example](./examples/react/)
- [Vue Example](./examples/vue/)
- [Svelte Example](./examples/svelte/)

[Back to contents](#contents)
<br />

## Development

### Prerequisites

- Node.js 20+
- pnpm 10+
- Emscripten SDK (for WASM builds)
- Meson & Ninja (for native builds)

### Building from Source

```bash
# Install dependencies
pnpm install

# Build all packages
pnpm run build

# Clean build artifacts
pnpm run clean
```

### Building WASM Bindings

Each package has its own WASM build script:

```bash
# Build lottie-player WASM
cd packages/lottie-player
sh ./wasm_player_setup.sh

# Build webcanvas WASM
cd packages/webcanvas
sh ./wasm_wcanvas_setup.sh
```

[Back to contents](#contents)
<br />
