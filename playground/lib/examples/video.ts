import { ShowcaseExample } from './types';

export const videoExample: ShowcaseExample = {
  id: 'video',
  title: 'Video',
  description: 'Load and play a video with playback controls',
  category: 'media',
  thumbnail: '/assets/video-thumbnail.png',
  useDarkCanvas: true,
  code: `// Experimental example

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
  const response = await fetch('/assets/video/sample.mp4');
  const bytes = new Uint8Array(await response.arrayBuffer());

  //Video controller
  const video = new TVG.Video();
  const picture = video.picture;

  await video.load(bytes);

  //Fit to the canvas
  picture.size(480, 270);
  picture.origin(0.5, 0.5);
  picture.translate(300, 300);

  canvas.add(video);

  //Loop playback
  video.loop(true).play();
})();
`
};
