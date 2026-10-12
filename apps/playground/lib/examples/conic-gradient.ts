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

let angle = 0;
const colorStops = [
  [0, [255, 255, 255, 255]],
  [1, [0, 0, 0, 255]]
];
const colorStops2 = [
  [0, [0, 255, 255, 255]],
  [1 / 3, [255, 0, 255, 255]],
  [2 / 3, [255, 255, 0, 255]],
  [1, [0, 255, 255, 255]]
];
const colorStops3 = [
  [0, [0, 127, 0, 127]],
  [0.25, [0, 170, 170, 170]],
  [0.5, [200, 0, 200, 200]],
  [1, [255, 255, 255, 255]]
];

//Prepare Round Rectangle
const shape1 = new TVG.Shape();
shape1.appendRect(0, 0, 300, 300);    //x, y, w, h

//ConicGradient
const fill = new TVG.ConicGradient(150, 150, angle);   //cx, cy, angle

//Gradient Color Stops
fill.setStops(...colorStops);

shape1.fill(fill);
canvas.add(shape1);

//Prepare Circle
const shape2 = new TVG.Shape();
shape2.appendCircle(300, 300, 150, 150);    //cx, cy, radiusW, radiusH

//ConicGradient
const fill2 = new TVG.ConicGradient(300, 300, angle);   //cx, cy, angle

//Gradient Color Stops
fill2.setStops(...colorStops2);

shape2.fill(fill2);
canvas.add(shape2);

//Prepare Ellipse
const shape3 = new TVG.Shape();
shape3.appendCircle(450, 450, 112.5, 75);    //cx, cy, radiusW, radiusH

//ConicGradient
const fill3 = new TVG.ConicGradient(450, 450, angle);   //cx, cy, angle

//Gradient Color Stops
fill3.setStops(...colorStops3);

shape3.fill(fill3);
canvas.add(shape3);

canvas.render();

const onKeyDown = (event) => {
  const target = event.target;
  if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable)) return;
  if (event.key !== ' ') return;
  event.preventDefault();

  angle = (angle + 1) % 360;
  const fill = new TVG.ConicGradient(150, 150, angle);
  fill.setStops(...colorStops);
  shape1.fill(fill);

  const fill2 = new TVG.ConicGradient(300, 300, angle);
  fill2.setStops(...colorStops2);
  shape2.fill(fill2);

  const fill3 = new TVG.ConicGradient(450, 450, angle);
  fill3.setStops(...colorStops3);
  shape3.fill(fill3);

  console.log('ConicGradient angle: ' + angle);

  canvas.update();
  canvas.render();
};

window.addEventListener('keydown', onKeyDown);
`
};
