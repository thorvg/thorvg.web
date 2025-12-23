import { ShowcaseExample } from './types';

export const pathExample: ShowcaseExample = {
  id: 'path',
  title: 'Path Drawing',
  description: 'Draw complex paths using moveTo, lineTo, and cubicTo',
  category: 'basic',
  code: `import { init } from '@thorvg/canvas-kit';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/canvas-kit/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 800,
  height: 800,
  renderer: 'gl'
});

// Star path using moveTo and lineTo
const star1 = new TVG.Shape();
star1.moveTo(199, 34);
star1.lineTo(253, 143);
star1.lineTo(374, 160);
star1.lineTo(287, 244);
star1.lineTo(307, 365);
star1.lineTo(199, 309);
star1.lineTo(97, 365);
star1.lineTo(112, 245);
star1.lineTo(26, 161);
star1.lineTo(146, 143);
star1.close();
star1.fill(0, 0, 255, 255);

// Circle using cubicTo (Bezier curves)
const cx = 550;
const cy = 550;
const radius = 125;
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

// Translated star
const star2 = new TVG.Shape();
star2.moveTo(199, 34);
star2.lineTo(253, 143);
star2.lineTo(374, 160);
star2.lineTo(287, 244);
star2.lineTo(307, 365);
star2.lineTo(199, 309);
star2.lineTo(97, 365);
star2.lineTo(112, 245);
star2.lineTo(26, 161);
star2.lineTo(146, 143);
star2.close();
star2.fill(0, 255, 0, 255);
star2.translate(400, 0);

// Translated circle
const cx2 = 550;
const cy2 = 550;
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
circle2.translate(-300, 0);

canvas.add(star1, circle1, star2, circle2);
canvas.render();
`
};
