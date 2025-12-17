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

// linear gradient stroke + linear gradient fill
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

const strokeGradient1 = new TVG.LinearGradient(75, 75, 187.5, 187.5);
strokeGradient1.setStops(
  [0, [255, 0, 0, 150]],
  [0.5, [0, 0, 255, 150]],
  [1, [127, 0, 127, 150]]
);

const fillGradient1 = new TVG.LinearGradient(75, 75, 187.5, 187.5);
fillGradient1.setStops(
  [0, [255, 0, 0, 150]],
  [0.5, [0, 0, 255, 150]],
  [1, [127, 0, 127, 150]]
);

shape1.fill(fillGradient1);
shape1.stroke({
  width: 15,
  gradient: strokeGradient1,
  join: TVG.StrokeJoin.Miter,
  cap: TVG.StrokeCap.Butt
});

// radial gradient stroke + duplicate
const shape2 = new TVG.Shape();
shape2.appendCircle(450, 131.25, 75, 45);

const strokeGradient2 = new TVG.RadialGradient(450, 131.25, 75);
strokeGradient2.setStops(
  [0.3, [255, 0, 0, 255]],
  [1, [50, 0, 255, 155]]
);

shape2.stroke({
  width: 60,
  gradient: strokeGradient2
});

const shape3 = new TVG.Shape();
shape3.appendCircle(450, 281.25, 75, 45);

const strokeGradient3 = new TVG.LinearGradient(375, 236.25, 525, 326.25);
strokeGradient3.setStops(
  [0, [0, 0, 255, 155]],
  [1, [0, 255, 0, 155]]
);

shape3.stroke({
  width: 60,
  gradient: strokeGradient3
});

const shape4 = new TVG.Shape();
shape4.appendCircle(450, 431.25, 75, 45);

const strokeGradient4 = new TVG.RadialGradient(450, 431.25, 75);
strokeGradient4.setStops(
  [0.3, [255, 0, 0, 255]],
  [1, [50, 0, 255, 155]]
);

shape4.stroke({
  width: 60,
  gradient: strokeGradient4
});

// dashed gradient stroke
const shape5 = new TVG.Shape();
shape5.appendRect(75, 375, 225, 225, { rx: 37.5, ry: 60 });

const strokeGradient5 = new TVG.LinearGradient(112.5, 337.5, 337.5, 562.5);
strokeGradient5.setStops(
  [0, [0, 0, 255, 155]],
  [1, [0, 255, 0, 155]]
);

const fillGradient5 = new TVG.LinearGradient(112.5, 337.5, 337.5, 562.5);
fillGradient5.setStops(
  [0, [0, 0, 255, 155]],
  [1, [0, 255, 0, 155]]
);

shape5.fill(fillGradient5);
shape5.stroke({
  width: 15,
  gradient: strokeGradient5,
  cap: TVG.StrokeCap.Butt
});
shape5.scale(0.8);

canvas.add(shape1);
canvas.add(shape2);
canvas.add(shape3);
canvas.add(shape4);
canvas.add(shape5);
canvas.render();
`
};
