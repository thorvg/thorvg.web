# ThorVG Web Canvas Kit Quick Guide

## Quick Start

### Initialization

```typescript
import ThorVG from '@thorvg/canvas-kit';

// Initialize ThorVG
const TVG = await ThorVG.init({
  locateFile: (path) => '../dist/' + path.split('/').pop(),
  renderer: 'wg'  // 'sw', 'gl', or 'wg'
});

// Ready to use!
const canvas = new TVG.Canvas('#canvas', { renderer: 'wg' });
```

---

## Renderer Backend Selection

### Software Renderer ('sw')

```typescript
const TVG = await ThorVG.init({ renderer: 'sw' });
const canvas = new TVG.Canvas('#canvas', { renderer: 'sw' });
```

**Features:**
- CPU-based rendering
- Works in all environments
- No hardware acceleration

**When to use:**
- Environments without WebGL/WebGPU support
- Server-side rendering
- High compatibility requirements

---

### WebGL Renderer ('gl')

```typescript
const TVG = await ThorVG.init({ renderer: 'gl' });
const canvas = new TVG.Canvas('#canvas', { renderer: 'gl' });
```

**Features:**
- GPU-accelerated rendering
- Wide browser support
- Good performance

**When to use:**
- Moderate performance requirements
- Need broad browser compatibility
- Browsers without WebGPU support

---

### WebGPU Renderer ('wg')

```typescript
const TVG = await ThorVG.init({ renderer: 'wg' });
const canvas = new TVG.Canvas('#canvas', { renderer: 'wg' });
```

**Features:**
- Best performance
- Latest GPU API
- Async initialization required
- Limited browser support (Chrome 113+, Edge 113+)

**When to use:**
- Need maximum performance
- Complex animations or many objects
- Targeting modern browsers

---

## Practical Examples

### Example 1: Simple Shape Drawing

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function drawShapes() {
  // Initialize
  const TVG = await ThorVG.init({ renderer: 'wg' });

  // Create Canvas
  const canvas = new TVG.Canvas('#canvas', {
    renderer: 'wg',
    width: 800,
    height: 600
  });

  // Rectangle
  const rect = new TVG.Shape();
  rect.appendRect(100, 100, 200, 150, { rx: 15, ry: 15 })
    .fill(100, 150, 255)
    .stroke({ width: 3, color: [0, 0, 0, 255] });

  // Circle
  const circle = new TVG.Shape();
  circle.appendCircle(600, 300, 80)
    .fill(255, 100, 100);

  // Render
  canvas.add(rect, circle);
  canvas.render();
}

drawShapes();
```

---

### Example 2: Using Gradients

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function drawGradient() {
  const TVG = await ThorVG.init({ renderer: 'gl' });
  const canvas = new TVG.Canvas('#canvas');

  // Linear gradient
  const gradient = new TVG.LinearGradient(0, 0, 400, 0);
  gradient.addStop(0, [255, 0, 0, 255])
    .addStop(0.5, [255, 255, 0, 255])
    .addStop(1, [0, 255, 0, 255]);

  const shape = new TVG.Shape();
  shape.appendRect(50, 50, 400, 200)
    .fill(gradient);

  canvas.add(shape);
  canvas.render();
}

drawGradient();
```

---

### Example 3: Text Rendering

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function drawText() {
  const TVG = await ThorVG.init({ renderer: 'sw' });
  const canvas = new TVG.Canvas('#canvas');

  // Load font
  const fontData = await fetch('fonts/Roboto-Regular.ttf')
    .then(r => r.arrayBuffer());
  TVG.Font.load('Roboto', new Uint8Array(fontData), { format: 'ttf' });

  // Create text
  const text = new TVG.Text();
  text.font('Roboto')
    .text('Hello ThorVG!')
    .fontSize(64)
    .fill(255, 255, 255)
    .outline(3, 0, 0, 0)
    .align({ horizontal: 'center', vertical: 'middle' })
    .translate(400, 300);

  canvas.add(text);
  canvas.render();
}

drawText();
```

---

### Example 4: Lottie Animation

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function playAnimation() {
  const TVG = await ThorVG.init({ renderer: 'wg' });
  const canvas = new TVG.Canvas('#canvas', { renderer: 'wg' });

  // Load Lottie animation
  const animation = new TVG.Animation();
  const lottieData = await fetch('animations/example.json')
    .then(r => r.text());

  animation.load(lottieData);

  // Center and scale picture
  const { width, height } = animation.picture.size();
  animation.picture
    .size(400, 400)
    .translate(200, 100);

  canvas.add(animation.picture);

  // Play animation
  animation.setLoop(true);
  animation.play(() => {
    canvas.update().render();
  });

  // Log info
  const info = animation.info();
  console.log(`Frames: ${info.totalFrames}, Duration: ${info.duration}s, FPS: ${info.fps}`);
}

playAnimation();
```

---

### Example 5: Loading SVG

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function loadSVG() {
  const TVG = await ThorVG.init({ renderer: 'gl' });
  const canvas = new TVG.Canvas('#canvas');

  // Load SVG
  const picture = new TVG.Picture();
  const svgData = await fetch('images/icon.svg').then(r => r.text());

  picture.loadData(svgData, { format: 'svg' })
    .size(300, 300)
    .translate(250, 150);

  canvas.add(picture);
  canvas.render();
}

