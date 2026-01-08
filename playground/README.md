# ThorVG Playground

Interactive playground for exploring ThorVG WebCanvas examples with real-time code editing and preview.

## Overview

- 📦 **Showcase**: Browse through curated examples organized by category
- 🎨 **Preview**: See your code changes rendered in real-time on canvas
- 💻 **Live Editor**: Full-featured code editor with syntax highlighting
- 🎯 **Examples**: Basic shapes, gradients, transforms, animations, text, and media

## Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager
- ThorVG WebCanvas built in `../packages/webcanvas`

### Installation

1. **Install dependencies:**

   ```bash
   cd playground
   yarn install
   ```

   This automatically links to the local `@thorvg/webcanvas` package.

2. **Copy WebCanvas WASM files:**

   ```bash
   yarn setup
   ```

   This copies the WASM files from `../packages/webcanvas/dist/` to `public/webcanvas/`.

   > **Note:** If webcanvas hasn't been built yet:
   > ```bash
   > cd ../packages/webcanvas
   > pnpm install && pnpm build
   > cd ../../playground
   > yarn setup
   > ```

3. **Start the development server:**

   ```bash
   yarn dev
   ```

4. **Open your browser:**

   Navigate to [http://localhost:3001](http://localhost:3001)

## Existing Examples

- **Basic**: Fundamental shapes, gradients, transforms
- **Animation**: Animated graphics using requestAnimationFrame
- **Text**: Text rendering with fonts and effects
- **Media**: SVG, images, and Lottie animations



## Adding New Examples

1. Create `lib/examples/my-example.ts`:

```typescript
import { ShowcaseExample } from './types';

export const myExample: ShowcaseExample = {
  id: 'my-example',
  title: 'My Example',
  description: 'What this demonstrates',
  category: 'basic',
  code: `import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
  renderer: 'gl'
});

// Your code here
const shape = new TVG.Shape();
shape.appendCircle(300, 300, 100, 100);
shape.fill(255, 100, 100, 255);

canvas.add(shape);
canvas.render();
`
};
```

2. Export it in `lib/examples/index.ts`:

```typescript
import { myExample } from './my-example';

export const showcaseExamples: ShowcaseExample[] = [
  // ... existing examples
  myExample,
];
```

Your example will automatically appear in the grid!


## Dependencies

- **Next.js 15**: React framework with App Router
- **React 19**: UI library
- **TypeScript**: Type-safe development
- **Monaco Editor**: VS Code's editor in the browser
- **Tailwind CSS**: Utility-first CSS framework
- **ThorVG WebCanvas**: High-performance vector graphics (local package)
