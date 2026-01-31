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

(async () => {
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
    gradient.setStops(
      [0, [0, 0, 0, 255]],
      [1, [255, 255, 255, 255]]
    );
    shape2.fill(gradient);
  
    //Duplicate Shape 2
    const shape3 = shape2.duplicate();
    shape3.translate(0, 330);
  
    canvas.add(shape1);
    canvas.add(shape2);
    canvas.add(shape3);
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
  
    canvas.add(scene1);
    canvas.add(scene2);
  }

  //Duplicate Picture - svg
  {
    const svgResponse = await fetch('/assets/images/2684.svg');
    const svgData = await svgResponse.text();
  
    const picture1 = new TVG.Picture();
    picture1.load(svgData, { type: 'svg' });
    picture1.translate(262.5, 150);
    picture1.scale(3);
  
    const picture2 = picture1.duplicate();
    picture2.translate(412.5, 187.5);
  
    canvas.add(picture1);
    canvas.add(picture2);
  }

  //Duplicate Picture - raw
  {
    const imageResponse = await fetch('https://jinui.s3.ap-northeast-2.amazonaws.com/rawimage_200x300.raw');
    const arrayBuffer = await imageResponse.arrayBuffer();
    const imageData = new Uint8Array(arrayBuffer);
  
    const picture1 = new TVG.Picture();
    picture1.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ABGR8888 });
    picture1.scale(0.6);
    picture1.translate(300, 337.5);
  
    const picture2 = picture1.duplicate();
    picture2.translate(450, 412.5);
    picture2.scale(0.525);
    picture2.rotate(6);
  
    canvas.add(picture1);
    canvas.add(picture2);
  }

  //Duplicate Text
  {
    const text = new TVG.Text();
    text.font('default')
      .fontSize(37.5)
      .text('ThorVG Text')
      .fill(100, 100, 255)
      .translate(0, 487.5);
  
    const text2 = text.duplicate();
    text2.translate(0, 545);
  
    canvas.add(text);
    canvas.add(text2);
  }
  
  canvas.render();
})();
`
};
