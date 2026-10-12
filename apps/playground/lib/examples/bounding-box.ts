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

function bbox(canvas, paint) {
  //aabb
  {
    let { x, y, width: w, height: h } = paint.bounds();
    x /= canvas.dpr;
    y /= canvas.dpr;
    w /= canvas.dpr;
    h /= canvas.dpr;
    const bound = new TVG.Shape();
    bound.moveTo(x, y);
    bound.lineTo(x + w, y);
    bound.lineTo(x + w, y + h);
    bound.lineTo(x, y + h);
    bound.close();
    bound.stroke({ width: 1.33, color: [255, 0, 0, 255] });

    canvas.add(bound);
  }

  //obb
  const pts = paint.bounds({ oriented: true });
  if (pts.length === 4) {
    const bound = new TVG.Shape();
    bound.moveTo(pts[0].x / canvas.dpr, pts[0].y / canvas.dpr);
    bound.lineTo(pts[1].x / canvas.dpr, pts[1].y / canvas.dpr);
    bound.lineTo(pts[2].x / canvas.dpr, pts[2].y / canvas.dpr);
    bound.lineTo(pts[3].x / canvas.dpr, pts[3].y / canvas.dpr);
    bound.close();
    bound.stroke({ width: 1.33, color: [255, 255, 255, 255], dash: [2, 6.67] });

    canvas.add(bound);
  }
}

