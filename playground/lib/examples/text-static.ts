import { ShowcaseExample } from './types';

export const textStaticExample: ShowcaseExample = {
  id: 'text-static',
  title: 'Text (Static)',
  description: 'Render text with custom fonts, gradients, and outlines',
  category: 'text',
  thumbnail: '/assets/text-thumbnail.png',
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

// Main title
const title = new TVG.Text();
title.font('default')
  .text('ThorVG Canvas Kit')
  .fontSize(48)
  .fill(255, 255, 255)
  .outline(2, 0, 122, 204)
  .align({ horizontal: 'center', vertical: 'middle' })
  .translate(300, 100);

// Subtitle
const subtitle = new TVG.Text();
subtitle.font('default')
  .text('High-Performance Vector Graphics')
  .fontSize(24)
  .fill(100, 200, 255)
  .align({ horizontal: 'center', vertical: 'middle' })
  .translate(300, 170);

// Feature list
const features = [
  'WebGPU / WebGL / Software Rendering',
  'Lottie Animation Support',
  'Custom Fonts & Text Rendering',
  'SVG / PNG / WebP Support',
  'Gradient & Stroke Support'
];

features.forEach((feature, i) => {
  const featureText = new TVG.Text();
  featureText.font('default')
    .text('• ' + feature)
    .fontSize(18)
    .fill(200, 200, 200)
    .align({ horizontal: 'left', vertical: 'middle' })
    .translate(120, 260 + i * 40);
  canvas.add(featureText);
});

// Gradient text
const gradientText = new TVG.Text();
const gradient = new TVG.LinearGradient(100, 500, 500, 500);
gradient.addStop(0, [255, 100, 100, 255]);
gradient.addStop(0.5, [255, 255, 100, 255]);
gradient.addStop(1, [100, 255, 100, 255]);

gradientText.font('default')
  .text('Gradient Text Support!')
  .fontSize(32)
  .fill(gradient)
  .align({ horizontal: 'center', vertical: 'middle' })
  .translate(300, 500);

canvas.add(title, subtitle, gradientText);
canvas.render();
`
};
