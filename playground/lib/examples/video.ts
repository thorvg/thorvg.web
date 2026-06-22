import { ShowcaseExample } from './types';

export const videoExample: ShowcaseExample = {
  id: 'video',
  title: 'Video',
  description: 'Load and play a video with keyboard playback controls',
  category: 'media',
  thumbnail: '/assets/video-thumbnail.png',
  useDarkCanvas: true,
  code: `// Native example: Video.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600
});

(async () => {
  globalThis.__videoDemo?.dispose();

  let playing = true;
  let paused = false;

  console.log(
    'Keys:\\n' +
    '  0: Play or Stop\\n' +
    '  1: Pause or Resume\\n' +
    '  2: Volume up\\n' +
    '  3: Volume down'
  );

  const w = 600, h = 600;

  // background
  const bg = new TVG.Shape();
  bg.appendRect(0, 0, w, h);
  bg.fill(0, 0, 0);
  canvas.add(bg);

  // video player
  const video = new TVG.Video();
  video.loop(true);

  const picture = video.picture;
  picture.origin(0.5, 0.5);

  const response = await fetch('/assets/video/video.mp4');
  await video.load(new Uint8Array(await response.arrayBuffer()));

  // video scaling preserving its aspect ratio
  const { width: w2, height: h2 } = picture.size();
  const scale = (w2 / h2 > w / h) ? w / w2 : h / h2;
  picture.scale(scale);
  picture.translate(w * 0.5, h * 0.5);

  canvas.add(video);
  canvas.update().render();

  // play the video
  video.play();

  const onKeyDown = (event) => {
    const print = () => {
      console.log('Video: '
        + (playing ? (paused ? 'paused' : 'playing') : 'stopped')
        + ', volume: ' + video.volume().toFixed(1));
    };

    switch (event.key) {
      case '0':
        if (playing) {  // play or stop
          video.stop();
          playing = false;
          paused = false;
        } else {
          video.play();
          playing = true;
        }
        print();
        break;
      case '1':    // pause or resume
        if (!playing) break;
        paused ? video.play() : video.pause();
        paused = !paused;
        print();
        break;
      case '2': {  // volume up
        const volume = video.volume();
        video.volume(volume < 0.9 ? volume + 0.1 : 1.0);
        print();
        break;
      }
      case '3': {  // volume down
        const volume = video.volume();
        video.volume(volume > 0.1 ? volume - 0.1 : 0.0);
        print();
        break;
      }
    }
  };

  window.addEventListener('keydown', onKeyDown);

  globalThis.__videoDemo = {
    dispose() {
      window.removeEventListener('keydown', onKeyDown);
      video.dispose();
    },
  };
})();
`
};
