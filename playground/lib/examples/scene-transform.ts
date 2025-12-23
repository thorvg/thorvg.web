import { ShowcaseExample } from './types';

export const sceneTransformExample: ShowcaseExample = {
  id: 'scene-transform',
  title: 'Scene Transform Animation',
  description: 'Animate scene transformations with rotate, scale, and translate',
  category: 'animation',
  code: `import { init } from '@thorvg/canvas-kit';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/canvas-kit/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 960,
  height: 960,
  renderer: 'gl'
});

let animationId;
let startTime = Date.now();

function animate() {
  const elapsed = Date.now() - startTime;
  const progress = (elapsed % 2000) / 2000; // 2 second loop

  // Clear canvas
  canvas.clear();

  // Create Scene1
  const scene = new TVG.Scene();

  // Round Rectangle (Scene1)
  const shape1 = new TVG.Shape();
  shape1.appendRect(-235, -250, 400, 400, { rx: 50, ry: 50 });
  shape1.fill(0, 255, 0, 255);
  shape1.stroke({ width: 5, color: [255, 255, 255, 255] });
  scene.add(shape1);

  // Circle (Scene1)
  const shape2 = new TVG.Shape();
  shape2.appendCircle(-165, -150, 200, 200);
  shape2.fill(255, 255, 0, 255);
  scene.add(shape2);

  // Ellipse (Scene1)
  const shape3 = new TVG.Shape();
  shape3.appendCircle(265, 250, 150, 100);
  shape3.fill(0, 255, 255, 255);
  scene.add(shape3);

  scene.translate(430, 430);
  scene.scale(0.7);
  scene.rotate(360 * progress);

  // Create Scene2 (nested scene)
  const scene2 = new TVG.Scene();

  // Star (Scene2)
  const shape4 = new TVG.Shape();
  shape4.moveTo(0, -114.5);
  shape4.lineTo(54, -5.5);
  shape4.lineTo(175, 11.5);
  shape4.lineTo(88, 95.5);
  shape4.lineTo(108, 216.5);
  shape4.lineTo(0, 160.5);
  shape4.lineTo(-102, 216.5);
  shape4.lineTo(-87, 96.5);
  shape4.lineTo(-173, 12.5);
  shape4.lineTo(-53, -5.5);
  shape4.close();
  shape4.fill(0, 0, 255, 127);
  shape4.stroke({ width: 3, color: [0, 0, 255, 255] });
  scene2.add(shape4);

  // Circle using bezier curves (Scene2)
  const cx = -150;
  const cy = -150;
  const radius = 100;
  const halfRadius = radius * 0.552284;

  const shape5 = new TVG.Shape();
  shape5.moveTo(cx, cy - radius);
  shape5.cubicTo(cx + halfRadius, cy - radius, cx + radius, cy - halfRadius, cx + radius, cy);
  shape5.cubicTo(cx + radius, cy + halfRadius, cx + halfRadius, cy + radius, cx, cy + radius);
  shape5.cubicTo(cx - halfRadius, cy + radius, cx - radius, cy + halfRadius, cx - radius, cy);
  shape5.cubicTo(cx - radius, cy - halfRadius, cx - halfRadius, cy - radius, cx, cy - radius);
  shape5.close();
  shape5.fill(255, 0, 0, 127);
  scene2.add(shape5);

  scene2.translate(500, 350);
  scene2.rotate(360 * progress);

  // Add scene2 to scene
  scene.add(scene2);

  // Draw
  canvas.add(scene);
  canvas.render();

  animationId = requestAnimationFrame(animate);
}

// Start animation
animate();

// Cleanup function (call this when component unmounts)
// cancelAnimationFrame(animationId);
`
};
