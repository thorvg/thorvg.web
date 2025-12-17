import { ShowcaseExample } from './types';

export const trimPathExample: ShowcaseExample = {
  id: 'trim-path',
  title: 'Path Trimming',
  description: 'Trim paths to show only portions of shapes',
  category: 'basic',
  thumbnail: '/assets/trimpath-thumbnail.png',
  code: `// Native example: TrimPath.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Shape 1
const shape1 = new TVG.Shape();
shape1.appendCircle(183.75, 93.75, 37.5, 90);
shape1.appendCircle(183.75, 273.75, 37.5, 90);
shape1.appendCircle(93.75, 183.75, 90, 37.5);
shape1.appendCircle(273.75, 183.75, 90, 37.5);
shape1.fill(0, 50, 155, 100);
shape1.stroke({
  width: 9,
  color: [0, 0, 255, 255],
  join: TVG.StrokeJoin.Round,
  cap: TVG.StrokeCap.Round
});

shape1.trimPath(0.25, 0.75, false);

const shape2 = shape1.duplicate();
shape2.translate(225, 225);
shape2.fill(0, 155, 50, 100);
shape2.stroke({
  width: 9,
  color: [0, 255, 0, 255],
  join: TVG.StrokeJoin.Round,
  cap: TVG.StrokeCap.Round,
  dash: [10, 20],
  dashOffset: 10
});

shape2.trimPath(0.25, 0.75, true);

canvas.add(shape1);
canvas.add(shape2);
canvas.render();
`
};
