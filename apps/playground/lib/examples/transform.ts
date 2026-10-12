import { ShowcaseExample } from './types';

export const transformExample: ShowcaseExample = {
  id: 'transform',
  title: 'Transform',
  description: 'Animate shapes with translation, rotation and scaling',
  category: 'basic',
  thumbnail: '/assets/transform-thumbnail.png',
  code: `// Native example: Transform.cpp

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
  const duration = 2000; // play time 2 sec.
  let progress = (elapsed % duration) / duration;
  if (Math.floor(elapsed / duration) % 2 !== 0) progress = 1 - progress; // rewind

  canvas.remove();

  //Shape1
  const shape = new TVG.Shape();
  shape.appendRect(-178.125, -187.5, 175, 175);
  shape.appendRect(-90.625, -100, 237.5, 237.5, { rx: 62.5, ry: 62.5 });
  shape.appendCircle(96.875, 87.5, 87.5, 87.5);
  shape.appendCircle(146.875, 200, 131.25, 87.5);
  shape.fill(255, 255, 255);
  shape.translate(265.625, 300);
  shape.scale(1.0 - 0.75 * progress);
  shape.rotate(360 * progress);

  canvas.add(shape);

  //Shape2
  const shape2 = new TVG.Shape();
  shape2.appendRect(-31.25, -31.25, 112.5, 112.5);
  shape2.fill(0, 255, 255);
  shape2.translate(300, 300);
  shape2.rotate(360 * progress);
  shape2.translate(250 + progress * 187.5, 250);
  canvas.add(shape2);

  //Shape3
  const shape3 = new TVG.Shape();

  /* Look, how shape3's origin is different with shape2
  The center of the shape is the anchor point for transformation. */
  shape3.appendRect(62.5, 62.5, 143.75, 81.25, { rx: 12.5, ry: 12.5 });
  shape3.fill(255, 0, 255);
  shape3.translate(350, 350);
  shape3.rotate(-360.0 * progress);
  shape3.scale(0.5 + progress);
  canvas.add(shape3);

  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
