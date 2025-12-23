import { ShowcaseExample } from './types';

export const gradientStrokeExample: ShowcaseExample = {
  id: 'gradient-stroke',
  title: 'Gradient Stroke',
  description: 'Apply linear and radial gradients to strokes',
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

// Shape with linear gradient stroke and fill
const shape1 = new TVG.Shape();
shape1.moveTo(150, 100);
shape1.lineTo(200, 100);
shape1.lineTo(200, 150);
shape1.lineTo(300, 150);
shape1.lineTo(250, 200);
shape1.lineTo(200, 200);
shape1.lineTo(200, 250);
shape1.lineTo(150, 300);
shape1.lineTo(150, 200);
shape1.lineTo(100, 200);
shape1.lineTo(100, 150);
shape1.close();

// Create gradient for stroke
const strokeGradient1 = new TVG.LinearGradient(100, 100, 250, 250);
strokeGradient1.addStop(0, [255, 0, 0, 150]);
strokeGradient1.addStop(0.5, [0, 0, 255, 150]);
strokeGradient1.addStop(1, [127, 0, 127, 150]);

// Create gradient for fill
const fillGradient1 = new TVG.LinearGradient(100, 100, 250, 250);
fillGradient1.addStop(0, [255, 0, 0, 150]);
fillGradient1.addStop(0.5, [0, 0, 255, 150]);
fillGradient1.addStop(1, [127, 0, 127, 150]);

shape1.fill(fillGradient1);
shape1.stroke({
  width: 20,
  gradient: strokeGradient1,
  join: 'miter',
  cap: 'butt'
});

// Circle with radial gradient stroke
const shape2 = new TVG.Shape();
shape2.appendCircle(600, 175, 100, 60);

const strokeGradient2 = new TVG.RadialGradient(600, 175, 100);
strokeGradient2.addStop(0.3, [255, 0, 0, 255]);
strokeGradient2.addStop(1, [50, 0, 255, 155]);

shape2.stroke({
  width: 80,
  gradient: strokeGradient2
});

// Circle with linear gradient stroke (translated)
const shape3 = new TVG.Shape();
shape3.appendCircle(600, 375, 100, 60);

const strokeGradient3 = new TVG.LinearGradient(500, 315, 700, 435);
strokeGradient3.addStop(0, [0, 0, 255, 155]);
strokeGradient3.addStop(1, [0, 255, 0, 155]);

shape3.stroke({
  width: 80,
  gradient: strokeGradient3
});

// Circle with radial gradient stroke (translated)
const shape4 = new TVG.Shape();
shape4.appendCircle(600, 575, 100, 60);

const strokeGradient4 = new TVG.RadialGradient(600, 575, 100);
strokeGradient4.addStop(0.3, [255, 0, 0, 255]);
strokeGradient4.addStop(1, [50, 0, 255, 155]);

shape4.stroke({
  width: 80,
  gradient: strokeGradient4
});

// Rectangle with gradient stroke and fill
const shape5 = new TVG.Shape();
shape5.appendRect(100, 500, 300, 300, { rx: 50, ry: 80 });

const strokeGradient5 = new TVG.LinearGradient(150, 450, 450, 750);
strokeGradient5.addStop(0, [0, 0, 255, 155]);
strokeGradient5.addStop(1, [0, 255, 0, 155]);

const fillGradient5 = new TVG.LinearGradient(150, 450, 450, 750);
fillGradient5.addStop(0, [0, 0, 255, 155]);
fillGradient5.addStop(1, [0, 255, 0, 155]);

shape5.fill(fillGradient5);
shape5.stroke({
  width: 20,
  gradient: strokeGradient5,
  cap: 'butt'
});
shape5.scale(0.8);

canvas.add(shape1, shape2, shape3, shape4, shape5);
canvas.render();
`
};
