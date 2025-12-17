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
shape1.appendRect(0, 0, 300, 300);

//RadialGradient
const gradient1 = new TVG.RadialGradient(150, 150, 150);

//Gradient Color Stops
gradient1.addStop(0, [255, 255, 255, 255]);
gradient1.addStop(1, [0, 0, 0, 255]);

shape1.fill(gradient1);

//Prepare Circle
const shape2 = new TVG.Shape();
shape2.appendCircle(300, 300, 150, 150);

//RadialGradient
const gradient2 = new TVG.RadialGradient(300, 300, 150);

//Gradient Color Stops
gradient2.addStop(0, [255, 0, 0, 255]);
gradient2.addStop(0.5, [255, 255, 0, 255]);
gradient2.addStop(1, [255, 255, 255, 255]);

shape2.fill(gradient2);

//Prepare Ellipse
const shape3 = new TVG.Shape();
shape3.appendCircle(450, 450, 112.5, 75);

//RadialGradient
const gradient3 = new TVG.RadialGradient(450, 450, 112.5);

//Gradient Color Stops
gradient3.addStop(0, [0, 127, 0, 127]);
gradient3.addStop(0.25, [0, 170, 170, 170]);
gradient3.addStop(0.5, [200, 0, 200, 200]);
gradient3.addStop(1, [255, 255, 255, 255]);

shape3.fill(gradient3);

canvas.add(shape1, shape2, shape3);
canvas.render();
`
};
