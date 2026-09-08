import { ShowcaseExample } from './types';

export const fontProviderExample: ShowcaseExample = {
  id: 'font-provider',
  title: 'Font Provider',
  description: 'Use a custom font provider to load fonts from any source',
  category: 'text',
  useDarkCanvas: true,
  thumbnail: '/assets/font-provider-thumbnail.png',
  code: `import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

(async () => {
  await Promise.all([
    TVG.Font.load('roboto'),
    TVG.Font.load('poppins', { weight: 700 }),
    TVG.Font.load('merriweather'),
    TVG.Font.load('oswald', { weight: 600 }),
    TVG.Font.load('dancing-script', { weight: 700 }),
  ]);

  const bg = new TVG.Shape();
  bg.appendRect(0, 0, 600, 600);
  bg.fill(22, 22, 30);
  canvas.add(bg);

  const header = new TVG.Text();
  header.font('poppins')
    .fontSize(30)
    .text('Font Auto-Loading')
    .fill(255, 255, 255)
    .translate(32, 36);
  canvas.add(header);

  const subheader = new TVG.Text();
  subheader.font('roboto')
    .fontSize(13)
    .text('Fonts fetched from fontsource CDN')
    .fill(130, 130, 160)
    .translate(32, 82);
  canvas.add(subheader);

  // divider
  const divider = new TVG.Shape();
  divider.appendRect(32, 108, 536, 1);
  divider.fill(60, 60, 80);
  canvas.add(divider);

  const rows = [
    {
      label: "Font.load('roboto')  -  weight 400, style normal",
      sample: 'The quick brown fox jumps over the lazy dog',
      font: 'roboto',
      size: 20,
      y: 128,
    },
    {
      label: "Font.load('poppins', { weight: 700 })  -  bold",
      sample: 'Sphinx of black quartz, judge my vow.',
      font: 'poppins',
      size: 22,
      y: 210,
    },
    {
      label: "Font.load('merriweather')  -  serif, weight 400",
      sample: 'How vexingly quick daft zebras jump!',
      font: 'merriweather',
      size: 19,
      y: 292,
    },
    {
      label: "Font.load('oswald', { weight: 600 })  -  condensed",
      sample: 'PACK MY BOX WITH FIVE DOZEN LIQUOR JUGS',
      font: 'oswald',
      size: 22,
      y: 374,
    },
    {
      label: "Font.load('dancing-script', { weight: 700 })  -  script",
      sample: 'Waltz, bad nymph, for quick jigs vex!',
      font: 'dancing-script',
      size: 24,
      y: 456,
    },
  ];

  for (const row of rows) {
    const labelText = new TVG.Text();
    labelText.font('roboto')
      .fontSize(11)
      .text(row.label)
      .fill(100, 100, 140)
      .translate(32, row.y);
    canvas.add(labelText);

    const sampleText = new TVG.Text();
    sampleText.font(row.font)
      .fontSize(row.size)
      .text(row.sample)
      .fill(230, 230, 245)
      .translate(32, row.y + 20);
    canvas.add(sampleText);

    // row separator
    if (row !== rows[rows.length - 1]) {
      const sep = new TVG.Shape();
      sep.appendRect(32, row.y + 56, 536, 1);
      sep.fill(45, 45, 60);
      canvas.add(sep);
    }
  }

  canvas.render();
})();
`,
};
