import { ShowcaseExample } from './types';

export const strokeExample: ShowcaseExample = {
  id: 'stroke',
  title: 'Stroke',
  description: 'Demonstrate stroke width, join, and cap styles',
  category: 'basic',
  thumbnail: '/assets/stroke-styles-thumbnail.png',
  code: `// Native example: Stroke.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600
});

const bg = new TVG.Shape();
bg.appendRect(0, 0, 600, 600);
bg.fill(0, 0, 0, 255);
canvas.add(bg);

//Shape 1
const shape1 = new TVG.Shape();
shape1.appendRect(37.5, 37.5, 150, 150);
shape1.fill(50, 50, 50, 255);
shape1.stroke({
  width: 7.5,
  color: [255, 255, 255, 255],
  join: TVG.StrokeJoin.Bevel
});

//Shape 2
const shape2 = new TVG.Shape();
shape2.appendRect(225, 37.5, 150, 150);
shape2.fill(50, 50, 50, 255);
shape2.stroke({
  width: 7.5,
  color: [255, 255, 255, 255],
  join: TVG.StrokeJoin.Round
});

//Shape 3
const shape3 = new TVG.Shape();
shape3.appendRect(412.5, 37.5, 150, 150);
shape3.fill(50, 50, 50, 255);
shape3.stroke({
  width: 7.5,
  color: [255, 255, 255, 255],
  join: TVG.StrokeJoin.Miter
});

//Shape 4
const shape4 = new TVG.Shape();
shape4.appendCircle(112.5, 300, 75, 75);
shape4.fill(50, 50, 50, 255);
shape4.stroke({ width: 1, color: [255, 255, 255, 255] });

//Shape 5
const shape5 = new TVG.Shape();
shape5.appendCircle(300, 300, 75, 75);
shape5.fill(50, 50, 50, 255);
shape5.stroke({ width: 2, color: [255, 255, 255, 255] });

//Shape 6
const shape6 = new TVG.Shape();
shape6.appendCircle(487.5, 300, 75, 75);
shape6.fill(50, 50, 50, 255);
shape6.stroke({ width: 4, color: [255, 255, 255, 255] });

//Stroke width test
for (let i = 0; i < 10; i++) {
  const y = 412.5 + 18.75 * i;
  const hline = new TVG.Shape();
  hline.moveTo(37.5, y);
  hline.lineTo(225, y);
  hline.stroke({
    width: i + 1,
    color: [255, 255, 255, 255],
    cap: TVG.StrokeCap.Round
  });
  canvas.add(hline);

  const x = 375 + 18.75 * i;
  const vline = new TVG.Shape();
  vline.moveTo(x, 412.5);
  vline.lineTo(x, 585);
  vline.stroke({
    width: i + 1,
    color: [255, 255, 255, 255],
    cap: TVG.StrokeCap.Round
  });
  canvas.add(vline);
}

//Stroke cap test
const line1 = new TVG.Shape();
line1.moveTo(270, 435);
line1.lineTo(337.5, 435);
line1.stroke({
  width: 11.25,
  color: [255, 255, 255, 255],
  cap: TVG.StrokeCap.Round
});

const line2 = new TVG.Shape();
line2.moveTo(270, 472.5);
line2.lineTo(337.5, 472.5);
line2.stroke({
  width: 11.25,
  color: [255, 255, 255, 255],
  cap: TVG.StrokeCap.Square
});

const line3 = new TVG.Shape();
line3.moveTo(270, 510);
line3.lineTo(337.5, 510);
line3.stroke({
  width: 11.25,
  color: [255, 255, 255, 255],
  cap: TVG.StrokeCap.Butt
});

canvas.add(shape1);
canvas.add(shape2);
canvas.add(shape3);
canvas.add(shape4);
canvas.add(shape5);
canvas.add(shape6);
canvas.add(line1);
canvas.add(line2);
canvas.add(line3);
canvas.render();
`
};
