import { ShowcaseExample } from './types';

export const strokeExample: ShowcaseExample = {
  id: 'stroke',
  title: 'Stroke Styles',
  description: 'Demonstrate stroke width, join, and cap styles',
  category: 'basic',
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

// Rectangle with Bevel join
const shape1 = new TVG.Shape();
shape1.appendRect(50, 50, 200, 200);
shape1.fill(50, 50, 50, 255);
shape1.stroke({
  width: 10,
  color: [255, 255, 255, 255],
  join: 'bevel'
});

// Rectangle with Round join
const shape2 = new TVG.Shape();
shape2.appendRect(300, 50, 200, 200);
shape2.fill(50, 50, 50, 255);
shape2.stroke({
  width: 10,
  color: [255, 255, 255, 255],
  join: 'round'
});

// Rectangle with Miter join
const shape3 = new TVG.Shape();
shape3.appendRect(550, 50, 200, 200);
shape3.fill(50, 50, 50, 255);
shape3.stroke({
  width: 10,
  color: [255, 255, 255, 255],
  join: 'miter'
});

// Circles with different stroke widths
const shape4 = new TVG.Shape();
shape4.appendCircle(150, 400, 100, 100);
shape4.fill(50, 50, 50, 255);
shape4.stroke({ width: 1, color: [255, 255, 255, 255] });

const shape5 = new TVG.Shape();
shape5.appendCircle(400, 400, 100, 100);
shape5.fill(50, 50, 50, 255);
shape5.stroke({ width: 2, color: [255, 255, 255, 255] });

const shape6 = new TVG.Shape();
shape6.appendCircle(650, 400, 100, 100);
shape6.fill(50, 50, 50, 255);
shape6.stroke({ width: 4, color: [255, 255, 255, 255] });

// Horizontal lines with increasing stroke width
for (let i = 0; i < 10; i++) {
  const hline = new TVG.Shape();
  hline.moveTo(50, 550 + (25 * i));
  hline.lineTo(300, 550 + (25 * i));
  hline.stroke({
    width: i + 1,
    color: [255, 255, 255, 255],
    cap: 'round'
  });
  canvas.add(hline);
}

// Vertical lines with increasing stroke width
for (let i = 0; i < 10; i++) {
  const vline = new TVG.Shape();
  vline.moveTo(500 + (25 * i), 550);
  vline.lineTo(500 + (25 * i), 780);
  vline.stroke({
    width: i + 1,
    color: [255, 255, 255, 255],
    cap: 'round'
  });
  canvas.add(vline);
}

// Lines with different cap styles
const line1 = new TVG.Shape();
line1.moveTo(360, 580);
line1.lineTo(450, 580);
line1.stroke({
  width: 15,
  color: [255, 255, 255, 255],
  cap: 'round'
});

const line2 = new TVG.Shape();
line2.moveTo(360, 630);
line2.lineTo(450, 630);
line2.stroke({
  width: 15,
  color: [255, 255, 255, 255],
  cap: 'square'
});

const line3 = new TVG.Shape();
line3.moveTo(360, 680);
line3.lineTo(450, 680);
line3.stroke({
  width: 15,
  color: [255, 255, 255, 255],
  cap: 'butt'
});

canvas.add(shape1, shape2, shape3, shape4, shape5, shape6, line1, line2, line3);
canvas.render();
`
};
