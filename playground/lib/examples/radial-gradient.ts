import { ShowcaseExample } from './types';

export const radialGradientExample: ShowcaseExample = {
  id: 'radial-gradient',
  title: 'Radial Gradient',
  description: 'Demonstrate radial gradients with various configurations',
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

// Rectangle with radial gradient
const shape1 = new TVG.Shape();
shape1.appendRect(0, 0, 400, 400);

const gradient1 = new TVG.RadialGradient(200, 200, 200);
gradient1.addStop(0, [255, 255, 255, 255]);
gradient1.addStop(1, [0, 0, 0, 255]);

shape1.fill(gradient1);

// Circle with radial gradient (3 color stops)
const shape2 = new TVG.Shape();
shape2.appendCircle(400, 400, 200, 200);

const gradient2 = new TVG.RadialGradient(400, 400, 200);
gradient2.addStop(0, [255, 0, 0, 255]);
gradient2.addStop(0.5, [255, 255, 0, 255]);
gradient2.addStop(1, [255, 255, 255, 255]);

shape2.fill(gradient2);

// Ellipse with radial gradient (4 color stops)
const shape3 = new TVG.Shape();
shape3.appendCircle(600, 600, 150, 100);

const gradient3 = new TVG.RadialGradient(600, 600, 150);
gradient3.addStop(0, [0, 127, 0, 127]);
gradient3.addStop(0.25, [0, 170, 170, 170]);
gradient3.addStop(0.5, [200, 0, 200, 200]);
gradient3.addStop(1, [255, 255, 255, 255]);

shape3.fill(gradient3);

canvas.add(shape1, shape2, shape3);
canvas.render();
`
};
