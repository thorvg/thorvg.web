import { ShowcaseExample } from './types';

export const directUpdateExample: ShowcaseExample = {
  id: 'direct-update',
  title: 'Direct Update',
  description: 'Direct shape updates with retained properties',
  category: 'basic',
  thumbnail: '/assets/direct-update-thumbnail.png',
  code: `// Native example: DirectUpdate.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Solid Shape
const solid = new TVG.Shape();
solid.appendRect(-62.5, -62.5, 125, 125);

//fill property will be retained
solid.fill(127, 255, 255, 255);
solid.stroke({
  width: 0.625,
  color: [0, 0, 255, 255]
});

//Gradient Shape
const gradient = new TVG.Shape();
gradient.appendRect(475, 0, 125, 125);

//LinearGradient
const fill = new TVG.LinearGradient(475, 0, 475 + 178.125, 187.5);
fill.setStops(
  [0, [255, 0, 0, 127]],
  [0.5, [255, 255, 0, 127]],
  [1, [255, 255, 255, 127]]
);
gradient.fill(fill);

canvas.add(solid);
canvas.add(gradient);
canvas.render();

const startTime = Date.now();

function animate() {
  const elapsed = Date.now() - startTime;
  const progress = ((elapsed % 2000) / 2000);

  //Reset Shape
  solid.reset();
  const cornerRadius = 62.5 * progress;
  solid.appendRect(
    -62.5 + (600 * progress),
    -62.5 + (600 * progress),
    125,
    125,
    { rx: cornerRadius, ry: cornerRadius }
  );

  //Solid Shape
  solid.stroke({ width: 18.75 * progress });

  //Gradient Shape
  gradient.translate(-(600 * progress), 600 * progress);

  canvas.update();
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
