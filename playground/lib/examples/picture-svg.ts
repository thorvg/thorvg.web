import { ShowcaseExample } from './types';

export const pictureSvgExample: ShowcaseExample = {
  id: 'picture-svg',
  title: 'Picture (SVG)',
  description: 'Load and display SVG graphics with various transformations',
  category: 'media',
  thumbnail: '/assets/svg-picture-thumbnail.png',
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

// SVG Icon 1: Check mark
const checkSvg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
  <polyline points="20 6 9 17 4 12" stroke="#00ff00"/>
</svg>\`;

const checkIcon = new TVG.Picture();
checkIcon.loadData(checkSvg, { format: 'svg' })
  .size(80, 80)
  .translate(50, 250);

// SVG Icon 2: Heart
const heartSvg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red">
  <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
</svg>\`;

const heartIcon = new TVG.Picture();
heartIcon.loadData(heartSvg, { format: 'svg' })
  .size(80, 80)
  .translate(180, 250);

// SVG Icon 3: Star
const starSvg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="gold">
  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
</svg>\`;

const starIcon = new TVG.Picture();
starIcon.loadData(starSvg, { format: 'svg' })
  .size(80, 80)
  .translate(310, 250);

// SVG Icon 4: Circle with gradient
const circleSvg = \`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <defs>
    <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" style="stop-color:rgb(255,100,100);stop-opacity:1" />
      <stop offset="100%" style="stop-color:rgb(100,100,255);stop-opacity:1" />
    </linearGradient>
  </defs>
  <circle cx="50" cy="50" r="40" fill="url(#grad)"/>
</svg>\`;

const circleIcon = new TVG.Picture();
circleIcon.loadData(circleSvg, { format: 'svg' })
  .size(80, 80)
  .translate(440, 250);

canvas.add(checkIcon, heartIcon, starIcon, circleIcon);
canvas.render();
`
};
