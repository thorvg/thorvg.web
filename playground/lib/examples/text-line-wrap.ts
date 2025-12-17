import { ShowcaseExample } from './types';

export const textLineWrapExample: ShowcaseExample = {
  id: 'text-line-wrap',
  title: 'Text Line Wrap',
  description: 'Demonstrate text wrapping modes with different alignments',
  category: 'text',
  thumbnail: '/assets/text-line-wrap-thumbnail.png',
  code: `// Native example: TextLineWrap.cpp

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
  //Load font
  const response = await fetch('/fonts/NotoSansKR.ttf');
  const buffer = await response.arrayBuffer();
  TVG.Font.load('NotoSansKR', new Uint8Array(buffer), { type: 'ttf' });

  //BG
  const bg = new TVG.Shape();
  bg.appendRect(0, 0, 600, 600);
  bg.fill(0, 0, 0, 255);
  canvas.add(bg);
  
  const size = { x: 172.5, y: 90 };
  
  function guide(title, x, y) {
    const txt = new TVG.Text();
    txt.font('NotoSansKR');
    txt.translate(x, y);
    txt.fontSize(9);
    txt.text(title);
    txt.fill(200, 200, 200);
    canvas.add(txt);
  
    const lines = new TVG.Shape();
    lines.stroke({ width: 1, color: [100, 100, 100, 255] });
    lines.appendRect(x, y + 22.5, size.x, size.y);
    canvas.add(lines);
  }
  
  function text(content, pos, align, wrapMode) {
    const txt = new TVG.Text();
    txt.font('NotoSansKR');
    txt.translate(pos.x, pos.y + 22.5);
    txt.layout(size.x, size.y);
    txt.fontSize(10.875);
    txt.text(content);
    txt.align(align.x, align.y);
    txt.wrap(wrapMode);
    txt.fill(255, 255, 255);
    canvas.add(txt);
  }
  
  const character = 'TextWrap::Character';
  guide(character, 18.75, 18.75);
  text('This is a lengthy text used to test line wrapping with top-left.', {x: 18.75, y: 18.75}, {x: 0, y: 0}, TVG.TextWrapMode.Character);
  
  guide(character, 217.5, 18.75);
  text('This is a lengthy text used to test line wrapping with middle-center.', {x: 217.5, y: 18.75}, {x: 0.5, y: 0.5}, TVG.TextWrapMode.Character);
  
  guide(character, 412.5, 18.75);
  text('This is a lengthy text used to test line wrapping with bottom-right.', {x: 412.5, y: 18.75}, {x: 1, y: 1}, TVG.TextWrapMode.Character);
  
  const word = 'TextWrap::Word';
  guide(word, 18.75, 146.25);
  text('An extreame-long-length-word to test with top-left.', {x: 18.75, y: 146.25}, {x: 0, y: 0}, TVG.TextWrapMode.Word);
  
  guide(word, 217.5, 146.25);
  text('An extreame-long-length-word to test with middle-center.', {x: 217.5, y: 146.25}, {x: 0.5, y: 0.5}, TVG.TextWrapMode.Word);
  
  guide(word, 412.5, 146.25);
  text('An extreame-long-length-word to test with bottom-right.', {x: 412.5, y: 146.25}, {x: 1, y: 1}, TVG.TextWrapMode.Word);
  
  const smart = 'TextWrap::Smart';
  guide(smart, 18.75, 273.75);
  text('An extreame-long-length-word to test with top-left.', {x: 18.75, y: 273.75}, {x: 0, y: 0}, TVG.TextWrapMode.Smart);
  
  guide(smart, 217.5, 273.75);
  text('An extreame-long-length-word to test with middle-center.', {x: 217.5, y: 273.75}, {x: 0.5, y: 0.5}, TVG.TextWrapMode.Smart);
  
  guide(smart, 412.5, 273.75);
  text('An extreame-long-length-word to test with bottom-right.', {x: 412.5, y: 273.75}, {x: 1, y: 1}, TVG.TextWrapMode.Smart);
  
  const ellipsis = 'TextWrap::Ellipsis';
  guide(ellipsis, 18.75, 401.25);
  text('This is a lengthy text used to test line wrapping with top-left.', {x: 18.75, y: 401.25}, {x: 0, y: 0}, TVG.TextWrapMode.Ellipsis);
  
  guide(ellipsis, 217.5, 401.25);
  text('This is a lengthy text used to test line wrapping with middle-center.', {x: 217.5, y: 401.25}, {x: 0.5, y: 0.5}, TVG.TextWrapMode.Ellipsis);

  guide(ellipsis, 412.5, 401.25);
  text('This is a lengthy text used to test line wrapping with bottom-right.', {x: 412.5, y: 401.25}, {x: 1, y: 1}, TVG.TextWrapMode.Ellipsis);

  canvas.render();
})();
`
};
