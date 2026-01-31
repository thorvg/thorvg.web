import { ShowcaseExample } from './types';

export const sceneBlendingExample: ShowcaseExample = {
  id: 'scene-blending',
  title: 'Scene Blending',
  description: 'Demonstrate scene blending modes',
  category: 'basic',
  thumbnail: '/assets/scene-blending-thumbnail.png',
  code: `// Native example: SceneBlending.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//BG
const bg = new TVG.Shape();
bg.appendRect(0, 0, 600, 600);
bg.fill(100, 100, 100, 255);
canvas.add(bg);

//Create a Scene
const scene = new TVG.Scene();
scene.blend(TVG.BlendMethod.Add);  //Add

//Prepare Circle
const shape1 = new TVG.Shape();
shape1.appendCircle(300, 300, 187.5, 187.5);
shape1.fill(255, 255, 0, 255);
scene.add(shape1);

//Round rectangle
const shape2 = new TVG.Shape();
shape2.appendRect(337.5, 75, 150, 150, { rx: 37.5, ry: 37.5 });
shape2.fill(0, 255, 0, 255);
shape2.stroke({ width: 7.5, color: [255, 255, 255, 255] });
scene.add(shape2);

//Draw the Scene onto the Canvas
canvas.add(scene);

//Create a Scene 2
const scene2 = new TVG.Scene();
scene2.opacity(127);              //Apply opacity to scene (0 - 255)
scene2.blend(TVG.BlendMethod.Overlay);  //Overlay
scene2.scale(1.2);

//Star
const shape3 = new TVG.Shape();

//Appends Paths
shape3.moveTo(149.25, 25.5);
shape3.lineTo(189.75, 107.25);
shape3.lineTo(280.5, 120);
shape3.lineTo(215.25, 183);
shape3.lineTo(230.25, 273.75);
shape3.lineTo(149.25, 231.75);
shape3.lineTo(72.75, 273.75);
shape3.lineTo(84, 183.75);
shape3.lineTo(19.5, 120.75);
shape3.lineTo(109.5, 107.25);
shape3.close();
shape3.fill(0, 0, 255, 255);
shape3.stroke({ width: 7.5, color: [255, 255, 255, 255] });
shape3.opacity(127);

scene2.add(shape3);

//Circle
const shape4 = new TVG.Shape();

const cx = 112.5;
const cy = 112.5;
const radius = 37.5;
const halfRadius = radius * 0.552284;

//Append Paths
shape4.moveTo(cx, cy - radius);
shape4.cubicTo(cx + halfRadius, cy - radius, cx + radius, cy - halfRadius, cx + radius, cy);
shape4.cubicTo(cx + radius, cy + halfRadius, cx + halfRadius, cy + radius, cx, cy + radius);
shape4.cubicTo(cx - halfRadius, cy + radius, cx - radius, cy + halfRadius, cx - radius, cy);
shape4.cubicTo(cx - radius, cy - halfRadius, cx - halfRadius, cy - radius, cx, cy - radius);
shape4.close();
shape4.fill(255, 0, 0, 255);
shape4.stroke({ width: 7.5, color: [0, 0, 255, 255] });
shape4.opacity(200);
shape4.scale(3);
scene2.add(shape4);

//Draw the Scene onto the Canvas
canvas.add(scene2);

canvas.render();
`
};
