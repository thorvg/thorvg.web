import { ShowcaseExample } from './types';

export const animationExample: ShowcaseExample = {
  id: 'animation',
  title: 'Animation',
  description: 'Load and play a Lottie animation',
  category: 'media',
  thumbnail: '/assets/animation-thumbnail.png',
  code: `// Native example: Animation.cpp

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
  //The default font for fallback in case
  const fontResponse = await fetch('/fonts/PublicSans-Regular.ttf');
  TVG.Font.load('PublicSans-Regular', new Uint8Array(await fontResponse.arrayBuffer()), { type: 'ttf' });

  //Animation Controller
  const animation = new TVG.Animation();
  const picture = animation.picture;
  picture.origin(0.5, 0.5);  //center origin

  //Background
  const shape = new TVG.Shape();
  shape.appendRect(0, 0, 600, 600);
  shape.fill(50, 50, 50);

  canvas.add(shape);

  const response = await fetch('/assets/lottie/sample.json');
  animation.load(await response.text());

  //image scaling preserving its aspect ratio
  const { width: w2, height: h2 } = picture.size();
  const scale = (w2 > h2) ? 600 / w2 : 600 / h2;
  picture.scale(scale);
  picture.translate(300, 300);

  canvas.add(picture);
  canvas.render();

  const { totalFrames, duration } = animation.info();
  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;
    const progress = (elapsed % (duration * 1000)) / (duration * 1000);

    //Update animation frame
    animation.frame(totalFrames * progress);

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
