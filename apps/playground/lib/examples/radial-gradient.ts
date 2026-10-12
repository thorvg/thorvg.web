import { ShowcaseExample } from './types';

export const radialGradientExample: ShowcaseExample = {
  id: 'radial-gradient',
  title: 'Radial Gradient',
  description: 'Demonstrate radial gradients',
  category: 'basic',
  thumbnail: '/assets/radial-gradient-thumbnail.png',
  code: `// Native example: RadialGradient.cpp

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
shape1.appendRect(0, 0, 300, 300);    //x, y, w, h

//RadialGradient
const fill = new TVG.RadialGradient(150, 150, 150, 150, 150, 0);  // cx, cy, r, fx, fy, fr

//Gradient Color Stops
fill.setStops(
  [0, [255, 255, 255, 255]],
  [1, [0, 0, 0, 255]]
);

shape1.fill(fill);
canvas.add(shape1);

//Prepare Circle
const shape2 = new TVG.Shape();
shape2.appendCircle(300, 300, 150, 150);    //cx, cy, radiusW, radiusH

//RadialGradient
const fill2 = new TVG.RadialGradient(300, 300, 150, 300, 300, 0);  // cx, cy, r, fx, fy, fr

//Gradient Color Stops
fill2.setStops(
  [0, [255, 0, 0, 255]],
  [0.5, [255, 255, 0, 255]],
  [1, [255, 255, 255, 255]]
);

shape2.fill(fill2);
canvas.add(shape2);

//Prepare Ellipse
const shape3 = new TVG.Shape();
shape3.appendCircle(450, 450, 112.5, 75);    //cx, cy, radiusW, radiusH

//RadialGradient
const fill3 = new TVG.RadialGradient(450, 450, 112.5, 525, 450, 15);  // cx, cy, r, fx, fy, fr

//Gradient Color Stops
fill3.setStops(
  [0, [0, 127, 0, 127]],
  [0.25, [0, 170, 170, 170]],
  [0.5, [200, 0, 200, 200]],
  [1, [255, 255, 255, 255]]
);

shape3.fill(fill3);
canvas.add(shape3);

canvas.render();
`
};
