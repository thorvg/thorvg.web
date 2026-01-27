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

## Quick Start

```typescript
import ThorVG from '@thorvg/webcanvas';

// 1. Initialize ThorVG WASM module
const TVG = await ThorVG.init({
  locateFile: (path) => `/wasm/${path}`,
  renderer: 'gl'  // RendererType: 'sw' | 'gl' | 'wg'
});

// 2. Create canvas
const canvas = new TVG.Canvas('#canvas', {
  width: 800,
  height: 600,
});

// 3. Draw shapes with fluent API
const rect = new TVG.Shape();
rect.appendRect(100, 100, 200, 150, { rx: 10, ry: 10 })
    .fill(255, 0, 0);

const circle = new TVG.Shape();
circle.appendCircle(500, 200, 80, 80)
      .fill(0, 100, 255)
      .stroke({ width: 5, color: [0, 0, 0] });

// 4. Render to canvas
canvas.add(rect).add(circle);
canvas.render();
```

## Core Concepts

### Shapes - Vector Primitives

```typescript
const shape = new TVG.Shape();

// Path drawing
shape.moveTo(50, 50)
     .lineTo(150, 50)
     .lineTo(100, 150)
     .close()
     .fill(255, 0, 0);

// Convenience methods
shape.appendRect(x, y, w, h, { rx: 10, ry: 10 });
shape.appendCircle(cx, cy, radius);
shape.appendPath('M0,0 L100,0 L50,100 Z');
```

### Scenes - Hierarchical Grouping

```typescript
const scene = new TVG.Scene();

// Group shapes and apply transformations
scene.add(shape1).add(shape2).add(shape3);
scene.translate(50, 50)
     .rotate(45)
     .scale(1.5)
     .opacity(0.8);

canvas.add(scene);
```

### Gradients - Advanced Fills

```typescript
// Linear gradient
const linear = new TVG.LinearGradient(0, 0, 200, 0);
linear.setStops(
  [0, [0, 0, 255, 255]],
  [1, [255, 0, 255, 255]]
);
linear.spread(TVG.GradientSpread.Pad);  // GradientSpread.Pad | Reflect | Repeat

// Radial gradient
const radial = new TVG.RadialGradient(100, 100, 50);
radial.addStop(0, [255, 255, 255, 255]);
radial.addStop(1, [0, 0, 0, 255]);

shape.fill(linear);
```

### Pictures - Images & SVG

```typescript
const picture = new TVG.Picture();

// Load SVG from string
picture.load(svgString, { type: 'svg' });

// Load from URL
const response = await fetch('/images/logo.svg');
const svgData = await response.text();
picture.load(svgData, { type: 'svg' });

// Resize
picture.size(300, 300);

canvas.add(picture);
```

### Text - Typography

```typescript
// Load font first
await TVG.Font.load('Roboto', fontDataUint8Array);

// Create text
const text = new TVG.Text();
text.font('Roboto')
    .text('Hello ThorVG!')
    .fontSize(48)
    .fill(0, 0, 0)
    .align(0.5, 0.5);  // x: 0.5 (center), y: 0.5 (middle)

canvas.add(text);
```

### Animations - Lottie Playback

```typescript
const animation = new TVG.Animation();

// Load Lottie JSON
await animation.load(lottieData);

// Get animation info
const info = animation.info();
console.log(`Total frames: ${info.totalFrame}`);
console.log(`Duration: ${info.duration}s`);
console.log(`FPS: ${info.framerate}`);

// Control playback
animation.frame(30);    // Set frame
animation.play();       // Start playback
animation.pause();      // Pause
animation.stop();       // Stop and reset
animation.loop(true);   // Enable looping

// Access picture for rendering
canvas.add(animation.picture);
```

## Rendering Backends

Choose the best renderer for your needs:

| Backend | Performance | Browser Support | Best For |
|---------|-------------|-----------------|----------|
| **Software (sw)** | Good | All browsers | Maximum compatibility |
| **WebGL (gl)** | Better | Chrome/Firefox/Safari 90+ | Balanced performance |
| **WebGPU (wg)** | Best | Chrome/Edge 113+ | Cutting-edge apps |

### Backend-Specific Initialization

```typescript
// Software renderer
const TVG = await ThorVG.init({ renderer: 'sw' });

// WebGL renderer
const TVG = await ThorVG.init({ renderer: 'gl' });

// WebGPU renderer (requires async init)
const TVG = await ThorVG.init({ renderer: 'wg' });
```

