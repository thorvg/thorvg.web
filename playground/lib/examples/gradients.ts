import { ShowcaseExample } from './types';

export const gradientsExample: ShowcaseExample = {
  id: 'gradients',
  title: 'Gradients',
  description: 'Apply linear and radial gradients to shapes',
  category: 'basic',
  thumbnail: '/assets/gradient-thumbnail.png',
  code: `import { init } from '@thorvg/canvas-kit';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/canvas-kit/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
  renderer: 'gl'
});

// Linear gradient rectangle
const rect = new TVG.Shape();
rect.appendRect(50, 50, 500, 400, { rx: 20, ry: 20 });

const gradient = new TVG.LinearGradient(50, 50, 550, 450);
gradient.addStop(0, [255, 100, 100, 255]);
gradient.addStop(0.5, [100, 100, 255, 255]);
gradient.addStop(1, [100, 255, 100, 255]);

rect.fill(gradient);
canvas.add(rect);

// Radial gradient circle
const circle = new TVG.Shape();
circle.appendCircle(300, 500, 80, 80);

const radialGrad = new TVG.RadialGradient(300, 500, 80);
radialGrad.addStop(0, [255, 255, 100, 255]);
radialGrad.addStop(1, [255, 100, 100, 255]);

circle.fill(radialGrad);
canvas.add(circle);

canvas.render();
`
};
