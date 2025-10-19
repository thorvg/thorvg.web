[![npm](https://img.shields.io/npm/v/@thorvg/lottie-player)](https://www.npmjs.com/package/@thorvg/lottie-player)

# ThorVG for Web
<p align="center">
  <img width="800" height="auto" src="https://github.com/thorvg/thorvg.site/blob/main/readme/logo/512/thorvg-banner.png">
</p>

# @thorvg/lottie-player

A Lottie Player which uses [ThorVG](https://github.com/thorvg/thorvg) as a renderer, provides a web component for easily embedding and playing [Lottie](https://airbnb.io/lottie) animations.

## Installation

- Import from CDN
```html
<script src="https://unpkg.com/@thorvg/lottie-player@latest/dist/lottie-player.js"></script>
```

- Install from [NPM](https://www.npmjs.com/package/@thorvg/lottie-player)
```sh
npm install @thorvg/lottie-player
```

## Usage
### With HTML (Basic Usage)

Once you import from CDN, you can access `<lottie-player/>`

```html
<lottie-player 
  autoPlay 
  loop
  mode="normal"
  src="https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"
  style="width: 500px; height: 500px;"
>
</lottie-player>
```

### With NPM (JS/TS)

Import the library and please follow Basic Usage, you can use library on any NPM-based project such as React, Vue and Svelte.

```ts
import '@thorvg/lottie-player';
```

### With ReactJS + TypeScript

Add `declarations.d.ts` on the root of project and make sure following declaration.

```js
declare namespace JSX {
  interface IntrinsicElements {
    "lottie-player": any;
  }
}
```

Then you will be able to use this as same as above
```js
import '@thorvg/lottie-player';

<lottie-player 
  autoPlay 
  loop
  mode="normal"
  src="https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"
  style="width: 500px; height: 500px;"
>
</lottie-player>
```

### With SSR Framework
We should be careful when using on SSR frameworks such as NextJS, NuxtJS and Svelte, as it means the library must to be rendered on browser/client side.

- NextJS
```ts
import { useEffect } from "react";

export default function Home() {
  // ...

  useEffect(() => {
    import("@thorvg/lottie-player");
  });

  // ...
}
```

- NuxtJS
```html
<template>
  {/* ... */}
</template>

<script>
  export default {
    mounted() {
      import("@thorvg/lottie-player");
    }
  }
</script>
```

- Svelte
```html
<script>
  import { onMount } from 'svelte';

  onMount(async () => {
    await import('@thorvg/lottie-player');
  });
</script>
```

## Player Preset Variants

ThorVG Lottie Player provides multiple presets optimized for different use cases. Each preset can be selected based on bundle size and performance requirements.

### Standard Presets
- **SW**: A CPU-based renderer with full Lottie specification support
- **GL**: A WebGL accelerated renderer with full Lottie specification support

### Lite Presets
- **SW-Lite**: A CPU-based renderer that supports basic Lottie specification (PNG only; Fonts and Expressions are not supported)
- **GL-Lite**: A WebGL accelerated renderer that supports basic Lottie specification (PNG only; Fonts and Expressions are not supported)

### Preset Comparison

| Preset | Renderer | Features | Bundle Size | Use Case |
|--------|----------|---------|-------------|----------|
| `sw` | Software | lottie + expressions, jpg, png, webp, ttf | ~687KB | Full-featured applications with CPU rendering |
| `gl` | WebGL | lottie + expressions, jpg, png, webp, ttf | ~694KB | Full-featured applications with WebGL acceleration |
| `sw-lite` | Software | lottie, png | ~288KB | Lightweight applications with CPU rendering |
| `gl-lite` | WebGL | lottie, png | ~294KB | Lightweight applications with WebGL acceleration |

### Preset Usage

#### CDN Usage
```html
<!-- Default version -->
<script src="https://unpkg.com/@thorvg/lottie-player@latest/dist/lottie-player.js"></script>

<!-- Software Renderer (Standard) -->
<script src="https://unpkg.com/@thorvg/lottie-player@latest/dist/sw/lottie-player.js"></script>

<!-- WebGL Renderer (Standard) -->
<script src="https://unpkg.com/@thorvg/lottie-player@latest/dist/gl/lottie-player.js"></script>

<!-- Software Renderer (Lite) -->
<script src="https://unpkg.com/@thorvg/lottie-player@latest/dist/sw-lite/lottie-player.js"></script>

<!-- WebGL Renderer (Lite) -->
<script src="https://unpkg.com/@thorvg/lottie-player@latest/dist/gl-lite/lottie-player.js"></script>
```

#### NPM Usage
```ts
// Default version
import '@thorvg/lottie-player';

// Software Renderer (Standard)
import '@thorvg/lottie-player/sw';

// WebGL Renderer (Standard)  
import '@thorvg/lottie-player/gl';

// Software Renderer (Lite)
import '@thorvg/lottie-player/sw-lite';

// WebGL Renderer (Lite)
import '@thorvg/lottie-player/gl-lite';
```

## API

### Events

You can adapt the event with the following code example

```jsx
const player = document.querySelector('lottie-player');

player.addEventListener('load', () => {
  // TODO: implements
});
```

| Name | Description |
| --- | --- |
| load | A graphic resource is loaded |
| error | An animation data can’t be parsed. |
| ready | Animation data is loaded and player is ready |
| play | Animation starts playing |
| pause | Animation is paused |
| stop | Animation is stopped |
| freeze | Animation is paused due to player being invisible |
| loop | An animation loop is completed |
| complete | Animation is complete (all loops completed) |
| frame | A new frame is entered |

## Examples

### Framework-specific Examples

Check the usage of each preset in the `example/{framework}` directory:

- [ThorVG React Example](example/react/)
- [ThorVG Vue Example](example/vue/)
- [ThorVG Svelte Example](example/svelte/)

### Build Testing

Test framework compatibility by running builds across different frontend frameworks:

```bash
# From the root directory
$ npm run test:build
```

This will automatically detect framework projects in the `example/` directory and test their build processes.

The build testing script is located in `./build-test/`.

### Local Examples
Check the usage of each preset in the `example/` directory:

- [Software Renderer (Standard)](example/software.html) - Full Lottie support with CPU rendering
- [WebGL Renderer (Standard)](example/webgl.html) - Full Lottie support with WebGL acceleration
- [Software Renderer (Lite)](example/software-lite.html) - Basic Lottie support with CPU rendering
- [WebGL Renderer (Lite)](example/webgl-lite.html) - Basic Lottie support with WebGL acceleration
- [WebGPU Renderer](example/webgpu.html) - Full Lottie support with WebGPU acceleration
