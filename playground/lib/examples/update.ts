import { ShowcaseExample } from './types';

export const updateExample: ShowcaseExample = {
  id: 'update',
  title: 'Canvas Update',
  description: 'Demonstrate canvas update pattern with animation',
  category: 'basic',
  thumbnail: '/assets/canvas-update-thumbnail.png',
  code: `// Native example: Update.cpp

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
  const progress = ((elapsed % 2000) / 2000);

  canvas.clear();

  //Shape
  const shape = new TVG.Shape();
  const cornerRadius = 62.5 * progress;

  shape.appendRect(-62.5, -62.5, 175, 175, { rx: cornerRadius, ry: cornerRadius });

  const r = Math.floor(Math.random() * 255);
  const g = Math.floor(Math.random() * 255);
  const b = Math.floor(Math.random() * 255);
  shape.fill(r, g, b, 255);

  shape.translate(600 * progress, 600 * progress);
  shape.scale(1.0 - 0.75 * progress);
  shape.rotate(360.0 * progress);

  canvas.add(shape);
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
