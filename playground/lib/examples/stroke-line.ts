import { ShowcaseExample } from './types';

export const strokeLineExample: ShowcaseExample = {
  id: 'stroke-line',
  title: 'Stroke Line',
  description: 'Demonstrate stroke join and cap styles',
  category: 'basic',
  thumbnail: '/assets/stroke-line-styles-thumbnail.png',
  code: `// Native example: StrokeLine.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//StrokeJoin & StrokeCap
const shape1 = new TVG.Shape();
shape1.moveTo(12.5, 31.25);
shape1.lineTo(156.25, 31.25);
shape1.lineTo(137.5, 125);
shape1.lineTo(43.75, 106.25);
shape1.lineTo(43.75, 18.75);
shape1.stroke({
  width: 6.25,
  color: [255, 0, 0, 255],
  join: TVG.StrokeJoin.Round,
  cap: TVG.StrokeCap.Round
});

const shape2 = new TVG.Shape();
shape2.moveTo(168.75, 31.25);
shape2.lineTo(312.5, 31.25);
shape2.lineTo(293.75, 125);
shape2.lineTo(200, 106.25);
shape2.lineTo(200, 18.75);
shape2.stroke({
  width: 6.25,
  color: [100, 100, 255, 255],
  join: TVG.StrokeJoin.Bevel,
  cap: TVG.StrokeCap.Square
});

const shape3 = new TVG.Shape();
shape3.moveTo(325, 31.25);
shape3.lineTo(468.75, 31.25);
shape3.lineTo(450, 125);
shape3.lineTo(356.25, 106.25);
shape3.lineTo(356.25, 18.75);
shape3.stroke({
  width: 6.25,
  color: [0, 255, 0, 255],
  join: TVG.StrokeJoin.Miter,
  cap: TVG.StrokeCap.Butt
});

//Stroke Dash
const shape4 = new TVG.Shape();
shape4.moveTo(12.5, 143.75);
shape4.lineTo(156.25, 143.75);
shape4.lineTo(137.5, 237.5);
shape4.lineTo(43.75, 206.25);
shape4.lineTo(43.75, 131.25);
shape4.stroke({
  width: 3.125,
  color: [255, 0, 0, 255],
  join: TVG.StrokeJoin.Round,
  cap: TVG.StrokeCap.Round,
  dash: [12.5, 6.25]
});

const shape5 = new TVG.Shape();
shape5.moveTo(168.75, 143.75);
shape5.lineTo(312.5, 143.75);
shape5.lineTo(293.75, 237.5);
shape5.lineTo(200, 206.25);
shape5.lineTo(200, 131.25);
shape5.stroke({
  width: 3.125,
  color: [100, 100, 255, 255],
  join: TVG.StrokeJoin.Bevel,
  cap: TVG.StrokeCap.Square,
  dash: [6.25, 6.25]
});

const shape6 = new TVG.Shape();
shape6.moveTo(325, 143.75);
shape6.lineTo(468.75, 143.75);
shape6.lineTo(450, 237.5);
shape6.lineTo(356.25, 206.25);
shape6.lineTo(356.25, 131.25);
shape6.stroke({
  width: 3.125,
  color: [0, 255, 0, 255],
  join: TVG.StrokeJoin.Miter,
  cap: TVG.StrokeCap.Butt,
  dash: [6.25, 6.25, 0.625, 5, 0.625, 6.25]
});

//Closed Shape Stroke
const shape7 = new TVG.Shape();
shape7.moveTo(43.75, 275);
shape7.lineTo(143.75, 275);
shape7.cubicTo(143.75, 334.375, 106.25, 368.75, 43.75, 368.75);
shape7.close();
shape7.stroke({
  width: 9.375,
  color: [255, 0, 0, 255],
  join: TVG.StrokeJoin.Round,
  cap: TVG.StrokeCap.Round
});

const shape8 = new TVG.Shape();
shape8.moveTo(200, 275);
shape8.lineTo(300, 275);
shape8.cubicTo(300, 334.375, 262.5, 368.75, 200, 368.75);
shape8.close();
shape8.stroke({
  width: 9.375,
  color: [100, 100, 255, 255],
  join: TVG.StrokeJoin.Bevel,
  cap: TVG.StrokeCap.Square
});

const shape9 = new TVG.Shape();
shape9.moveTo(356.25, 275);
shape9.lineTo(456.25, 275);
shape9.cubicTo(456.25, 334.375, 418.75, 368.75, 356.25, 368.75);
shape9.close();
shape9.stroke({
  width: 9.375,
  color: [0, 255, 0, 255],
  join: TVG.StrokeJoin.Miter,
  cap: TVG.StrokeCap.Butt
});

//Stroke Dash for Circle and Rect
const shape10 = new TVG.Shape();
shape10.appendCircle(43.75, 437.5, 12.5, 37.5);
shape10.appendRect(81.25, 406.25, 62.5, 50);
shape10.stroke({
  width: 3.125,
  color: [255, 0, 0, 255],
  join: TVG.StrokeJoin.Round,
  cap: TVG.StrokeCap.Round,
  dash: [12.5, 6.25]
});

const shape11 = new TVG.Shape();
shape11.appendCircle(200, 437.5, 12.5, 37.5);
shape11.appendRect(237.5, 406.25, 62.5, 50);
shape11.stroke({
  width: 3.125,
  color: [100, 100, 255, 255],
  join: TVG.StrokeJoin.Bevel,
  cap: TVG.StrokeCap.Square,
  dash: [6.25, 6.25]
});

const shape12 = new TVG.Shape();
shape12.appendCircle(356.25, 437.5, 12.5, 37.5);
shape12.appendRect(393.75, 406.25, 62.5, 50);
shape12.stroke({
  width: 3.125,
  color: [0, 255, 0, 255],
  join: TVG.StrokeJoin.Miter,
  cap: TVG.StrokeCap.Butt,
  dash: [6.25, 6.25, 0.625, 5, 0.625, 6.25]
});

//Zero length Dashes
const shape13 = new TVG.Shape();
shape13.appendCircle(43.75, 531.25, 12.5, 37.5);
shape13.appendRect(81.25, 500, 62.5, 50);
shape13.stroke({
  width: 3.125,
  color: [255, 0, 0, 255],
  join: TVG.StrokeJoin.Round,
  cap: TVG.StrokeCap.Round,
  dash: [0, 12.5]
});

const shape14 = new TVG.Shape();
shape14.appendCircle(200, 531.25, 12.5, 37.5);
shape14.appendRect(237.5, 500, 62.5, 50);
shape14.stroke({
  width: 3.125,
  color: [100, 100, 255, 255],
  join: TVG.StrokeJoin.Bevel,
  cap: TVG.StrokeCap.Square,
  dash: [0, 12.5]
});

const shape15 = new TVG.Shape();
shape15.appendCircle(356.25, 531.25, 12.5, 37.5);
shape15.appendRect(393.75, 500, 62.5, 50);
shape15.stroke({
  width: 3.125,
  color: [0, 255, 0, 255],
  join: TVG.StrokeJoin.Miter,
  cap: TVG.StrokeCap.Butt,
  dash: [0, 12.5]
});

canvas.add(shape1);
canvas.add(shape2);
canvas.add(shape3);
canvas.add(shape4);
canvas.add(shape5);
canvas.add(shape6);
canvas.add(shape7);
canvas.add(shape8);
canvas.add(shape9);
canvas.add(shape10);
canvas.add(shape11);
canvas.add(shape12);
canvas.add(shape13);
canvas.add(shape14);
canvas.add(shape15);
canvas.render();
`
};
