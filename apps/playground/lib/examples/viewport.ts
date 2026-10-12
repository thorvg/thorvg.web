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

const VPORT_SIZE = 300;

(async () => {
  //set viewport before canvas become dirty.
  canvas.viewport(0, 0, VPORT_SIZE, VPORT_SIZE);

  const mask = new TVG.Shape();
  mask.appendCircle(1024 / 2, 1024 / 2, 1024 / 2, 1024 / 2);
  mask.fill(255, 255, 255);
  //Use the opacity for a half-translucent mask.
  mask.opacity(125);

  const data = await fetch('/assets/svg/tiger.svg').then(res => res.text());

  const picture = new TVG.Picture();
  picture.load(data, { type: 'svg' });
  picture.size(1024, 1024);
  picture.mask(mask, TVG.MaskMethod.Alpha);
  canvas.add(picture);

  canvas.render();

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const duration = 2000; // play time 2 sec.
    let progress = (elapsed % duration) / duration;
    if (Math.floor(elapsed / duration) % 2 !== 0) progress = 1 - progress;

    canvas.viewport((1024 - VPORT_SIZE) * progress, (1024 - VPORT_SIZE) * progress, VPORT_SIZE, VPORT_SIZE);
    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
