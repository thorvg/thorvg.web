import { ShowcaseExample } from './types';

export const pathExample: ShowcaseExample = {
  id: 'path',
  title: 'Path Drawing',
  description: 'Draw shapes using path commands',
  category: 'basic',
  thumbnail: '/assets/path-drawing-thumbnail.png',
  code: `// Native example: Path.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600
});

//Command Calls
{
  //Star
  const shape1 = new TVG.Shape();

  //Appends Paths
  shape1.moveTo(149.25, 25.5);
  shape1.lineTo(189.75, 107.25);
  shape1.lineTo(280.5, 120);
  shape1.lineTo(215.25, 183);
  shape1.lineTo(230.25, 273.75);
  shape1.lineTo(149.25, 231.75);
  shape1.lineTo(72.75, 273.75);
  shape1.lineTo(84, 183.75);
  shape1.lineTo(19.5, 120.75);
  shape1.lineTo(109.5, 107.25);
  shape1.close();
  shape1.fill(0, 0, 255);
  canvas.add(shape1);

  //Circle
  const shape2 = new TVG.Shape();

  const cx = 412.5;
  const cy = 412.5;
  const radius = 93.75;
  const halfRadius = radius * 0.552284;

  //Append Paths
  shape2.moveTo(cx, cy - radius);
  shape2.cubicTo(cx + halfRadius, cy - radius, cx + radius, cy - halfRadius, cx + radius, cy);
  shape2.cubicTo(cx + radius, cy + halfRadius, cx + halfRadius, cy + radius, cx, cy + radius);
  shape2.cubicTo(cx - halfRadius, cy + radius, cx - radius, cy + halfRadius, cx - radius, cy);
  shape2.cubicTo(cx - radius, cy - halfRadius, cx - halfRadius, cy - radius, cx, cy - radius);
  shape2.close();
  shape2.fill(255, 0, 0);
  canvas.add(shape2);
}

//Commands Copy
{
  /* Star */

  //Prepare Path Commands
  const cmds = [
    TVG.PathCommand.MoveTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.LineTo,
    TVG.PathCommand.Close
  ];

  //Prepare Path Points
  const pts = [
    [149.25, 25.5],     //MoveTo
    [189.75, 107.25],   //LineTo
    [280.5, 120],       //LineTo
    [215.25, 183],      //LineTo
    [230.25, 273.75],   //LineTo
    [149.25, 231.75],   //LineTo
    [72.75, 273.75],    //LineTo
    [84, 183.75],       //LineTo
    [19.5, 120.75],     //LineTo
    [109.5, 107.25]     //LineTo
  ];

  const shape1 = new TVG.Shape();
  shape1.appendPath(cmds, pts);     //copy path data
  shape1.fill(0, 255, 0);
  shape1.translate(300, 0);
  canvas.add(shape1);

  /* Circle */
  const cx = 412.5;
  const cy = 412.5;
  const radius = 93.75;
  const halfRadius = radius * 0.552284;

  //Prepare Path Commands
  const cmds2 = [
    TVG.PathCommand.MoveTo,
    TVG.PathCommand.CubicTo,
    TVG.PathCommand.CubicTo,
    TVG.PathCommand.CubicTo,
    TVG.PathCommand.CubicTo,
    TVG.PathCommand.Close
  ];

  //Prepare Path Points
  const pts2 = [
    [cx, cy - radius],                 //MoveTo
    //CubicTo 1
    [cx + halfRadius, cy - radius],    //Ctrl1
    [cx + radius, cy - halfRadius],    //Ctrl2
    [cx + radius, cy],                 //To
    //CubicTo 2
    [cx + radius, cy + halfRadius],    //Ctrl1
    [cx + halfRadius, cy + radius],    //Ctrl2
    [cx, cy + radius],                 //To
    //CubicTo 3
    [cx - halfRadius, cy + radius],    //Ctrl1
    [cx - radius, cy + halfRadius],    //Ctrl2
    [cx - radius, cy],                 //To
    //CubicTo 4
    [cx - radius, cy - halfRadius],    //Ctrl1
    [cx - halfRadius, cy - radius],    //Ctrl2
    [cx, cy - radius]                  //To
  ];

  const shape2 = new TVG.Shape();
  shape2.appendPath(cmds2, pts2);     //copy path data
  shape2.fill(255, 255, 0);
  shape2.translate(-225, 0);
  canvas.add(shape2);
}

canvas.render();
`
};
