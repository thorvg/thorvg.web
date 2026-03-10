import { ShowcaseExample } from './types';

export const accessorExample: ShowcaseExample = {
  id: 'accessor',
  title: 'Accessor',
  description: 'Traverse a picture scene tree and modify paint properties by ID',
  category: 'advanced',
  thumbnail: '/assets/accessor-thumbnail.png',
  code: `// Native example: Accessor.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

(async () => {
  //load the svg file
  const svgResponse = await fetch('/assets/images/favorite_on.svg');
  const svgString = await svgResponse.text();

  const picture = new TVG.Picture();
  picture.load(svgString, { type: 'svg' });
  picture.size(600, 600);

  //The callback function.
  //This function will be called for every paint nodes of the picture tree.
  TVG.Accessor.set(picture, (paint) => {
    if (paint instanceof TVG.Shape) {
      //override color?
      paint.fill(0, 0, 255);
    }

    //You can return false, to stop traversing immediately.
    return true;
  });

  // Try to retrieve the shape that corresponds to the SVG node with the unique ID "star".
  const starPaint = picture.paint('star');
  if (starPaint instanceof TVG.Shape) {
    starPaint.stroke({ width: 5, color: [255, 255, 0, 255] });
  }

  canvas.add(picture);
  canvas.render();
})();
`
};
