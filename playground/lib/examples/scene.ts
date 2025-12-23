import { ShowcaseExample } from './types';

export const sceneExample: ShowcaseExample = {
  id: 'scene',
  title: 'Scene Hierarchy',
  description: 'Group shapes together using scenes for hierarchical organization',
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

// Create first scene
const scene1 = new TVG.Scene();

// Add rounded rectangle to scene1
const shape1 = new TVG.Shape();
shape1.appendRect(0, 0, 400, 400, { rx: 50, ry: 50 });
shape1.fill(0, 255, 0, 255);
scene1.add(shape1);

// Add circle to scene1
const shape2 = new TVG.Shape();
shape2.appendCircle(400, 400, 200, 200);
shape2.fill(255, 255, 0, 255);
scene1.add(shape2);

// Add ellipse to scene1
const shape3 = new TVG.Shape();
shape3.appendCircle(600, 600, 150, 100);
shape3.fill(0, 255, 255, 255);
scene1.add(shape3);

// Create second scene (nested scene)
const scene2 = new TVG.Scene();

// Add star to scene2
const shape4 = new TVG.Shape();
shape4.moveTo(199, 34);
shape4.lineTo(253, 143);
shape4.lineTo(374, 160);
shape4.lineTo(287, 244);
shape4.lineTo(307, 365);
shape4.lineTo(199, 309);
shape4.lineTo(97, 365);
shape4.lineTo(112, 245);
shape4.lineTo(26, 161);
shape4.lineTo(146, 143);
shape4.close();
shape4.fill(0, 0, 255, 255);
scene2.add(shape4);

// Add circle using bezier curves to scene2
const cx = 550;
const cy = 550;
const radius = 125;
const halfRadius = radius * 0.552284;

const shape5 = new TVG.Shape();
shape5.moveTo(cx, cy - radius);
shape5.cubicTo(cx + halfRadius, cy - radius, cx + radius, cy - halfRadius, cx + radius, cy);
shape5.cubicTo(cx + radius, cy + halfRadius, cx + halfRadius, cy + radius, cx, cy + radius);
shape5.cubicTo(cx - halfRadius, cy + radius, cx - radius, cy + halfRadius, cx - radius, cy);
shape5.cubicTo(cx - radius, cy - halfRadius, cx - halfRadius, cy - radius, cx, cy - radius);
shape5.close();
shape5.fill(255, 0, 0, 255);
scene2.add(shape5);

// Add scene2 to scene1 (nested scenes)
scene1.add(scene2);

// Add the entire scene hierarchy to canvas
canvas.add(scene1);
canvas.render();
`
};
