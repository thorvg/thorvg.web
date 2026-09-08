import { ShowcaseExample } from './types';

export const textAnimationExample: ShowcaseExample = {
  id: 'text-animation',
  title: 'Text Effects',
  description: 'Demonstrate text animation with multiple effects',
  category: 'text',
  thumbnail: '/assets/animated-text-thumbnail.png',
  code: `// Native example: TextEffects.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

let time = 0;

function animate() {
  time += 0.05;
  canvas.clear();

  // Rainbow effect on title
  const r = Math.sin(time) * 127 + 128;
  const g = Math.sin(time + 2) * 127 + 128;
  const b = Math.sin(time + 4) * 127 + 128;

  const animTitle = new TVG.Text();
  animTitle.font('default')
    .text('ThorVG WebCanvas')
    .fontSize(48)
    .fill(r, g, b)
    .outline(2, 0, 0, 0)
    .align(0.5, 0.5)
    .translate(300, 150);

  // Pulsing subtitle
  const scale = 1 + Math.sin(time * 2) * 0.1;
  const animSubtitle = new TVG.Text();
  animSubtitle.font('default')
    .text('High-Performance Vector Graphics')
    .fontSize(24 * scale)
    .fill(100, 200, 255)
    .align(0.5, 0.5)
    .translate(300, 220);

  // Rotating text
  const rotatingText = new TVG.Text();
  rotatingText.font('default')
    .text('Animated!')
    .fontSize(32)
    .fill(255, 200, 100)
    .align(0.5, 0.5)
    .translate(300, 300)
    .rotate(time * 20);

  // Wave effect text
  const waveText = 'WAVE EFFECT';
  for (let i = 0; i < waveText.length; i++) {
    const yOffset = Math.sin(time * 2 + i * 0.5) * 20;
    const charColor = Math.sin(time + i * 0.3) * 127 + 128;

    const char = new TVG.Text();
    char.font('default')
      .text(waveText[i])
      .fontSize(28)
      .fill(charColor, 150, 255 - charColor)
      .align(0.5, 0.5)
      .translate(150 + i * 30, 400 + yOffset);

    canvas.add(char);
  }

  canvas.add(animTitle);
  canvas.add(animSubtitle);
  canvas.add(rotatingText);
  canvas.render();

  requestAnimationFrame(animate);
}

animate();
`
};
