import { ShowcaseExample } from './types';

export const lottieSlotExample: ShowcaseExample = {
  id: 'lottie-slot',
  title: 'Lottie Slot',
  description: 'Override Lottie properties at runtime with slots',
  category: 'media',
  thumbnail: '/assets/lottie-slot-thumbnail.png',
  code: `// Native example: LottieSlot.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const NUM_PER_ROW = 4;
const NUM_PER_COL = 4;

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const slots = [];
const size = 600 / NUM_PER_ROW;

function sizing(picture, counter) {
  picture.origin(0.5, 0.5);

  //image scaling preserving its aspect ratio
  const { width: w, height: h } = picture.size();
  picture.scale((w > h) ? size / w : size / h);
  picture.translate((counter % NUM_PER_ROW) * size + size / 2, Math.floor(counter / NUM_PER_ROW) * (600 / NUM_PER_COL) + size / 2);
}

(async () => {
  //The default font for fallback in case
  const fontResponse = await fetch('/fonts/PublicSans-Regular.ttf');
  TVG.Font.load('PublicSans-Regular', new Uint8Array(await fontResponse.arrayBuffer()), { type: 'ttf' });

  //Background
  const bg = new TVG.Shape();
  bg.appendRect(0, 0, 600, 600);
  bg.fill(75, 75, 75);
  canvas.add(bg);

  const data = await Promise.all(
    ['slot0.json', 'slot1.json', 'slot2.json', 'slot3.json', 'slot4.json', 'slot5.json', 'slot6.json', 'slot7.json', 'slot8.json', 'slot9.json', 'slot10.json', 'slot11.json', 'slot12.json', 'slot13.json', 'slot14.json'].map(file =>
      fetch('/assets/lottie/extensions/' + file).then(res => res.text())
    )
  );

  //The image slot refers to external images, so prefetch them to resolve with.
  const images = {};
  await Promise.all(['img_0.png', 'logo.png'].map(async (name) => {
    const response = await fetch('/assets/lottie/extensions/images/' + name);
    images[name] = new Uint8Array(await response.arrayBuffer());
  }));

  const resolver = (paint, src) => {
    const image = images[src.split('/').pop()];
    if (!image || !(paint instanceof TVG.Picture)) return false;
    paint.load(image, { type: 'png' });
    return true;
  };

  //slot (default)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[0]);

    sizing(picture, 0);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (gradient: color stops, opacity, start, end, height, angle)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[1]);

    const slotJson = '{' +
      '"gradient_fill":{"p":{"p":2,"k":{"k":[0,0.1,0.1,0.2,1,1,0.1,0.2,0,0,1,1]}}},' +
      '"gradient_opacity":{"p":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"s":[100],"t":0},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"s":[30],"t":60},{"s":[100],"t":120}]}},' +
      '"gradient_start":{"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"s":[-80,-40],"t":0},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"s":[80,40],"t":60},{"s":[-80,-40],"t":120}]}},' +
      '"gradient_end":{"p":{"a":0,"k":[110,0]}},' +
      '"gradient_height":{"p":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"s":[0],"t":0},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"s":[90],"t":60},{"s":[0],"t":120}]}},' +
      '"gradient_angle":{"p":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"s":[0],"t":0},{"s":[360],"t":120}]}}' +
    '}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 1);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (solid fill)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[2]);

    const slotJson = '{"ball_color":{"p":{"a":1,"k":[{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":7,"s":[0,0.176,0.867]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":22,"s":[0.867,0,0.533]},{"i":{"x":[0.833],"y":[0.833]},"o":{"x":[0.167],"y":[0.167]},"t":37,"s":[0.867,0,0.533]},{"t":51,"s":[0,0.867,0.255]}]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 2);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (image)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    picture.resolver(resolver);
    slot.load(data[3]);

    const slotJson = '{"path_img":{"p":{"id":"image_0","w":200,"h":300,"u":"images/","p":"logo.png","e":0}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 3);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (overriden default slot)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[4]);

    const slotJson = '{"bg_color":{"p":{"a":0,"k":[1,0.8196,0.2275]}},"check_color":{"p":{"a":0,"k":[0.0078,0.0078,0.0078]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 4);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (duplicate slots with default)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[5]);

    sizing(picture, 5);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (transform: position)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[6]);

    const slotJson = '{"position_id":{"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"s":[100,100],"t":0},{"s":[200,300],"t":100}]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 6);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (transform: scale)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[7]);

    const slotJson = '{"scale_id":{"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"s":[0,0],"t":0},{"s":[100,100],"t":100}]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 7);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (transform: rotation)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[8]);

    const slotJson = '{"rotation_id":{"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"s":[0],"t":0},{"s":[180],"t":100}]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 8);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (transform: opacity)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[9]);

    const slotJson = '{"opacity_id":{"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"s":[0],"t":0},{"s":[100],"t":100}]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 9);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (expression)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[10]);

    const slotJson = '{"rect_rotation":{"p":{"x":"var $bm_rt = time * 360;"}},"rect_scale":{"p":{"x":"var $bm_rt = [];$bm_rt[0] = value[0] + Math.cos(2 * Math.PI * time) * 100;$bm_rt[1] = value[1];"}},"rect_position":{"p":{"x":"var $bm_rt = [];$bm_rt[0] = value[0] + Math.cos(2 * Math.PI * time) * 100;$bm_rt[1] = value[1];"}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 10);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (text)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[11]);

    const slotJson = '{"text_doc":{"p":{"k":[{"s":{"f":"Ubuntu Light Italic","t":"ThorVG!","j":0,"s":48,"fc":[1,1,1]},"t":0}]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 11);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (text range)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[12]);

    const slotJson = '{"texty":{"p":{"a":0,"k":[1,0.5,0]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 12);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (bezier path)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[13]);

    const slotJson = '{"bezier_path":{"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":0,"s":[{"c":true,"i":[[0,0],[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0],[0,0]],"v":[[0,-180],[180,0],[0,180],[-180,0]]}]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":90,"s":[{"c":true,"i":[[-99.4,0],[0,-99.4],[99.4,0],[0,99.4]],"o":[[99.4,0],[0,99.4],[-99.4,0],[0,-99.4]],"v":[[0,-180],[180,0],[0,180],[-180,0]]}]},{"t":180,"s":[{"c":true,"i":[[0,0],[0,0],[0,0],[0,0]],"o":[[0,0],[0,0],[0,0],[0,0]],"v":[[0,-180],[180,0],[0,180],[-180,0]]}]}]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 13);
    canvas.add(picture);
    slots.push(slot);
  }

  //slot (time remap)
  {
    const slot = new TVG.LottieAnimation();
    const picture = slot.picture;
    slot.load(data[14]);

    const slotJson = '{"time_remap":{"p":{"a":1,"k":[{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":0,"s":[0]},{"i":{"x":0.833,"y":0.833},"o":{"x":0.167,"y":0.167},"t":90,"s":[3]},{"t":180,"s":[0]}]}}}';
    const slotId = slot.gen(slotJson);
    slot.apply(slotId);

    sizing(picture, 14);
    canvas.add(picture);
    slots.push(slot);
  }

  canvas.render();

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;

    for (const slot of slots) {
      const { totalFrames, duration } = slot.info();
      const progress = (elapsed % (duration * 1000)) / (duration * 1000);
      slot.frame(totalFrames * progress);
    }

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
