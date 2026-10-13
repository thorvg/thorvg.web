import { ShowcaseExample } from './types';

export const textMetricsExample: ShowcaseExample = {
  id: 'text-metrics',
  title: 'Text Metrics',
  description: 'Type text with a cursor positioned by text and glyph metrics',
  category: 'text',
  thumbnail: '/assets/text-metrics-thumbnail.png',
  code: `// Native example: TextMetrics.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const MAX_LINE = 16;

let data = 'Type here: ';
let pos = { x: 0, y: 0 };  //cursor position
let lastElapsed = 0;
const endPos = [];         //each line end position
let curLine = 1;           //default line number
let toggle = true;         //blinking toggle
let updated = false;

(async () => {
  const response = await fetch('/fonts/NotoSansKR.ttf');
  TVG.Font.load('NotoSansKR', new Uint8Array(await response.arrayBuffer()), { type: 'ttf' });

  // guide line
  const border = 112.5;
  const lines = new TVG.Shape();
  lines.moveTo(border, border);
  lines.lineTo(600 - border, border);
  lines.lineTo(600 - border, 600 - border);
  lines.lineTo(border, 600 - border);
  lines.close();
  lines.stroke({ width: 0.75, color: [100, 100, 100, 255], dash: [7.5, 7.5] });
  canvas.add(lines);

  // text group
  const group = new TVG.Scene();
  group.translate(border, border);
  canvas.add(group);

  // text body
  const text = new TVG.Text();
  text.font('NotoSansKR');
  text.fontSize(12);
  text.align(0, 0);
  text.layout(600 - border * 2, 600 - border * 2);
  text.wrap(TVG.TextWrapMode.Character);
  text.text(data);
  text.fill(255, 255, 255);
  group.add(text);

  // text cursor

  // figure out the cursor x position
  for (const ch of data) {
    pos.x += text.metrics(ch).advance;
  }

  // figure out the cursor y position
  const textMetric = text.metrics();
  pos.y = textMetric.ascent;

  // cursor visual
  const cursor = new TVG.Shape();
  cursor.appendRect(0, 0, 7.5, 1.5);
  cursor.fill(255, 255, 255);
  cursor.translate(pos.x, pos.y);
  group.add(cursor);

  canvas.render();

  // This example demonstrates very basic text typing.
  const onKeyDown = (e) => {
    if (e.metaKey || e.ctrlKey || e.altKey) return;

    //ignore typing in the code editor
    const target = e.target;
    if (target && (target.tagName === 'TEXTAREA' || target.tagName === 'INPUT' || target.isContentEditable)) return;

    const input = e.key;
    let glyphAdvance = 0;
    const p = { x: pos.x, y: pos.y };

    // backspace
    if (input === 'Backspace') {
      if (data.length === 0) return;
      const chars = Array.from(data);
      const last = chars.pop();
      glyphAdvance = text.metrics(last).advance;
      data = chars.join('');        // revert the character
      p.x -= glyphAdvance;          // cursor x position
    // feed line
    } else if (input === 'Enter') {
      data += '\\n';
      endPos[curLine - 1] = p.x;
    // append a character
    } else if (Array.from(input).length === 1) {
      glyphAdvance = text.metrics(input).advance;
      data += input;                // append the character
      p.x += glyphAdvance;          // cursor x position
    } else {
      return;
    }

    e.preventDefault();

    text.text(data);

    // get the line count
    const newLine = text.lines();

    // limit the line number, revert the condition
    if (newLine > MAX_LINE) {
      data = Array.from(data).slice(0, -1).join('');
      text.text(data);
      return;
    }

    // line has been changed
    if (curLine !== newLine) {
      // retreat
      if (curLine > newLine) {
        p.x = endPos[newLine - 1];
      // advance
      } else {
        endPos[curLine - 1] = pos.x;
        p.x = glyphAdvance;
      }
      curLine = newLine;
    }

    // cursor y position
    p.y = textMetric.ascent;
    if (newLine > 1) p.y += (newLine - 1) * textMetric.advance;

    cursor.translate(p.x, p.y);

    pos = p;
    updated = true;
  };

  window.addEventListener('keydown', onKeyDown);

  const startTime = Date.now();

  function animate() {
    const elapsed = Date.now() - startTime;

    //blinking cursor effect
    if (elapsed - lastElapsed > 500) {
      toggle = !toggle;

      if (toggle) cursor.opacity(255);
      else cursor.opacity(0);

      lastElapsed = elapsed;
      updated = true;
    }

    if (updated) {
      updated = false;
      canvas.update();
      canvas.render();
    }

    requestAnimationFrame(animate);
  }

  animate();
})();
`
};
