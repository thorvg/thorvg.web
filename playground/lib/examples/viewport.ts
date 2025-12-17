import { ShowcaseExample } from './types';

export const viewportExample: ShowcaseExample = {
  id: 'viewport',
  title: 'Viewport',
  description: 'Control canvas viewport for panning effects',
  category: 'advanced',
  thumbnail: '/assets/viewport-control-thumbnail.png',
  code: `// Native example: Viewport.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 1024,
  height: 1024,
});

const viewportSize = 300;
const startTime = Date.now();

//set viewport before canvas become dirty.
canvas.viewport(0, 0, viewportSize, viewportSize);

const scene = new TVG.Scene();

for (let i = 0; i < 5; i++) {
  for (let j = 0; j < 5; j++) {
    const rect = new TVG.Shape();
    rect.appendRect(i * 220, j * 220, 200, 200, { rx: 20, ry: 20 });

    const gradient = new TVG.LinearGradient(
      i * 220, j * 220,
      i * 220 + 200, j * 220 + 200
    );
    gradient.setStops(
      [0, [i * 50, j * 50, 255, 255]],
      [1, [255 - i * 50, 255 - j * 50, 100, 255]]
    );

    rect.fill(gradient);
    scene.add(rect);
  }
}

canvas.add(scene);
canvas.render();

function animate() {
  const elapsed = Date.now() - startTime;
  const progress = (elapsed % 2000) / 2000;

  const x = (1024 - viewportSize) * progress;
  const y = (1024 - viewportSize) * progress;

  canvas.viewport(x, y, viewportSize, viewportSize);
  canvas.update();
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
