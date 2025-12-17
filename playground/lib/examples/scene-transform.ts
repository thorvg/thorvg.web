import { ShowcaseExample } from './types';

export const sceneTransformExample: ShowcaseExample = {
  id: 'scene-transform',
  title: 'Scene Transform',
  description: 'Animate scene transformations with rotate, scale, and translate',
  category: 'basic',
  thumbnail: '/assets/scene-transform-animation-thumbnail.png',
  code: `// Native example: SceneTransform.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const startTime = Date.now();

function animate() {
  const elapsed = Date.now() - startTime;
  const progress = (elapsed % 2000) / 2000;

  canvas.clear();

  //Create a Scene1
  const scene = new TVG.Scene();

  //Prepare Round Rectangle (Scene1)
  const shape1 = new TVG.Shape();
  shape1.appendRect(-146.875, -156.25, 250, 250, { rx: 31.25, ry: 31.25 });
  shape1.fill(0, 255, 0, 255);
  shape1.stroke({ width: 3.125, color: [255, 255, 255, 255] });
  scene.add(shape1);

  //Prepare Circle (Scene1)
  const shape2 = new TVG.Shape();
  shape2.appendCircle(-103.125, -93.75, 125, 125);
  shape2.fill(255, 255, 0, 255);
  scene.add(shape2);

  //Prepare Ellipse (Scene1)
  const shape3 = new TVG.Shape();
  shape3.appendCircle(165.625, 156.25, 93.75, 62.5);
  shape3.fill(0, 255, 255, 255);
  scene.add(shape3);

  scene.translate(268.75, 268.75);
  scene.scale(0.7);
  scene.rotate(360 * progress);

  //Create Scene2
  const scene2 = new TVG.Scene();

  //Star (Scene2)
  const shape4 = new TVG.Shape();

  //Appends Paths
  shape4.moveTo(0, -71.5625);
  shape4.lineTo(33.75, -3.4375);
  shape4.lineTo(109.375, 7.1875);
  shape4.lineTo(55, 59.6875);
  shape4.lineTo(67.5, 135.3125);
  shape4.lineTo(0, 100.3125);
  shape4.lineTo(-63.75, 135.3125);
  shape4.lineTo(-54.375, 60.3125);
  shape4.lineTo(-108.125, 7.8125);
  shape4.lineTo(-33.125, -3.4375);
  shape4.close();
  shape4.fill(0, 0, 255, 127);
  shape4.stroke({ width: 1.875, color: [0, 0, 255, 255] });
  scene2.add(shape4);

  //Circle (Scene2)
  const cx = -93.75;
  const cy = -93.75;
  const radius = 62.5;
  const halfRadius = radius * 0.552284;

  const shape5 = new TVG.Shape();

  //Append Paths
  shape5.moveTo(cx, cy - radius);
  shape5.cubicTo(cx + halfRadius, cy - radius, cx + radius, cy - halfRadius, cx + radius, cy);
  shape5.cubicTo(cx + radius, cy + halfRadius, cx + halfRadius, cy + radius, cx, cy + radius);
  shape5.cubicTo(cx - halfRadius, cy + radius, cx - radius, cy + halfRadius, cx - radius, cy);
  shape5.cubicTo(cx - radius, cy - halfRadius, cx - halfRadius, cy - radius, cx, cy - radius);
  shape5.close();
  shape5.fill(255, 0, 0, 127);
  scene2.add(shape5);

  scene2.translate(312.5, 218.75);
  scene2.rotate(360 * progress);

  //Push scene2 onto the scene
  scene.add(scene2);

  //Draw the Scene onto the Canvas
  canvas.add(scene);
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
