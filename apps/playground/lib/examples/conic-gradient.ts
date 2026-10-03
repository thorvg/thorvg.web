import { ShowcaseExample } from './types';

export const conicGradientExample: ShowcaseExample = {
  id: 'conic-gradient',
  title: 'Conic Gradient',
  description: 'Demonstrate conic gradients',
  category: 'basic',
  thumbnail: '/assets/conic-gradient-thumbnail.png',
  code: `// Native example: ConicGradient.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Prepare Round Rectangle
const shape1 = new TVG.Shape();
shape1.appendRect(0, 0, 300, 300);

//ConicGradient
const gradient1 = new TVG.ConicGradient(150, 150, 0);
gradient1.setStops(
  [0, [255, 255, 255, 255]],
  [1, [0, 0, 0, 255]]
);

shape1.fill(gradient1);

//Prepare Circle
const shape2 = new TVG.Shape();
shape2.appendCircle(300, 300, 150, 150);

//ConicGradient
const gradient2 = new TVG.ConicGradient(300, 300, 0);
gradient2.setStops(
  [0, [0, 255, 255, 255]],
  [1 / 3, [255, 0, 255, 255]],
  [2 / 3, [255, 255, 0, 255]],
  [1, [0, 255, 255, 255]]
);

shape2.fill(gradient2);

//Prepare Ellipse
const shape3 = new TVG.Shape();
shape3.appendCircle(450, 450, 112.5, 75);

//ConicGradient
const gradient3 = new TVG.ConicGradient(450, 450, 0);
gradient3.setStops(
  [0, [0, 127, 0, 127]],
  [0.25, [0, 170, 170, 170]],
  [0.5, [200, 0, 200, 200]],
  [1, [255, 255, 255, 255]]
);

shape3.fill(gradient3);

canvas.add(shape1);
canvas.add(shape2);
canvas.add(shape3);
canvas.render();
`
};
