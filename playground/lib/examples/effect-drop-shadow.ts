import { ShowcaseExample } from './types';

export const effectDropShadowExample: ShowcaseExample = {
  id: 'effect-drop-shadow',
  title: 'Effect Drop Shadow',
  description: 'Drop shadow effect applied to scene content',
  category: 'advanced',
  thumbnail: '/assets/effect-drop-shadow-thumbnail.png',
  code: `// Native example: EffectDropShadow.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//background
const bg = new TVG.Shape();
bg.appendRect(0, 0, 600, 600);
bg.fill(255, 255, 255);
canvas.add(bg);

let scene1, scene2, scene3;

//Prepare a scene for post effects
(async () => {
  {
    scene1 = new TVG.Scene();

    const response = await fetch('/assets/images/thorvg-logo-clear.svg');
    const svgString = await response.text();
    const svgData = new TextEncoder().encode(svgString);

    const picture = new TVG.Picture();
    picture.load(svgData, { type: 'svg' });

    picture.size(200, 200);
    picture.translate(190, 0);

    scene1.add(picture);
    canvas.add(scene1);
  }

  //Prepare a scene for post effects
  {
    scene2 = new TVG.Scene();

    const response = await fetch('/assets/images/152932619-bd3d6921-72df-4f09-856b-f9743ae32a14.svg');
    const svgString = await response.text();
    const svgData = new TextEncoder().encode(svgString);

    const picture = new TVG.Picture();
    picture.load(svgData, { type: 'svg' });

    const size = picture.size();
    const pw = size.width;
    const ph = size.height;
    picture.translate(175, 185);
    picture.size(pw * 0.5, ph * 0.5);

    scene2.add(picture);
    canvas.add(scene2);
  }

  //Prepare a scene for post effects
  {
    scene3 = new TVG.Scene();

    const response = await fetch('/assets/images/circles1.svg');
    const svgString = await response.text();
    const svgData = new TextEncoder().encode(svgString);

    const picture = new TVG.Picture();
    picture.load(svgData, { type: 'svg' });

    const size = picture.size();
    const pw = size.width;
    const ph = size.height;
    picture.translate(600 * 0.35, 600 * 0.7);
    picture.size(pw * 0.5, ph * 0.5);

    scene3.add(picture);
    canvas.add(scene3);
  }

  canvas.render();

  // Animation loop
  let startTime = Date.now();
  function animate() {
    const elapsed = Date.now() - startTime;
    const duration = 2500; // 2.5 seconds
    const progress = ((elapsed % duration) / duration);

    //Clear the previously applied effects
    scene1.resetEffects();
    //Apply DropShadow post effect (r, g, b, a, angle, distance, sigma of blurness, quality)
    scene1.dropShadow(0, 0, 0, 125, 120, 20 * progress * 0.75, 3, 100);

    scene2.resetEffects();
    scene2.dropShadow(65, 143, 222, Math.floor(255 * progress), 135, 10 * 0.75, 3, 100);

    scene3.resetEffects();
    scene3.dropShadow(0, 0, 0, 125, 360 * progress, 20 * 0.75, 0, 100);

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
