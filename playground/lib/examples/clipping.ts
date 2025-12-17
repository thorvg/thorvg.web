import { ShowcaseExample } from './types';

export const clippingExample: ShowcaseExample = {
  id: 'clipping',
  title: 'Clipping',
  description: 'Demonstrate clipping masks for shapes and scenes',
  category: 'advanced',
  code: `import { init } from '@thorvg/canvas-kit';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/canvas-kit/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 800,
  height: 800,
  renderer: 'gl'
});

// Background
const background = new TVG.Shape();
background.appendRect(0, 0, 800, 800);
background.fill(255, 255, 255, 255);

// Star shape
const star = new TVG.Shape();
star.moveTo(199, 34);
star.lineTo(253, 143);
star.lineTo(374, 160);
star.lineTo(287, 244);
star.lineTo(307, 365);
star.lineTo(199, 309);
star.lineTo(97, 365);
star.lineTo(112, 245);
star.lineTo(26, 161);
star.lineTo(146, 143);
star.close();
star.fill(255, 255, 0, 255);
star.stroke({ width: 10, color: [255, 0, 0, 255] });

// Clip the star with a circle
const clipCircle = new TVG.Shape();
clipCircle.appendCircle(200, 230, 110, 110);
star.clip(clipCircle);

// Rectangle with clipping
const rect = new TVG.Shape();
rect.appendRect(500, 420, 250, 250, { rx: 20, ry: 20 });
rect.fill(255, 0, 255, 160);

// Clip the rectangle with a circle
const clipShape = new TVG.Shape();
clipShape.appendCircle(600, 550, 150, 150);
rect.clip(clipShape);

canvas.add(background, star, rect);
canvas.render();

// Note: This example demonstrates where clipping would be used.
// The clip() method is not yet implemented in the Canvas API.
`
};
