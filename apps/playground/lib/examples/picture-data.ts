import { ShowcaseExample } from './types';

export const pictureDataExample: ShowcaseExample = {
  id: 'picture-data',
  title: 'Picture Data',
  description: 'Load and display a picture with raw pixel data',
  category: 'media',
  thumbnail: '/assets/picture-data-thumbnail.png',
  code: `// Native example: PictureData.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const buffer = new Uint8Array(800 * 800 * 4);

function generate() {
  // generate the content image
  for (let i = 0; i < 800 * 800 * 4; i += 4) {
    buffer[i + 0] = 255;
    buffer[i + 1] = Math.floor(Math.random() * 255);
    buffer[i + 2] = Math.floor(Math.random() * 255);
    buffer[i + 3] = Math.floor(Math.random() * 255);
  }
}

generate();

// picture 1
const picture1 = new TVG.Picture();
picture1.scale(0.375);

// load the picture raw image data
picture1.load(buffer, { type: 'raw', width: 800, height: 800, colorSpace: TVG.ColorSpace.ABGR8888 });

canvas.add(picture1);

// picture 2
const picture2 = new TVG.Picture();
picture2.translate(300, 300);
picture2.scale(0.375);

// load the picture raw image data
picture2.load(buffer, { type: 'raw', width: 800, height: 800, colorSpace: TVG.ColorSpace.ABGR8888 });

canvas.add(picture2);

function animate() {
  generate();

  // only reload the picture1 image
  picture1.load(buffer, { type: 'raw', width: 800, height: 800, colorSpace: TVG.ColorSpace.ABGR8888 });

  canvas.update();
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
