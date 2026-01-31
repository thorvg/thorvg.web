import { ShowcaseExample } from './types';

export const imageRotationExample: ShowcaseExample = {
  id: 'image-rotation',
  title: 'Image Rotation',
  description: 'Rotate images around center origin',
  category: 'basic',
  thumbnail: '/assets/image-rotation-thumbnail.png',
  code: `// Native example: ImageRotation.cpp

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

  const picture = new TVG.Picture();
  picture.load(data, { type: 'jpg' });

  picture.origin(0.5, 0.5);
  picture.translate(300, 300);

  //Add picture to canvas once
  canvas.add(picture);

  function animate(currentTime) {
    const elapsed = currentTime - startTime;
    const progress = (elapsed / 4000) % 1;  //4 second loop

    picture.scale(0.6);
    picture.rotate(progress * 360);

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate(performance.now());
})();
`
};
