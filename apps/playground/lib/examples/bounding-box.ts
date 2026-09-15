import { ShowcaseExample } from './types';

export const boundingBoxExample: ShowcaseExample = {
  id: 'bounding-box',
  title: 'Bounding Box',
  description: 'Display bounding boxes around objects',
  category: 'advanced',
  thumbnail: '/assets/boundingbox-thumbnail.png',
  code: `// Native example: BoundingBox.cpp

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
  //Load font
  const response = await fetch('/fonts/Arial.ttf');
  const buffer = await response.arrayBuffer();
  TVG.Font.load('Arial', new Uint8Array(buffer), { type: 'ttf' });

  const allShapes = [];

{
  const shape1 = new TVG.Shape();
  shape1.appendCircle(33.33, 66.67, 26.67, 66.67);
  shape1.fill(0, 30, 255);
  canvas.add(shape1);
  allShapes.push(shape1);
}

{
  const text1 = new TVG.Text();
  text1.font('Arial')
    .fontSize(20)
    .text('Text Test')
    .fill(100, 100, 255)
    .translate(66.67, 13.33)
    .rotate(16);
  canvas.add(text1);
  allShapes.push(text1);
}

{
  const shape2 = new TVG.Shape();
  shape2.appendRect(133.33, 20, 66.67, 13.33);
  shape2.fill(200, 150, 55);
  shape2.rotate(30);
  canvas.add(shape2);
  allShapes.push(shape2);
}

{
  const shape3 = new TVG.Shape();
  shape3.appendRect(150, -33.33, 50, 33.33, { rx: 13.33, ry: 16.67 });
  shape3.appendCircle(150, 16.67, 33.33, 16.67);
  shape3.stroke({ width: 6.67, color: [255, 255, 255, 255] });
  shape3.fill(50, 50, 155);
  shape3.transform({
    e11: 1.732, e12: -1.0, e13: 20,
    e21: 1.0, e22: 1.732, e23: -46.67,
    e31: 0, e32: 0, e33: 1
  });
  canvas.add(shape3);
  allShapes.push(shape3);
}

{
  const svg1 = new TVG.Picture();
  const svgData1 = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
  </svg>\`;
  svg1.load(svgData1, { type: 'svg' })
    .size(60, 60)
    .translate(413.33, 33.33);
  canvas.add(svg1);
  allShapes.push(svg1);
}

{
  const svg2 = new TVG.Picture();
  const svgData2 = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red">
    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
  </svg>\`;
  svg2.load(svgData2, { type: 'svg' })
    .size(40, 40)
    .translate(93.33, 143.33)
    .rotate(45);
  canvas.add(svg2);
  allShapes.push(svg2);
}

{
  const scene1 = new TVG.Scene();
  scene1.scale(0.2);
  scene1.translate(186.67, 220);

  const img1 = new TVG.Picture();
  const imgSvg1 = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#4CAF50"/>
    <circle cx="50" cy="50" r="30" fill="white"/>
  </svg>\`;
  img1.load(imgSvg1, { type: 'svg' }).size(300, 300);
  scene1.add(img1);
  canvas.add(scene1);
  allShapes.push(scene1);
}

{
  const scene2 = new TVG.Scene();
  scene2.scale(0.2);
  scene2.rotate(80);
  scene2.translate(133.33, 320);

  const img2 = new TVG.Picture();
  const imgSvg2 = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
    <rect width="100" height="100" fill="#2196F3"/>
    <rect x="25" y="25" width="50" height="50" fill="yellow"/>
  </svg>\`;
  img2.load(imgSvg2, { type: 'svg' }).size(300, 300);
  scene2.add(img2);
  canvas.add(scene2);
  allShapes.push(scene2);
}

{
  const line = new TVG.Shape();
  line.moveTo(313.33, 233.33);
  line.lineTo(513.33, 233.33);
  line.stroke({ width: 13.33, color: [55, 55, 0, 255] });
  canvas.add(line);
  allShapes.push(line);
}

{
  const curve1 = new TVG.Shape();
  curve1.moveTo(0, 0);
  curve1.cubicTo(26.67, -6.67, 80, -100, 53.33, 0);
  curve1.translate(33.33, 513.33);
  curve1.stroke({ width: 1.33, color: [100, 0, 255, 255] });
  canvas.add(curve1);
  allShapes.push(curve1);
}

{
  const curve2 = new TVG.Shape();
  curve2.moveTo(0, 0);
  curve2.cubicTo(26.67, -6.67, 80, -100, 53.33, 0);
  curve2.translate(100, 500);
  curve2.rotate(20);
  curve2.stroke({ width: 1.33, color: [255, 0, 255, 255] });
  canvas.add(curve2);
  allShapes.push(curve2);
}

{
  const scene3 = new TVG.Scene();
  scene3.translate(366.67, 246.67);
  scene3.scale(0.467);

  const sceneShape1 = new TVG.Shape();
  sceneShape1.moveTo(0, 0);
  sceneShape1.lineTo(300, 200);
  sceneShape1.lineTo(0, 200);
  sceneShape1.fill(255, 0, 0);
  sceneShape1.close();
  sceneShape1.rotate(20);
  scene3.add(sceneShape1);

  canvas.add(scene3);
  allShapes.push(scene3);
}

{
  const scene4 = new TVG.Scene();
  scene4.translate(220, 426.67);
  scene4.scale(0.467);

  const sceneShape2 = new TVG.Shape();
  sceneShape2.moveTo(0, 0);
  sceneShape2.lineTo(300, 200);
  sceneShape2.lineTo(0, 200);
  sceneShape2.fill(0, 255, 0);
  sceneShape2.close();
  sceneShape2.stroke({ width: 20, color: [255, 255, 255, 255], join: TVG.StrokeJoin.Bevel });
  scene4.add(sceneShape2);

  canvas.add(scene4);
  allShapes.push(scene4);
}

{
  const scene5 = new TVG.Scene();
  scene5.translate(433.33, 433.33);
  scene5.scale(0.467);
  scene5.rotate(20);

  const sceneShape3 = new TVG.Shape();
  sceneShape3.moveTo(0, 0);
  sceneShape3.lineTo(300, 200);
  sceneShape3.lineTo(0, 200);
  sceneShape3.fill(0, 255, 255);
  sceneShape3.close();
  sceneShape3.stroke({ width: 13.33, color: [0, 0, 255, 255] });
  scene5.add(sceneShape3);

  canvas.add(scene5);
  allShapes.push(scene5);
}

{
  const scene6 = new TVG.Scene();
  scene6.translate(533.33, 280);
  scene6.scale(0.333);
  scene6.rotate(20);

  const sceneShape4 = new TVG.Shape();
  sceneShape4.moveTo(0, 0);
  sceneShape4.lineTo(150, 100);
  sceneShape4.lineTo(0, 100);
  sceneShape4.close();
  sceneShape4.fill(255, 0, 255);
  sceneShape4.stroke({ width: 20, color: [0, 255, 255, 255], join: TVG.StrokeJoin.Miter });
  sceneShape4.transform({
    e11: 1.8794, e12: -0.6840, e13: 0,
    e21: 0.6840, e22: 1.8794, e23: 0,
    e31: 0, e32: 0, e33: 1
  });
  scene6.add(sceneShape4);

  canvas.add(scene6);
  allShapes.push(scene6);
}

{
  const scene7 = new TVG.Scene();
  scene7.translate(166.67, 326.67);
  scene7.scale(0.467);

  const text2 = new TVG.Text();
  text2.font('Arial')
    .fontSize(33.33)
    .text('Text Test')
    .fill(100, 100, 255)
    .rotate(16);
  scene7.add(text2);

  canvas.add(scene7);
  allShapes.push(scene7);
}

canvas.render();

allShapes.forEach(shape => {
  //aabb
  const aabb = shape.bounds();
  if (aabb) {
    let { x, y, width, height } = aabb;
    x /= canvas.dpr;
    y /= canvas.dpr;
    width /= canvas.dpr;
    height /= canvas.dpr;
    const aabbShape = new TVG.Shape();
    aabbShape.moveTo(x, y);
    aabbShape.lineTo(x + width, y);
    aabbShape.lineTo(x + width, y + height);
    aabbShape.lineTo(x, y + height);
    aabbShape.close();
    aabbShape.stroke({ width: 1.33, color: [255, 0, 0, 255] });
    canvas.add(aabbShape);
  }

  //obb
  const obb = shape.bounds({ oriented: true });
  if (obb && obb.length === 4) {
    const obbShape = new TVG.Shape();
    obbShape.moveTo(obb[0].x / canvas.dpr, obb[0].y / canvas.dpr);
    obbShape.lineTo(obb[1].x / canvas.dpr, obb[1].y / canvas.dpr);
    obbShape.lineTo(obb[2].x / canvas.dpr, obb[2].y / canvas.dpr);
    obbShape.lineTo(obb[3].x / canvas.dpr, obb[3].y / canvas.dpr);
    obbShape.close();
    obbShape.stroke({
      width: 1.33,
      color: [0, 0, 0, 255],
      dash: [2, 6.67]
    });
    canvas.add(obbShape);
  }
});

  canvas.render();
})();
`
};
