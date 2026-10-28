# @thorvg/perf-monitor

### Web FPS and memory (JS, WASM, GPU) monitor
- FPS: frames per second, sampled every second
- JS heap: used JS heap size
- WASM memory: linear memory of all wasm instances
- GPU memory: buffers, textures and render targets of all WebGL contexts and WebGPU devices

## Usage

```js
import PerfMonitor from 'https://esm.sh/gh/thorvg/thorvg.web/packages/perf-monitor/src/index.ts';

const perfMonitor = new PerfMonitor();
document.body.appendChild(perfMonitor.dom);

function loop() {
  // render
  requestAnimationFrame(loop);
}
requestAnimationFrame(loop);
```

Note: Load the monitor before your renderer creates its WebGL context, WebGPU device or wasm instance.

## Drop-in

Add this before your app scripts.

```html
<script type="module">
  import PerfMonitor from 'https://esm.sh/gh/thorvg/thorvg.web/packages/perf-monitor/src/index.ts';
  document.body.appendChild(new PerfMonitor().dom);
</script>
```

