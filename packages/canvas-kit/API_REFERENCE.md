# ThorVG Canvas Kit API

TypeScript/WebAssembly API for high-performance vector graphics rendering

## Table of Contents

- [Overview](#overview)
- [Initialization](#initialization)
- [Canvas](#canvas)
- [Shape](#shape)
- [Scene](#scene)
- [Picture](#picture)
- [Text](#text)
- [Animation](#animation)
- [Gradients](#gradients)
- [Font](#font)
- [Paint (Base Class)](#paint-base-class)
- [Constants & Enums](#constants--enums)

---

## Overview

ThorVG Canvas Kit provides an object-oriented API supporting WebGPU, WebGL, and Software rendering backends.

### Features

- **Vector Graphics**: Paths, shapes, lines, Bezier curves
- **Image/Vector Files**: SVG, PNG, JPG, WebP, Lottie
- **Text Rendering**: Custom fonts, alignment, layout, outlines
- **Animation**: Lottie animation playback and control
- **Gradients**: Linear and radial gradients
- **Transforms**: Translation, rotation, scaling
- **Opacity and visibility control**

---

## Initialization

### ThorVG.init()

Loads the ThorVG WASM module and initializes the engine.

```ts
import ThorVG from '@thorvg/canvas-kit';

// Initialization
const TVG = await ThorVG.init({
  locateFile: (path) => `/path/to/${path}`,
  renderer: 'wg'
});

// Ready to use!
const canvas = new TVG.Canvas('#canvas', { renderer: 'wg' });
const shape = new TVG.Shape();
```

**Parameters:**
- `options.locateFile?: (path: string) => string` - WASM file path resolver (optional)
- `options.renderer?: 'sw' | 'gl' | 'wg'` - Rendering backend type (optional, default: 'gl')

**Returns:** `Promise<ThorVGNamespace>` - Namespace containing all classes and utilities

**Example:**
```typescript
// WebGL rendering (default)
const TVG = await ThorVG.init();

// WebGPU initialization
const TVG = await ThorVG.init({
  renderer: 'wg',
  locateFile: (path) => '../dist/' + path.split('/').pop()
});

// Software rendering
const TVG = await ThorVG.init({ renderer: 'sw' });

// Use classes via namespace
const canvas = new TVG.Canvas('#canvas');
const shape = new TVG.Shape();
const scene = new TVG.Scene();
```

---

### TVG.term()

Terminates the ThorVG engine and releases resources.

```typescript
TVG.term();
```

You must call `ThorVG.init()` again to use ThorVG after termination.

---

## Canvas

Rendering context. Renders vector graphics to an HTML Canvas element.

### Constructor

```typescript
const canvas = new TVG.Canvas(selector, options);
```

**Parameters:**
- `selector: string` - CSS selector for HTML Canvas element (e.g., `'#canvas'`)
- `options.renderer?: 'sw' | 'gl' | 'wg'` - Renderer type (default: `'sw'`)
- `options.width?: number` - Canvas width (default: 800)
- `options.height?: number` - Canvas height (default: 600)

**Example:**
```typescript
const canvas = new TVG.Canvas('#canvas', {
  renderer: 'wg',
  width: 1920,
  height: 1080
});
```

---

### canvas.add()

Adds Paint objects (Shape, Scene, Picture, Text) to the canvas.

```typescript
canvas.add(paint1, paint2, ...);
```

**Parameters:**
- `...paints: Paint[]` - Paint objects to add

**Returns:** `this` (supports method chaining)

**Example:**
```typescript
const shape = new TVG.Shape();
canvas.add(shape);
```

---

### canvas.remove()

Removes Paint object(s) from the canvas.

```typescript
// Remove specific object
canvas.remove(paint);

// Remove all objects
canvas.remove();
```

**Parameters:**
- `paint?: Paint` - Paint object to remove (omit to remove all)

**Returns:** `this`

---

### canvas.clear()

Removes all Paint objects from the canvas and clears the screen.

```typescript
canvas.clear();
```

**Returns:** `this`

---

### canvas.update()

Updates the canvas. Required before rendering when using animations.

```typescript
canvas.update();
```

**Returns:** `this`

**Note:** Must be called before `render()` when animation frames change.

---

### canvas.render()

Renders the canvas.

```typescript
canvas.render();
```

**Returns:** `this`

**Example (Animation Loop):**
```typescript
animation.play((frame) => {
  canvas.update().render();
});
```

---

### canvas.resize()

Resizes the canvas.

```typescript
canvas.resize(width, height);
```

**Parameters:**
- `width: number` - New width
- `height: number` - New height

**Returns:** `this`

---

### canvas.viewport()

Sets the rendering viewport.

```typescript
canvas.viewport(x, y, width, height);
```

**Parameters:**
- `x: number` - Viewport X coordinate
- `y: number` - Viewport Y coordinate
- `width: number` - Viewport width
- `height: number` - Viewport height

**Returns:** `this`

---

### canvas.destroy()

Destroys the canvas and frees WASM memory.

```typescript
canvas.destroy();
```

**Note:** The module remains active, so you can create new canvases.

---

### canvas.renderer

Returns the currently used renderer.

```typescript
const renderer = canvas.renderer; // 'sw', 'gl', or 'wg'
```

**Returns:** `string`

---

## Shape

Creates and styles vector graphics paths and shapes.

### Constructor

```typescript
const shape = new TVG.Shape();
```

---

### Path Drawing

#### shape.moveTo()

Moves the starting point of the path.

```typescript
shape.moveTo(x, y);
```

**Parameters:**
- `x: number` - X coordinate
- `y: number` - Y coordinate

**Returns:** `this`

---

#### shape.lineTo()

Draws a straight line from the current position to the specified point.

```typescript
shape.lineTo(x, y);
```

**Parameters:**
- `x: number` - Target X coordinate
- `y: number` - Target Y coordinate

**Returns:** `this`

---

#### shape.cubicTo()

Draws a cubic Bezier curve.

```typescript
shape.cubicTo(cx1, cy1, cx2, cy2, x, y);
```

**Parameters:**
- `cx1: number` - First control point X
- `cy1: number` - First control point Y
- `cx2: number` - Second control point X
- `cy2: number` - Second control point Y
- `x: number` - End point X
- `y: number` - End point Y

**Returns:** `this`

---

#### shape.close()

Closes the current path (connects line to starting point).

```typescript
shape.close();
```

**Returns:** `this`

**Example (Triangle):**
```typescript
shape.moveTo(100, 100)
  .lineTo(200, 100)
  .lineTo(150, 200)
  .close()
  .fill(255, 0, 0);
```

---

### Adding Shapes

#### shape.appendRect()

Adds a rectangle.

```typescript
shape.appendRect(x, y, width, height, options?);
```

**Parameters:**
- `x: number` - Top-left X coordinate
- `y: number` - Top-left Y coordinate
- `width: number` - Width
- `height: number` - Height
- `options.rx?: number` - X-axis corner radius (default: 0)
- `options.ry?: number` - Y-axis corner radius (default: 0)
- `options.clockwise?: boolean` - Draw clockwise (default: true)

**Returns:** `this`

**Example:**
```typescript
// Rounded rectangle
shape.appendRect(10, 10, 100, 100, { rx: 10, ry: 10 })
  .fill(0, 128, 255);
```

---

#### shape.appendCircle()

Adds a circle or ellipse.

```typescript
shape.appendCircle(cx, cy, rx, ry?, clockwise?);
```

**Parameters:**
- `cx: number` - Center X coordinate
- `cy: number` - Center Y coordinate
- `rx: number` - X-axis radius
- `ry?: number` - Y-axis radius (default: rx, i.e., perfect circle)
- `clockwise?: boolean` - Draw clockwise (default: true)

**Returns:** `this`

**Example:**
```typescript
// Circle
shape.appendCircle(150, 150, 50).fill(255, 200, 0);

// Ellipse
shape.appendCircle(150, 150, 80, 40).fill(100, 200, 100);
```

---

### Styling

#### shape.fill()

Sets fill color or gradient.

```typescript
// Fill with color
shape.fill(r, g, b, a?);

// Fill with gradient
shape.fill(gradient);
```

**Parameters:**
- `r: number` - Red (0-255)
- `g: number` - Green (0-255)
- `b: number` - Blue (0-255)
- `a?: number` - Alpha (0-255, default: 255)
- `gradient: LinearGradient | RadialGradient` - Gradient object

**Returns:** `this`

**Example:**
```typescript
// Red fill
shape.fill(255, 0, 0);

// Semi-transparent blue
shape.fill(0, 0, 255, 128);

// Gradient
const gradient = new TVG.LinearGradient(0, 0, 100, 100);
gradient.addStop(0, [255, 0, 0, 255]);
gradient.addStop(1, [0, 0, 255, 255]);
shape.fill(gradient);
```

---

#### shape.stroke()

Sets stroke style.

```typescript
// Set stroke width only
shape.stroke(width);

// Set detailed options
shape.stroke(options);
```

**Parameters:**
- `width: number` - Stroke width
- `options.width?: number` - Stroke width
- `options.color?: [r, g, b, a?]` - Stroke color
- `options.gradient?: Fill` - Stroke gradient
- `options.cap?: 'butt' | 'round' | 'square'` - Line cap style
- `options.join?: 'miter' | 'round' | 'bevel'` - Line join style
- `options.miterLimit?: number` - Miter limit value

**Returns:** `this`

**Example:**
```typescript
// Simple stroke
shape.stroke(2);

// Detailed stroke
shape.stroke({
  width: 3,
  color: [0, 0, 0, 255],
  cap: 'round',
  join: 'round'
});
```

---

## Scene

Groups multiple Paint objects for collective management.

### Constructor

```typescript
const scene = new TVG.Scene();
```

---

### scene.add()

Adds Paint objects to the Scene.

```typescript
scene.add(paint1, paint2, ...);
```

**Parameters:**
- `...paints: Paint[]` - Paint objects to add

**Returns:** `this`

**Example:**
```typescript
const scene = new TVG.Scene();
const shape1 = new TVG.Shape().appendRect(0, 0, 50, 50).fill(255, 0, 0);
const shape2 = new TVG.Shape().appendRect(60, 0, 50, 50).fill(0, 255, 0);

scene.add(shape1, shape2);
canvas.add(scene);
```

---

### scene.remove()

Removes Paint object(s) from the Scene.

```typescript
// Remove specific object
scene.remove(paint);

// Remove all objects
scene.remove();
```

**Parameters:**
- `paint?: Paint` - Paint object to remove (omit to remove all)

**Returns:** `this`

---

### scene.clear()

Removes all Paint objects from the Scene (same as `remove()`).

```typescript
scene.clear();
```

**Returns:** `this`

---

## Picture

Loads and renders images and vector files (SVG, PNG, JPG, WebP, Lottie).

### Constructor

```typescript
const picture = new TVG.Picture();
```

---

### picture.loadData()

Loads image data from memory.

```typescript
picture.loadData(data, options?);
```

**Parameters:**
- `data: Uint8Array | string` - Image data (SVG can be string)
- `options.format?: 'svg' | 'png' | 'jpg' | 'jpeg' | 'webp' | 'lottie' | 'json'` - File format (default: 'svg')
- `options.resourcePath?: string` - Path for resolving relative resources
- `options.copy?: boolean` - Whether to copy data (default: false)

**Returns:** `this`

**Example:**
```typescript
// Load SVG
const svgData = '<svg>...</svg>';
picture.loadData(svgData, { format: 'svg' });

// Load PNG
const response = await fetch('image.png');
const arrayBuffer = await response.arrayBuffer();
picture.loadData(new Uint8Array(arrayBuffer), { format: 'png' });

canvas.add(picture);
```

---

### picture.load()

Loads image from file path (for Node.js or when file system is accessible).

```typescript
picture.load(path);
```

**Parameters:**
- `path: string` - File path

**Returns:** `this`

---

### picture.size()

Gets or sets the Picture size.

```typescript
// Getter
const size = picture.size();

// Setter
picture.size(width, height);
```

**Parameters (Setter):**
- `width: number` - Target width
- `height: number` - Target height

**Returns (Getter):**
```typescript
{
  width: number;
  height: number;
}
```

**Returns (Setter):** `this`

**Example:**
```typescript
// Scale SVG to specific size
picture.loadData(svgData, { format: 'svg' })
  .size(400, 300);

// Check current size
const { width, height } = picture.size();
```

---

## Text

Renders text with custom fonts and styling.

### Constructor

```typescript
const text = new TVG.Text();
```

---

### text.font()

Sets the font to use.

```typescript
text.font(fontName);
```

**Parameters:**
- `fontName: string` - Font name (loaded via `Font.load()` or `"default"`)

**Returns:** `this`

---

### text.text()

Sets the text content (UTF-8 supported).

```typescript
text.text(content);
```

**Parameters:**
- `content: string` - Text to display

**Returns:** `this`

---

### text.fontSize()

Sets the font size.

```typescript
text.fontSize(size);
```

**Parameters:**
- `size: number` - Font size in pixels

**Returns:** `this`

---

### text.fill()

Sets text color or gradient.

```typescript
// Fill with color
text.fill(r, g, b);

// Fill with gradient
text.fill(gradient);
```

**Parameters:**
- `r: number` - Red (0-255)
- `g: number` - Green (0-255)
- `b: number` - Blue (0-255)
- `gradient: LinearGradient | RadialGradient` - Gradient object

**Returns:** `this`

---

### text.align()

Sets text alignment.

```typescript
// Align with numbers (0.0 ~ 1.0)
text.align(horizontal, vertical);

// Align with names
text.align({ horizontal: 'center', vertical: 'middle' });
```

**Parameters:**
- `horizontal: number | 'left' | 'center' | 'right'` - Horizontal alignment (0.0 = left, 0.5 = center, 1.0 = right)
- `vertical: number | 'top' | 'middle' | 'bottom'` - Vertical alignment (0.0 = top, 0.5 = middle, 1.0 = bottom)

**Returns:** `this`

---

### text.layout()

Sets text layout constraints (for wrapping).

```typescript
text.layout(width, height?);
```

**Parameters:**
- `width: number` - Maximum width (0 = no constraint)
- `height?: number` - Maximum height (0 = no constraint, default: 0)

**Returns:** `this`

---

### text.wrap()

Sets text wrapping mode.

```typescript
text.wrap(mode);
```

**Parameters:**
- `mode: 'none' | 'character' | 'word' | 'smart' | 'ellipsis'` - Wrapping mode

**Returns:** `this`

---

### text.italic()

Sets italic style.

```typescript
text.italic(shear);
```

**Parameters:**
- `shear: number` - Shear factor (0.0 = no italic, typical: 0.1-0.3)

**Returns:** `this`

---

### text.outline()

Sets text outline (stroke).

```typescript
// Color outline
text.outline(width, r, g, b);

// Gradient outline
text.outline(width, gradient);
```

**Parameters:**
- `width: number` - Outline width
- `r: number` - Red (0-255)
- `g: number` - Green (0-255)
- `b: number` - Blue (0-255)
- `gradient: LinearGradient | RadialGradient` - Gradient object

**Returns:** `this`

---

### Text Usage Example

```typescript
// Load custom font
const fontData = await fetch('font.ttf').then(r => r.arrayBuffer());
TVG.Font.load('MyFont', new Uint8Array(fontData), { format: 'ttf' });

// Create and style text
const text = new TVG.Text();
text.font('MyFont')
  .text('Hello ThorVG!')
  .fontSize(48)
  .fill(255, 255, 255)
  .outline(2, 0, 0, 0)
  .align({ horizontal: 'center', vertical: 'middle' })
  .translate(400, 300);

canvas.add(text);
canvas.render();
```

---

## Animation

Loads and controls Lottie animations.

### Constructor

```typescript
const animation = new TVG.Animation();
```

---

### animation.load()

Loads Lottie animation data.

```typescript
animation.load(data, options?);
```

**Parameters:**
- `data: Uint8Array | string` - Lottie JSON data
- `options.resourcePath?: string` - Resource path
- `options.copy?: boolean` - Whether to copy data

**Returns:** `this`

**Example:**
```typescript
const response = await fetch('animation.json');
const lottieData = await response.text();
animation.load(lottieData);
```

---

### animation.picture

Returns the animation's Picture object (read-only).

```typescript
const picture = animation.picture;
canvas.add(picture);
```

**Returns:** `Picture | null`

**Note:** Picture is owned by Animation, do not manually dispose.

---

### animation.info()

Returns animation information.

```typescript
const info = animation.info();
```

**Returns:**
```typescript
{
  totalFrames: number;  // Total frame count
  duration: number;     // Duration in seconds
  fps: number;          // Frames per second
} | null
```

---

### animation.frame()

Gets or sets the current frame.

```typescript
// Getter
const currentFrame = animation.frame();

// Setter
animation.frame(frameNumber);
```

**Parameters (Setter):**
- `frameNumber: number` - Frame number

**Returns (Getter):** `number`

**Returns (Setter):** `this`

---

### animation.segment()

Sets animation segment/marker (for partial playback).

```typescript
animation.segment(segmentIndex);
```

**Parameters:**
- `segmentIndex: number` - Segment index (0-based)

**Returns:** `this`

---

### animation.play()

Plays the animation.

```typescript
animation.play(onFrame?);
```

**Parameters:**
- `onFrame?: (frame: number) => void` - Callback called on each frame

**Returns:** `this`

**Example:**
```typescript
animation.play((frame) => {
  canvas.update().render();
});
```

---

### animation.pause()

Pauses the animation.

```typescript
animation.pause();
```

**Returns:** `this`

---

### animation.stop()

Stops the animation and resets to frame 0.

```typescript
animation.stop();
```

**Returns:** `this`

---

### animation.isPlaying()

Checks if animation is currently playing.

```typescript
const playing = animation.isPlaying();
```

**Returns:** `boolean`

---

### animation.setLoop()

Sets animation looping.

```typescript
animation.setLoop(loop);
```

**Parameters:**
- `loop: boolean` - Whether to loop

**Returns:** `this`

---

### animation.getLoop()

Returns loop status.

```typescript
const loop = animation.getLoop();
```

**Returns:** `boolean`

---

### animation.seek()

Seeks to a specific time.

```typescript
animation.seek(time);
```

**Parameters:**
- `time: number` - Target time in seconds

**Returns:** `this`

---

### animation.getCurrentTime()

Returns current playback time.

```typescript
const time = animation.getCurrentTime();
```

**Returns:** `number` - Current time in seconds

---

### animation.dispose()

Destroys the animation and frees resources.

```typescript
animation.dispose();
```

---

### Animation Usage Example

```typescript
const animation = new TVG.Animation();
const lottieData = await fetch('animation.json').then(r => r.text());

animation.load(lottieData);
canvas.add(animation.picture);

animation.setLoop(true);
animation.play((frame) => {
  canvas.update().render();
});

// Pause after 3 seconds
setTimeout(() => animation.pause(), 3000);
```

---

## Gradients

Creates linear and radial gradients.

### LinearGradient

Creates a linear gradient.

#### Constructor

```typescript
const gradient = new TVG.LinearGradient(x1, y1, x2, y2);
```

**Parameters:**
- `x1: number` - Start point X
- `y1: number` - Start point Y
- `x2: number` - End point X
- `y2: number` - End point Y

---

### RadialGradient

Creates a radial gradient.

#### Constructor

```typescript
const gradient = new TVG.RadialGradient(cx, cy, r, fx?, fy?, fr?);
```

**Parameters:**
- `cx: number` - Center X
- `cy: number` - Center Y
- `r: number` - Radius
- `fx?: number` - Focus X (default: cx)
- `fy?: number` - Focus Y (default: cy)
- `fr?: number` - Focus radius (default: 0)

---

### gradient.addStop()

Adds a color stop to the gradient.

```typescript
gradient.addStop(offset, color);
```

**Parameters:**
- `offset: number` - Stop position (0.0 ~ 1.0)
- `color: [r, g, b, a]` - RGBA color (each 0-255)

**Returns:** `this`

**Example:**
```typescript
const gradient = new TVG.LinearGradient(0, 0, 200, 0);
gradient.addStop(0, [255, 0, 0, 255]);    // Red
gradient.addStop(0.5, [255, 255, 0, 255]); // Yellow
gradient.addStop(1, [0, 255, 0, 255]);    // Green

shape.fill(gradient);
```

---

### gradient.spread()

Sets gradient spread method.

```typescript
gradient.spread(type);
```

**Parameters:**
- `type: 'pad' | 'reflect' | 'repeat'` - Spread method
  - `'pad'` - Extend boundary colors
  - `'reflect'` - Reflect repeat
  - `'repeat'` - Normal repeat

**Returns:** `this`

---

## Font

Loads and manages custom fonts. Fonts are globally available.

### Font.load()

Loads font from memory.

```typescript
TVG.Font.load(name, data, options?);
```

**Parameters:**
- `name: string` - Unique font name
- `data: Uint8Array` - Font data
- `options.format?: 'ttf' | 'otf'` - Font format (default: 'ttf')
- `options.copy?: boolean` - Whether to copy data (default: true)

**Returns:** `void`

**Example:**
```typescript
const fontData = await fetch('MyFont.ttf').then(r => r.arrayBuffer());
TVG.Font.load('MyFont', new Uint8Array(fontData), { format: 'ttf' });

// Use in Text
const text = new TVG.Text();
text.font('MyFont').text('Hello!');
```

---

### Font.loadFromPath()

Loads font from file path (for Node.js or when file system is accessible).

```typescript
TVG.Font.loadFromPath(name, path);
```

**Parameters:**
- `name: string` - Unique font name
- `path: string` - Font file path

**Returns:** `void`

---

### Font.unload()

Unloads a loaded font.

```typescript
TVG.Font.unload(name);
```

**Parameters:**
- `name: string` - Font name to unload

**Returns:** `void`

---

## Paint (Base Class)

Base class for all renderable objects (Shape, Scene, Picture, Text).

### Transform Methods

#### paint.translate()

Translates the object.

```typescript
paint.translate(x, y);
```

**Parameters:**
- `x: number` - X-axis translation
- `y: number` - Y-axis translation

**Returns:** `this`

---

#### paint.rotate()

Rotates the object.

```typescript
paint.rotate(angle);
```

**Parameters:**
- `angle: number` - Rotation angle in degrees

**Returns:** `this`

---

#### paint.scale()

Scales the object.

```typescript
paint.scale(sx, sy?);
```

**Parameters:**
- `sx: number` - X-axis scale
- `sy?: number` - Y-axis scale (defaults to sx if omitted)

**Returns:** `this`

---

### Property Methods

#### paint.opacity()

Gets or sets opacity.

```typescript
// Getter
const opacity = paint.opacity();

// Setter
paint.opacity(value);
```

**Parameters (Setter):**
- `value: number` - Opacity (0.0 ~ 1.0)

**Returns (Getter):** `number`

**Returns (Setter):** `this`

---

#### paint.visible()

Gets or sets visibility.

```typescript
// Getter
const isVisible = paint.visible();

// Setter
paint.visible(value);
```

**Parameters (Setter):**
- `value: boolean` - Visibility

**Returns (Getter):** `boolean`

**Returns (Setter):** `this`

---

#### paint.bounds()

Returns the axis-aligned bounding box (AABB) of the object.

```typescript
const bounds = paint.bounds();
```

**Returns:**
```typescript
{
  x: number;
  y: number;
  width: number;
  height: number;
}
```

---

#### paint.duplicate()

Duplicates the Paint object.

```typescript
const clone = paint.duplicate();
```

**Returns:** `T extends Paint` - Cloned object

**Example:**
```typescript
const shape1 = new TVG.Shape().appendRect(0, 0, 50, 50).fill(255, 0, 0);
const shape2 = shape1.duplicate();
shape2.translate(60, 0).fill(0, 255, 0);
```

---

### Transform Chaining Example

```typescript
const shape = new TVG.Shape();
shape.appendRect(0, 0, 100, 100)
  .fill(255, 0, 0)
  .translate(200, 100)
  .rotate(45)
  .scale(1.5)
  .opacity(0.8);

canvas.add(shape);
```

---

## Constants & Enums

### BlendMethod

Blend modes (future support).

```typescript
enum BlendMethod {
  Normal = 0,
  Multiply = 1,
  Screen = 2,
  Overlay = 3,
  Darken = 4,
  Lighten = 5,
  ColorDodge = 6,
  ColorBurn = 7,
  HardLight = 8,
  SoftLight = 9,
  Difference = 10,
  Exclusion = 11,
}
```

---

### StrokeCap

Line cap styles.

```typescript
enum StrokeCap {
  Butt = 0,    // Flat
  Round = 1,   // Rounded
  Square = 2,  // Square
}
```

**Type:** `'butt' | 'round' | 'square'`

---

### StrokeJoin

Line join styles.

```typescript
enum StrokeJoin {
  Miter = 0,  // Sharp
  Round = 1,  // Rounded
  Bevel = 2,  // Beveled
}
```

**Type:** `'miter' | 'round' | 'bevel'`

---

### FillRule

Fill rules (future support).

```typescript
enum FillRule {
  Winding = 0,
  EvenOdd = 1,
}
```

---

### GradientSpread

Gradient spread methods.

```typescript
enum GradientSpread {
  Pad = 0,       // Extend boundary colors
  Reflect = 1,   // Reflect repeat
  Repeat = 2,    // Normal repeat
}
```

**Type:** `'pad' | 'reflect' | 'repeat'`

---

### CompositeMethod

Composite methods (future support).

```typescript
enum CompositeMethod {
  None = 0,
  ClipPath = 1,
  AlphaMask = 2,
  InvAlphaMask = 3,
  LumaMask = 4,
  InvLumaMask = 5,
}
```

---

### TextWrapMode

Text wrapping modes.

```typescript
enum TextWrapMode {
  None = 0,       // No wrapping
  Character = 1,  // Character-based
  Word = 2,       // Word-based
  Smart = 3,      // Smart wrapping
  Ellipsis = 4,   // Ellipsis (...)
}
```

**Type:** `'none' | 'character' | 'word' | 'smart' | 'ellipsis'`

---

### RendererType

Renderer backend types.

```typescript
type RendererType = 'sw' | 'gl' | 'wg' | 'auto';
```

- `'sw'` - Software (CPU) rendering
- `'gl'` - WebGL (hardware accelerated)
- `'wg'` - WebGPU (best performance)
- `'auto'` - Auto-select (future support)

---

## Memory Management

ThorVG Canvas Kit provides automatic memory management.

### Automatic Cleanup (Recommended)

```typescript
{
  const shape = new TVG.Shape();
  canvas.add(shape);
  // GC + FinalizationRegistry handles cleanup at block end
}
```

### Manual Cleanup

For large objects or when immediate cleanup is needed:

```typescript
// Cleanup Paint objects
shape.dispose();

// Destroy Canvas
canvas.destroy();

// Cleanup Animation
animation.dispose();
```

---

## Complete Usage Example

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function main() {
  // 1. Initialize ThorVG
  const TVG = await ThorVG.init({
    locateFile: (path) => '../dist/' + path.split('/').pop(),
    renderer: 'wg'
  });

  // 2. Create Canvas
  const canvas = new TVG.Canvas('#canvas', {
    renderer: 'wg',
    width: 800,
    height: 600
  });

  // 3. Create Shape
  const rect = new TVG.Shape();
  rect.appendRect(50, 50, 200, 100, { rx: 10, ry: 10 })
    .fill(100, 150, 255)
    .stroke({ width: 3, color: [0, 0, 0, 255] })
    .translate(100, 100)
    .rotate(15);

  // 4. Gradient circle
  const circle = new TVG.Shape();
  const gradient = new TVG.LinearGradient(0, 0, 100, 100);
  gradient.addStop(0, [255, 0, 0, 255])
    .addStop(1, [255, 255, 0, 255]);

  circle.appendCircle(400, 300, 80)
    .fill(gradient);

  // 5. Group with Scene
  const scene = new TVG.Scene();
  scene.add(rect, circle)
    .opacity(0.9);

  // 6. Add text
  const fontData = await fetch('font.ttf').then(r => r.arrayBuffer());
  TVG.Font.load('CustomFont', new Uint8Array(fontData));

  const text = new TVG.Text();
  text.font('CustomFont')
    .text('ThorVG Canvas Kit')
    .fontSize(48)
    .fill(255, 255, 255)
    .outline(2, 0, 0, 0)
    .align({ horizontal: 'center', vertical: 'top' })
    .translate(400, 50);

  // 7. Lottie animation
  const animation = new TVG.Animation();
  const lottieData = await fetch('animation.json').then(r => r.text());
  animation.load(lottieData);

  animation.picture.translate(600, 400).scale(0.5);

  // 8. Add to canvas and render
  canvas.add(scene, text, animation.picture);

  // 9. Play animation
  animation.setLoop(true);
  animation.play(() => {
    canvas.update().render();
  });

  // 10. Interaction
  document.querySelector('#pause-btn').addEventListener('click', () => {
    animation.pause();
  });
}

main();
```

---

## Additional Resources

- **GitHub**: [thorvg.web](https://github.com/lottiefiles/thorvg.web)
- **ThorVG Official**: [thorvg.org](https://thorvg.org)
- **Examples**: Check `examples/` directory

### Documentation

- **English**: [API Reference](./API_REFERENCE.md) | [Usage Guide](./USAGE.md)
- **한국어 (Korean)**: [API 레퍼런스](./API_REFERENCE.ko.md) | [사용 가이드](./USAGE.ko.md)

---

## License

MIT License
