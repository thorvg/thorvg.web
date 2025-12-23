import { ShowcaseExample } from './types';

export const duplicateExample: ShowcaseExample = {
  id: 'duplicate',
  title: 'Duplicate Objects',
  description: 'Duplicate shapes, scenes, and pictures with duplicate() method',
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

// Duplicate Shapes
// Original Shape
const shape1 = new TVG.Shape();
shape1.appendRect(10, 10, 200, 200);
shape1.appendRect(220, 10, 100, 100);
shape1.stroke({ width: 3, color: [0, 255, 0, 255] });
shape1.fill(255, 0, 0, 255);

// Duplicate Shape, Switch fill method
const shape2 = shape1.duplicate();
shape2.translate(0, 220);

const gradient = new TVG.LinearGradient(10, 10, 440, 200);
gradient.addStop(0, [0, 0, 0, 255]);
gradient.addStop(1, [255, 255, 255, 255]);
shape2.fill(gradient);

// Duplicate Shape 2
const shape3 = shape2.duplicate();
shape3.translate(0, 440);

// Duplicate Scene
// Create a Scene1
const scene1 = new TVG.Scene();

const sceneShape1 = new TVG.Shape();
sceneShape1.appendRect(0, 0, 400, 400, { rx: 50, ry: 50 });
sceneShape1.fill(0, 255, 0, 255);
scene1.add(sceneShape1);

const sceneShape2 = new TVG.Shape();
sceneShape2.appendCircle(400, 400, 200, 200);
sceneShape2.fill(255, 255, 0, 255);
scene1.add(sceneShape2);

const sceneShape3 = new TVG.Shape();
sceneShape3.appendCircle(600, 600, 150, 100);
sceneShape3.fill(0, 255, 255, 255);
scene1.add(sceneShape3);

scene1.scale(0.25);
scene1.translate(400, 0);

// Duplicate Scene1
const scene2 = scene1.duplicate();
scene2.translate(600, 0);

// Add all to canvas
canvas.add(shape1, shape2, shape3, scene1, scene2);
canvas.render();
`
};
