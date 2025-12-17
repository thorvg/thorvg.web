import { ShowcaseExample } from './types';

export const lottieExpressionsExample: ShowcaseExample = {
  id: 'lottie-expressions',
  title: 'Lottie Expressions',
  description: 'Lottie animations with expressions support',
  category: 'media',
  thumbnail: '/assets/lottie-expressions-thumbnail.png',
  code: `// Native example: LottieExpressions.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const NUM_PER_ROW = 3;
const NUM_PER_COL = 3;

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const size = 600 / NUM_PER_ROW;

const animations = [];
const lottieFiles = [
  'antennaAnimation.json',
  'bicycle.json',
  'driving.json',
  'jolly_walker.json',
  'layereffect.json',
  'snail.json',
  'traveling.json',
  'wiggle.json',
  'windmill.json'
];

(async () => {
  //Load animations
  const lottieDataArray = await Promise.all(
    lottieFiles.map(file =>
      fetch(\`/assets/lottie/expressions/\${file}\`).then(res => res.text())
    )
  );

  for (let i = 0; i < lottieDataArray.length; i++) {
    const lottieData = lottieDataArray[i];

    //Animation Controller
    const animation = new TVG.Animation();
    animation.load(lottieData);

    //image scaling preserving its aspect ratio
    const picture = animation.picture;
    picture.origin(0.5, 0.5);

    const pictureSize = picture.size();
    const w = pictureSize.width;
    const h = pictureSize.height;
    const scale = (w > h) ? size / w : size / h;
    picture.scale(scale);

    //Position at center of each grid cell
    const col = i % NUM_PER_ROW;
    const row = Math.floor(i / NUM_PER_ROW);
    picture.translate(
      col * size + size / 2,
      row * size + size / 2
    );

    animations.push(animation);
    canvas.add(picture);
  }

  canvas.render();

  //Run animation loop
  let lastTime = 0;
  const animationStates = animations.map(animation => ({
    animation,
    currentFrame: 0,
    info: animation.info()
  }));

  function animate(time) {
    if (lastTime === 0) {
      lastTime = time;
    }

    const deltaTime = (time - lastTime) / 1000; // Convert to seconds
    lastTime = time;

    // Update each animation
    for (const state of animationStates) {
      const frameIncrement = state.info.fps * deltaTime;
      state.currentFrame += frameIncrement;

      // Use modulo to get frame within valid range [0, totalFrames)
      const frameToSet = state.currentFrame % state.info.totalFrames + 1;
      state.animation.frame(frameToSet);
    }

    // Update canvas once for all animations
    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate(performance.now());
})();
`
};
