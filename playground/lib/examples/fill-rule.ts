import { ShowcaseExample } from './types';

export const fillRuleExample: ShowcaseExample = {
  id: 'fill-rule',
  title: 'Fill Rule',
  description: 'Demonstrate fill rule (winding vs even-odd)',
  category: 'basic',
  code: `import { init } from '@thorvg/canvas-kit';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/canvas-kit/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 800,
  height: 700,
  renderer: 'gl'
});

// Star with NonZero (Winding) fill rule
// This fills all areas enclosed by paths with non-zero winding numbers
const star1 = new TVG.Shape();
star1.moveTo(205, 35);
star1.lineTo(330, 355);
star1.lineTo(25, 150);
star1.lineTo(385, 150);
star1.lineTo(80, 355);
star1.close();
star1.fill(0, 255, 255, 255);
// Set the fill rule to NonZero (Winding)
star1.fillRule('winding'); // NonZero fill rule

// Star with EvenOdd fill rule
// This fills areas where path overlaps an odd number of times
const star2 = new TVG.Shape();
star2.moveTo(535, 335);
star2.lineTo(660, 655);
star2.lineTo(355, 450);
star2.lineTo(715, 450);
star2.lineTo(410, 655);
star2.close();
star2.fill(255, 0, 255, 255);
// Set the fill rule to EvenOdd
star2.fillRule('evenodd'); // EvenOdd fill rule

canvas.add(star1, star2);
canvas.render();
`
};
