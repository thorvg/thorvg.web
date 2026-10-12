import { ShowcaseExample } from './types';

export const pictureSvgExample: ShowcaseExample = {
  id: 'picture-svg',
  title: 'Picture SVG',
  description: 'Load and display a SVG image',
  category: 'media',
  thumbnail: '/assets/svg-picture-thumbnail.png',
  code: `// Native example: PictureSvg.cpp

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

  const data = await fetch('/assets/svg/logo.svg').then(res => res.text());

  const opacity = 36;

  //Load svg file
  for (let i = 0; i < 7; ++i) {
    const picture = new TVG.Picture();
    picture.load(data, { type: 'svg' });
    picture.translate(i * 112.5, i * 112.5);
    picture.rotate(30 * i);
    picture.size(150, 150);
    picture.opacity(opacity + opacity * i);
    canvas.add(picture);
  }

  //Open file
  const picture = new TVG.Picture();
  picture.load(data, { type: 'svg' });

  picture.translate(300, 0);
  picture.scale(0.3);
  canvas.add(picture);

  canvas.render();
})();
`
};
