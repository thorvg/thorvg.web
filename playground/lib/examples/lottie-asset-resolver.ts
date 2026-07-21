import { ShowcaseExample } from './types';

export const lottieAssetResolverExample: ShowcaseExample = {
  id: 'lottie-asset-resolver',
  title: 'Lottie Asset Resolver',
  description: 'Supply external Lottie assets (images, fonts) at runtime via a resolver callback',
  category: 'media',
  thumbnail: '/assets/lottie-asset-resolver-thumbnail.png',
  useDarkCanvas: true,
  code: `// Native example: LottieAssetResolver.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const NUM_PER_ROW = 2;
const W = 600, H = 300;

const canvas = new TVG.Canvas('#canvas', { width: W, height: H });

const size = W / NUM_PER_ROW;

function sizing(picture, counter) {
  picture.origin(0.5, 0.5);

  //image scaling preserving its aspect ratio
  const { width, height } = picture.size();
  picture.scale(((width > height) ? size / width : size / height) * 0.85);
  picture.translate((counter % NUM_PER_ROW) * size + size / 2, Math.floor(counter / NUM_PER_ROW) * H + size / 2);
}

(async () => {
  //The resolver callback is synchronous, so prefetch the assets to resolve with.
  const [logo, font, resolver1, resolver2] = await Promise.all([
    fetch('/assets/images/logo.png').then(r => r.arrayBuffer()).then(b => new Uint8Array(b)),
    fetch('/fonts/SentyCloud.ttf').then(r => r.arrayBuffer()).then(b => new Uint8Array(b)),
    fetch('/assets/lottie/extensions/resolver1.json').then(r => r.text()),
    fetch('/assets/lottie/extensions/resolver2.json').then(r => r.text()),
  ]);

  const animations = [];

  //asset resolver (image)
  {
    const animation = new TVG.LottieAnimation();

    //set a resolver prior to load a resource
    animation.picture.resolver((paint, src) => {
      if (!(paint instanceof TVG.Picture)) return false;
      //The engine may fail to access the source image. This demonstrates how to resolve it with a valid user-provided source.
      paint.load(logo, { type: 'png' });
      return true;  //return true if the resolving is successful
    });

    animation.load(resolver1);
    sizing(animation.picture, 0);
    canvas.add(animation.picture);
    animations.push(animation);
  }

  //asset resolver (font)
  {
    TVG.Font.load('SentyCloud', font);

    const animation = new TVG.LottieAnimation();

    animation.picture.resolver((paint, src) => {
      if (!(paint instanceof TVG.Text)) return false;
      //The engine may fail to access the source font. This demonstrates how to resolve it with a valid user-provided font.
      paint.font('SentyCloud');
      return true;  //return true if font loading is successful
    });

    animation.load(resolver2);
    sizing(animation.picture, 1);
    canvas.add(animation.picture);
    animations.push(animation);
  }

  canvas.render();

  //Run animation loop
  const states = animations.map(animation => ({
    animation,
    frame: 0,
    info: animation.info(),
  }));

  let lastTime = 0;
  function animate(time) {
    if (lastTime === 0) lastTime = time;
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    for (const state of states) {
      state.frame = (state.frame + state.info.fps * delta) % state.info.totalFrames;
      state.animation.frame(state.frame);
    }

    canvas.update();
    canvas.render();
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
`
};
