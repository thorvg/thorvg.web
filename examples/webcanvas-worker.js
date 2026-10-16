import ThorVG from 'https://unpkg.com/@thorvg/webcanvas@latest/dist/webcanvas.esm.js';
// import ThorVG from '../packages/webcanvas/dist/webcanvas.esm.js'; // for local build

self.onmessage = async ({ data }) => {
  const { canvas, renderer, width, height } = data;

  const TVG = await ThorVG.init({ renderer });

  const tvgCanvas = new TVG.Canvas(canvas, { width, height });

  const star = new TVG.Shape();
  star.moveTo(0, -166).lineTo(54, -57).lineTo(175, -40).lineTo(88, 44).lineTo(108, 165)
      .lineTo(0, 109).lineTo(-102, 165).lineTo(-87, 45).lineTo(-173, -39).lineTo(-53, -57).close();

  const gradient = new TVG.LinearGradient(-200, -200, 200, 200);
  gradient.setStops([0, [255, 200, 0, 255]], [1, [255, 60, 120, 255]]);
  star.fill(gradient).stroke({ width: 6, color: [40, 40, 40, 255] });

  tvgCanvas.add(star);

  let rotation = 0;
  const frame = () => {
    star.translate(width / 2, height / 2).rotate(rotation++);
    tvgCanvas.update().render();
    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
};
