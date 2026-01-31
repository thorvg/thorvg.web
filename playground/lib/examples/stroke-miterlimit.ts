import { ShowcaseExample } from './types';

export const strokeMiterlimitExample: ShowcaseExample = {
  id: 'stroke-miterlimit',
  title: 'Stroke Miter Limit',
  description: 'Demonstrate stroke miter limit behavior',
  category: 'basic',
  thumbnail: '/assets/stroke-miter-limit-thumbnail.png',
  code: `// Native example: StrokeMiterlimit.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//background
const bg = new TVG.Shape();
bg.appendRect(0, 0, 600, 600);
bg.fill(200, 200, 255, 255);

//wild
const path = new TVG.Shape();
const top = 75.0;
const bot = 525.0;

path.moveTo(225, top / 2);
path.lineTo(75, bot);
path.lineTo(262.5, 300);
path.lineTo(315, bot);
path.lineTo(322.5, top * 2);
path.lineTo(375, bot);
path.lineTo(345, top * 2);
path.lineTo(562.5, bot);
path.lineTo(345, top / 2);
path.close();

path.fill(150, 150, 255, 255);
path.stroke({
  width: 15,
  color: [120, 120, 255, 255],
  join: TVG.StrokeJoin.Miter,
  miterLimit: 10
});

canvas.add(bg);
canvas.add(path);
canvas.render();
`
};
