import { ShowcaseExample } from './types';

export const motionBlurExample: ShowcaseExample = {
  id: 'motion-blur',
  title: 'Motion Blur',
  description: 'Motion blur effect applied to scene content',
  category: 'advanced',
  thumbnail: '/assets/motion-blur-thumbnail.png',
  code: `// Native example: MotionBlur.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const circles = [null, null, null];

const radius = 600 * 0.1;
const distance = { x: 600 - 2 * radius, y: 600 - 2 * radius };

// horizontal
{
  circles[0] = new TVG.Shape();
  circles[0].appendCircle(radius, radius, radius, radius);
  circles[0].fill(255, 255, 0);

  // motion blur effect scene
  const scene = new TVG.Scene();
  // distance, angle, quality
  scene.motionBlur(distance.x * 0.1, 0, 100);
  scene.add(circles[0]);
  canvas.add(scene);
}

// vertical
{
  circles[1] = new TVG.Shape();
  circles[1].appendCircle(600 * 0.5, radius, radius, radius);
  circles[1].fill(0, 255, 255);

  // motion blur effect scene
  const scene = new TVG.Scene();
  scene.motionBlur(distance.y * 0.1, 90, 100);
  scene.add(circles[1]);
  canvas.add(scene);
}

// diagonal
{
  circles[2] = new TVG.Shape();
  circles[2].appendCircle(600 - radius, 600 - radius, radius, radius);
  circles[2].fill(255, 0, 255);

  // motion blur effect scene
  const scene = new TVG.Scene();
  const dist = Math.hypot(distance.x, distance.y) * 0.1;
  const angle = Math.atan2(distance.y, distance.x) * 180 / Math.PI;
  scene.motionBlur(dist, angle, 100);

  scene.add(circles[2]);
  canvas.add(scene);
}

canvas.render();

// Animation loop
let startTime = Date.now();
function animate() {
  const elapsed = Date.now() - startTime;
  const duration = 1000; // 1 second
  let progress = ((elapsed % duration) / duration);
  if (Math.floor(elapsed / duration) % 2 !== 0) progress = 1 - progress; // rewind

  circles[0].translate(distance.x * progress, 0);
  circles[1].translate(0, distance.y * progress);
  circles[2].translate(-distance.x * progress, -distance.y * progress);

  canvas.update();
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
