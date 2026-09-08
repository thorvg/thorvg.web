import { ShowcaseExample } from './types';

export const transformAnimationExample: ShowcaseExample = {
  id: 'transform-animation',
  title: 'Shape Transform',
  description: 'Animate shapes with rotation and scaling',
  category: 'basic',
  thumbnail: '/assets/animated-transform-thumbnail.png',
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

const startTime = performance.now();

function animate(currentTime) {
  const elapsed = currentTime - startTime;
  const t = elapsed / 1500;
  const wave = Math.sin(elapsed / 1500 * Math.PI * 2) * 0.5 + 0.5;

  canvas.clear();

  //Shape1
  const shape1 = new TVG.Shape();
  shape1.appendRect(-285, -300, 280, 280);
  shape1.appendRect(-145, -160, 380, 380, { rx: 100, ry: 100 });
  shape1.appendCircle(155, 140, 140, 140);
  shape1.appendCircle(235, 320, 210, 140);

  const gradient = new TVG.LinearGradient(50, 50, 550, 450);
  gradient.setStops(
    [0, [150 + wave * 25, 100, wave * 100, 255]],
    [0.5, [150 + wave * 10, 200, wave * 255, 255]],
    [1, [100, 255 * wave, 100, 255]]
  );

  shape1.fill(gradient);
  shape1.translate(300, 300);
  shape1.scale(1.0 - 0.75 * wave);
  shape1.rotate(360 * t);

  canvas.add(shape1);

  //Shape2
  const shape2 = new TVG.Shape();
  shape2.appendRect(-50, -50, 180, 180);
  shape2.fill(0, 255, 255, 255);

  shape2.translate(300, 300);
  shape2.rotate(360 * t);
  shape2.translate(200 + wave * 150, 200);

  canvas.add(shape2);

  //Shape3
  const shape3 = new TVG.Shape();

  /* Look, how shape3's origin is different with shape2
  The center of the shape is the anchor point for transformation. */
  shape3.appendRect(100, 100, 230, 130, { rx: 20, ry: 20 });
  shape3.fill(255, 0, 255, 255);

  shape3.translate(350, 350);
  shape3.rotate(-360 * t);
  shape3.scale(0.5 + wave);

  canvas.add(shape3);

  canvas.render();
  requestAnimationFrame(animate);
}

animate(performance.now());
`
};
