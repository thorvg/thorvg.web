import { ShowcaseExample } from './types';

export const lottieAudioExample: ShowcaseExample = {
  id: 'lottie-audio',
  title: 'Lottie Audio',
  description: 'Play the audio layers of a Lottie',
  category: 'media',
  thumbnail: '/assets/lottie-audio-thumbnail.png',
  useDarkCanvas: true,
  requiresUserGesture: true,
  code: `// Native example: LottieAudio.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const W = 600, H = 600;

const canvas = new TVG.Canvas('#canvas', { width: W, height: H });

(async () => {
  globalThis.__lottieAudioDemo?.dispose();

  //background
  const bg = new TVG.Shape();
  bg.appendRect(0, 0, W, H);
  bg.fill(30, 30, 35);
  canvas.add(bg);

  //lottie animation
  const animation = new TVG.LottieAnimation();
  const response = await fetch('/assets/lottie/extensions/audio.json');
  animation.load(await response.text());

  const picture = animation.picture;
  const { width, height } = picture.size();
  const scale = (width / height > W / H) ? W / width : H / height;
  picture.scale(scale);
  picture.translate((W - width * scale) * 0.5, (H - height * scale) * 0.5);
  canvas.add(picture);

  const info = animation.info();

  //draw a text progress of current audio playback position.
  const drawPosition = (frame) => {
    const WIDTH = 40;

    const pos = frame / info.fps;
    let head = Math.floor((frame / info.totalFrames) * WIDTH);
    if (head >= WIDTH) head = WIDTH - 1;

    let bar = '';
    for (let i = 0; i < WIDTH; ++i) {
      bar += (i < head) ? '=' : (i === head) ? '>' : '-';
    }

    console.log('[audio] |' + bar + '| '
      + pos.toFixed(2).padStart(6) + 's  vol '
      + (animation.volume() * 100).toFixed(0).padStart(3));
  };

  animation.play((frame) => {
    drawPosition(frame);
    canvas.update();
    canvas.render();
  });

  globalThis.__lottieAudioDemo = {
    dispose() {
      animation.dispose();
    },
  };
})();
`
};
