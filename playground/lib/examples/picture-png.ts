import { ShowcaseExample } from './types';

export const picturePngExample: ShowcaseExample = {
  id: 'picture-png',
  title: 'PNG',
  description: 'Load and display PNG images',
  category: 'media',
  thumbnail: '/assets/png-thumbnail.png',
  code: `// Native example: PicturePng.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Load png file from path
(async () => {
  const response = await fetch('/assets/images/test.png');
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  for (let i = 0; i < 7; ++i) {
    const picture = new TVG.Picture();
    picture.load(data, { type: 'png' });
    picture.translate(i * 97.5, i * 97.5);
    picture.rotate(30 * i);
    picture.size(130, 130);
    picture.opacity(31 * (1 + i));
    canvas.add(picture);
  }

  //Open file manually
  {
    const picture = new TVG.Picture();
    picture.load(data, { type: 'png' });

    picture.translate(247, 0);
    picture.scale(0.65);
    canvas.add(picture);
  }

  canvas.render();
})();
`
};
