import { ShowcaseExample } from './types';

export const strokeMiterlimitExample: ShowcaseExample = {
  id: 'stroke-miterlimit',
  title: 'Stroke Miterlimit',
  description: 'Demonstrate stroke miter limit behavior',
  category: 'basic',
  thumbnail: '/assets/stroke-miter-limit-thumbnail.png',
  code: `// Native example: StrokeMiterlimit.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//background
{
  const bg = new TVG.Shape();
  bg.appendRect(0, 0, 600, 600);  // x, y, w, h
  bg.fill(200, 200, 255);           //r, g, b
  canvas.add(bg);
}

//wild
{
  const top = 75.0;
  const bot = 525.0;

  const path = new TVG.Shape();
  path.moveTo(225, top / 2);
  path.lineTo(75, bot);
  path.lineTo(262.5, 300);
  path.lineTo(315, bot);
  path.lineTo(322.5, top * 2);
  path.lineTo(375, bot);
  path.lineTo(345, top * 2);
  path.lineTo(562.5, bot);
  path.lineTo(345, top / 2);
  path.close();

  path.fill(150, 150, 255, 255);
  path.stroke({
    width: 15,
    color: [120, 120, 255, 255],
    join: TVG.StrokeJoin.Miter,
    miterLimit: 10
  });

  canvas.add(path);
}

(async () => {
  //blueprint
  {
    // Load png file.
    const data = await fetch('/assets/images/stroke-miterlimit.png').then(res => res.bytes());

    const picture = new TVG.Picture();
    picture.load(data, { type: 'png' });

    picture.opacity(42);
    picture.translate(18, 0);
    picture.scale(0.75);
    canvas.add(picture);
  }

  //svg
  {
    //SVG stroke-miterlimit test.
    const svgText = \`
    <svg viewBox="0 0 38 30">
    <!-- Impact of the default miter limit -->
    <path
        stroke="black"
        fill="none"
        stroke-linejoin="miter"
        id="p1"
        d="M1,9 l7   ,-3 l7   ,3
        m2,0 l3.5 ,-3 l3.5 ,3
        m2,0 l2   ,-3 l2   ,3
        m2,0 l0.75,-3 l0.75,3
        m2,0 l0.5 ,-3 l0.5 ,3" />

    <!-- Impact of the smallest miter limit (1) -->
    <path
        stroke="black"
        fill="none"
        stroke-linejoin="miter"
        stroke-miterlimit="1"
        id="p2"
        d="M1,19 l7   ,-3 l7   ,3
        m2, 0 l3.5 ,-3 l3.5 ,3
        m2, 0 l2   ,-3 l2   ,3
        m2, 0 l0.75,-3 l0.75,3
        m2, 0 l0.5 ,-3 l0.5 ,3" />

    <!-- Impact of a large miter limit (8) -->
    <path
        stroke="black"
        fill="none"
        stroke-linejoin="miter"
        stroke-miterlimit="8"
        id="p3"
        d="M1,29 l7   ,-3 l7   ,3
        m2, 0 l3.5 ,-3 l3.5 ,3
        m2, 0 l2   ,-3 l2   ,3
        m2, 0 l0.75,-3 l0.75,3
        m2, 0 l0.5 ,-3 l0.5 ,3" />

    <!-- the following pink lines highlight the position of the path for each stroke -->
    <path
        stroke="pink"
        fill="none"
        stroke-width="0.05"
        d="M1, 9 l7,-3 l7,3 m2,0 l3.5,-3 l3.5,3 m2,0 l2,-3 l2,3 m2,0 l0.75,-3 l0.75,3 m2,0 l0.5,-3 l0.5,3
        M1,19 l7,-3 l7,3 m2,0 l3.5,-3 l3.5,3 m2,0 l2,-3 l2,3 m2,0 l0.75,-3 l0.75,3 m2,0 l0.5,-3 l0.5,3
        M1,29 l7,-3 l7,3 m2,0 l3.5,-3 l3.5,3 m2,0 l2,-3 l2,3 m2,0 l0.75,-3 l0.75,3 m2,0 l0.5,-3 l0.5,3" />
    </svg>
    \`;

    const picture = new TVG.Picture();
    picture.load(svgText, { type: 'svg' });
    picture.scale(15);
    canvas.add(picture);
  }

  canvas.render();
})();
`
};
