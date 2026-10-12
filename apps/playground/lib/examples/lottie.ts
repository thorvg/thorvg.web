import { ShowcaseExample } from './types';

export const lottieExample: ShowcaseExample = {
  id: 'lottie',
  title: 'Lottie',
  description: 'Play a collection of Lottie animations',
  category: 'media',
  thumbnail: '/assets/lottie-thumbnail.png',
  code: `// Native example: Lottie.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const NUM_PER_ROW = 3;
const NUM_PER_COL = 3;

const lottieFiles = [
  '11555.json',
  '16266.json',
  '1643-exploding-star.json',
  '1f409.json',
  '27746-joypixels-partying-face-emoji-animation.json',
  '43391.json',
  '5317-fireworkds.json',
  '5344-honey-sack-hud.json',
  'abstract_circle.json',
];

(async () => {
  //The default font for fallback in case
  const fontResponse = await fetch('/fonts/PublicSans-Regular.ttf');
  TVG.Font.load('PublicSans-Regular', new Uint8Array(await fontResponse.arrayBuffer()), { type: 'ttf' });

  //Background
  const shape = new TVG.Shape();
  shape.appendRect(0, 0, 600, 600);
  shape.fill(75, 75, 75);
  canvas.add(shape);

  const lottieDataArray = await Promise.all(
    lottieFiles.slice(0, NUM_PER_ROW * NUM_PER_COL).map(file =>
      fetch('/assets/lottie/' + file).then(res => res.text())
    )
  );

  const animations = [];
  let counter = 0;

  for (const lottieData of lottieDataArray) {
    //Animation Controller
    const animation = new TVG.Animation();
    const picture = animation.picture;
    picture.origin(0.5, 0.5);

    animation.load(lottieData);

    //image scaling preserving its aspect ratio
    const cellSize = 600 / NUM_PER_ROW;
    const { width: w, height: h } = picture.size();
    picture.scale((w > h) ? cellSize / w : cellSize / h);
    picture.translate((counter % NUM_PER_ROW) * cellSize + cellSize / 2, Math.floor(counter / NUM_PER_ROW) * (600 / NUM_PER_COL) + cellSize / 2);

    animations.push(animation);

    counter++;
  }

  //Run animation loop
  for (const animation of animations) {
    canvas.add(animation.picture);
  }

  canvas.render();

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;

    for (const animation of animations) {
      const { totalFrames, duration } = animation.info();
      const progress = (elapsed % (duration * 1000)) / (duration * 1000);
      animation.frame(totalFrames * progress);
    }

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
