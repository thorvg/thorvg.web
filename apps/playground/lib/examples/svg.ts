import { ShowcaseExample } from './types';

export const svgExample: ShowcaseExample = {
  id: 'svg',
  title: 'Svg',
  description: 'Load a collection of SVG images',
  category: 'media',
  thumbnail: '/assets/svg-thumbnail.png',
  code: `// Native example: Svg.cpp

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

const svgFiles = [
  '1372943623.svg',
  '1528928570.svg',
  '1528966158.svg',
  '1528971912.svg',
  '1529018819.svg',
  '152932619-bd3d6921-72df-4f09-856b-f9743ae32a14.svg',
  '1551733624.svg',
  '1630446379Bahamas-patriotic-flag-symbol.svg',
  '1690525371exotic-beach-in-the-summer.svg',
];

(async () => {
  //The default font for fallback in case
  const fontResponse = await fetch('/fonts/PublicSans-Regular.ttf');
  TVG.Font.load('PublicSans-Regular', new Uint8Array(await fontResponse.arrayBuffer()), { type: 'ttf' });

  //Background
  const shape = new TVG.Shape();
  shape.appendRect(0, 0, 600, 600);
  shape.fill(150, 150, 150);

  canvas.add(shape);

  const svgDataArray = await Promise.all(
    svgFiles.slice(0, NUM_PER_ROW * NUM_PER_COL).map(file =>
      fetch('/assets/svg/' + encodeURIComponent(file)).then(res => res.text())
    )
  );

  const pictures = [];
  let counter = 0;

  for (const svgData of svgDataArray) {
    const picture = new TVG.Picture();
    picture.origin(0.5, 0.5);

    picture.load(svgData, { type: 'svg' });

    //image scaling preserving its aspect ratio
    const cellSize = 600 / NUM_PER_ROW;
    const { width: w, height: h } = picture.size();
    picture.scale((w > h) ? cellSize / w : cellSize / h);
    picture.translate((counter % NUM_PER_ROW) * cellSize + cellSize / 2, Math.floor(counter / NUM_PER_ROW) * (600 / NUM_PER_COL) + cellSize / 2);

    pictures.push(picture);

    counter++;
  }

  /* This showcase demonstrates the asynchronous loading of tvg.
     For this, pictures are added at a certain sync time.
     This allows time for the tvg resources to finish loading;
     otherwise, you can add pictures immediately. */
  for (const paint of pictures) {
    canvas.add(paint);
  }

  canvas.render();
})();
`
};
