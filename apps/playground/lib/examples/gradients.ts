import { ShowcaseExample } from './types';

export const gradientsExample: ShowcaseExample = {
  id: 'gradients',
  title: 'Linear Gradient',
  description: 'Apply linear and radial gradients to shapes',
  category: 'basic',
  thumbnail: '/assets/gradient-thumbnail.png',
  code: `// Native example: LinearGradient.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600
});

//Prepare Round Rectangle
const shape1 = new TVG.Shape();
shape1.appendRect(0, 0, 300, 300);

//LinearGradient
const fill1 = new TVG.LinearGradient(0, 0, 300, 300);
fill1.setStops(
  [0, [0, 0, 0, 255]],
  [1, [255, 255, 255, 255]]
);

shape1.fill(fill1);

//Prepare Circle
const shape2 = new TVG.Shape();
shape2.appendCircle(300, 300, 150, 150);

//LinearGradient
const fill2 = new TVG.LinearGradient(300, 150, 300, 450);
fill2.setStops(
  [0, [255, 0, 0, 255]],
  [0.5, [255, 255, 0, 255]],
  [1, [255, 255, 255, 255]]
);

shape2.fill(fill2);

//Prepare Ellipse
const shape3 = new TVG.Shape();
shape3.appendCircle(450, 450, 112.5, 75);

//LinearGradient
const fill3 = new TVG.LinearGradient(337.5, 450, 562.5, 450);
fill3.setStops(
  [0, [0, 127, 0, 127]],
  [0.25, [0, 170, 170, 170]],
  [0.5, [200, 0, 200, 200]],
  [1, [255, 255, 255, 255]]
);

shape3.fill(fill3);

canvas.add(shape1);
canvas.add(shape2);
canvas.add(shape3);
canvas.render();
`
};
