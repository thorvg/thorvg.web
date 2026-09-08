import { ShowcaseExample } from './types';

export const sceneEffectsExample: ShowcaseExample = {
  id: 'scene-effects',
  title: 'Scene Effects',
  description: 'Comprehensive demonstration of all scene effects: Gaussian Blur, Fill, Tint, and Tritone',
  category: 'advanced',
  thumbnail: '/assets/scene-effects-thumbnail.png',
  code: `// Native example: SceneEffects.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const SIZE = 200;

const canvas = new TVG.Canvas('#canvas', {
  width: SIZE * 3,
  height: SIZE * 2,
});

const blur = [null, null, null]; //(for direction both, horizontal, vertical)
let fill, tint, trintone;

//blur scene
(async () => {
  const response = await fetch('/assets/images/tiger.svg');
  const svgString = await response.text();
  const svgData = new TextEncoder().encode(svgString);

  for (let i = 0; i < 3; i++) {
    blur[i] = new TVG.Scene();

    const picture = new TVG.Picture();
    picture.load(svgData, { type: 'svg' });
    picture.size(SIZE, SIZE);
    picture.translate(SIZE * i, 0);

    blur[i].add(picture);
    canvas.add(blur[i]);
  }

  //fill scene
  {
    fill = new TVG.Scene();

    const picture = new TVG.Picture();
    picture.load(svgData, { type: 'svg' });
    picture.size(SIZE, SIZE);
    picture.translate(0, SIZE);

    fill.add(picture);
    canvas.add(fill);
  }

  //tint scene
  {
    tint = new TVG.Scene();

    const picture = new TVG.Picture();
    picture.load(svgData, { type: 'svg' });
    picture.size(SIZE, SIZE);
    picture.translate(SIZE, SIZE);

    tint.add(picture);
    canvas.add(tint);
  }

  //trinton scene
  {
    trintone = new TVG.Scene();

    const picture = new TVG.Picture();
    picture.load(svgData, { type: 'svg' });
    picture.size(SIZE, SIZE);
    picture.translate(SIZE * 2, SIZE);

    trintone.add(picture);
    canvas.add(trintone);
  }

  canvas.render();

  // Animation loop
  let startTime = Date.now();
  function animate() {
    const elapsed = Date.now() - startTime;
    const duration = 2500; // 2.5 seconds
    const progress = ((elapsed % duration) / duration);

    //Apply GaussianBlur post effect (sigma, direction, border option, quality)
    for (let i = 0; i < 3; i++) {
      blur[i].resetEffects();
      blur[i].gaussianBlur(10.0 * progress, i, 0, 100);
    }

    //Apply Fill post effect (rgba)
    fill.resetEffects();
    fill.fillEffect(0, Math.floor(progress * 255), 0, Math.floor(255 * progress));

    //Apply Tint post effect (black:rgb, white:rgb, intensity)
    tint.resetEffects();
    tint.tint(0, 0, 0, 0, Math.floor(progress * 255), 0, progress * 100);

    //Apply Tritone post effect (shadow:rgb, midtone:rgb, highlight:rgb, blending with original)
    trintone.resetEffects();
    trintone.tritone(0, Math.floor(progress * 255), 0, 199, 110, 36, 255, 255, 255, 0);

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
