import { ShowcaseExample } from './types';

export const pictureExample: ShowcaseExample = {
  id: 'picture',
  title: 'Picture',
  description: 'Load and display a picture',
  category: 'media',
  thumbnail: '/assets/picture-thumbnail.png',
  code: `// Native example: Picture.cpp

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
  const fontData = await fetch('/fonts/PublicSans-Regular.ttf').then(res => res.bytes());
  TVG.Font.load('PublicSans-Regular', fontData, { type: 'ttf' });

  //Background
  const bg = new TVG.Shape();
  bg.appendRect(0, 0, 600, 600);
  bg.fill(50, 50, 50);
  canvas.add(bg);

  const picture = new TVG.Picture();
  picture.origin(0.5, 0.5);  //center origin

  const data = await fetch('/assets/svg/logo.svg').then(res => res.text());
  picture.load(data, { type: 'svg' });

  //image scaling preserving its aspect ratio
  const { width: w2, height: h2 } = picture.size();
  const scale = (w2 > h2) ? 600 / w2 : 600 / h2;
  picture.scale(scale);
  picture.translate(300, 300);

  canvas.add(picture);
  canvas.render();
})();
`
};
