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

## Customization

The monitor defaults to the bottom-left corner. 
Override `.thorvg-perf-monitor` to customize its position:

```css
/* top-left */
.thorvg-perf-monitor { top: 12px; right: auto; bottom: auto; left: 12px; }

/* top-right */
.thorvg-perf-monitor { top: 12px; right: 12px; bottom: auto; left: auto; }

/* bottom-left */
.thorvg-perf-monitor { top: auto; right: auto; bottom: 12px; left: 12px; }

/* bottom-right */
.thorvg-perf-monitor { top: auto; right: 12px; bottom: 12px; left: auto; }
```

The details panel opens toward the center of the viewport and aligns to the nearest horizontal edge.

