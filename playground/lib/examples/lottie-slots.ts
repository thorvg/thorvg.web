import { ShowcaseExample } from './types';

export const lottieSlotsExample: ShowcaseExample = {
  id: 'lottie-slots',
  title: 'Lottie Slots',
  description: 'Override Lottie properties at runtime with slots (color, gradient, transform, text)',
  category: 'media',
  thumbnail: '/assets/lottie-slots-thumbnail.png',
  useDarkCanvas: true,
  code: `// Native example: LottieSlot.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const NUM_PER_ROW = 3;

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const size = 600 / NUM_PER_ROW;

//Slot data per Lottie file. null keeps the authored default.
const samples = [
  //slot (default)
  { file: 'slot0.json', slot: null },
  //slot (gradient)
  {
    file: 'slot1.json',
    slot: { gradient_fill: { p: { p: 2, k: { k: [0, 0.1, 0.1, 0.2, 1, 1, 0.1, 0.2, 0, 0, 1, 1] } } } },
  },
  //slot (solid fill)
  {
    file: 'slot2.json',
    slot: { ball_color: { p: { a: 1, k: [
      { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 7, s: [0, 0.176, 0.867] },
      { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 22, s: [0.867, 0, 0.533] },
      { i: { x: [0.833], y: [0.833] }, o: { x: [0.167], y: [0.167] }, t: 37, s: [0.867, 0, 0.533] },
      { t: 51, s: [0, 0.867, 0.255] },
    ] } } },
  },
  //slot (overriden default slot)
  {
    file: 'slot4.json',
    slot: {
      bg_color: { p: { a: 0, k: [1, 0.8196, 0.2275] } },
      check_color: { p: { a: 0, k: [0.0078, 0.0078, 0.0078] } },
    },
  },
  //slot (transform: position)
  {
    file: 'slot6.json',
    slot: { position_id: { p: { a: 1, k: [
      { i: { x: 0.833, y: 0.833 }, o: { x: 0.167, y: 0.167 }, s: [100, 100], t: 0 },
      { s: [200, 300], t: 100 },
    ] } } },
  },
  //slot (transform: scale)
  {
    file: 'slot7.json',
    slot: { scale_id: { p: { a: 1, k: [
      { i: { x: 0.833, y: 0.833 }, o: { x: 0.167, y: 0.167 }, s: [0, 0], t: 0 },
      { s: [100, 100], t: 100 },
    ] } } },
  },
  //slot (transform: rotation)
  {
    file: 'slot8.json',
    slot: { rotation_id: { p: { a: 1, k: [
      { i: { x: 0.833, y: 0.833 }, o: { x: 0.167, y: 0.167 }, s: [0], t: 0 },
      { s: [180], t: 100 },
    ] } } },
  },
  //slot (transform: opacity)
  {
    file: 'slot9.json',
    slot: { opacity_id: { p: { a: 1, k: [
      { i: { x: 0.833, y: 0.833 }, o: { x: 0.167, y: 0.167 }, s: [0], t: 0 },
      { s: [100], t: 100 },
    ] } } },
  },
  //slot (text)
  {
    file: 'slot11.json',
    slot: { text_doc: { p: { k: [
      { s: { f: 'Ubuntu Light Italic', t: 'ThorVG!', j: 0, s: 48, fc: [1, 1, 1] }, t: 0 },
    ] } } },
  },
];

(async () => {
  const animations = [];

  for (let i = 0; i < samples.length; i++) {
    const { file, slot } = samples[i];
    const data = await fetch('/assets/lottie/extensions/' + file).then(res => res.text());

    //LottieAnimation Controller
    const animation = new TVG.LottieAnimation();
    animation.load(data);

    if (slot) {
      const slotId = animation.gen(slot);
      animation.apply(slotId);
    }

    //image scaling preserving its aspect ratio
    const picture = animation.picture;
    picture.origin(0.5, 0.5);
    const { width, height } = picture.size();
    picture.scale(((width > height) ? size / width : size / height) * 0.9);
    picture.translate(
      (i % NUM_PER_ROW) * size + size / 2,
      Math.floor(i / NUM_PER_ROW) * size + size / 2
    );

    canvas.add(picture);
    animations.push(animation);
  }

  canvas.render();

  //Run animation loop
  const states = animations.map(animation => ({
    animation,
    frame: 0,
    info: animation.info(),
  }));

  let lastTime = 0;
  function animate(time) {
    if (lastTime === 0) lastTime = time;
    const delta = (time - lastTime) / 1000;
    lastTime = time;

    for (const state of states) {
      state.frame = (state.frame + state.info.fps * delta) % state.info.totalFrames;
      state.animation.frame(state.frame);
    }

    canvas.update();
    canvas.render();
    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
})();
`
};
