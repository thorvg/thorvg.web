import { ShowcaseExample } from './types';

export const duplicateExample: ShowcaseExample = {
  id: 'duplicate',
  title: 'Duplication',
  description: 'Duplicate shapes, scenes, pictures, and objects',
  category: 'advanced',
  thumbnail: '/assets/duplicate-objects-thumbnail.png',
  code: `// Native example: Duplicate.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Duplicate Shapes
{
  //Original Shape
  const shape1 = new TVG.Shape();
  shape1.appendRect(7.5, 7.5, 150, 150);
  shape1.appendRect(165, 7.5, 75, 75);
  shape1.stroke({ width: 2.25, color: [0, 255, 0, 255] });
  shape1.fill(255, 0, 0, 255);

  //Duplicate Shape, Switch fill method
  const shape2 = shape1.duplicate();
  shape2.translate(0, 165);

  const gradient = new TVG.LinearGradient(7.5, 7.5, 330, 150);
  gradient.addStop(0, [0, 0, 0, 255]);
  gradient.addStop(1, [255, 255, 255, 255]);
  shape2.fill(gradient);

  //Duplicate Shape 2
  const shape3 = shape2.duplicate();
  shape3.translate(0, 330);

  canvas.add(shape1, shape2, shape3);
}

//Duplicate Scene
{
  //Create a Scene1
  const scene1 = new TVG.Scene();

  const sceneShape1 = new TVG.Shape();
  sceneShape1.appendRect(0, 0, 300, 300, { rx: 37.5, ry: 37.5 });
  sceneShape1.fill(0, 255, 0, 255);
  scene1.add(sceneShape1);

  const sceneShape2 = new TVG.Shape();
  sceneShape2.appendCircle(300, 300, 150, 150);
  sceneShape2.fill(255, 255, 0, 255);
  scene1.add(sceneShape2);

  const sceneShape3 = new TVG.Shape();
  sceneShape3.appendCircle(450, 450, 112.5, 75);
  sceneShape3.fill(0, 255, 255, 255);
  scene1.add(sceneShape3);

  scene1.scale(0.25);
  scene1.translate(300, 0);

  //Duplicate Scene1
  const scene2 = scene1.duplicate();
  scene2.translate(450, 0);

  canvas.add(scene1, scene2);
}

//Duplicate Picture - svg
{
  const svgData = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
    <polyline points="20 6 9 17 4 12" stroke="#00ff00"/>
  </svg>\`;

  const picture1 = new TVG.Picture();
  picture1.loadData(svgData, { format: 'svg' });
  picture1.translate(280, 150);
  picture1.scale(3);

  const picture2 = picture1.duplicate();
  picture2.translate(420, 180);

  canvas.add(picture1, picture2);
}

//Duplicate Text
{
  const text = new TVG.Text();
  text.font('Arial')
    .fontSize(37.5)
    .text('ThorVG Text')
    .fill(100, 100, 255)
    .translate(0, 487.5);

  const text2 = text.duplicate();
  text2.translate(0, 545);

  canvas.add(text, text2);
}

canvas.render();
`
};
