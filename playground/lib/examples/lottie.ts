import { ShowcaseExample } from './types';

export const lottieExample: ShowcaseExample = {
  id: 'lottie',
  title: 'Lottie',
  description: 'Multiple Lottie animations displayed in a grid layout',
  category: 'media',
  thumbnail: '/assets/lottie-thumbnail.png',
  code: `// Native example: Lottie.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const NUM_PER_ROW = 10;
const NUM_PER_COL = 10;

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600,
});

const size = 600 / NUM_PER_ROW;

const animations = [];
const BASE_URL = 'https://raw.githubusercontent.com/thorvg/thorvg.web/refs/heads/main/examples/resources';
const lottieFiles = [
  '1643-exploding-star.json',
  '5317-fireworkds.json',
  '5344-honey-sack-hud.json',
  '11555.json',
  '27746-joypixels-partying-face-emoji-animation.json',
  'R_QPKIVi.json',
  'abstract_circle.json',
  'alien.json',
  'anubis.json',
  'balloons_with_string.json',
  'birth_stone_logo.json',
  'calculator.json',
  'card_hover.json',
  'cat_loader.json',
  'coin.json',
  'confetti.json',
  'confetti2.json',
  'confettiBird.json',
  'dancing_book.json',
  'dancing_star.json',
  'dash-offset.json',
  'day_to_night.json',
  'dodecahedron.json',
  'down.json',
  'dropball.json',
  'duck.json',
  'emoji_enjoying.json',
  'emoji.json',
  'fleche.json',
  'flipping_page.json',
  'fly_in_beaker.json',
  'focal_test.json',
  'foodrating.json',
  'frog_vr.json',
  'fun_animation.json',
  'funky_chicken.json',
  'game_finished.json',
  'geometric.json',
  'glow_loading.json',
  'ghost.json',
  'ghost2.json',
  'gradient_background.json',
  'gradient_infinite.json',
  'gradient_sleepy_loader.json',
  'gradient_smoke.json',
  'graph.json',
  'growup.json',
  'guitar.json',
  'hamburger.json',
  'happy_holidays.json',
  'happy_trio.json',
  'heart_fill.json',
  'hola.json',
  'holdanimation.json',
  'hourglass.json',
  'isometric.json',
  'kote.json',
  'la_communaute.json',
  '1f409.json',
  'like_button.json',
  'like.json',
  'loading_rectangle.json',
  'lolo_walk.json',
  'lolo.json',
  'loveface_emoji.json',
  'masking.json',
  'material_wave_loading.json',
  'merging_shapes.json',
  'message.json',
  'monkey.json',
  'morphing_anim.json',
  'new_design.json',
  'page_slide.json',
  'personal_character.json',
  'polystar_anim.json',
  'polystar.json',
  'property_market.json',
  'pumpkin.json',
  'ripple_loading_animation.json',
  'rufo.json',
  'sample.json',
  'seawalk.json',
  'shutup.json',
  'skullboy.json',
  'starburst.json',
  'starstrips.json',
  'starts_transparent.json',
  'stroke_dash.json',
  'swinging.json',
  'text_anim.json',
  'text2.json',
  'textblock.json',
  'textrange.json',
  'threads.json',
  'train.json',
  'uk_flag.json',
  'voice_recognition.json',
  'water_filling.json',
  'waves.json',
  'yarn_loading.json'
].sort((a, b) => a.localeCompare(b));

(async () => {
  // Load all animations
  const lottieDataArray = await Promise.all(
    lottieFiles.map(file =>
      fetch(\`\${BASE_URL}/\${file}\`).then(res => res.text())
    )
  );

  for (let i = 0; i < lottieDataArray.length; i++) {
    const lottieData = lottieDataArray[i];

    // Animation Controller
    const animation = new TVG.Animation();
    animation.load(lottieData);

    // Image scaling preserving its aspect ratio
    const picture = animation.picture;
    picture.origin(0.5, 0.5);

    const pictureSize = picture.size();
    const w = pictureSize.width;
    const h = pictureSize.height;
    const scale = (w > h) ? size / w : size / h;
    picture.scale(scale);

    // Position at center of each grid cell
    const col = i % NUM_PER_ROW;
    const row = Math.floor(i / NUM_PER_ROW);
    picture.translate(
      col * size + size / 2,
      row * size + size / 2
    );

    animations.push(animation);
    canvas.add(picture);
  }

  canvas.render();

  // Run animation loop
  let lastTime = 0;
  const animationStates = animations.map(animation => ({
    animation,
    currentFrame: 0,
    info: animation.info()
  }));

  function animate(time) {
    if (lastTime === 0) {
      lastTime = time;
    }

    const deltaTime = (time - lastTime) / 1000;
    lastTime = time;

    // Update each animation
    for (const state of animationStates) {
      const frameIncrement = state.info.fps * deltaTime;
      state.currentFrame += frameIncrement;

      const frameToSet = state.currentFrame % state.info.totalFrames + 1;
      state.animation.frame(frameToSet);
    }

    canvas.update();
    canvas.render();

    requestAnimationFrame(animate);
  }

  animate(performance.now());
})();
`
};
