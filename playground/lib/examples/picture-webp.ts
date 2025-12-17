import { ShowcaseExample } from './types';

export const pictureWebpExample: ShowcaseExample = {
  id: 'picture-webp',
  title: 'WebP',
  description: 'Load and display WebP images',
  category: 'media',
  thumbnail: '/assets/webp-thumbnail.png',
  code: `// Native example: PictureWebp.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Load webp file from path
(async () => {
  //Fetch and load webp file once
  const response = await fetch('/assets/images/test.webp');
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  var opacity = 31;

  for (let i = 0; i < 7; ++i) {
    const picture = new TVG.Picture();
    picture.loadData(data, { format: 'webp' });
    picture.translate(i * 97.5, i * 97.5);
    picture.rotate(30 * i);
    picture.size(130, 130);
    picture.opacity((opacity + opacity * i) / 255);
    canvas.add(picture);
  }

  //Open file manually
  {
    const picture = new TVG.Picture();
    picture.loadData(data, { format: 'webp' });

    picture.translate(260, 0);
    picture.scale(0.65);
    canvas.add(picture);
  }

  canvas.render();
})();
`
};
