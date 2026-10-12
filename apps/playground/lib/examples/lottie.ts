import { ShowcaseExample } from './types';

// TODO: display 10 x 10 Lottie animations
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

const NUM_PER_ROW = 4;
const NUM_PER_COL = 4;

const lottieFiles = [
  '1f409.json',
  '27746-joypixels-partying-face-emoji-animation.json',
  'gradient_infinite.json',
  'alien.json',
  'funky_chicken.json',
  'dodecahedron.json',
  'guitar.json',
  'happy_trio.json',
  'merging_shapes.json',
  'monkey.json',
  'uk_flag.json',
  'skullboy.json',
  'dancing_star.json',
  'message.json',
  'seawalk.json',
  'yarn_loading.json',
];

(async () => {
  //The default font for fallback in case
  const data = await fetch('/fonts/PublicSans-Regular.ttf').then(res => res.bytes());
  TVG.Font.load('PublicSans-Regular', data, { type: 'ttf' });

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
