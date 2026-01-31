import { ShowcaseExample } from './types';

export const pictureRawExample: ShowcaseExample = {
  id: 'picture-raw',
  title: 'Raw',
  description: 'Load and display raw ARGB8888 image data',
  category: 'media',
  thumbnail: '/assets/raw-thumbnail.png',
  code: `// Native example: PictureRaw.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Load raw image data (200x300, ARGB8888)
(async () => {
  const response = await fetch('https://jinui.s3.ap-northeast-2.amazonaws.com/rawimage_200x300.raw');
  const arrayBuffer = await response.arrayBuffer();
  const data = new Uint8Array(arrayBuffer);

  //Picture 1: Simple display
  const picture = new TVG.Picture();
  picture.load(data, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });
  picture.translate(260, 162.5);
  canvas.add(picture);

  //Picture 2: Rotated, scaled, with opacity and clipping
  const picture2 = new TVG.Picture();
  picture2.load(data, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });

  picture2.translate(260, 130);
  picture2.rotate(47);
  picture2.scale(0.975);
  picture2.opacity(128);

  //Create circular clipping mask
  const circle = new TVG.Shape();
  circle.appendCircle(227.5, 227.5, 130, 130);
  picture2.clip(circle);

  canvas.add(picture2);

  canvas.render();
})();
`
};
