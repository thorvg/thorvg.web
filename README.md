[![npm](https://img.shields.io/npm/v/@thorvg/lottie-player)](https://www.npmjs.com/package/@thorvg/lottie-player)

# ThroVG for Web
<p align="center">
  <img width="800" height="auto" src="https://github.com/thorvg/thorvg/blob/main/res/logo/512/thorvg-banner.png">
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

## API Documentation

📚 **[View Full API Documentation](https://thorvg.github.io/thorvg.web/)**

The complete API documentation is generated from the source code using JSDoc and includes:

- **Properties**: All configurable properties with types and descriptions
- **Methods**: Detailed method signatures with parameters and return types
- **Events**: Complete list of events that can be listened to
- **Enums**: PlayMode, PlayerState, FileType, and more
- **Examples**: Code examples for common use cases

### Quick Reference

#### Key Properties
- `src` - Animation source (URL or JSON)
- `autoPlay` - Auto-play on load
- `loop` - Enable looping
- `speed` - Playback speed
- `direction` - Play direction (1 or -1)

#### Main Methods
- `load(src)` - Load animation
- `play()` - Start playback
- `pause()` - Pause animation
- `stop()` - Stop animation
- `seek(frame)` - Jump to frame
- `destroy()` - Clean up player

#### Events
- `load` - Resource loaded
- `ready` - Player ready
- `play` - Started playing
- `pause` - Paused
- `complete` - Animation complete
- `error` - Error occurred

### Generating Documentation

To generate the documentation locally:

```bash
# Generate documentation
npm run docs

# Generate and serve documentation
npm run docs:serve

# Watch for changes and auto-regenerate
npm run docs:watch
```

Documentation will be generated in the `docs/` directory.

## Examples

Please check these examples in various environments.

- [VanillaJS Usage](https://codesandbox.io/p/sandbox/thorvg-lottieplayer-vanillajs-t737qm)
- [React Usage](https://codesandbox.io/p/devbox/thorvg-lottieplayer-react-hkkrq3)
- [VueJS Usage](https://codesandbox.io/p/devbox/thorvg-lottieplayer-vue-758h3l)
- [Svelte Usage](https://codesandbox.io/p/devbox/thorvg-lottieplayer-svelte-xd4zp6)
