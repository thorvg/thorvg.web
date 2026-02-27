import { ShowcaseExample } from './types';

export const clippingExample: ShowcaseExample = {
  id: 'clipping',
  title: 'Clipping',
  description: 'Demonstrate clipping for shapes and scenes',
  category: 'advanced',
  thumbnail: '/assets/clipping-thumbnail.png',
  code: `// Native example: Clipping.cpp

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
  const svgResponse = await fetch('/assets/images/cartman.svg');
  const svgString = await svgResponse.text();
  const svgData = new TextEncoder().encode(svgString);

  //Background
  const background = new TVG.Shape();
  background.appendRect(0, 0, 600, 600);
  background.fill(255, 255, 255);
  canvas.add(background);

  {
    const scene = new TVG.Scene();

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
    star1.fill(255, 255, 0);
    star1.stroke({ width: 7.5, color: [255, 0, 0, 255] });
    star1.translate(-7.5, -7.5);

    // color/alpha/opacity are ignored for a clip object - no need to set them
    const clipStar = new TVG.Shape();
    clipStar.appendCircle(150, 172.5, 82.5, 82.5);
    clipStar.translate(7.5, 7.5);
    star1.clip(clipStar);

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
    star2.fill(0, 255, 255);
    star2.stroke({ width: 7.5, color: [0, 255, 0, 255] });
    star2.opacity(100);
    star2.translate(7.5, 30);

    // color/alpha/opacity are ignored for a clip object - no need to set them
    const clip = new TVG.Shape();
    clip.appendCircle(150, 172.5, 97.5, 97.5);
    clip.translate(7.5, 7.5);

    scene.add(star1);
    scene.add(star2);

    //Clipping scene to shape
    scene.clip(clip);

    canvas.add(scene);
  }

  {
    const star3 = new TVG.Shape();
    star3.moveTo(149.25, 25.5);
    star3.lineTo(189.75, 107.25);
    star3.lineTo(280.5, 120);
    star3.lineTo(215.25, 183);
    star3.lineTo(230.25, 273.75);
    star3.lineTo(149.25, 231.75);
    star3.lineTo(72.75, 273.75);
    star3.lineTo(84, 183.75);
    star3.lineTo(19.5, 120.75);
    star3.lineTo(109.5, 107.25);
    star3.close();

    //Fill Gradient
    const fill = new TVG.LinearGradient(75, 75, 225, 225);
    fill.setStops(
      [0, [0, 0, 0, 255]],
      [1, [255, 255, 255, 255]]
    );
    star3.fill(fill);

    star3.stroke({ width: 7.5, color: [255, 0, 0, 255] });
    star3.translate(300, 0);

    // color/alpha/opacity are ignored for a clip object - no need to set them
    const clipRect = new TVG.Shape();
    clipRect.appendRect(375, 90, 150, 150);
    clipRect.translate(15, 15);

    //Clipping star3 to rect(shape)
    star3.clip(clipRect);

    canvas.add(star3);
  }

  {
    const picture = new TVG.Picture();
    picture.load(svgData, { type: 'svg' });
    picture.scale(2.25);
    picture.translate(37.5, 300);

    // color/alpha/opacity are ignored for a clip object - no need to set them
    const clipPath = new TVG.Shape();
    clipPath.appendCircle(150, 382.5, 37.5, 37.5);
    clipPath.appendCircle(150, 487.5, 37.5, 37.5);
    clipPath.translate(15, 15);

    //Clipping picture to path
    picture.clip(clipPath);

    canvas.add(picture);
  }

  {
    const shape1 = new TVG.Shape();
    shape1.appendRect(375, 315, 187.5, 187.5, { rx: 15, ry: 15 });
    shape1.fill(255, 0, 255, 160);

    // color/alpha/opacity are ignored for a clip object - no need to set them
    const clipShape = new TVG.Shape();
    clipShape.appendCircle(450, 412.5, 112.5, 112.5);
    clipShape.stroke({ width: 15 });

    //Clipping shape1 to clipShape
    shape1.clip(clipShape);

    canvas.add(shape1);
  }

  canvas.render();
})();
`
};
