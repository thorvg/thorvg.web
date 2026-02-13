import { ShowcaseExample } from './types';

export const animationExample: ShowcaseExample = {
  id: 'animation',
  title: 'Animation',
  description: 'Load and play a Lottie animation with playback controls',
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
  height: 600
});

//Load Lottie animation from file
(async () => {
  const response = await fetch('/assets/lottie/sample.json');
  const lottieData = await response.text();

  //Animation Controller
  const animation = new TVG.Animation();
  const picture = animation.picture;

  animation.load(lottieData);

  //image scaling preserving its aspect ratio
  picture.size(500, 500);
  picture.origin(0.5, 0.5);
  picture.translate(300, 300);

  canvas.add(picture);

  //Run animation loop
  animation.play((frame) => {
    canvas.update();
    canvas.render();
  });

  canvas.render();
})();
`
};