(async () => {
  {
    const shape = new TVG.Shape();
    shape.appendCircle(33.33, 66.67, 26.67, 66.67);
    shape.fill(0, 30, 255);
    canvas.add(shape);
    bbox(canvas, shape);
  }

  {
    const data = await fetch('/fonts/PublicSans-Regular.ttf').then(res => res.bytes());
    TVG.Font.load('PublicSans-Regular', data, { type: 'ttf' });
    const text = new TVG.Text();
    text.font('PublicSans-Regular');
    text.fontSize(20);
    text.text('Text Test');
    text.fill(255, 255, 0);
    text.translate(66.67, 13.33);
    text.rotate(16);
    canvas.add(text);
    bbox(canvas, text);
  }

  {
    const shape = new TVG.Shape();
    shape.appendRect(133.33, 20, 66.67, 13.33);
    shape.fill(200, 150, 55);
    shape.rotate(30);
    canvas.add(shape);
    bbox(canvas, shape);
  }

  {
    const shape = new TVG.Shape();
    shape.appendRect(150, -33.33, 50, 33.33, { rx: 13.33, ry: 16.67 });
    shape.appendCircle(150, 16.67, 33.33, 16.67);
    shape.stroke({ width: 6.67, color: [255, 255, 255, 255] });
    shape.fill(50, 50, 155);

    const m = {
      e11: 1.732, e12: -1.0, e13: 20,
      e21: 1.0, e22: 1.732, e23: -46.67,
      e31: 0, e32: 0, e33: 1
    };
    shape.transform(m);

    canvas.add(shape);
    bbox(canvas, shape);
  }

  {
    const svg = new TVG.Picture();
    const data = await fetch('/assets/svg/tiger.svg').then(res => res.text());
    svg.load(data, { type: 'svg' });
    svg.scale(0.2);
    svg.translate(413.33, 33.33);
    canvas.add(svg);
    bbox(canvas, svg);
  }

  {
    const svg = new TVG.Picture();
    const data = await fetch('/assets/svg/tiger.svg').then(res => res.text());
    svg.load(data, { type: 'svg' });
    svg.scale(0.1333);
    svg.translate(93.33, 143.33);
    svg.rotate(45);
    canvas.add(svg);
    bbox(canvas, svg);
  }

  {
    const scene = new TVG.Scene();
    scene.scale(0.2);
    scene.translate(186.67, 220);

    const img = new TVG.Picture();
    const data = await fetch('/assets/images/test.png').then(res => res.bytes());
    img.load(data, { type: 'png' });
    scene.add(img);

    canvas.add(scene);
    bbox(canvas, scene);
  }

  {
    const scene = new TVG.Scene();
    scene.scale(0.2);
    scene.rotate(80);
    scene.translate(133.33, 320);

    const img = new TVG.Picture();
    const data = await fetch('/assets/images/test.jpg').then(res => res.bytes());
    img.load(data, { type: 'jpg' });
    scene.add(img);

    canvas.add(scene);
    bbox(canvas, scene);
  }

  {
    const line = new TVG.Shape();
    line.moveTo(313.33, 233.33);
    line.lineTo(513.33, 233.33);
    line.stroke({ width: 13.33, color: [55, 55, 0, 255] });
    canvas.add(line);
    bbox(canvas, line);
  }

  {
    const curve = new TVG.Shape();
    curve.moveTo(0, 0);
    curve.cubicTo(26.67, -6.67, 80, -100, 53.33, 0);
    curve.translate(33.33, 513.33);
    curve.stroke({ width: 1.33, color: [255, 255, 255, 255] });
    canvas.add(curve);
    bbox(canvas, curve);
  }

  {
    const curve = new TVG.Shape();
    curve.moveTo(0, 0);
    curve.cubicTo(26.67, -6.67, 80, -100, 53.33, 0);
    curve.translate(100, 500);
    curve.rotate(20);
    curve.stroke({ width: 1.33, color: [255, 0, 255, 255] });
    canvas.add(curve);
    bbox(canvas, curve);
  }

  {
    const scene = new TVG.Scene();
    scene.translate(366.67, 246.67);
    scene.scale(0.7);

    const shape = new TVG.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(200, 133.33);
    shape.lineTo(0, 133.33);
    shape.fill(255, 0, 0);
    shape.close();
    shape.rotate(20);
    scene.add(shape);

    canvas.add(scene);
    bbox(canvas, scene);
  }

  {
    const scene = new TVG.Scene();
    scene.translate(220, 426.67);
    scene.scale(0.7);

    const shape = new TVG.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(200, 133.33);
    shape.lineTo(0, 133.33);
    shape.fill(0, 255, 0);
    shape.close();

    shape.stroke({ width: 20, color: [255, 255, 255, 255], join: TVG.StrokeJoin.Bevel });

    scene.add(shape);

    canvas.add(scene);
    bbox(canvas, scene);
  }

  {
    const scene = new TVG.Scene();
    scene.translate(433.33, 433.33);
    scene.scale(0.7);
    scene.rotate(20);

    const shape = new TVG.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(200, 133.33);
    shape.lineTo(0, 133.33);
    shape.fill(0, 255, 255);
    shape.close();

    shape.stroke({ width: 13.33, color: [0, 0, 255, 255] });

    scene.add(shape);

    canvas.add(scene);
    bbox(canvas, scene);
  }

  {
    const scene = new TVG.Scene();
    scene.translate(533.33, 280);
    scene.scale(0.5);
    scene.rotate(20);

    const shape = new TVG.Shape();
    shape.moveTo(0, 0);
    shape.lineTo(100, 66.67);
    shape.lineTo(0, 66.67);
    shape.close();
    shape.fill(255, 0, 255);
    shape.stroke({ width: 20, color: [0, 255, 255, 255], join: TVG.StrokeJoin.Miter });

    const m = {
      e11: 1.8794, e12: -0.6840, e13: 0,
      e21: 0.6840, e22: 1.8794, e23: 0,
      e31: 0, e32: 0, e33: 1
    };
    shape.transform(m);

    scene.add(shape);

    canvas.add(scene);
    bbox(canvas, scene);
  }

  {
    const scene = new TVG.Scene();
    scene.translate(166.67, 326.67);
    scene.scale(0.7);

    const text = new TVG.Text();
    text.font('PublicSans-Regular');
    text.fontSize(33.33);
    text.text('Text Test');
    text.fill(255, 255, 0);
    text.translate(0, 0);
    text.rotate(16);
    scene.add(text);

    canvas.add(scene);
    bbox(canvas, scene);
  }

  canvas.render();
})();
`
};
