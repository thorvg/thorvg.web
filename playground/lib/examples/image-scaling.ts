import { ShowcaseExample } from './types';

export const imageScalingExample: ShowcaseExample = {
  id: 'image-scaling',
  title: 'Image Scaling',
  description: 'Scale images around center origin',
  category: 'basic',
  thumbnail: '/assets/image-scaling-thumbnail.png',
  code: `// Native example: ImageScaling.cpp

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

(async () => {
  //Load image
  const response = await fetch('/assets/images/scale.jpg');
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  //Original
  const picture = new TVG.Picture();
  picture.load(data, { type: 'jpg' });

  picture.origin(0.5, 0.5);
  picture.translate(300, 300);

  //Add picture to canvas once
  canvas.add(picture);

  const baseScale = 1.125;

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = Math.abs(Math.sin((elapsed / 3000) * Math.PI));  //3 second loop

    picture.scale((1.0 - progress) * baseScale);

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate(performance.now());
})();
`
};
