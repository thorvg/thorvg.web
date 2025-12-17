import { ShowcaseExample } from './types';

export const gradientTransformExample: ShowcaseExample = {
  id: 'gradient-transform',
  title: 'Gradient with Transforms',
  description: 'Animate gradients with shape transformations',
  category: 'basic',
  thumbnail: '/assets/gradient-with-transform-thumbnail.png',
  code: `// Native example: GradientTransform.cpp

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
  const progress = ((elapsed % 2000) / 2000); // 2 second loop

  canvas.clear();

  //Shape1
  const shape = new TVG.Shape();
  shape.appendRect(-178.125, -187.5, 175, 175);
  shape.appendRect(-90.625, -100, 237.5, 237.5, { rx: 62.5, ry: 62.5 });
  shape.appendCircle(121.875, 112.5, 87.5, 87.5);
  shape.appendCircle(146.875, 200, 131.25, 87.5);

  //LinearGradient
  const fill = new TVG.LinearGradient(-178.125, -187.5, 178.125, 187.5);
  fill.setStops(
    [0, [255, 0, 0, 255]],
    [0.5, [255, 255, 0, 255]],
    [1, [255, 255, 255, 255]]
  );

  shape.fill(fill);
  shape.translate(240.625, 250);

  //Update Shape1
  shape.scale(1.0 - 0.75 * progress);
  shape.rotate(360.0 * progress);

  //Shape2
  const shape2 = new TVG.Shape();
  shape2.appendRect(-31.25, -31.25, 112.5, 112.5);
  shape2.translate(300, 300);

  //LinearGradient
  const fill2 = new TVG.LinearGradient(-31.25, -31.25, 81.25, 81.25);
  fill2.setStops(
    [0, [0, 0, 0, 255]],
    [1, [255, 255, 255, 255]]
  );

  shape2.fill(fill2);

  shape2.rotate(360 * progress);
  shape2.translate(300 + progress * 187.5, 300);

  //Shape3
  const shape3 = new TVG.Shape();
  shape3.appendRect(62.5, 62.5, 93.75, 62.5, { rx: 12.5, ry: 12.5 });

  //RadialGradient
  const fill3 = new TVG.RadialGradient(109.375, 93.75, 46.875);
  fill3.setStops(
    [0, [0, 127, 0, 127]],
    [0.25, [0, 170, 170, 170]],
    [0.5, [200, 0, 200, 200]],
    [1, [255, 255, 255, 255]]
  );

  shape3.fill(fill3);
  shape3.translate(300, 300);

  //Update Shape3
  shape3.rotate(-360.0 * progress);
  shape3.scale(0.5 + progress);

  canvas.add(shape);
  canvas.add(shape2);
  canvas.add(shape3);
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
