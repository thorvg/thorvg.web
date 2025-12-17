import { ShowcaseExample } from './types';

export const basicShapesExample: ShowcaseExample = {
  id: 'basic-shapes',
  title: 'Basic Shapes',
  description: 'Draw rectangles, circles, and triangles with fills and strokes',
  category: 'basic',
  thumbnail: '/assets/shape-thumbnail.png',
  code: `import { init } from '@thorvg/canvas-kit';

// Initialize ThorVG with WebGL renderer
const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/canvas-kit/' + path.split('/').pop()
});

// Create canvas instance
const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
  renderer: 'gl'
});

// Create a rounded rectangle
const rect = new TVG.Shape();
rect.appendRect(100, 100, 200, 150, { rx: 10, ry: 10 });
rect.fill(255, 80, 80, 255);

// Create a circle with stroke
const circle = new TVG.Shape();
circle.appendCircle(400, 200, 80, 80);
circle.fill(80, 150, 255, 255);
circle.stroke({ width: 5, color: [0, 0, 0, 255] });

// Create a triangle
const triangle = new TVG.Shape();
triangle.moveTo(300, 400);
triangle.lineTo(400, 550);
triangle.lineTo(200, 550);
triangle.close();
triangle.fill(100, 200, 100, 255);

// Add shapes to canvas and render
canvas.add(rect, circle, triangle);
canvas.render();
`
};
