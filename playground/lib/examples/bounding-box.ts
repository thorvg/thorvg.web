import { ShowcaseExample } from './types';

export const boundingBoxExample: ShowcaseExample = {
  id: 'bounding-box',
  title: 'Bounding Box',
  description: 'Display axis-aligned bounding boxes around shapes',
  category: 'advanced',
  code: `import { init } from '@thorvg/canvas-kit';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/canvas-kit/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 900,
  height: 900,
  renderer: 'gl'
});

function drawBoundingBox(shape) {
  const { x, y, width, height } = shape.bounds();
  const bbox = new TVG.Shape();
  
  bbox.moveTo(x, y);
  bbox.lineTo(x + width, y);
  bbox.lineTo(x + width, y + height);
  bbox.lineTo(x, y + height);
  bbox.close()
  bbox.stroke({ width: 2, color: [100, 100, 100, 255], dash: [1, 1] });
  return bbox;
}

// Ellipse
const shape1 = new TVG.Shape();
shape1.appendCircle(50, 100, 40, 100);
shape1.fill(0, 30, 255, 255);
canvas.add(shape1);
canvas.add(drawBoundingBox(shape1));

// Rotated rectangle
const shape2 = new TVG.Shape();
shape2.appendRect(200, 30, 100, 20);
shape2.fill(200, 150, 55, 255);
shape2.rotate(30);
canvas.add(shape2);
canvas.add(drawBoundingBox(shape2));

// Complex shape with multiple paths
const shape3 = new TVG.Shape();
shape3.appendRect(225, -50, 75, 50, { rx: 20, ry: 25 });
shape3.appendCircle(225, 25, 50, 25);
shape3.stroke({ width: 10, color: [255, 255, 255, 255] });
shape3.fill(50, 50, 155, 255);
shape3.translate(100, 100);
canvas.add(shape3);
canvas.add(drawBoundingBox(shape3));

// Line
const line = new TVG.Shape();
line.moveTo(470, 350);
line.lineTo(770, 350);
line.stroke({ width: 20, color: [55, 55, 0, 255] });
canvas.add(line);
canvas.add(drawBoundingBox(line));

// Bezier curve
const curve = new TVG.Shape();
curve.moveTo(0, 0);
curve.cubicTo(40, -10, 120, -150, 80, 0);
curve.translate(50, 770);
curve.stroke({ width: 2, color: [255, 255, 255, 255] });
canvas.add(curve);
canvas.add(drawBoundingBox(curve));

// Rotated bezier curve
const curve2 = new TVG.Shape();
curve2.moveTo(0, 0);
curve2.cubicTo(40, -10, 120, -150, 80, 0);
curve2.translate(150, 750);
curve2.rotate(20);
curve2.stroke({ width: 2, color: [255, 0, 255, 255] });
canvas.add(curve2);
canvas.add(drawBoundingBox(curve2));

// Scene with shapes
const scene = new TVG.Scene();
scene.translate(550, 370);
scene.scale(0.7);

const sceneShape = new TVG.Shape();
sceneShape.moveTo(0, 0);
sceneShape.lineTo(300, 200);
sceneShape.lineTo(0, 200);
sceneShape.fill(255, 0, 0, 255);
sceneShape.close();
sceneShape.rotate(20);
scene.add(sceneShape);

canvas.add(scene);
canvas.add(drawBoundingBox(scene));

// Scene with stroke
const scene2 = new TVG.Scene();
scene2.translate(330, 640);
scene2.scale(0.7);

const sceneShape2 = new TVG.Shape();
sceneShape2.moveTo(0, 0);
sceneShape2.lineTo(300, 200);
sceneShape2.lineTo(0, 200);
sceneShape2.fill(0, 255, 0, 255);
sceneShape2.close();
sceneShape2.stroke({ width: 30, color: [255, 255, 255, 255], join: 'bevel' });
scene2.add(sceneShape2);

canvas.add(scene2);
canvas.add(drawBoundingBox(scene2));

canvas.render();
`
};
