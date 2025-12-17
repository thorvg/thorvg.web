import { ShowcaseExample } from './types';

export const customTransformExample: ShowcaseExample = {
  id: 'custom-transform',
  title: 'Custom Transform',
  description: 'Apply custom transformation matrices to shapes',
  category: 'basic',
  thumbnail: '/assets/custom-transform-matrix-thumbnail.png',
  code: `// Native example: CustomTransform.cpp

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

  //Shape
  const shape = new TVG.Shape();
  shape.moveTo(0, -71.5625);
  shape.lineTo(33.75, -3.4375);
  shape.lineTo(109.375, 7.1875);
  shape.lineTo(55, 59.6875);
  shape.lineTo(67.5, 135.3125);
  shape.lineTo(0, 100.3125);
  shape.lineTo(-63.75, 135.3125);
  shape.lineTo(-54.375, 60.3125);
  shape.lineTo(-108.125, 7.8125);
  shape.lineTo(-33.125, -3.4375);
  shape.close();
  shape.fill(0, 0, 255, 255);
  shape.stroke({ width: 1.875, color: [255, 255, 255, 255] });

  //Transform Matrix
  const scaleX = 1 - (progress * 0.5);
  const scaleY = 1 + (progress * 2.0);
  const translateX = progress * 312.5 + 187.5;
  const translateY = progress * -62.5 + 237.5;

  //rotation
  const angle = 45;
  const rad = (angle * Math.PI) / 180;
  const cos = Math.cos(rad);
  const sin = Math.sin(rad);

  const matrix = {
    e11: scaleX * cos,   e12: -scaleX * sin,  e13: translateX,
    e21: scaleY * sin,   e22: scaleY * cos,   e23: translateY,
    e31: 0,              e32: 0,              e33: 1
  };

  shape.transform(matrix);

  canvas.add(shape);
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
