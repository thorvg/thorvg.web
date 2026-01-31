import { ShowcaseExample } from './types';

export const clippingExample: ShowcaseExample = {
  id: 'clipping',
  title: 'Clipping',
  description: 'Demonstrate clipping for shapes and scenes',
  category: 'advanced',
  thumbnail: '/assets/clipping-thumbnail.png',
  code: `// Native example: Clipping.cpp

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
const background = new TVG.Shape();
background.appendRect(0, 0, 600, 600);
background.fill(255, 255, 255, 255);

const star = new TVG.Shape();
star.moveTo(149.25, 25.5);
star.lineTo(189.75, 107.25);
star.lineTo(280.5, 120);
star.lineTo(215.25, 183);
star.lineTo(230.25, 273.75);
star.lineTo(149.25, 231.75);
star.lineTo(72.75, 273.75);
star.lineTo(84, 183.75);
star.lineTo(19.5, 120.75);
star.lineTo(109.5, 107.25);
star.close();
star.fill(255, 255, 0, 255);
star.stroke({ width: 7.5, color: [255, 0, 0, 255] });

// color/alpha/opacity are ignored for a clip object - no need to set them
const clipCircle = new TVG.Shape();
clipCircle.appendCircle(150, 172.5, 82.5, 82.5);
star.clip(clipCircle);

const rect = new TVG.Shape();
rect.appendRect(375, 315, 187.5, 187.5, { rx: 15, ry: 15 });
rect.fill(255, 0, 255, 160);

// color/alpha/opacity are ignored for a clip object - no need to set them
const clipShape = new TVG.Shape();
clipShape.appendCircle(450, 412.5, 112.5, 112.5);

//Clipping shape1 to clipShape
rect.clip(clipShape);

canvas.add(background);
canvas.add(star);
canvas.add(rect);
canvas.render();
`
};
