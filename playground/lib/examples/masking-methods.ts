import { ShowcaseExample } from './types';

export const maskingMethodsExample: ShowcaseExample = {
  id: 'masking-methods',
  title: 'Masking Methods',
  description: 'Demonstrate all 6 mask composition methods (Add, Subtract, Intersect, Difference, Lighten, Darken)',
  category: 'advanced',
  thumbnail: '/assets/masking-methods-thumbnail.png',
  code: `// Native example: MaskingMethods.cpp

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
bg.fill(0, 0, 0, 255);
canvas.add(bg);

(async () => {
  const response = await fetch('https://jinui.s3.ap-northeast-2.amazonaws.com/rawimage_200x300.raw');
  const arrayBuffer = await response.arrayBuffer();
  const imageData = new Uint8Array(arrayBuffer);

  //background
  const bg = new TVG.Shape();
  bg.appendRect(0, 0, 250, 600);
  bg.fill(50, 50, 50);
  canvas.add(bg);

  {
    //Shape + Shape Mask Add
    const shape = new TVG.Shape();
    shape.appendCircle(50, 40, 60, 60);
    shape.fill(255, 255, 255);

    const mask = new TVG.Shape();
    mask.appendCircle(50, 40, 20, 20);
    mask.fill(255, 255, 255);

    const add = new TVG.Shape();
    add.appendCircle(70, 40, 20, 20);
    add.fill(255, 255, 255);
    mask.mask(add, TVG.MaskMethod.Add);
    shape.mask(mask, TVG.MaskMethod.Alpha);
    canvas.add(shape);

    //Shape + Shape Mask Subtract
    const shape2 = new TVG.Shape();
    shape2.appendCircle(150, 40, 60, 60);
    shape2.fill(255, 255, 255, 255);

    const mask2 = new TVG.Shape();
    mask2.appendCircle(150, 40, 20, 20);
    mask2.fill(255, 255, 255, 127);

    const sub = new TVG.Shape();
    sub.appendCircle(160, 40, 20, 20);
    sub.fill(255, 255, 255);
    mask2.mask(sub, TVG.MaskMethod.Subtract);
    shape2.mask(mask2, TVG.MaskMethod.Alpha);
    canvas.add(shape2);

    //Shape + Shape Mask Intersect
    const shape3 = new TVG.Shape();
    shape3.appendCircle(250, 40, 20, 20);
    shape3.fill(255, 255, 255, 127);

    const mask3 = new TVG.Shape();
    mask3.appendCircle(250, 40, 20, 20);
    mask3.fill(255, 255, 255, 127);

    const inter = new TVG.Shape();
    inter.appendCircle(260, 40, 20, 20);
    inter.fill(255, 255, 255);
    mask3.mask(inter, TVG.MaskMethod.Intersect);
    shape3.mask(mask3, TVG.MaskMethod.Alpha);
    canvas.add(shape3);

    //Shape + Shape Mask Difference
    const shape4 = new TVG.Shape();
    shape4.appendCircle(350, 40, 60, 60);
    shape4.fill(255, 255, 255);

    const mask4 = new TVG.Shape();
    mask4.appendCircle(350, 40, 20, 20);
    mask4.fill(255, 255, 255);

    const diff = new TVG.Shape();
    diff.appendCircle(360, 40, 20, 20);
    diff.fill(255, 255, 255);
    mask4.mask(diff, TVG.MaskMethod.Difference);
    shape4.mask(mask4, TVG.MaskMethod.Alpha);
    canvas.add(shape4);

    //Shape + Shape Mask Lighten
    const shape5 = new TVG.Shape();
    shape5.appendCircle(450, 40, 60, 60);
    shape5.fill(255, 255, 255);

    const mask5 = new TVG.Shape();
    mask5.appendCircle(450, 40, 20, 20);
    mask5.fill(255, 255, 255, 200);

    const light = new TVG.Shape();
    light.appendCircle(460, 40, 20, 20);
    light.fill(255, 255, 255);
    mask5.mask(light, TVG.MaskMethod.Lighten);
    shape5.mask(mask5, TVG.MaskMethod.Alpha);
    canvas.add(shape5);

    //Shape + Shape Mask Darken
    const shape6 = new TVG.Shape();
    shape6.appendCircle(550, 40, 60, 60);
    shape6.fill(255, 255, 255);

    const mask6 = new TVG.Shape();
    mask6.appendCircle(550, 40, 20, 20);
    mask6.fill(255, 255, 255, 200);

    const dark = new TVG.Shape();
    dark.appendCircle(560, 40, 20, 20);
    dark.fill(255, 255, 255);
    mask6.mask(dark, TVG.MaskMethod.Darken);
    shape6.mask(mask6, TVG.MaskMethod.Alpha);
    canvas.add(shape6);
  }
  {
    //Shape + Shape Mask Add
    const shape = new TVG.Shape();
    shape.appendCircle(50, 120, 40, 40);
    shape.fill(255, 255, 255);

    const mask = new TVG.Shape();
    mask.appendCircle(50, 120, 20, 20);
    mask.fill(255, 255, 255);

    const add = new TVG.Shape();
    add.appendCircle(70, 120, 20, 20);
    add.fill(255, 255, 255);
    mask.mask(add, TVG.MaskMethod.Add);
    shape.mask(mask, TVG.MaskMethod.InvAlpha);
    canvas.add(shape);

    //Shape + Shape Mask Subtract
    const shape2 = new TVG.Shape();
    shape2.appendCircle(150, 120, 40, 40);
    shape2.fill(255, 255, 255, 255);

    const mask2 = new TVG.Shape();
    mask2.appendCircle(150, 120, 20, 20);
    mask2.fill(255, 255, 255, 127);

    const sub = new TVG.Shape();
    sub.appendCircle(160, 120, 20, 20);
    sub.fill(255, 255, 255);
    mask2.mask(sub, TVG.MaskMethod.Subtract);
    shape2.mask(mask2, TVG.MaskMethod.InvAlpha);
    canvas.add(shape2);

    //Shape + Shape Mask Intersect
    const shape3 = new TVG.Shape();
    shape3.appendCircle(250, 120, 40, 40);
    shape3.fill(255, 255, 255, 127);

    const mask3 = new TVG.Shape();
    mask3.appendCircle(250, 120, 20, 20);
    mask3.fill(255, 255, 255, 127);

    const inter = new TVG.Shape();
    inter.appendCircle(260, 120, 20, 20);
    inter.fill(255, 255, 255);
    mask3.mask(inter, TVG.MaskMethod.Intersect);
    shape3.mask(mask3, TVG.MaskMethod.InvAlpha);
    canvas.add(shape3);

    //Shape + Shape Mask Difference
    const shape4 = new TVG.Shape();
    shape4.appendCircle(350, 120, 40, 40);
    shape4.fill(255, 255, 255);

    const mask4 = new TVG.Shape();
    mask4.appendCircle(350, 120, 20, 20);
    mask4.fill(255, 255, 255);

    const diff = new TVG.Shape();
    diff.appendCircle(360, 120, 20, 20);
    diff.fill(255, 255, 255);
    mask4.mask(diff, TVG.MaskMethod.Difference);
    shape4.mask(mask4, TVG.MaskMethod.InvAlpha);
    canvas.add(shape4);

    //Shape + Shape Mask Lighten
    const shape5 = new TVG.Shape();
    shape5.appendCircle(450, 120, 40, 40);
    shape5.fill(255, 255, 255);

    const mask5 = new TVG.Shape();
    mask5.appendCircle(450, 120, 20, 20);
    mask5.fill(255, 255, 255, 200);

    const light = new TVG.Shape();
    light.appendCircle(460, 120, 20, 20);
    light.fill(255, 255, 255);
    mask5.mask(light, TVG.MaskMethod.Lighten);
    shape5.mask(mask5, TVG.MaskMethod.InvAlpha);
    canvas.add(shape5);

    //Shape + Shape Mask Darken
    const shape6 = new TVG.Shape();
    shape6.appendCircle(550, 120, 40, 40);
    shape6.fill(255, 255, 255);

    const mask6 = new TVG.Shape();
    mask6.appendCircle(550, 120, 20, 20);
    mask6.fill(255, 255, 255, 200);

    const dark = new TVG.Shape();
    dark.appendCircle(560, 120, 20, 20);
    dark.fill(255, 255, 255);
    mask6.mask(dark, TVG.MaskMethod.Darken);
    shape6.mask(mask6, TVG.MaskMethod.InvAlpha);
    canvas.add(shape6);
  }
  {
    //Rect + Rect Mask Add
    const shape = new TVG.Shape();
    shape.appendRect(30, 180, 60, 60);
    shape.fill(255, 255, 255);

    const mask = new TVG.Shape();
    mask.appendRect(30, 200, 40, 40);
    mask.fill(255, 255, 255);

    const add = new TVG.Shape();
    add.appendRect(50, 180, 40, 40);
    add.fill(255, 255, 255);
    mask.mask(add, TVG.MaskMethod.Add);
    shape.mask(mask, TVG.MaskMethod.Alpha);
    canvas.add(shape);

    //Rect + Rect Mask Subtract
    const shape2 = new TVG.Shape();
    shape2.appendRect(130, 180, 60, 60);
    shape2.fill(255, 255, 255);

    const mask2 = new TVG.Shape();
    mask2.appendRect(130, 200, 40, 40);
    mask2.fill(255, 255, 255, 127);

    const sub = new TVG.Shape();
    sub.appendRect(150, 180, 40, 40);
    sub.fill(255, 255, 255);
    mask2.mask(sub, TVG.MaskMethod.Subtract);
    shape2.mask(mask2, TVG.MaskMethod.Alpha);
    canvas.add(shape2);

    //Rect + Rect Mask Intersect
    const shape3 = new TVG.Shape();
    shape3.appendRect(230, 180, 60, 60);
    shape3.fill(255, 255, 255);

    const mask3 = new TVG.Shape();
    mask3.appendRect(230, 200, 40, 40);
    mask3.fill(255, 255, 255, 127);

    const inter = new TVG.Shape();
    inter.appendRect(250, 180, 40, 40);
    inter.fill(255, 255, 255);
    mask3.mask(inter, TVG.MaskMethod.Intersect);
    shape3.mask(mask3, TVG.MaskMethod.Alpha);
    canvas.add(shape3);

    //Rect + Rect Mask Difference
    const shape4 = new TVG.Shape();
    shape4.appendRect(330, 180, 60, 60);
    shape4.fill(255, 255, 255);

    const mask4 = new TVG.Shape();
    mask4.appendRect(330, 200, 40, 40);
    mask4.fill(255, 255, 255);

    const diff = new TVG.Shape();
    diff.appendRect(350, 180, 40, 40);
    diff.fill(255, 255, 255);
    mask4.mask(diff, TVG.MaskMethod.Difference);
    shape4.mask(mask4, TVG.MaskMethod.Alpha);
    canvas.add(shape4);

    //Rect + Rect Mask Lighten
    const shape5 = new TVG.Shape();
    shape5.appendRect(450, 180, 60, 60);
    shape5.fill(255, 255, 255);

    const mask5 = new TVG.Shape();
    mask5.appendRect(450, 200, 40, 40);
    mask5.fill(255, 255, 255, 200);

    const light = new TVG.Shape();
    light.appendRect(470, 180, 40, 40);
    light.fill(255, 255, 255);
    mask5.mask(light, TVG.MaskMethod.Lighten);
    shape5.mask(mask5, TVG.MaskMethod.Alpha);
    canvas.add(shape5);

    //Rect + Rect Mask Darken
    const shape6 = new TVG.Shape();
    shape6.appendRect(550, 180, 60, 60);
    shape6.fill(255, 255, 255);

    const mask6 = new TVG.Shape();
    mask6.appendRect(550, 200, 40, 40);
    mask6.fill(255, 255, 255, 200);

    const dark = new TVG.Shape();
    dark.appendRect(560, 180, 40, 40);
    dark.fill(255, 255, 255);
    mask6.mask(dark, TVG.MaskMethod.Darken);
    shape6.mask(mask6, TVG.MaskMethod.Alpha);
    canvas.add(shape6);
  }
  {
    //Transformed Image + Shape Mask Add
    const image = new TVG.Picture();
    image.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(80, 175.78);
    image.translate(60, 260);
    image.rotate(45);

    const mask = new TVG.Shape();
    mask.appendCircle(50, 280, 20, 20);
    mask.fill(255, 255, 255);

    const add = new TVG.Shape();
    add.appendCircle(60, 300, 20, 20);
    add.fill(255, 255, 255);
    mask.mask(add, TVG.MaskMethod.Add);
    image.mask(mask, TVG.MaskMethod.Alpha);
    canvas.add(image);

    //Transformed Image + Shape Mask Subtract
    const image2 = new TVG.Picture();
    image2.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(80, 175.78);
    image2.translate(160, 260);
    image2.rotate(45);

    const mask2 = new TVG.Shape();
    mask2.appendCircle(150, 280, 20, 20);
    mask2.fill(255, 255, 255, 127);

    const sub = new TVG.Shape();
    sub.appendCircle(160, 300, 20, 20);
    sub.fill(255, 255, 255);
    mask2.mask(sub, TVG.MaskMethod.Subtract);
    image2.mask(mask2, TVG.MaskMethod.Alpha);
    canvas.add(image2);

    //Transformed Image + Shape Mask Intersect
    const image3 = new TVG.Picture();
    image3.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(80, 175.78);
    image3.translate(260, 260);
    image3.rotate(45);

    const mask3 = new TVG.Shape();
    mask3.appendCircle(250, 280, 20, 20);
    mask3.fill(255, 255, 255, 127);

    const inter = new TVG.Shape();
    inter.appendCircle(260, 300, 20, 20);
    inter.fill(255, 255, 255, 127);
    mask3.mask(inter, TVG.MaskMethod.Intersect);
    image3.mask(mask3, TVG.MaskMethod.Alpha);
    canvas.add(image3);

    //Transformed Image + Shape Mask Difference
    const image4 = new TVG.Picture();
    image4.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(80, 175.78);
    image4.translate(360, 260);
    image4.rotate(45);

    const mask4 = new TVG.Shape();
    mask4.appendCircle(350, 280, 20, 20);
    mask4.fill(255, 255, 255);

    const diff = new TVG.Shape();
    diff.appendCircle(360, 300, 20, 20);
    diff.fill(255, 255, 255);
    mask4.mask(diff, TVG.MaskMethod.Difference);
    image4.mask(mask4, TVG.MaskMethod.Alpha);
    canvas.add(image4);

    //Transformed Image + Shape Mask Lighten
    const image5 = new TVG.Picture();
    image5.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(80, 175.78);
    image5.translate(460, 260);
    image5.rotate(45);

    const mask5 = new TVG.Shape();
    mask5.appendCircle(450, 280, 20, 20);
    mask5.fill(255, 255, 255, 200);

    const light = new TVG.Shape();
    light.appendCircle(460, 300, 20, 20);
    light.fill(255, 255, 255);
    mask5.mask(light, TVG.MaskMethod.Lighten);
    image5.mask(mask5, TVG.MaskMethod.Alpha);
    canvas.add(image5);

    //Transformed Image + Shape Mask Darken
    const image6 = new TVG.Picture();
    image6.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(80, 175.78);
    image6.translate(560, 260);
    image6.rotate(45);

    const mask6 = new TVG.Shape();
    mask6.appendCircle(550, 280, 20, 20);
    mask6.fill(255, 255, 255, 200);

    const dark = new TVG.Shape();
    dark.appendCircle(560, 300, 20, 20);
    dark.fill(255, 255, 255);
    mask6.mask(dark, TVG.MaskMethod.Darken);
    image6.mask(mask6, TVG.MaskMethod.Alpha);
    canvas.add(image6);
  }
  {
    //Transformed Image + Shape Mask Add
    const image = new TVG.Picture();
    image.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });
    image.translate(60, 340);
    image.scale(0.2);
    image.rotate(45);

    const mask = new TVG.Shape();
    mask.appendCircle(50, 360, 20, 20);
    mask.fill(255, 255, 255);

    const add = new TVG.Shape();
    add.appendCircle(60, 380, 20, 20);
    add.fill(255, 255, 255);
    mask.mask(add, TVG.MaskMethod.Add);
    image.mask(mask, TVG.MaskMethod.InvAlpha);
    canvas.add(image);

    //Transformed Image + Shape Mask Subtract
    const image2 = new TVG.Picture();
    image2.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });
    image2.translate(160, 340);
    image2.scale(0.2);
    image2.rotate(45);

    const mask2 = new TVG.Shape();
    mask2.appendCircle(150, 360, 20, 20);
    mask2.fill(255, 255, 255, 127);

    const sub = new TVG.Shape();
    sub.appendCircle(160, 380, 20, 20);
    sub.fill(255, 255, 255);
    mask2.mask(sub, TVG.MaskMethod.Subtract);
    image2.mask(mask2, TVG.MaskMethod.InvAlpha);
    canvas.add(image2);

    //Transformed Image + Shape Mask Intersect
    const image3 = new TVG.Picture();
    image3.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });
    image3.translate(260, 340);
    image3.scale(0.2);
    image3.rotate(45);

    const mask3 = new TVG.Shape();
    mask3.appendCircle(250, 360, 20, 20);
    mask3.fill(255, 255, 255, 127);

    const inter = new TVG.Shape();
    inter.appendCircle(260, 380, 20, 20);
    inter.fill(255, 255, 255, 127);
    mask3.mask(inter, TVG.MaskMethod.Intersect);
    image3.mask(mask3, TVG.MaskMethod.InvAlpha);
    canvas.add(image3);

    //Transformed Image + Shape Mask Difference
    const image4 = new TVG.Picture();
    image4.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });
    image4.translate(360, 340);
    image4.scale(0.2);
    image4.rotate(45);

    const mask4 = new TVG.Shape();
    mask4.appendCircle(350, 360, 20, 20);
    mask4.fill(255, 255, 255);

    const diff = new TVG.Shape();
    diff.appendCircle(360, 380, 20, 20);
    diff.fill(255, 255, 255);
    mask4.mask(diff, TVG.MaskMethod.Difference);
    image4.mask(mask4, TVG.MaskMethod.InvAlpha);
    canvas.add(image4);

    //Transformed Image + Shape Mask Lighten
    const image5 = new TVG.Picture();
    image5.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });
    image5.translate(460, 340);
    image5.scale(0.2);
    image5.rotate(45);

    const mask5 = new TVG.Shape();
    mask5.appendCircle(450, 360, 20, 20);
    mask5.fill(255, 255, 255, 200);

    const light = new TVG.Shape();
    light.appendCircle(460, 380, 20, 20);
    light.fill(255, 255, 255);
    mask5.mask(light, TVG.MaskMethod.Lighten);
    image5.mask(mask5, TVG.MaskMethod.InvAlpha);
    canvas.add(image5);

    //Transformed Image + Shape Mask Darken
    const image6 = new TVG.Picture();
    image6.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });
    image6.translate(560, 340);
    image6.scale(0.2);
    image6.rotate(45);

    const mask6 = new TVG.Shape();
    mask6.appendCircle(550, 360, 20, 20);
    mask6.fill(255, 255, 255, 200);

    const dark = new TVG.Shape();
    dark.appendCircle(560, 380, 20, 20);
    dark.fill(255, 255, 255);
    mask6.mask(dark, TVG.MaskMethod.Darken);
    image6.mask(mask6, TVG.MaskMethod.InvAlpha);
    canvas.add(image6);
  }

  canvas.render();
})();
`
};
