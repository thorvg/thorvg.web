import { ShowcaseExample } from './types';

export const pictureSvgExample: ShowcaseExample = {
  id: 'picture-svg',
  title: 'SVG',
  description: 'Load and display the Ghostscript Tiger SVG',
  category: 'media',
  thumbnail: '/assets/svg-picture-thumbnail.png',
  code: `// Native example: PictureSvg.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Load SVG from file
(async () => {
  const response = await fetch('/assets/images/tiger.svg');
  const tigerSvg = await response.text();

  const tiger = new TVG.Picture();
  tiger.load(tigerSvg, { type: 'svg' })
    .size(600, 600);

  canvas.add(tiger);
  canvas.render();
})();
`
};