loadSVG();
```

---

### Example 6: Grouping with Scene

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function groupShapes() {
  const TVG = await ThorVG.init({ renderer: 'sw' });
  const canvas = new TVG.Canvas('#canvas');

  // Create scene
  const scene = new TVG.Scene();

  // Add multiple shapes
  for (let i = 0; i < 5; i++) {
    const circle = new TVG.Shape();
    circle.appendCircle(100 + i * 50, 200, 20)
      .fill(255, i * 50, i * 50);
    scene.add(circle);
  }

  // Apply transforms to entire scene
  scene.rotate(15)
    .scale(1.2)
    .opacity(0.8);

  canvas.add(scene);
  canvas.render();
}

groupShapes();
```

---

### Example 7: Responsive Canvas

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function responsiveCanvas() {
  const TVG = await ThorVG.init({ renderer: 'gl' });
  const canvas = new TVG.Canvas('#canvas');

  // Create shape
  const shape = new TVG.Shape();
  shape.appendRect(0, 0, 100, 100)
    .fill(100, 200, 255);

  canvas.add(shape);

  // Resize handler
  function handleResize() {
    const container = document.querySelector('#canvas');
    const width = container.clientWidth;
    const height = container.clientHeight;

    canvas.resize(width, height);

    // Center position
    shape.translate(width / 2 - 50, height / 2 - 50);

    canvas.render();
  }

  window.addEventListener('resize', handleResize);
  handleResize();
}

responsiveCanvas();
```

---

### Example 8: Interactive Animation

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function interactiveAnimation() {
  const TVG = await ThorVG.init({ renderer: 'wg' });
  const canvas = new TVG.Canvas('#canvas', { renderer: 'wg' });

  // Load animation
  const animation = new TVG.Animation();
  const lottieData = await fetch('animation.json').then(r => r.text());
  animation.load(lottieData);

  canvas.add(animation.picture);
  canvas.render();

  // Button controls
  document.querySelector('#play-btn').addEventListener('click', () => {
    animation.play(() => {
      canvas.update().render();
    });
  });

  document.querySelector('#pause-btn').addEventListener('click', () => {
    animation.pause();
  });

  document.querySelector('#stop-btn').addEventListener('click', () => {
    animation.stop();
    canvas.update().render();
  });

  // Slider for frame control
  const slider = document.querySelector('#frame-slider');
  const info = animation.info();
  slider.max = info.totalFrames - 1;

  slider.addEventListener('input', (e) => {
    animation.pause();
    animation.frame(parseInt(e.target.value));
    canvas.update().render();
  });
}

interactiveAnimation();
```

---

## Auto-Select Backend Utility

Helper function to automatically select the best backend:

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function initWithBestBackend() {
  // Check WebGPU support
  const hasWebGPU = 'gpu' in navigator;

  // Check WebGL support
  const hasWebGL = (() => {
    try {
      const canvas = document.createElement('canvas');
      return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
    } catch {
      return false;
    }
  })();

  // Select best renderer
  let renderer = 'sw';
  if (hasWebGPU) {
    renderer = 'wg';
    console.log('Using WebGPU renderer');
  } else if (hasWebGL) {
    renderer = 'gl';
    console.log('Using WebGL renderer');
  } else {
    console.log('Using Software renderer');
  }

  // Initialize
  const TVG = await ThorVG.init({
    renderer: renderer,
    locateFile: (path) => '../dist/' + path.split('/').pop()
  });

  return { TVG, renderer };
}

// Usage
const { TVG, renderer } = await initWithBestBackend();
const canvas = new TVG.Canvas('#canvas', { renderer });
```

---

## Memory Management Best Practices

### Automatic Cleanup (Recommended)

```typescript
function createTemporaryShapes(canvas) {
  // Use block scope
  {
    const shape = new TVG.Shape();
    shape.appendCircle(100, 100, 50).fill(255, 0, 0);
    canvas.add(shape);
    // Automatically cleaned up at block end
  }
}
```

### Manual Cleanup

```typescript
// Manual cleanup for large resources
const animation = new TVG.Animation();
// ... use ...
animation.dispose();

// Destroy canvas
canvas.destroy();

// Unload font
TVG.Font.unload('CustomFont');

// Terminate all
TVG.term();
```

---

## Error Handling

```typescript
import ThorVG from '@thorvg/canvas-kit';

async function safeInit() {
  try {
    const TVG = await ThorVG.init({
      renderer: 'wg',
      locateFile: (path) => '../dist/' + path.split('/').pop()
    });

    return TVG;
  } catch (error) {
    console.error('ThorVG initialization failed:', error);

    // Fallback to software renderer
    console.log('Falling back to software renderer');
    return await ThorVG.init({ renderer: 'sw' });
  }
}

const TVG = await safeInit();
```

---

## Additional Resources

- **GitHub**: [thorvg.web](https://github.com/lottiefiles/thorvg.web)
- **ThorVG Official**: [thorvg.org](https://thorvg.org)
- **Examples**: Check `examples/` directory

### Documentation

- **English**: [API Reference](./API_REFERENCE.md) | [Usage Guide](./USAGE.md)
- **한국어 (Korean)**: [API 레퍼런스](./API_REFERENCE.ko.md) | [사용 가이드](./USAGE.ko.md)
