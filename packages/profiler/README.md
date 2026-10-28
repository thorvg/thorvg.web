# @thorvg/profiler

### Web FPS and memory (JS, WASM, GPU) profiler
- FPS: frames per second, sampled every second
- JS heap: used JS heap size
- WASM memory: linear memory of all wasm instances
- GPU memory: buffers, textures and render targets of all WebGL contexts and WebGPU devices

## Install

```sh
npm install @thorvg/profiler
```

```js
import Profiler from '@thorvg/profiler';
```

Or from a CDN:

```js
import Profiler from 'https://esm.sh/gh/thorvg/thorvg.web/packages/profiler/src/index.ts';
```

## Usage

```js
import Profiler from '@thorvg/profiler';

const profiler = new Profiler();
document.body.appendChild(profiler.dom);

function loop() {
  // render
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

Note: Load the profiler before your renderer creates its WebGL context, WebGPU device or wasm instance.

## Drop-in

Add this before your app scripts.

```html
<script type="module">
  import Profiler from 'https://esm.sh/gh/thorvg/thorvg.web/packages/profiler/src/index.ts';
  document.body.appendChild(new Profiler().dom);
</script>
```

