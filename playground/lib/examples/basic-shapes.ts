import { ShowcaseExample } from './types';

export const basicShapesExample: ShowcaseExample = {
  id: 'basic-shapes',
  title: 'Shapes',
  description: 'Draw simple shapes',
  category: 'basic',
  thumbnail: '/assets/shape-thumbnail.png',
  code: `// Native example: Shapes.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600
});

//Prepare a Composite Shape (Rectangle + Circle + Circle)
const shape4 = new TVG.Shape();
shape4.appendRect(0, 0, 225, 225, { rx: 37.5, ry: 37.5 });
shape4.appendCircle(300, 112.5, 112.5, 112.5);
shape4.appendCircle(450, 112.5, 112.5, 75);
shape4.fill(255, 255, 0, 255);

//Prepare Round Rectangle
const shape1 = new TVG.Shape();
shape1.appendRect(0, 337.5, 225, 225, { rx: 37.5, ry: 37.5 });
shape1.fill(0, 255, 0, 255);

//Prepare Circle
const shape2 = new TVG.Shape();
shape2.appendCircle(300, 450, 112.5, 112.5);
shape2.fill(255, 255, 0, 255);

//Prepare Ellipse
const shape3 = new TVG.Shape();
shape3.appendCircle(450, 450, 112.5, 75);
shape3.fill(0, 255, 255, 255);

canvas.add(shape4);
canvas.add(shape1);
canvas.add(shape2);
canvas.add(shape3);
canvas.render();
`
};
