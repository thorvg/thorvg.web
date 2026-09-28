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

## 📑 Contents
- [Packages](#-packages)
- [Examples](#examples)
  - [WebCanvas](#webcanvas)
  - [Lottie Player](#lottie-player)
  - [Framework Integration](#framework-integration)
- [Demo](#demo)
  - [Thor MarbleRace](#thor-marblerace)
  - [Lottie Test](#lottie-test)
- [Development](#development)
  - [Prerequisites](#prerequisites)
  - [Building from Source](#building-from-source)
  - [Building WASM Bindings](#building-wasm-bindings)
- [Partners](#partners)
- [Communication](#communication)

<br />

## 📦 Packages

This monorepo contains two complementary packages:

| Package | Description | Version |
| :--- | :--- | :--- |
| [WebCanvas](./packages/webcanvas) | Fluent TypeScript API for vector graphics rendering | [![npm](https://img.shields.io/npm/v/@thorvg/webcanvas)](https://www.npmjs.com/package/@thorvg/webcanvas) |
| [Lottie Player](./packages/lottie-player) | Web Component for embedding Lottie animations | [![npm](https://img.shields.io/npm/v/@thorvg/lottie-player)](https://www.npmjs.com/package/@thorvg/lottie-player) |

<br />

## 🎨 Examples

### WebCanvas
- [ThorVG Playground](https://www.thorvg.org/playground) - Explore vector graphics interactively.

### Lottie Player
- [Basic Usage](./examples/index.html) - Get started with player setup and basic Lottie playback.

### Framework Integration
- [React Example](./examples/react/)
- [Vue Example](./examples/vue/)
- [Svelte Example](./examples/svelte/)

<br />

## ▶️Demo

### Thor MarbleRace
A pinball-inspired racing demo game where multiple balls bounce through obstacles and race to the finish, showcasing the power of ThorVG WebCanvas. [Give it try!](https://thorvg-marblerace.vercel.app/)!
<p align="center">
  <img width="700" height="auto" src="https://github.com/thorvg/thorvg.demo.marblerace/blob/main/docs/screenshot.jpg">
</p>

### Lottie Test
An animation benchmarking app for testing Lottie rendering performance, powered by ThorVG WebCanvas. 👉 [Link](https://thorvg-perf-test.vercel.app/)
<p align="center">
  <img width="700" height="auto" alt="image" src="https://github.com/user-attachments/assets/b6bb08a1-f481-4c25-b1c7-27cababb3230" />
</p>

<br />

## 🛠️ Development

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
# Build webcanvas WASM
cd packages/webcanvas
sh ./wasm_wcanvas_setup.sh

# Build lottie-player WASM
cd packages/lottie-player
sh ./wasm_player_setup.sh
```

<br />

## 🤝 Partners
Corporate partners collaborate with ThorVG Web through development, integration, and strategic initiatives that help advance the project. 
<br />
<br />
<p align="center", href="https://www.lottiefiles.com">
  <a href="https://www.lottiefiles.com">
  <img width="250" height="auto" src="https://github.com/thorvg/thorvg.site/blob/main/readme/partner_lottiefiles.jpg"  alt="LottieFiles">
  </a>
</p>
<br />

If you’re interested in partnering with ThorVG, we’d love to hear from you. Please reach out at thorvg@thorvg.org

<br />

## 💬Communication
For real-time conversations and discussions, please join us on [Discord](https://discord.gg/n25xj6J6HM)
