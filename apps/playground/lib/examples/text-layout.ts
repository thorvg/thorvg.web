import { ShowcaseExample } from './types';

export const textLayoutExample: ShowcaseExample = {
  id: 'text-layout',
  title: 'Text Layout',
  description: 'Demonstrate text layout with alignment within a bounding box',
  category: 'text',
  thumbnail: '/assets/text-layout-thumbnail.png',
  code: `// Native example: TextLayout.cpp

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
  const response = await fetch('/fonts/Arial.ttf');
  const buffer = await response.arrayBuffer();
  TVG.Font.load('Arial', new Uint8Array(buffer), { type: 'ttf' });

  //guide line
  const yOffset = 82;
  const border = 81.75;
  const dashPattern = [5.45, 5.45];
  const lines = new TVG.Shape();
  lines.stroke({ width: 1, color: [100, 100, 100, 255], dash: dashPattern });
  lines.moveTo(218, 0 + yOffset);
  lines.lineTo(218, 436 + yOffset);
  lines.moveTo(0, 218 + yOffset);
  lines.lineTo(436, 218 + yOffset);
  lines.moveTo(border, border + yOffset);
  lines.lineTo(354.25, border + yOffset);
  lines.lineTo(354.25, 354.25 + yOffset);
  lines.lineTo(border, 354.25 + yOffset);
  lines.close();
  lines.moveTo(490.5, 0 + yOffset);
  lines.lineTo(490.5, 436 + yOffset);
  canvas.add(lines);

  const fontSize = 8.175;
  const w = 272.5;
  const h = 272.5;

  //top left
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(0, 0);
    text.layout(w, h);
    text.text('Top-Left');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //top center
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(0.5, 0);
    text.layout(w, h);
    text.text('Top-Center');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //top right
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(1, 0);
    text.layout(w, h);
    text.text('Top-End');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //middle left
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(0, 0.5);
    text.layout(w, h);
    text.text('Middle-Left');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //middle center
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(0.5, 0.5);
    text.layout(w, h);
    text.text('Middle-Center');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //middle right
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(1, 0.5);
    text.layout(w, h);
    text.text('Middle-End');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //bottom left
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(0, 1);
    text.layout(w, h);
    text.text('Bottom-Left');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //bottom center
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(0.5, 1);
    text.layout(w, h);
    text.text('Bottom-Center');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //bottom right
  {
    const text = new TVG.Text();
    text.font('Arial');
    text.translate(border, border + yOffset);
    text.fontSize(fontSize);
    text.align(1, 1);
    text.layout(w, h);
    text.text('Bottom-End');
    text.fill(0, 0, 0);
    canvas.add(text);
  }

  //origin
  const alignments = [{x: 0, y: 0.5}, {x: 0.25, y: 0.5}, {x: 0.5, y: 0.5}, {x: 0.75, y: 0.5}, {x: 1, y: 0.5}];
  const yPositions = [109, 163.5, 218, 272.5, 327];
  for (let i = 0; i < 5; i++) {
    const text = new TVG.Text();
    text.font('Arial');
    text.fontSize(fontSize);
    text.text(\`Alignment = \${(0.25 * i).toFixed(2)}\`);
    text.fill(0, 0, 0);
    text.translate(490.5, yPositions[i] + yOffset);
    text.align(alignments[i].x, alignments[i].y);
    canvas.add(text);
  }

  canvas.render();
})();
`
};
