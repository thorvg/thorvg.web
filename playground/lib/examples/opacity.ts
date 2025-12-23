import { ShowcaseExample } from './types';

export const opacityExample: ShowcaseExample = {
  id: 'opacity',
  title: 'Opacity',
  description: 'Demonstrate opacity control on shapes and scenes',
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

// Create a scene with opacity
const scene1 = new TVG.Scene();
scene1.opacity(175 / 255); // Apply opacity to entire scene (0-1 range)

// Circle in scene
const shape1 = new TVG.Shape();
shape1.appendCircle(400, 400, 250, 250);
shape1.fill(255, 255, 0, 255);
scene1.add(shape1);

// Rectangle in scene
const shape2 = new TVG.Shape();
shape2.appendRect(450, 100, 200, 200, { rx: 50, ry: 50 });
shape2.fill(0, 255, 0, 255);
shape2.stroke({ width: 10, color: [255, 255, 255, 255] });
scene1.add(shape2);

// Create another scene with different opacity
const scene2 = new TVG.Scene();
scene2.opacity(127 / 255); // Half transparent
scene2.scale(1.2);

// Star in second scene
const shape3 = new TVG.Shape();
shape3.moveTo(199, 34);
shape3.lineTo(253, 143);
shape3.lineTo(374, 160);
shape3.lineTo(287, 244);
shape3.lineTo(307, 365);
shape3.lineTo(199, 309);
shape3.lineTo(97, 365);
shape3.lineTo(112, 245);
shape3.lineTo(26, 161);
shape3.lineTo(146, 143);
shape3.close();
shape3.fill(0, 0, 255, 255);
shape3.stroke({ width: 10, color: [255, 255, 255, 255] });
shape3.opacity(127 / 255); // Individual shape opacity
scene2.add(shape3);

// Circle with bezier curves
const cx = 150;
const cy = 150;
const radius = 50;
const halfRadius = radius * 0.552284;

const shape4 = new TVG.Shape();
shape4.moveTo(cx, cy - radius);
shape4.cubicTo(cx + halfRadius, cy - radius, cx + radius, cy - halfRadius, cx + radius, cy);
shape4.cubicTo(cx + radius, cy + halfRadius, cx + halfRadius, cy + radius, cx, cy + radius);
shape4.cubicTo(cx - halfRadius, cy + radius, cx - radius, cy + halfRadius, cx - radius, cy);
shape4.cubicTo(cx - radius, cy - halfRadius, cx - halfRadius, cy - radius, cx, cy - radius);
shape4.close();
shape4.fill(255, 0, 0, 255);
shape4.stroke({ width: 10, color: [0, 0, 255, 255] });
shape4.opacity(200 / 255); // 78% opacity
shape4.scale(3);
scene2.add(shape4);

canvas.add(scene1, scene2);
canvas.render();
`
};
