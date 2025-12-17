import { ShowcaseExample } from './types';

export const fillRuleExample: ShowcaseExample = {
  id: 'fill-rule',
  title: 'Fill Rule',
  description: 'Demonstrate shape fill rules',
  category: 'basic',
  thumbnail: '/assets/fill-rule-thumbnail.png',
  code: `// Native example: FillRule.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

//Star
const star1 = new TVG.Shape();
star1.moveTo(153.75, 30);
star1.lineTo(247.5, 304.29);
star1.lineTo(18.75, 128.57);
star1.lineTo(288.75, 128.57);
star1.lineTo(60, 304.29);
star1.close();
star1.fill(0, 255, 255, 255);
star1.fillRule(TVG.FillRule.Winding);

//Star 2
const star2 = new TVG.Shape();
star2.moveTo(401.25, 287.14);
star2.lineTo(495, 561.43);
star2.lineTo(266.25, 385.71);
star2.lineTo(536.25, 385.71);
star2.lineTo(307.5, 561.43);
star2.close();
star2.fill(255, 0, 255, 255);
star2.fillRule(TVG.FillRule.EvenOdd);

canvas.add(star1);
canvas.add(star2);
canvas.render();
`
};
