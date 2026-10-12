import { ShowcaseExample } from './types';

export const gradientStrokeExample: ShowcaseExample = {
  id: 'gradient-stroke',
  title: 'Gradient Stroke',
  description: 'Apply linear and radial gradients to strokes',
  category: 'basic',
  thumbnail: '/assets/gradient-stroke-thumbnail.png',
  code: `// Native example: GradientStroke.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const colorStops1 = [
  [0, [255, 0, 0, 150]],
  [0.5, [0, 0, 255, 150]],
  [1, [127, 0, 127, 150]]
];

const colorStops2 = [
  [0.3, [255, 0, 0, 255]],
  [1, [50, 0, 255, 155]]
];

const colorStops3 = [
  [0, [0, 0, 255, 155]],
  [1, [0, 255, 0, 155]]
];

const dashPattern1 = [11.25, 11.25];

// linear gradient stroke (animated in update()) + linear gradient fill
const shape1 = new TVG.Shape();
shape1.moveTo(112.5, 75);
shape1.lineTo(150, 75);
shape1.lineTo(150, 112.5);
shape1.lineTo(225, 112.5);
shape1.lineTo(187.5, 150);
shape1.lineTo(150, 150);
shape1.lineTo(150, 187.5);
shape1.lineTo(112.5, 225);
shape1.lineTo(112.5, 150);
shape1.lineTo(75, 150);
shape1.lineTo(75, 112.5);
shape1.close();

shape1.stroke({
  color: [0, 255, 0],
  width: 15,
  join: TVG.StrokeJoin.Miter,
  cap: TVG.StrokeCap.Butt
});

const fill1 = new TVG.LinearGradient(75, 75, 187.5, 187.5);
fill1.setStops(...colorStops1);
shape1.fill(fill1);

canvas.add(shape1);

// radial gradient stroke (animated in update()) + duplicate
const shape2 = new TVG.Shape();
shape2.appendCircle(450, 131.25, 75, 45);
shape2.stroke(60);

const fillStroke2 = new TVG.RadialGradient(450, 131.25, 75, 450, 131.25, 0);
fillStroke2.setStops(...colorStops2);
shape2.stroke({ gradient: fillStroke2 });

const shape3 = shape2.duplicate();
shape3.translate(0, 150);

const fillStroke3 = new TVG.LinearGradient(375, 86.25, 525, 176.25);
fillStroke3.setStops(...colorStops3);
shape3.stroke({ gradient: fillStroke3 });

const shape4 = shape2.duplicate();
shape4.translate(0, 300);

canvas.add(shape2);
canvas.add(shape3);
canvas.add(shape4);

// dashed gradient stroke
const shape5 = new TVG.Shape();
shape5.appendRect(75, 375, 225, 225, { rx: 37.5, ry: 60 });

shape5.stroke({
  width: 15,
  dash: dashPattern1,
  cap: TVG.StrokeCap.Butt
});
const fillStroke5 = new TVG.LinearGradient(112.5, 337.5, 337.5, 562.5);
fillStroke5.setStops(...colorStops3);
shape5.stroke({ gradient: fillStroke5 });

const fill5 = new TVG.LinearGradient(112.5, 337.5, 337.5, 562.5);
fill5.setStops(...colorStops3);
shape5.fill(fill5);
shape5.scale(0.8);

canvas.add(shape5);

const startTime = Date.now();

function animate() {
  const elapsed = Date.now() - startTime;
  const duration = 2000;
  let progress = (elapsed % duration) / duration;
  if (Math.floor(elapsed / duration) % 2 !== 0) progress = 1 - progress;

  // slide shape1's linear gradient stroke
  const colorStops1 = [
    [0, [255, 0, 0, 150]],
    [0.5, [0, 0, 255, 150]],
    [1, [127, 0, 127, 150]]
  ];

  const fillStroke1 = new TVG.LinearGradient(225 - 300 * progress, 75, 337.5 - 300 * progress, 187.5);
  fillStroke1.setStops(...colorStops1);
  shape1.stroke({ gradient: fillStroke1 });

  // pulse shape2's radial gradient radius
  const colorStops2 = [
    [0.3, [255, 0, 0, 255]],
    [1, [50, 0, 255, 155]]
  ];

  const fillStroke2 = new TVG.RadialGradient(450, 131.25, 15 + 90 * progress, 450, 131.25, 0);
  fillStroke2.setStops(...colorStops2);
  shape2.stroke({ gradient: fillStroke2 });

  canvas.update();
  canvas.render();
  requestAnimationFrame(animate);
}
animate();
`
};
