import { ShowcaseExample } from './types';

export const pictureTransformExample: ShowcaseExample = {
  id: 'picture-transform',
  title: 'Picture Transform',
  description: 'Scale and rotate an image around its center origin',
  category: 'media',
  thumbnail: '/assets/picture-transform-thumbnail.png',
  code: `// Native example: PictureTransform.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

(async () => {
  const response = await fetch('/assets/images/scale.jpg');
  const data = new Uint8Array(await response.arrayBuffer());

  //Original
  const picture = new TVG.Picture();
  picture.load(data, { type: 'jpg' });

  picture.origin(0.5, 0.5);  //center origin
  picture.translate(300, 300);
  picture.scale(0.879);

  canvas.add(picture);

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const duration = 3000; // play time 3 secs.
    let progress = (elapsed % duration) / duration;
    if (Math.floor(elapsed / duration) % 2 !== 0) progress = 1 - progress; // rewind

    picture.scale((1.0 - progress) * 0.879);
    picture.rotate(360 * progress);

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
