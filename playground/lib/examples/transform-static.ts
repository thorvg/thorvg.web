import { ShowcaseExample } from './types';

export const transformStaticExample: ShowcaseExample = {
  id: 'transform-static',
  title: 'Transforms (Static)',
  description: 'Apply rotation, scale, and translation transforms to shapes',
  category: 'basic',
  thumbnail: '/assets/transform-thumbnail.png',
  code: `import { init } from '@thorvg/canvas-kit';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/canvas-kit/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
  renderer: 'gl'
});

// Create rotating shapes in a circle pattern
for (let i = 0; i < 8; i++) {
  const rect = new TVG.Shape();
  rect.appendRect(50, 25, 100, 50, { rx: 5, ry: 5 });

  // Calculate color based on position
  const hue = (i * 45) % 360;
  const r = Math.abs(Math.sin(hue * Math.PI / 180)) * 255;
  const g = Math.abs(Math.sin((hue + 120) * Math.PI / 180)) * 255;
  const b = Math.abs(Math.sin((hue + 240) * Math.PI / 180)) * 255;

  rect.fill(r, g, b, 255);

  // Apply transformations: translate to center, rotate, then translate outward
  rect.translate(300, 300);
  rect.rotate(i * 45);
  rect.translate(300, 300);

  canvas.add(rect);
}

// Add center circle
const center = new TVG.Shape();
center.appendCircle(300, 300, 30, 30);
center.fill(0, 255, 255, 255);
canvas.add(center);

canvas.render();
`
};
