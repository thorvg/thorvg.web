# ThorVG for Web
<p align="center">
  <img width="800" height="auto" src="https://github.com/thorvg/thorvg.site/blob/main/readme/logo/512/thorvg-banner.png">
</p>

[![npm](https://img.shields.io/npm/v/@thorvg/webcanvas)](https://www.npmjs.com/package/@thorvg/webcanvas)

# @thorvg/webcanvas

A high-performance TypeScript Canvas API for [ThorVG](https://github.com/thorvg/thorvg), providing an object-oriented interface with fluent API pattern for vector graphics rendering using WebAssembly.

## Installation

- Import from CDN
```html
<script src="https://unpkg.com/@thorvg/webcanvas@latest/dist/webcanvas.js"></script>
```

- Install from [NPM](https://www.npmjs.com/package/@thorvg/webcanvas)
```bash
npm install @thorvg/webcanvas
```

## Contents
- [Quick Start](#quick-start)
- [Render Backends](#render-backends)
- [Memory Management](#memory-management)
- [Documentation](#documentation)
- [Examples](#examples)


## Quick Start

ThorVG renders vector shapes to a given canvas buffer. The following is a quick start to show you how to use the essential APIs.

First, you should initialize the ThorVG engine:

```typescript
import ThorVG from '@thorvg/webcanvas';

const TVG = await ThorVG.init({ renderer: 'gl' });  // WebGL renderer
```

Then it would be best if you prepared an empty canvas for drawing on it:

```typescript
const canvas = new TVG.Canvas('#canvas', {
  width: 800,
  height: 600
});
```

Next you can draw multiple shapes on the canvas:

```typescript
const rect = new TVG.Shape();                              // generate a shape
rect.appendRect(50, 50, 200, 200, { rx: 20, ry: 20 });    // define it as a rounded rectangle (x, y, w, h, rx, ry)
rect.fill(100, 100, 100);                                  // set its color (r, g, b)
canvas.add(rect);                                          // add the rectangle to the canvas

const circle = new TVG.Shape();                            // generate a shape
circle.appendCircle(400, 400, 100, 100);                   // define it as a circle (cx, cy, rx, ry)

const fill = new TVG.RadialGradient(400, 400, 150);       // generate a radial gradient (cx, cy, radius)

fill.setStops(                                             // set the gradient colors info
  [0.0, [255, 255, 255, 255]],                             // 1st color values (offset, [r, g, b, a])
  [1.0, [0, 0, 0, 255]]                                    // 2nd color values (offset, [r, g, b, a])
);

circle.fill(fill);                                         // set the circle fill
canvas.add(circle);                                        // add the circle to the canvas
```

This code generates the following result:

<p align="center">
  <img width="416" height="auto" src="https://github.com/thorvg/thorvg.site/blob/main/readme/example_shapes.png">
</p>

You can also draw your own shapes and use dashed stroking:

```typescript
const path = new TVG.Shape();                              // generate a path
path.moveTo(199, 34);                                      // set sequential path coordinates
path.lineTo(253, 143);
path.lineTo(374, 160);
path.lineTo(287, 244);
path.lineTo(307, 365);
path.lineTo(199, 309);
path.lineTo(97, 365);
path.lineTo(112, 245);
path.lineTo(26, 161);
path.lineTo(146, 143);
path.close();

path.fill(150, 150, 255);                                  // path color

path.stroke({
  width: 3,                                                // stroke width
  color: [0, 0, 255, 255],                                 // stroke color (r, g, b, a)
  cap: TVG.StrokeCap.Round,                                // stroke cap style
  join: TVG.StrokeJoin.Round,                              // stroke join style
  dash: [10, 10]                                           // stroke dash pattern (line, gap)
});

canvas.add(path);                                          // add the path to the canvas
```

The code generates the following result:

<p align="center">
  <img width="300" height="auto" src="https://github.com/thorvg/thorvg.site/blob/main/readme/example_path.png">
</p>

Now begin rendering & finish it at a particular time:

```typescript
canvas.render();
```

Then you can acquire the rendered image from the canvas element.

Lastly, terminate the engine after its usage:

```typescript
TVG.term();
```

[Back to contents](#contents)
<br />

## Render Backends

ThorVG WebCanvas supports both WebGL and the next-generation WebGPU, optimized for modern browsers and high-performance rendering pipelines. Designed to empower developers with cutting-edge graphics capabilities.

| Backend | Browser Support |
|---------|-----------------|
| **WebGL (gl)** | Chrome/Firefox/Safari 90+ |
| **WebGPU (wg)** | Chrome/Edge 113+/Firefox 141+/Safari 26+ |

### Backend-Specific Initialization

```typescript
// WebGL renderer
const TVG = await ThorVG.init({ renderer: 'gl' });

// WebGPU renderer (requires async init)
const TVG = await ThorVG.init({ renderer: 'wg' });
```

[Back to contents](#contents)
<br />

## Memory Management

WebCanvas provides automatic memory management through FinalizationRegistry, but you can also manage memory explicitly:

```typescript
// Automatic cleanup when GC runs
const shape = new TVG.Shape();
canvas.add(shape);
shape = null; // Call dispose()

// Automatic cleanup on page unload (registry.ts)
window.addEventListener('beforeunload', () => {
  if (hasModule()) {
    const Module = getModule();
    Module.term(); // Terminate WASM
  }
});

// Explicit cleanup (recommended for predictable memory management)
shape.dispose();
picture.dispose();
animation.dispose();

// Terminate WASM module (call this when done)
TVG.term();
```

[Back to contents](#contents)
<br />

## Documentation

- **[API Documentation](https://thorvg.github.io/thorvg.web)** - Standard TypeDoc hierarchical documentation
- **[Manual Documentation](./API_USAGE.md)** - Complete API documentation with detailed method signatures

[Back to contents](#contents)
<br />

## Examples

- [Basic Usage](../../examples/basic-usage.html) - Getting started with shapes
- [Animation](../../examples/animation-example.html) - Frame-based animations
- [Scene Composition](../../examples/scene.html) - Hierarchical grouping
- [Picture Loading](../../examples/picture-example.html) - SVG and images
- [Text Rendering](../../examples/text-example.html) - Typography
- [Live Editor](../../examples/live-editor.html) - Interactive playground

[Back to contents](#contents)
<br />

