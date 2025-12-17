import { ShowcaseExample } from './types';

export const pathExample: ShowcaseExample = {
  id: 'path',
  title: 'Path Drawing',
  description: 'Draw shapes using path commands',
  category: 'basic',
  thumbnail: '/assets/path-drawing-thumbnail.png',
  code: `// Native example: Path.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600
});

//Star
const star1 = new TVG.Shape();
star1.moveTo(149.25, 25.5);
star1.lineTo(189.75, 107.25);
star1.lineTo(280.5, 120);
star1.lineTo(215.25, 183);
star1.lineTo(230.25, 273.75);
star1.lineTo(149.25, 231.75);
star1.lineTo(72.75, 273.75);
star1.lineTo(84, 183.75);
star1.lineTo(19.5, 120.75);
star1.lineTo(109.5, 107.25);
star1.close();
star1.fill(0, 0, 255, 255);

//Circle
const cx = 412.5;
const cy = 412.5;
const radius = 93.75;
const halfRadius = radius * 0.552284;

const circle1 = new TVG.Shape();
circle1.moveTo(cx, cy - radius);
circle1.cubicTo(
  cx + halfRadius, cy - radius,
  cx + radius, cy - halfRadius,
  cx + radius, cy
);
circle1.cubicTo(
  cx + radius, cy + halfRadius,
  cx + halfRadius, cy + radius,
  cx, cy + radius
);
circle1.cubicTo(
  cx - halfRadius, cy + radius,
  cx - radius, cy + halfRadius,
  cx - radius, cy
);
circle1.cubicTo(
  cx - radius, cy - halfRadius,
  cx - halfRadius, cy - radius,
  cx, cy - radius
);
circle1.close();
circle1.fill(255, 0, 0, 255);

//Star
const star2 = new TVG.Shape();
star2.moveTo(149.25, 25.5);
star2.lineTo(189.75, 107.25);
star2.lineTo(280.5, 120);
star2.lineTo(215.25, 183);
star2.lineTo(230.25, 273.75);
star2.lineTo(149.25, 231.75);
star2.lineTo(72.75, 273.75);
star2.lineTo(84, 183.75);
star2.lineTo(19.5, 120.75);
star2.lineTo(109.5, 107.25);
star2.close();
star2.fill(0, 255, 0, 255);
star2.translate(300, 0);

//Circle
const cx2 = 412.5;
const cy2 = 412.5;
const circle2 = new TVG.Shape();
circle2.moveTo(cx2, cy2 - radius);
circle2.cubicTo(
  cx2 + halfRadius, cy2 - radius,
  cx2 + radius, cy2 - halfRadius,
  cx2 + radius, cy2
);
circle2.cubicTo(
  cx2 + radius, cy2 + halfRadius,
  cx2 + halfRadius, cy2 + radius,
  cx2, cy2 + radius
);
circle2.cubicTo(
  cx2 - halfRadius, cy2 + radius,
  cx2 - radius, cy2 + halfRadius,
  cx2 - radius, cy2
);
circle2.cubicTo(
  cx2 - radius, cy2 - halfRadius,
  cx2 - halfRadius, cy2 - radius,
  cx2, cy2 - radius
);
circle2.close();
circle2.fill(255, 255, 0, 255);
circle2.translate(-225, 0);

canvas.add(star1);
canvas.add(circle1);
canvas.add(star2);
canvas.add(circle2);
canvas.render();
`
};
