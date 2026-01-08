import { ShowcaseExample } from './types';

export const pictureJpgExample: ShowcaseExample = {
  id: 'picture-jpg',
  title: 'JPG',
  description: 'Load and display JPG images',
  category: 'media',
  thumbnail: '/assets/jpg-thumbnail.png',
  code: `// Native example: PictureJpg.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Load jpg file from path
(async () => {
  var opacity = 36;

  for (let i = 0; i < 7; ++i) {
    const picture = new TVG.Picture();

    //Fetch and load jpg file
    const response = await fetch('/assets/images/test.jpg');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    picture.loadData(data, { format: 'jpg' });
    picture.translate(i * 112.5, i * 112.5);
    picture.rotate(30 * i);
    picture.size(150, 150);
    picture.opacity((opacity + opacity * i) / 255);
    canvas.add(picture);
  }

  //Open file manually
  {
    const response = await fetch('/assets/images/test.jpg');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const picture = new TVG.Picture();
    picture.loadData(data, { format: 'jpg' });

    picture.translate(300, 0);
    picture.scale(0.8);
    canvas.add(picture);
  }

  canvas.render();
})();
`
};
