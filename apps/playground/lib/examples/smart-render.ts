import { ShowcaseExample } from './types';

export const smartRenderExample: ShowcaseExample = {
  id: 'smart-render',
  title: 'Smart Render',
  description: 'Animate many particles with partial rendering',
  category: 'advanced',
  thumbnail: '/assets/smart-render-thumbnail.png',
  code: `// Native example: SmartRender.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'sw',  // smart rendering is CPU engine only
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
  engineOption: TVG.EngineOption.SmartRender,
});

const COUNT = 1200;
const raindrops = [];
const clouds = [];

//The native scene is 2440 x 1280
const w = 600;
const h = 600 * 1280 / 2440;
const ratio = 600 / 2440;

(async () => {
  const [cityData, cloudData] = await Promise.all([
    fetch('/assets/images/particle.jpg').then(res => res.bytes()),
    fetch('/assets/images/clouds.png').then(res => res.bytes())
  ]);

  const city = new TVG.Picture();
  city.load(cityData, { type: 'jpg' });
  city.scale(ratio);

  //Crop the image to the native window area
  const clipper = new TVG.Shape();
  clipper.appendRect(0, 0, w, h);
  city.clip(clipper);

  canvas.add(city);

  const cloud1 = new TVG.Picture();
  cloud1.load(cloudData, { type: 'png' });
  cloud1.scale(ratio);
  cloud1.opacity(60);
  canvas.add(cloud1);

  const cloudWidth = cloud1.size().width * ratio;
  clouds.push({ obj: cloud1, x: 0, y: 0, speed: 0.25 * ratio, size: cloudWidth });

  const cloud2 = cloud1.duplicate();
  cloud2.opacity(30);
  cloud2.translate(400 * ratio, 100 * ratio);
  canvas.add(cloud2);

  clouds.push({ obj: cloud2, x: 400 * ratio, y: 100 * ratio, speed: 0.125 * ratio, size: cloudWidth });

  const cloud3 = cloud1.duplicate();
  cloud3.opacity(20);
  cloud3.translate(1200 * ratio, 200 * ratio);
  canvas.add(cloud3);

  clouds.push({ obj: cloud3, x: 1200 * ratio, y: 200 * ratio, speed: 0.075 * ratio, size: cloudWidth });

  const darkness = new TVG.Shape();
  darkness.appendRect(0, 0, w, h);
  darkness.fill(0, 0, 0, 150);
  canvas.add(darkness);

  //rain drops
  const spacing = w / COUNT;

  for (let i = 0; i < COUNT; ++i) {
    const shape = new TVG.Shape();
    const x = spacing * i;
    raindrops.push({ obj: shape, x: x, y: Math.random() * h, speed: (10 + Math.floor(Math.random() * 100) * 0.1) * ratio });
    shape.appendRect(0, 0, ratio, Math.floor(Math.random() * 15) * ratio + spacing);
    shape.fill(255, 255, 255, 55 + Math.floor(Math.random() * 100));
    canvas.add(shape);
  }

  function animate() {
    for (const p of raindrops) {
      p.y += p.speed;
      if (p.y > h) {
        p.y -= h;
      }
      p.obj.translate(p.x, p.y);
    }

    for (const p of clouds) {
      p.x -= p.speed;
      if (p.x + p.size < 0) {
        p.x = w;
      }
      p.obj.translate(p.x, p.y);
    }

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
