# ThorVG Playground

Interactive playground for exploring ThorVG WebCanvas examples with real-time code editing and preview.

> Hosted version: https://thorvg-playground.vercel.app/

## Overview

- 📦 **Showcase**: Browse through curated examples organized by category
- 🎨 **Preview**: See your code changes rendered in real-time on canvas
- 💻 **Live Editor**: Full-featured code editor with syntax highlighting
- 🎯 **Examples**: Basic shapes, gradients, transforms, animations, text, and media

## Getting Started

### Prerequisites

- Node.js 20+
- pnpm 10+
- A built ThorVG WebCanvas (`pnpm --filter @thorvg/webcanvas build`)

### Launch Playground

```bash
pnpm install
pnpm build
pnpm start
```

### Development

```bash
pnpm dev
# open http://localhost:3001
```

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
