import { ShowcaseExample } from './types';

export const gradientMaskingExample: ShowcaseExample = {
  id: 'gradient-masking',
  title: 'Gradient Masking',
  description: 'Demonstrate Alpha and InvAlpha masking with linear gradients',
  category: 'advanced',
  thumbnail: '/assets/gradient-masking-thumbnail.png',
  code: `// Native example: GradientMasking.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Solid Rectangle
{
  const shape = new TVG.Shape();
  shape.appendRect(0, 0, 300, 300);

  //Mask
  const mask = new TVG.Shape();
  mask.appendCircle(150, 150, 93.75, 93.75);
  mask.fill(255, 0, 0);

  const fill = new TVG.LinearGradient(0, 0, 300, 300);
  fill.setStops(
    [0, [0, 0, 0, 255]],
    [1, [255, 255, 255, 255]]
  );
  shape.fill(fill);

  shape.mask(mask, TVG.MaskMethod.Alpha);
  canvas.add(shape);
}

//Star
{
  const shape1 = new TVG.Shape();
  shape1.moveTo(449.25, 25.5);
  shape1.lineTo(489.75, 107.25);
  shape1.lineTo(580.5, 120);
  shape1.lineTo(515.25, 183);
  shape1.lineTo(530.25, 273.75);
  shape1.lineTo(449.25, 231.75);
  shape1.lineTo(372.75, 273.75);
  shape1.lineTo(384, 183.75);
  shape1.lineTo(319.5, 120.75);
  shape1.lineTo(409.5, 107.25);
  shape1.close();

  //Mask
  const mask1 = new TVG.Shape();
  mask1.appendCircle(450, 150, 93.75, 93.75);
  mask1.fill(255, 0, 0);

  const fill1 = new TVG.LinearGradient(300, 0, 600, 300);
  fill1.setStops(
    [0, [0, 0, 0, 255]],
    [1, [1, 255, 255, 255]]
  );
  shape1.fill(fill1);

  shape1.mask(mask1, TVG.MaskMethod.Alpha);
  canvas.add(shape1);
}

//Solid Rectangle
{
  const shape2 = new TVG.Shape();
  shape2.appendRect(0, 300, 300, 300);

  //Mask
  const mask2 = new TVG.Shape();
  mask2.appendCircle(150, 450, 93.75, 93.75);
  mask2.fill(255, 0, 0);

  const fill2 = new TVG.LinearGradient(0, 300, 300, 600);
  fill2.setStops(
    [0, [0, 0, 0, 255]],
    [1, [255, 255, 255, 255]]
  );
  shape2.fill(fill2);

  shape2.mask(mask2, TVG.MaskMethod.InvAlpha);
  canvas.add(shape2);
}

// Star
{
  const shape3 = new TVG.Shape();
  shape3.moveTo(449.25, 325.5);
  shape3.lineTo(489.75, 407.25);
  shape3.lineTo(580.5, 420);
  shape3.lineTo(515.25, 483);
  shape3.lineTo(530.25, 573.75);
  shape3.lineTo(449.25, 531.75);
  shape3.lineTo(372.75, 573.75);
  shape3.lineTo(384, 483.75);
  shape3.lineTo(319.5, 420.75);
  shape3.lineTo(409.5, 407.25);
  shape3.close();

  //Mask
  const mask3 = new TVG.Shape();
  mask3.appendCircle(450, 450, 93.75, 93.75);
  mask3.fill(255, 0, 0);

  const fill3 = new TVG.LinearGradient(300, 300, 600, 600);
  fill3.setStops(
    [0, [0, 0, 0, 255]],
    [1, [1, 255, 255, 255]]
  );
  shape3.fill(fill3);

  shape3.mask(mask3, TVG.MaskMethod.InvAlpha);
  canvas.add(shape3);
}

canvas.render();
`
};
