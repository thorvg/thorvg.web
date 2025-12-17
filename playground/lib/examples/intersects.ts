import { ShowcaseExample } from './types';

export const intersectsExample: ShowcaseExample = {
  id: 'intersects',
  title: 'Intersects',
  description: 'Interactive example demonstrating paint.intersects() API with mouse hover detection',
  category: 'advanced',
  thumbnail: '/assets/intersects-thumbnail.png',
  useDarkCanvas: true,
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

let shape, picture, text, tiger, marquee;
let mx = 0, my = 0;
const mw = 10, mh = 10;

(async () => {

// Dash stroke filled shape (star)
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

  shape.stroke({
    width: 10,
    color: [0, 255, 0, 255],
    cap: TVG.StrokeCap.Butt,
    dash: [20, 20]
  });

  shape.scale(1.25);

  canvas.add(shape);
}

// Clipped, rotated image
{
  const response = await fetch('/assets/images/test.jpg');
  const arrayBuffer = await response.arrayBuffer();
  const imageData = new Uint8Array(arrayBuffer);

  picture = new TVG.Picture();
  picture.load(imageData, { type: 'jpg' });
  picture.scale(0.5);
  picture.translate(400, 50);
  picture.rotate(47);

  const clip = new TVG.Shape();
  clip.appendCircle(450, 175, 100, 100);
  picture.clip(clip);

  canvas.add(picture);

  // Vector scene (tiger)
  const svgResponse = await fetch('/assets/images/tiger.svg');
  const svgString = await svgResponse.text();
  const svgData = new TextEncoder().encode(svgString);

  tiger = new TVG.Picture();
  tiger.load(svgData, { type: 'svg' });
  tiger.translate(350, 320);
  tiger.scale(0.25);

  canvas.add(tiger);

  // Normal text
  text = new TVG.Text();
  text.font('default');
  text.fontSize(50);
  text.text('Intersect');
  text.translate(12.5, 400);
  text.fill(255, 255, 255);

  canvas.add(text);

  // Marquee
  marquee = new TVG.Shape();
  marquee.appendRect(0, 0, mw, mh);
  marquee.stroke({ width: 1, color: [255, 255, 0, 255] });
  marquee.fill(255, 255, 0, 50);
  canvas.add(marquee);

  canvas.render();

  // Mouse move handler
  const canvasElement = document.querySelector('#canvas');
  if (canvasElement) {
    canvasElement.addEventListener('mousemove', (e) => {
      const rect = canvasElement.getBoundingClientRect();

      // Convert CSS pixel coordinates to canvas logical coordinates
      const scaleX = 600 / rect.width;
      const scaleY = 600 / rect.height;

      mx = (e.clientX - rect.left) * scaleX * canvas.dpr - (mw / 2);
      my = (e.clientY - rect.top) * scaleY * canvas.dpr - (mh / 2);
    });
  }

  // Animation loop
  function animate() {
    // Update marquee position
    marquee.translate(mx / canvas.dpr, my / canvas.dpr);

    // Reset all opacities
    shape.opacity(255);
    picture.opacity(255);
    text.opacity(255);
    tiger.opacity(255);

    // Check intersections and set opacity
    if (shape.intersects(mx, my, mw, mh)) {
      shape.opacity(128);
    } else if (picture.intersects(mx, my, mw, mh)) {
      picture.opacity(128);
    } else if (text.intersects(mx, my, mw, mh)) {
      text.opacity(128);
    } else if (tiger.intersects(mx, my, mw, mh)) {
      tiger.opacity(128);
    }

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
}
})();
`
};
