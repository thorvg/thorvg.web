import { ShowcaseExample } from './types';

export const sceneExample: ShowcaseExample = {
  id: 'scene',
  title: 'Scene Hierarchy',
  description: 'Group shapes together using scenes for hierarchical organization',
  category: 'basic',
  thumbnail: '/assets/scene-hierachy-thumbnail.png',
  code: `// Native example: Scene.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Create a Scene
const scene1 = new TVG.Scene();

//Prepare Round Rectangle
const shape1 = new TVG.Shape();
shape1.appendRect(0, 0, 300, 300, { rx: 37.5, ry: 37.5 });
shape1.fill(0, 255, 0, 255);
scene1.add(shape1);

//Prepare Circle
const shape2 = new TVG.Shape();
shape2.appendCircle(300, 300, 150, 150);
shape2.fill(255, 255, 0, 255);
scene1.add(shape2);

//Prepare Ellipse
const shape3 = new TVG.Shape();
shape3.appendCircle(450, 450, 112.5, 75);
shape3.fill(0, 255, 255, 255);
scene1.add(shape3);

//Create another Scene
const scene2 = new TVG.Scene();

//Star
const shape4 = new TVG.Shape();

//Appends Paths
shape4.moveTo(149.25, 25.5);
shape4.lineTo(189.75, 107.25);
shape4.lineTo(280.5, 120);
shape4.lineTo(215.25, 183);
shape4.lineTo(230.25, 273.75);
shape4.lineTo(149.25, 231.75);
shape4.lineTo(72.75, 273.75);
shape4.lineTo(84, 183.75);
shape4.lineTo(19.5, 120.75);
shape4.lineTo(109.5, 107.25);
shape4.close();
shape4.fill(0, 0, 255, 255);
scene2.add(shape4);

//Circle
const cx = 412.5;
const cy = 412.5;
const radius = 93.75;
const halfRadius = radius * 0.552284;

const shape5 = new TVG.Shape();

//Append Paths
shape5.moveTo(cx, cy - radius);
shape5.cubicTo(cx + halfRadius, cy - radius, cx + radius, cy - halfRadius, cx + radius, cy);
shape5.cubicTo(cx + radius, cy + halfRadius, cx + halfRadius, cy + radius, cx, cy + radius);
shape5.cubicTo(cx - halfRadius, cy + radius, cx - radius, cy + halfRadius, cx - radius, cy);
shape5.cubicTo(cx - radius, cy - halfRadius, cx - halfRadius, cy - radius, cx, cy - radius);
shape5.fill(255, 0, 0, 255);
scene2.add(shape5);

//Push scene2 onto the scene
scene1.add(scene2);

//Draw the Scene onto the Canvas
canvas.add(scene1);
canvas.render();
`
};
