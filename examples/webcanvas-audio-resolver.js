import ThorVG from 'https://unpkg.com/@thorvg/webcanvas@latest/dist/webcanvas.esm.js';
// import ThorVG from '../packages/webcanvas/dist/webcanvas.esm.js'; // for local build

let tvgCanvas = null;
let animation = null;
let fps = 0;

const sources = new Map();

function sourceId(src, mimeType) {
  let id = sources.get(src);
  if (id !== undefined) return id;

  id = sources.size;
  sources.set(src, id);
  self.postMessage({ type: 'source', id, src, mimeType });
  return id;
}

function play() {
  animation.play((frame) => {
    tvgCanvas.update().render();
    self.postMessage({ type: 'tick', frame, fps });
  });
}

function pause() {
  animation.pause();
  self.postMessage({ type: 'pause' });
}

async function start({ canvas, renderer, width, height }) {
  const TVG = await ThorVG.init({
    renderer,
    // locateFile: (path) => '../packages/webcanvas/dist/' + path.split('/').pop(), // for local build
  });

  tvgCanvas = new TVG.Canvas(canvas, { width, height });

  animation = new TVG.LottieAnimation();
  animation.resolver((info) => {
    self.postMessage({
      type: 'audio',
      id: sourceId(info.src, info.mimeType),
      active: info.active,
      offset: info.offset,
      volume: info.volume,
      frame: animation.frame(),
    });
  });

  const json = await fetch('resources/emoji_audio.json').then((res) => res.text());
  animation.load(json);
  animation.setLoop(true);
  fps = animation.info().fps;

  const picture = animation.picture;
  const size = picture.size();
  const scale = Math.min(width / size.width, height / size.height);
  picture.size(size.width * scale, size.height * scale);
  picture.translate((width - size.width * scale) / 2, (height - size.height * scale) / 2);
  tvgCanvas.add(picture);

  animation.frame(0);
  tvgCanvas.update().render();

  self.postMessage({ type: 'ready' });
}

self.onmessage = ({ data }) => {
  switch (data.type) {
    case 'init':
      start(data);
      break;
    case 'play':
      play();
      break;
    case 'pause':
      pause();
      break;
  }
};
