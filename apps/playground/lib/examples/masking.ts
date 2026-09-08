import { ShowcaseExample } from './types';

export const maskingExample: ShowcaseExample = {
  id: 'masking',
  title: 'Masking',
  description: 'Demonstrate Alpha, InvAlpha, Luma, and InvLuma masking with various paint types',
  category: 'advanced',
  thumbnail: '/assets/masking-thumbnail.png',
  code: `// Native example: Masking.cpp

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
  const response = await fetch('/assets/images/rawimage_200x300.raw');
  const arrayBuffer = await response.arrayBuffer();
  const imageData = new Uint8Array(arrayBuffer);

  const svgResponse = await fetch('/assets/images/cartman.svg');
  const svgString = await svgResponse.text();
  const svgData = new TextEncoder().encode(svgString);

  //Masking
  {
    //Solid Rectangle
    const shape = new TVG.Shape();
    shape.appendRect(0, 0, 150, 150);
    shape.fill(0, 0, 255);

    //Mask
    const mask = new TVG.Shape();
    mask.appendCircle(75, 75, 46.875, 46.875);
    mask.fill(255, 255, 255);

    //Nested Mask
    const nMask = new TVG.Shape();
    nMask.appendCircle(82.5, 82.5, 46.875, 46.875);
    nMask.fill(255, 255, 255);

    mask.mask(nMask, TVG.MaskMethod.Alpha);
    shape.mask(mask, TVG.MaskMethod.Alpha);
    canvas.add(shape);

    //SVG
    const svg = new TVG.Picture();
    svg.load(svgData, { type: 'svg' });
    svg.opacity(100);
    svg.scale(1.125);
    svg.translate(18.75, 150);

    //Mask2
    const mask2 = new TVG.Shape();
    mask2.appendCircle(56.25, 187.5, 28.125, 28.125);
    mask2.appendRect(56.25, 187.5, 75, 75, { rx: 11.25, ry: 11.25 });
    mask2.fill(255, 255, 255);
    svg.mask(mask2, TVG.MaskMethod.Alpha);
    canvas.add(svg);

    //Star
    const star = new TVG.Shape();
    star.fill(80, 80, 80);
    star.moveTo(224.625, 12.75);
    star.lineTo(244.875, 53.625);
    star.lineTo(290.25, 60);
    star.lineTo(257.625, 91.5);
    star.lineTo(265.125, 136.875);
    star.lineTo(224.625, 115.875);
    star.lineTo(186.375, 136.875);
    star.lineTo(192, 91.875);
    star.lineTo(159.75, 60.375);
    star.lineTo(204.75, 53.625);
    star.close();
    star.stroke({ width: 11.25, color: [255, 255, 255, 255], join: TVG.StrokeJoin.Miter });

    //Mask3
    const mask3 = new TVG.Shape();
    mask3.appendCircle(225, 75, 46.875, 46.875);
    mask3.fill(255, 255, 255);
    mask3.opacity(200);
    star.mask(mask3, TVG.MaskMethod.Alpha);
    canvas.add(star);

    const image = new TVG.Picture();
    image.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(75, 112.5);
    image.translate(187.5, 150);

    //Mask4
    const mask4 = new TVG.Shape();
    mask4.moveTo(224.625, 144);
    mask4.lineTo(244.875, 184.875);
    mask4.lineTo(290.25, 191.25);
    mask4.lineTo(257.625, 222.75);
    mask4.lineTo(265.125, 268.125);
    mask4.lineTo(224.625, 247.125);
    mask4.lineTo(186.375, 268.125);
    mask4.lineTo(192, 223.125);
    mask4.lineTo(159.75, 191.625);
    mask4.lineTo(204.75, 184.875);
    mask4.close();
    mask4.fill(255, 255, 255);
    mask4.opacity(70);
    image.mask(mask4, TVG.MaskMethod.Alpha);
    canvas.add(image);
  }

  //Inverse Masking
  {
    //Solid Rectangle
    const shape = new TVG.Shape();
    shape.appendRect(300, 0, 150, 150);
    shape.fill(0, 0, 255);

    //Mask
    const mask = new TVG.Shape();
    mask.appendCircle(375, 75, 46.875, 46.875);
    mask.fill(255, 255, 255);

    //Nested Mask
    const nMask = new TVG.Shape();
    nMask.appendCircle(382.5, 82.5, 46.875, 46.875);
    nMask.fill(255, 255, 255);

    mask.mask(nMask, TVG.MaskMethod.InvAlpha);
    shape.mask(mask, TVG.MaskMethod.InvAlpha);
    canvas.add(shape);

    //SVG
    const svg = new TVG.Picture();
    svg.load(svgData, { type: 'svg' });
    svg.opacity(100);
    svg.scale(1.125);
    svg.translate(318.75, 150);

    //Mask2
    const mask2 = new TVG.Shape();
    mask2.appendCircle(356.25, 187.5, 28.125, 28.125);
    mask2.appendRect(356.25, 187.5, 75, 75, { rx: 11.25, ry: 11.25 });
    mask2.fill(255, 255, 255);
    svg.mask(mask2, TVG.MaskMethod.InvAlpha);
    canvas.add(svg);

    //Star
    const star = new TVG.Shape();
    star.fill(80, 80, 80);
    star.moveTo(524.625, 12.75);
    star.lineTo(544.875, 53.625);
    star.lineTo(590.25, 60);
    star.lineTo(557.625, 91.5);
    star.lineTo(565.125, 136.875);
    star.lineTo(524.625, 115.875);
    star.lineTo(486.375, 136.875);
    star.lineTo(492, 91.875);
    star.lineTo(459.75, 60.375);
    star.lineTo(504.75, 53.625);
    star.close();
    star.stroke({ width: 3.75, color: [255, 255, 255, 255] });

    //Mask3
    const mask3 = new TVG.Shape();
    mask3.appendCircle(525, 75, 46.875, 46.875);
    mask3.fill(255, 255, 255);
    star.mask(mask3, TVG.MaskMethod.InvAlpha);
    canvas.add(star);

    const image = new TVG.Picture();
    image.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ABGR8888 }).size(75, 112.5);
    image.translate(487.5, 150);

    //Mask4
    const mask4 = new TVG.Shape();
    mask4.moveTo(524.625, 144);
    mask4.lineTo(544.875, 184.875);
    mask4.lineTo(590.25, 191.25);
    mask4.lineTo(557.625, 222.75);
    mask4.lineTo(565.125, 268.125);
    mask4.lineTo(524.625, 247.125);
    mask4.lineTo(486.375, 268.125);
    mask4.lineTo(492, 223.125);
    mask4.lineTo(459.75, 191.625);
    mask4.lineTo(504.75, 184.875);
    mask4.close();
    mask4.fill(255, 255, 255);
    mask4.opacity(70);
    image.mask(mask4, TVG.MaskMethod.InvAlpha);
    canvas.add(image);
  }

  //Luma Masking
  {
    const shape = new TVG.Shape();
    shape.appendRect(0, 262.5, 150, 150);
    shape.fill(255, 0, 0);

    const mask = new TVG.Shape();
    mask.appendCircle(75, 337.5, 46.875, 46.875);
    mask.fill(255, 100, 255);

    const nMask = new TVG.Shape();
    nMask.appendCircle(82.5, 345, 46.875, 46.875);
    nMask.fill(255, 200, 255);

    mask.mask(nMask, TVG.MaskMethod.Luma);
    shape.mask(mask, TVG.MaskMethod.Luma);
    canvas.add(shape);

    const svg = new TVG.Picture();
    svg.load(svgData, { type: 'svg' });
    svg.opacity(100);
    svg.scale(1.125);
    svg.translate(18.75, 412.5);

    const mask2 = new TVG.Shape();
    mask2.appendCircle(56.25, 450, 28.125, 28.125);
    mask2.appendRect(56.25, 450, 75, 75, { rx: 11.25, ry: 11.25 });
    mask2.fill(255, 255, 255);
    svg.mask(mask2, TVG.MaskMethod.Luma);
    canvas.add(svg);

    const star = new TVG.Shape();
    star.fill(80, 80, 80);
    star.moveTo(224.625, 270);
    star.lineTo(244.875, 316.125);
    star.lineTo(290.25, 322.5);
    star.lineTo(257.625, 354);
    star.lineTo(265.125, 399.375);
    star.lineTo(224.625, 378.375);
    star.lineTo(186.375, 399.375);
    star.lineTo(192, 354.375);
    star.lineTo(159.75, 322.875);
    star.lineTo(204.75, 316.125);
    star.close();
    star.stroke({ width: 3.75, color: [255, 255, 255, 255] });

    const mask3 = new TVG.Shape();
    mask3.appendCircle(225, 337.5, 46.875, 46.875);
    mask3.fill(0, 255, 255);
    star.mask(mask3, TVG.MaskMethod.Luma);
    canvas.add(star);

    const image = new TVG.Picture();
    image.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(75, 112.5);
    image.translate(187.5, 412.5);

    const mask4 = new TVG.Scene();
    const mask4_rect = new TVG.Shape();
    mask4_rect.appendRect(187.5, 412.5, 75, 112.5);
    mask4_rect.fill(255, 255, 255);
    const mask4_circle = new TVG.Shape();
    mask4_circle.appendCircle(225, 468.75, 46.875, 46.875);
    mask4_circle.fill(128, 0, 128);
    mask4.add(mask4_rect);
    mask4.add(mask4_circle);
    image.mask(mask4, TVG.MaskMethod.Luma);
    canvas.add(image);
  }

  //Inverse Luma Masking
  {
    const shape = new TVG.Shape();
    shape.appendRect(300, 262.5, 150, 150);
    shape.fill(255, 0, 0);

    const mask = new TVG.Shape();
    mask.appendCircle(375, 337.5, 46.875, 46.875);
    mask.fill(255, 100, 255);

    const nMask = new TVG.Shape();
    nMask.appendCircle(382.5, 345, 46.875, 46.875);
    nMask.fill(255, 200, 255);

    mask.mask(nMask, TVG.MaskMethod.InvLuma);
    shape.mask(mask, TVG.MaskMethod.InvLuma);
    canvas.add(shape);

    const svg = new TVG.Picture();
    svg.load(svgData, { type: 'svg' });
    svg.opacity(100);
    svg.scale(1.125);
    svg.translate(318.75, 412.5);

    const mask2 = new TVG.Shape();
    mask2.appendCircle(356.25, 450, 28.125, 28.125);
    mask2.appendRect(356.25, 450, 75, 75, { rx: 11.25, ry: 11.25 });
    mask2.fill(255, 255, 255);
    svg.mask(mask2, TVG.MaskMethod.InvLuma);
    canvas.add(svg);

    const star = new TVG.Shape();
    star.fill(80, 80, 80);
    star.moveTo(524.625, 270);
    star.lineTo(544.875, 316.125);
    star.lineTo(590.25, 322.5);
    star.lineTo(557.625, 354);
    star.lineTo(565.125, 399.375);
    star.lineTo(524.625, 378.375);
    star.lineTo(486.375, 399.375);
    star.lineTo(492, 354.375);
    star.lineTo(459.75, 322.875);
    star.lineTo(504.75, 316.125);
    star.close();
    star.stroke({ width: 3.75, color: [255, 255, 255, 255] });

    const mask3 = new TVG.Shape();
    mask3.appendCircle(525, 337.5, 46.875, 46.875);
    mask3.fill(0, 255, 255);
    star.mask(mask3, TVG.MaskMethod.InvLuma);
    canvas.add(star);

    const image = new TVG.Picture();
    image.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 }).size(74, 112);
    image.translate(488, 413.5);

    const mask4 = new TVG.Scene();
    const mask4_rect = new TVG.Shape();
    mask4_rect.appendRect(487.5, 412.5, 75, 112.5);
    mask4_rect.fill(255, 255, 255);
    const mask4_circle = new TVG.Shape();
    mask4_circle.appendCircle(525, 468.75, 46.875, 46.875);
    mask4_circle.fill(128, 0, 128);
    mask4.add(mask4_rect);
    mask4.add(mask4_circle);
    image.mask(mask4, TVG.MaskMethod.InvLuma);
    canvas.add(image);
  }

  canvas.render();
})();
`
};
