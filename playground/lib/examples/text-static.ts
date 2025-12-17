import { ShowcaseExample } from './types';

export const textStaticExample: ShowcaseExample = {
  id: 'text-static',
  title: 'Text',
  description: 'Demonstrate basic text features',
  category: 'text',
  thumbnail: '/assets/text-thumbnail.png',
  code: `// Native example: Text.cpp

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
  //Load fonts
  const fonts = ['Arial', 'NotoSansKR', 'NanumGothicCoding', 'SentyCloud'];
  await Promise.all(fonts.map(async (fontName) => {
    const response = await fetch(\`/fonts/\${fontName}.ttf\`);
    const buffer = await response.arrayBuffer();
    TVG.Font.load(fontName, new Uint8Array(buffer), { type: 'ttf' });
  }));

  //Background
  const background = new TVG.Shape();
  background.appendRect(0, 0, 600, 600);
  background.fill(75, 75, 75);
  canvas.add(background);
  
  const text1 = new TVG.Text();
  text1.font('Arial')
    .fontSize(47)
    .text('THORVG Text')
    .fill(255, 255, 255);
  canvas.add(text1);
  
  const text2 = new TVG.Text();
  text2.font('Arial')
    .fontSize(18)
    .italic()
    .text('Font = "Arial", Size = 18, Style = Italic')
    .fill(255, 255, 255)
    .translate(0, 88);
  canvas.add(text2);
  
  const text3 = new TVG.Text();
  text3.font('default').fontSize(23)
    .text('Kerning Test: VA, AV, TJ, JT')
    .fill(255, 255, 255)
    .translate(0, 132);
  canvas.add(text3);
  
  const text4 = new TVG.Text();
  text4.font('Arial')
    .fontSize(15)
    .text('Purple Text')
    .fill(255, 0, 255)
    .translate(0, 182);
  canvas.add(text4);
  
  const text5 = new TVG.Text();
  text5.font('Arial')
    .fontSize(15)
    .text('Gray Text')
    .fill(150, 150, 150)
    .translate(129, 182);
  canvas.add(text5);
  
  const text6 = new TVG.Text();
  text6.font('Arial')
    .fontSize(15)
    .text('Yellow Text')
    .fill(255, 255, 0)
    .translate(234, 182);
  canvas.add(text6);
  
  const text7 = new TVG.Text();
  text7.font('NotoSansKR').fontSize(9)
    .text("Transformed Text - 30'")
    .fill(0, 0, 0)
    .translate(352, 234)
    .rotate(30);
  canvas.add(text7);
  
  const text8 = new TVG.Text();
  text8.font('NotoSansKR').fontSize(9)
    .text("Transformed Text - 90'")
    .fill(0, 0, 0)
    .translate(352, 234)
    .rotate(90);
  canvas.add(text8);
  
  const text9 = new TVG.Text();
  text9.font('NotoSansKR').fontSize(9)
    .text("Transformed Text - 180'")
    .fill(0, 0, 0)
    .translate(469, 234)
    .rotate(180);
  canvas.add(text9);
  
  //gradient texts
  const text10 = new TVG.Text();
  text10.font('NotoSansKR').fontSize(29)
    .text('Linear Text');
  
  //LinearGradient
  const linearGradient = new TVG.LinearGradient(0, 205, 205, 205);
  
  linearGradient.setStops(
    [0, [255, 0, 0, 255]],
    [0.5, [255, 255, 0, 255]],
    [1, [255, 255, 255, 255]]
  );
  
  text10.fill(linearGradient)
    .translate(0, 205);
  canvas.add(text10);
  
  const text11 = new TVG.Text();
  text11.font('NanumGothicCoding').fontSize(23)
    .text('나눔고딕코딩(UTF-8)');
  
  //RadialGradient
  const radialGradient = new TVG.RadialGradient(117, 264, 59);
  
  radialGradient.setStops(
    [0, [0, 255, 255, 255]],
    [0.5, [255, 255, 0, 255]],
    [1, [255, 255, 255, 255]]
  );
  
  text11.fill(radialGradient)
    .translate(0, 264);
  canvas.add(text11);
  
  const text12 = new TVG.Text();
  text12.font('SentyCloud').fontSize(29)
    .text('不到长城非好汉!')
    .fill(255, 25, 25)
    .outline(2, 255, 200, 200)
    .translate(0, 308);
  canvas.add(text12);
  
  const text13 = new TVG.Text();
  text13.font('Arial')
    .fontSize(12)
    .text('LINE-FEED TEST. THIS IS THE FIRST LINE - \\nTHIS IS THE SECOND LINE.')
    .fill(255, 255, 255)
    .translate(0, 366);
  canvas.add(text13);
  
  const text14 = new TVG.Text();
  text14.font('Arial')
    .fontSize(12)
    .text('1.5x SPACING TEST. THIS IS THE FIRST LINE - \\nTHIS IS THE SECOND LINE.')
    .spacing(1.5, 1.5)
    .fill(255, 255, 255)
    .translate(0, 410);
  canvas.add(text14);
  
  canvas.render();
})();
`
};
