import { ShowcaseExample } from './types';

export const intersectsExample: ShowcaseExample = {
  id: 'intersects',
  title: 'Intersects',
  description: 'Interactive example demonstrating paint.intersects() API with mouse hover detection',
  category: 'advanced',
  thumbnail: '/assets/intersects-thumbnail.png',
  code: `// Native example: Intersects.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Use a scene for selection effect
let shape, picture, text, tiger;

let marquee;
let mx = 0, my = 0, mw = 10, mh = 10;

(async () => {
  //dash stroke filled shape
  {
    shape = new TVG.Shape();
    shape.moveTo(127.5, 42.5);
    shape.lineTo(190, 202.5);
    shape.lineTo(37.5, 100);
    shape.lineTo(217.5, 100);
    shape.lineTo(65, 202.5);
    shape.close();
    shape.fill(255, 255, 255);
    shape.fillRule(TVG.FillRule.EvenOdd);

    shape.stroke({ width: 10, color: [0, 255, 0, 255], cap: TVG.StrokeCap.Butt, dash: [20, 20] });

    shape.scale(1.25);

    canvas.add(shape);
  }

  //clipped, rotated image
  {
    picture = new TVG.Picture();
    const data = await fetch('/assets/images/test.jpg').then(res => res.bytes());
    picture.load(data, { type: 'jpg' });

    picture.translate(400, 50);
    picture.rotate(47);
    picture.scale(0.5);

    const clip = new TVG.Shape();
    clip.appendCircle(450, 175, 100, 100);
    picture.clip(clip);

    canvas.add(picture);
  }

  //normal text
  {
    const data = await fetch('/fonts/PublicSans-Regular.ttf').then(res => res.bytes());
    TVG.Font.load('PublicSans-Regular', data, { type: 'ttf' });
    text = new TVG.Text();
    text.font('PublicSans-Regular');
    text.fontSize(50);
    text.text('Intersect?!');
    text.translate(12.5, 400);
    text.fill(255, 255, 255);

    canvas.add(text);
  }

  //vector scene
  {
    tiger = new TVG.Picture();
    const data = await fetch('/assets/svg/tiger.svg').then(res => res.text());
    tiger.load(data, { type: 'svg' });
    tiger.translate(350, 320);
    tiger.scale(0.25);

    canvas.add(tiger);
  }

  //marquee
  {
    marquee = new TVG.Shape();
    marquee.appendRect(mx, my, mw, mh);
    marquee.stroke({ width: 1, color: [255, 255, 0, 255] });
    marquee.fill(255, 255, 0, 50);
    canvas.add(marquee);
  }

  const canvasElement = document.querySelector('#canvas');
  canvasElement.addEventListener('mousemove', (e) => {
    const rect = canvasElement.getBoundingClientRect();
    const x = (e.clientX - rect.left) * (600 / rect.width);
    const y = (e.clientY - rect.top) * (600 / rect.height);

    //center align
    mx = Math.trunc(x - mw * 0.5);
    my = Math.trunc(y - mh * 0.5);
  });

  function animate() {
    marquee.translate(mx, my);

    //reset
    shape.opacity(255);
    picture.opacity(255);
    text.opacity(255);
    tiger.opacity(255);

    const dpr = canvas.dpr;
    if (shape.intersects(mx * dpr, my * dpr, mw * dpr, mh * dpr, true)) shape.opacity(127);
    else if (picture.intersects(mx * dpr, my * dpr, mw * dpr, mh * dpr, true)) picture.opacity(127);
    else if (text.intersects(mx * dpr, my * dpr, mw * dpr, mh * dpr, true)) text.opacity(127);
    else if (tiger.intersects(mx * dpr, my * dpr, mw * dpr, mh * dpr, true)) tiger.opacity(127);

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