## Memory Management

WebCanvas provides automatic memory management through FinalizationRegistry, but you can also manage memory explicitly:

```typescript
// Automatic cleanup when out of scope
{
  const shape = new TVG.Shape();
  canvas.add(shape);
} // WASM memory automatically freed

// Explicit cleanup (recommended for large objects)
shape.dispose();
picture.dispose();
animation.dispose();

// Canvas lifecycle
canvas.clear();     // Clear all objects
canvas.render();    // Re-render
TVG.term();         // Terminate WASM module
```

## API Quick Reference

### Initialization

```typescript
ThorVG.init(options?)        // Load WASM module
TVG.term()                   // Terminate module
```

### Canvas

```typescript
new TVG.Canvas(selector, options)
canvas.add(paint)            // Add object
canvas.remove(paint?)        // Remove objects
canvas.clear()               // Clear all
canvas.render()              // Render frame
canvas.update()              // Update before render
canvas.resize(w, h)          // Resize canvas
canvas.viewport(x, y, w, h)  // Set viewport
```

### Shape

```typescript
new TVG.Shape()
shape.moveTo(x, y)
shape.lineTo(x, y)
shape.cubicTo(cx1, cy1, cx2, cy2, x, y)
shape.close()
shape.appendRect(x, y, w, h, options?)
shape.appendCircle(cx, cy, rx, ry?)
shape.appendPath(svgPath)
shape.fill(r, g, b)          // Color fill (RGB)
shape.fill(gradient)         // Gradient fill
shape.stroke(width)          // Simple stroke
shape.stroke(options)        // Full stroke config
```

### Scene

```typescript
const scene = new TVG.Scene()
scene.add(paint)             // Add child
scene.remove(paint?)         // Remove children
scene.clear()                // Clear all
```

### Paint Transformations (Shape/Scene/Picture/Text)

```typescript
paint.translate(x, y)
paint.rotate(degrees)
paint.scale(sx, sy?)
paint.opacity(value)         // 0-1
paint.visible(boolean)
paint.bounds()               // Get bounding box
paint.duplicate()            // Clone
paint.dispose()              // Free memory
```

### Gradients

```typescript
const linear = new TVG.LinearGradient(x1, y1, x2, y2)
linear.addStop(offset, [r, g, b, a])
linear.spread(TVG.GradientSpread.Pad | Reflect | Repeat)

const radial = new TVG.RadialGradient(cx, cy, radius)
radial.addStop(offset, [r, g, b, a])
radial.spread(TVG.GradientSpread.Pad | Reflect | Repeat)
```

### Picture

```typescript
const picture = new TVG.Picture()
picture.load(data, options?)  // Load from data
picture.size()                // Get size
picture.size(w, h)            // Set size
```

### Text

```typescript
const text = new TVG.Text()
text.font(name)              // Set font
text.text(content)           // Set text
text.fontSize(size)          // Set size
text.fill(r, g, b)           // Color (RGB)
text.fill(gradient)          // Gradient
text.align(x, y)             // Alignment (0.0-1.0 for both axes)
```

### Animation

```typescript
const animation = new TVG.Animation()
animation.load(lottieData)   // Load Lottie JSON
animation.info()             // Get metadata
animation.frame()            // Get current frame
animation.frame(n)           // Set frame
animation.play()             // Start playback
animation.pause()            // Pause
animation.stop()             // Stop and reset
animation.loop(boolean)      // Enable looping
animation.picture            // Get Picture instance
```

### Font

```typescript
TVG.Font.load(name, data, options?)
TVG.Font.unload(name)
```

## Examples

### Documentation

- **[API Documentation](https://thorvg.github.io/thorvg.web)** - Standard TypeDoc hierarchical documentation
- **[Manual Documentation](./API_USAGE.md)** - Complete API documentation with detailed method signatures

### Interactive Examples

- [Basic Usage](../../examples/basic-usage.html) - Getting started with shapes
- [Animation](../../examples/animation-example.html) - Frame-based animations
- [Scene Composition](../../examples/scene.html) - Hierarchical grouping
- [Picture Loading](../../examples/picture-example.html) - SVG and images
- [Text Rendering](../../examples/text-example.html) - Typography
- [Live Editor](../../examples/live-editor.html) - Interactive playground

