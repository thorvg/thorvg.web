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

(async () => {
  //Prepare a scene for post effects
  {
    scene1 = new TVG.Scene();

    const picture = new TVG.Picture();
    const data = await fetch('/assets/svg/thorvg-logo-clear.svg').then(res => res.text());
    picture.load(data, { type: 'svg' });
    picture.scale(0.45);
    picture.origin(0.5, 0.0);
    picture.translate(300, 37.5);

    scene1.add(picture);
    canvas.add(scene1);
  }

  //Prepare a scene for post effects
  {
    scene2 = new TVG.Scene();

    const picture = new TVG.Picture();
    const data = await fetch('/assets/svg/152932619-bd3d6921-72df-4f09-856b-f9743ae32a14.svg').then(res => res.text());
    picture.load(data, { type: 'svg' });
    picture.scale(0.45);
    picture.origin(0.5, 0.0);
    picture.translate(300, 187.5);

    scene2.add(picture);
    canvas.add(scene2);
  }

  //Prepare a scene for post effects
  {
    scene3 = new TVG.Scene();

    const picture = new TVG.Picture();
    const data = await fetch('/assets/svg/circles1.svg').then(res => res.text());
    picture.load(data, { type: 'svg' });
    picture.scale(0.525);
    picture.origin(0.5, 0.0);
    picture.translate(300, 412.5);

    scene3.add(picture);
    canvas.add(scene3);
  }

  const startTime = Date.now();
  function animate() {
    const elapsed = Date.now() - startTime;
    const duration = 2500; // 2.5 seconds
    let progress = (elapsed % duration) / duration;
    if (Math.floor(elapsed / duration) % 2 !== 0) progress = 1 - progress;

    //Clear the previously applied effects
    scene1.resetEffects();
    //Apply DropShadow post effect (r, g, b, a, angle, distance, sigma of blurness, quality)
    scene1.dropShadow(0, 0, 0, 125, 120, 15 * progress, 5.25, 100);

    scene2.resetEffects();
    scene2.dropShadow(65, 143, 222, Math.floor(255 * progress), 135, 7.5, 2.25, 100);

    scene3.resetEffects();
    scene3.dropShadow(0, 0, 0, 125, 360 * progress, 15, 0, 100);

    canvas.update();
    canvas.render();
    requestAnimationFrame(animate);
  }
  animate();
})();
`
};
