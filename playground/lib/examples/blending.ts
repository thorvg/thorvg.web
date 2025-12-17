import { ShowcaseExample } from './types';

export const blendingExample: ShowcaseExample = {
  id: 'blending',
  title: 'Blending',
  description: 'Demonstrate all blend modes with various paint types',
  category: 'advanced',
  useDarkCanvas: true,
  thumbnail: '/assets/blending-thumbnail.png',
  code: `// Native example: Blending.cpp

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
  const imageResponse = await fetch('https://jinui.s3.ap-northeast-2.amazonaws.com/rawimage_200x300.raw');
  const arrayBuffer = await imageResponse.arrayBuffer();
  const imageData = new Uint8Array(arrayBuffer);

  const svgResponse = await fetch('/assets/images/tiger.svg');
  const svgString = await svgResponse.text();
  const svgData = new TextEncoder().encode(svgString);

  function blender(name, method, x, y) {
    const text = new TVG.Text();
    text.font('default');
    text.fontSize(5);
    text.text(name);
    text.fill(255, 255, 255);
    text.translate(6.67 + x, 8.33 + y + 67);
    canvas.add(text);

    //solid
    {
      const bottom = new TVG.Shape();
      bottom.appendRect(6.67 + x, 8.33 + y + 75, 33.33, 33.33, { rx: 3.33, ry: 3.33 });
      bottom.fill(255, 255, 0);
      canvas.add(bottom);

      const top = new TVG.Shape();
      top.appendRect(15 + x, 16.67 + y + 75, 33.33, 33.33, { rx: 3.33, ry: 3.33 });
      top.fill(0, 255, 255);
      top.blend(method);
      canvas.add(top);
    }

    //solid (half transparent)
    {
      const bottom = new TVG.Shape();
      bottom.appendRect(56.67 + x, 8.33 + y + 75, 33.33, 33.33, { rx: 3.33, ry: 3.33 });
      bottom.fill(255, 255, 0, 127);
      canvas.add(bottom);

      const top = new TVG.Shape();
      top.appendRect(65 + x, 16.67 + y + 75, 33.33, 33.33, { rx: 3.33, ry: 3.33 });
      top.fill(0, 255, 255, 127);
      top.blend(method);
      canvas.add(top);
    }

    //gradient blending
    {
      const fill = new TVG.LinearGradient(108.33 + x, 8.33 + y + 75, 141.67 + x, 41.67 + y + 75);
      fill.setStops(
        [0, [255, 0, 255, 255]],
        [1, [0, 255, 0, 127]]
      );

      const bottom = new TVG.Shape();
      bottom.appendRect(108.33 + x, 8.33 + y + 75, 33.33, 33.33, { rx: 3.33, ry: 3.33 });
      bottom.fill(fill);
      canvas.add(bottom);

      const fill2 = new TVG.LinearGradient(116.67 + x, 16.67 + y + 75, 150 + x, 50 + y + 75);
      fill2.setStops(
        [0, [255, 0, 255, 255]],
        [1, [0, 255, 0, 127]]
      );

      const top = new TVG.Shape();
      top.appendRect(116.67 + x, 16.67 + y + 75, 33.33, 33.33, { rx: 3.33, ry: 3.33 });
      top.fill(fill2);
      top.blend(method);
      canvas.add(top);
    }

    //image
    {
      const bottom = new TVG.Picture();
      bottom.load(imageData, { type: 'raw', width: 200, height: 300, colorSpace: TVG.ColorSpace.ARGB8888 });
      bottom.translate(158.33 + x, 8.33 + y + 75);
      bottom.scale(0.11);
      canvas.add(bottom);

      const top = bottom.duplicate();
      top.translate(166.67 + x, 16.67 + y + 75);
      top.rotate(-10);
      top.blend(method);
      canvas.add(top);
    }

    //scene
    {
      const bottom = new TVG.Picture();
      bottom.load(svgData, { type: 'svg' });
      bottom.translate(200 + x, 8.33 + y + 75);
      bottom.scale(0.03);
      canvas.add(bottom);

      const top = bottom.duplicate();
      top.translate(208.33 + x, 16.67 + y + 75);
      top.blend(method);
      canvas.add(top);
    }

    //scene (half transparent)
    {
      const bottom = new TVG.Picture();
      bottom.load(svgData, { type: 'svg' });
      bottom.translate(250 + x, 8.33 + y + 75);
      bottom.scale(0.03);
      bottom.opacity(127);
      canvas.add(bottom);

      const top = bottom.duplicate();
      top.translate(258.33 + x, 16.67 + y + 75);
      top.blend(method);
      canvas.add(top);
    }
  }

  blender('Normal', TVG.BlendMethod.Normal, 0, 0);
  blender('Multiply', TVG.BlendMethod.Multiply, 0, 50);
  blender('Screen', TVG.BlendMethod.Screen, 0, 100);
  blender('Overlay', TVG.BlendMethod.Overlay, 0, 150);
  blender('Darken', TVG.BlendMethod.Darken, 0, 200);
  blender('Lighten', TVG.BlendMethod.Lighten, 0, 250);
  blender('ColorDodge', TVG.BlendMethod.ColorDodge, 0, 300);
  blender('ColorBurn', TVG.BlendMethod.ColorBurn, 0, 350);
  blender('HardLight', TVG.BlendMethod.HardLight, 0, 400);

  blender('SoftLight', TVG.BlendMethod.SoftLight, 300, 0);
  blender('Difference', TVG.BlendMethod.Difference, 300, 50);
  blender('Exclusion', TVG.BlendMethod.Exclusion, 300, 100);
  blender('Hue', TVG.BlendMethod.Hue, 300, 150);
  blender('Saturation', TVG.BlendMethod.Saturation, 300, 200);
  blender('Color', TVG.BlendMethod.Color, 300, 250);
  blender('Luminosity', TVG.BlendMethod.Luminosity, 300, 300);
  blender('Add', TVG.BlendMethod.Add, 300, 350);

  canvas.render();
})();
`
};
