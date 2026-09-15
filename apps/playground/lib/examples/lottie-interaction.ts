import { ShowcaseExample } from './types';

export const lottieInteractionExample: ShowcaseExample = {
  id: 'lottie-interaction',
  title: 'Lottie Interaction',
  description: 'Drag on the canvas to spin the Lottie in real time — driven by expression slots',
  category: 'media',
  thumbnail: '/assets/lottie-interaction-thumbnail.png',
  useDarkCanvas: true,
  code: `// Native example: LottieInteraction.cpp
// Drag on the canvas to spin the animation. A quick flick spins it further.

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const SIZE = 600;
const canvas = new TVG.Canvas('#canvas', {
  width: SIZE,
  height: SIZE,
});

(async () => {
  const data = await fetch('/assets/lottie/extensions/spin.json').then(res => res.text());

  //LottieAnimation Controller
  const animation = new TVG.LottieAnimation();
  animation.load(data);

  const picture = animation.picture;
  picture.origin(0.5, 0.5);

  //image scaling preserving its aspect ratio
  const { width, height } = picture.size();
  const scale = ((width > height) ? SIZE / width : SIZE / height) * 0.8;
  picture.scale(scale);
  picture.translate(SIZE / 2, SIZE / 2);
  canvas.add(picture);

  const info = animation.info();
  const origin = { x: SIZE / 2, y: SIZE / 2 };

  const slot = { cursor: 0, rotation: 0 };
  const effect = { duration: 2000, target: 0, time: 0, on: false };
  let rotation = 0;
  let pressed = false;
  let downTime = 0;
  let down = { x: 0, y: 0 };
  let prv = { x: 0, y: 0 };
  let cur = { x: 0, y: 0 };

  function calculate(prv, cur) {
    //degree with dot product
    let degree = Math.acos((prv.x * cur.x + prv.y * cur.y) / (Math.sqrt(prv.x * prv.x + prv.y * prv.y) * Math.sqrt(cur.x * cur.x + cur.y * cur.y)));
    degree *= 30;  //weight x30

    //direction with cross product
    const dir = prv.x * cur.y - prv.y * cur.x;
    if (dir < 0) degree *= -1;

    return degree;
  }

  function rotate(val) {
    rotation = val;
    if (slot.rotation) animation.del(slot.rotation);
    slot.rotation = animation.gen({ spin_rotation: { p: { x: 'var $bm_rt = ' + rotation + ';' } } });
    animation.apply(slot.rotation);
  }

  //Map a pointer event to canvas coordinates
  const el = document.querySelector('#canvas');
  function position(e) {
    const rect = el.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width * SIZE,
      y: (e.clientY - rect.top) / rect.height * SIZE,
    };
  }

  el.addEventListener('pointerdown', (e) => {
    const p = position(e);
    down = p;
    prv = { x: p.x - origin.x, y: p.y - origin.y };
    downTime = performance.now();
    pressed = true;
    effect.on = false;
    effect.target = rotation;
    el.setPointerCapture(e.pointerId);
  });

  el.addEventListener('pointermove', (e) => {
    const p = position(e);
    cur = { x: p.x - origin.x, y: p.y - origin.y };
    if (!pressed) return;

    rotate((rotation + calculate(prv, cur)) % 360);

    prv = cur;
  });

  el.addEventListener('pointerup', (e) => {
    pressed = false;
    const p = position(e);

    //flicking in 500ms
    if (performance.now() - downTime > 500) return;
    if (Math.abs(down.x - p.x) < 10 && Math.abs(down.y - p.y) < 10) return;

    const cur = { x: p.x - origin.x, y: p.y - origin.y };
    const prv = { x: down.x - origin.x, y: down.y - origin.y };

    effect.target = rotation + calculate(prv, cur) * 20;  //target to spinning effect
    effect.time = performance.now();
    effect.on = true;
  });

  canvas.render();

  //Run animation loop
  let frame = 0;
  let lastTime = 0;
  function animate(time) {
    if (lastTime === 0) lastTime = time;
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    //update cursor
    const wiggle = Math.sin(time * 0.01) * 20 + 320;
    const cx = (cur.x + origin.x) / scale + wiggle;
    const cy = (cur.y + origin.y) / scale;
    if (slot.cursor) animation.del(slot.cursor);
    slot.cursor = animation.gen({ finger_cursor: { p: { x: 'var $bm_rt; $bm_rt = [' + cx + ', ' + cy + '];' } } });
    animation.apply(slot.cursor);

    //spinning effect
    if (effect.on) {
      let progress = (time - effect.time) / effect.duration;
      if (progress >= 1) {
        progress = 1;
        effect.on = false;
      }
      rotate((effect.target * Math.sin(progress)) % 360);
    }

    frame = (frame + info.fps * delta) % info.totalFrames;
    animation.frame(frame);

    canvas.update();
    canvas.render();
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
`
};
