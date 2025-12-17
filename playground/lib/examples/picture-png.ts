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

//Background
const bg = new TVG.Shape();
bg.appendRect(0, 0, 600, 600);    //x, y, w, h
bg.fill(255, 255, 255);           //r, g, b
canvas.add(bg);

//Load png file from path
(async () => {
  var opacity = 31;

  for (let i = 0; i < 7; ++i) {
    const picture = new TVG.Picture();

    //Fetch and load png file
    const response = await fetch('/assets/images/test.png');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    picture.loadData(data, { format: 'png' });
    picture.translate(i * 112.5, i * 112.5);
    picture.rotate(30 * i);
    picture.size(150, 150);
    picture.opacity((opacity + opacity * i) / 255);
    canvas.add(picture);
  }

  //Open file manually
  {
    const response = await fetch('/assets/images/test.png');
    const arrayBuffer = await response.arrayBuffer();
    const data = new Uint8Array(arrayBuffer);

    const picture = new TVG.Picture();
    picture.loadData(data, { format: 'png' });

    picture.translate(285, 0);
    picture.scale(0.8);
    canvas.add(picture);
  }

  canvas.render();
})();
`
};
