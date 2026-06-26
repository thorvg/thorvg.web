import { ShowcaseExample } from './types';

export const videoPlayerExample: ShowcaseExample = {
  id: 'video-player',
  title: 'Video Player',
  description: 'Interactive video with on-canvas controls and composition',
  category: 'media',
  thumbnail: '/assets/video-thumbnail.png',
  useDarkCanvas: true,
  code: `// Native example: VideoDemo.cpp

import { init } from '@thorvg/webcanvas';

const TVG = await init({
  renderer: 'gl',
  locateFile: (path) => '/webcanvas/' + path.split('/').pop()
});

const canvas = new TVG.Canvas('#canvas', {
  width: 600,
  height: 600
});

(async () => {
  globalThis.__videoPlayerDemo?.dispose();

  const videoUrl = 'https://jinui.s3.ap-northeast-2.amazonaws.com/bbb.mp4';
  const canvasEl = document.getElementById('canvas');
  let rafId = 0;

  const layout = {
    width: 600,
    height: 600,
    controlBarTop: 520,
    buttonRowY: 568,
    buttonRadius: 16,
    transport: { back: 36, play: 76, forward: 116 },
    progress: { x: 152, width: 232 },
    loop: 420,
    mute: 460,
    volume: { down: 500, up: 540 },
    watermark: { y: 440, textWidth: 760, speed: 80 },
  };

  const colors = {
    background: [26, 28, 34],
    controlBar: [16, 18, 24, 235],
    button: [48, 50, 60, 235],
    icon: [240, 240, 245, 255],
    progressTrack: [70, 72, 82],
    progressFill: [80, 170, 255],
    progressKnob: [255, 255, 255],
    title: [235, 238, 245],
    time: [220, 224, 232],
    volume: [200, 204, 214],
    loopActive: [50, 110, 200, 235],
    loopIdle: [48, 50, 60, 235],
    muteActive: [190, 70, 70, 235],
    muteIdle: [48, 50, 60, 235],
  };

  const state = {
    playing: false,
    looping: true,
    muted: false,
    volume: 0,
    time: 0,
    duration: 0,
    seeking: false,
  };

  const confettiBursts = [];

  const ui = {
    createShape() {
      const shape = new TVG.Shape();
      canvas.add(shape);
      return shape;
    },

    fill(shape, rgba) {
      shape.fill(rgba[0], rgba[1], rgba[2], rgba.length > 3 ? rgba[3] : 255);
      return shape;
    },

    circle(cx, rgba) {
      const { buttonRowY: cy, buttonRadius: r } = layout;
      const shape = this.createShape();
      shape.appendCircle(cx, cy, r);
      return this.fill(shape, rgba);
    },

    text(x, y, size, rgba) {
      const label = new TVG.Text();
      label.font('default').fontSize(size).fill(rgba[0], rgba[1], rgba[2]).translate(x, y);
      canvas.add(label);
      return label;
    },

    triangle(shape, x, y, direction) {
      shape.moveTo(x - 5 * direction, y - 8)
        .lineTo(x - 5 * direction, y + 8)
        .lineTo(x + 7 * direction, y)
        .close();
    },

    speaker(shape, cx, muted) {
      const cy = layout.buttonRowY;
      shape.moveTo(cx - 9, cy - 5).lineTo(cx - 4, cy - 5).lineTo(cx + 4, cy - 12)
        .lineTo(cx + 4, cy + 12).lineTo(cx - 4, cy + 5).lineTo(cx - 9, cy + 5).close();
      if (muted) shape.appendRect(cx + 8, cy - 10, 3, 22);
    },

    shrinkIcon(shape, cx) {
      const scale = 0.7;
      const cy = layout.buttonRowY;
      shape.scale(scale).translate((1 - scale) * cx, (1 - scale) * cy);
      return shape;
    },

    formatTime(seconds) {
      if (!isFinite(seconds) || seconds < 0) seconds = 0;
      const centiseconds = Math.floor(seconds * 100);
      const whole = Math.floor(centiseconds / 100);
      const fraction = centiseconds % 100;
      return (whole < 10 ? '0' : '') + whole + '.' + (fraction < 10 ? '0' : '') + fraction;
    },
  };

  const videoBytes = new Uint8Array(await (await fetch(videoUrl)).arrayBuffer());
  const confettiData = await (await fetch('/assets/lottie/confetti.json')).text();

  const video = new TVG.Video();
  const picture = video.picture;
  await video.load(videoBytes);

  const naturalSize = picture.size();
  const videoScale = Math.min(
    layout.width / naturalSize.width,
    layout.controlBarTop / naturalSize.height
  );
  picture
    .size(naturalSize.width * videoScale, naturalSize.height * videoScale)
    .origin(0.5, 0.5)
    .translate(layout.width / 2, layout.controlBarTop / 2);

  state.duration = video.duration();
  video.loop(state.looping).volume(state.volume).mute(state.muted);

  const background = new TVG.Shape();
  background.appendRect(0, 0, layout.width, layout.height);
  ui.fill(background, colors.background);
  canvas.add(background);
  canvas.add(video);

  const watermarkText = 'This is the thorvg video composition demo.';
  let watermarkX = layout.width;
  const watermark = ui.text(watermarkX, layout.watermark.y, 38, [255, 255, 255]);
  watermark.text(watermarkText).opacity(150);

  const controlBar = new TVG.Shape();
  controlBar.appendRect(0, layout.controlBarTop, layout.width, layout.height - layout.controlBarTop);
  ui.fill(controlBar, colors.controlBar);
  canvas.add(controlBar);

  const title = ui.text(20, 22, 15, colors.title);
  title.text('sample.mp4');

  const { buttonRowY: cy, transport } = layout;

  ui.circle(transport.back, colors.button);
  const backIcon = ui.fill(ui.createShape(), colors.icon);
  ui.triangle(backIcon, transport.back - 3, cy, -1);
  backIcon.appendRect(transport.back + 7, cy - 9, 3, 18);

  ui.circle(transport.play, colors.button);
  const playIcon = ui.fill(ui.createShape(), colors.icon);

  ui.circle(transport.forward, colors.button);
  const forwardIcon = ui.fill(ui.createShape(), colors.icon);
  ui.triangle(forwardIcon, transport.forward + 3, cy, 1);
  forwardIcon.appendRect(transport.forward - 10, cy - 9, 3, 18);

  const { x: progressX, width: progressWidth } = layout.progress;
  const progressTrack = new TVG.Shape();
  progressTrack.appendRect(progressX, cy - 2.5, progressWidth, 5, { rx: 2.5, ry: 2.5 });
  ui.fill(progressTrack, colors.progressTrack);
  canvas.add(progressTrack);

  const progressFill = ui.createShape();
  const progressKnob = ui.createShape();
  const timeLabel = ui.text(progressX, cy - 30, 13, colors.time);

  const loopButton = ui.circle(layout.loop, colors.button);
  const loopIcon = ui.fill(ui.createShape(), colors.icon);
  loopIcon.appendRect(layout.loop - 9, cy - 8, 12, 3);
  ui.triangle(loopIcon, layout.loop + 8, cy - 6.5, 1);
  loopIcon.appendRect(layout.loop - 3, cy + 5, 12, 3);
  ui.triangle(loopIcon, layout.loop - 8, cy + 6.5, -1);
  ui.shrinkIcon(loopIcon, layout.loop);

  const muteButton = ui.circle(layout.mute, colors.button);
  const muteIcon = ui.shrinkIcon(ui.fill(ui.createShape(), colors.icon), layout.mute);

  ui.circle(layout.volume.down, colors.button);
  const volumeDownIcon = ui.fill(ui.createShape(), colors.icon);
  ui.speaker(volumeDownIcon, layout.volume.down - 2, false);
  volumeDownIcon.appendRect(layout.volume.down + 9, cy - 1.5, 9, 3);
  ui.shrinkIcon(volumeDownIcon, layout.volume.down);

  ui.circle(layout.volume.up, colors.button);
  const volumeUpIcon = ui.fill(ui.createShape(), colors.icon);
  ui.speaker(volumeUpIcon, layout.volume.up - 4, false);
  volumeUpIcon.appendRect(layout.volume.up + 8, cy - 1.5, 10, 3);
  volumeUpIcon.appendRect(layout.volume.up + 11.5, cy - 5, 3, 10);
  ui.shrinkIcon(volumeUpIcon, layout.volume.up);

  const volumeLabel = ui.text(layout.volume.down - 4, cy - 40, 12, colors.volume);

  function updateControls() {
    const duration = state.duration > 0 ? state.duration : 0.0001;
    const ratio = Math.max(0, Math.min(1, state.time / duration));
    const knobX = progressX + progressWidth * ratio;

    progressFill.reset();
    ui.fill(progressFill, colors.progressFill);
    if (knobX > progressX) {
      progressFill.appendRect(progressX, cy - 2.5, knobX - progressX, 5, { rx: 2.5, ry: 2.5 });
    }

    progressKnob.reset();
    ui.fill(progressKnob, colors.progressKnob);
    progressKnob.appendCircle(knobX, cy, 7);

    playIcon.reset();
    ui.fill(playIcon, colors.icon);
    if (state.playing) {
      playIcon.appendRect(transport.play - 6, cy - 9, 4, 18);
      playIcon.appendRect(transport.play + 3, cy - 9, 4, 18);
    } else {
      playIcon.moveTo(transport.play - 5, cy - 10)
        .lineTo(transport.play - 5, cy + 10)
        .lineTo(transport.play + 11, cy)
        .close();
    }

    muteIcon.reset();
    ui.fill(muteIcon, colors.icon);
    ui.speaker(muteIcon, layout.mute, state.muted);

    ui.fill(loopButton, state.looping ? colors.loopActive : colors.loopIdle);
    ui.fill(muteButton, state.muted ? colors.muteActive : colors.muteIdle);

    timeLabel.text(ui.formatTime(state.time) + ' - ' + ui.formatTime(state.duration));
    volumeLabel.text('Vol ' + state.volume.toFixed(1));
  }

  function spawnConfetti() {
    const animation = new TVG.Animation();
    const picture = animation.picture;
    animation.load(confettiData);

    const size = picture.size();
    const scale = Math.max(layout.width / size.width, layout.height / size.height) * 1.12;
    picture.size(size.width * scale, size.height * scale)
      .origin(0.5, 0.5)
      .translate(layout.width / 2, layout.height / 2);

    animation.frame(0);
    canvas.add(picture);

    const info = animation.info();
    confettiBursts.push({
      animation,
      picture,
      startedAt: performance.now(),
      durationMs: Math.max(0.1, info ? info.duration : 1) * 1000,
      totalFrames: info ? info.totalFrames : 1,
    });
  }

  function onVideoFrame(time) {
    state.time = time;
    if (!state.looping && state.duration > 0 && time >= state.duration - 0.04) {
      state.playing = false;
    }
  }

  function setPlaying(playing) {
    if (playing) video.play(onVideoFrame);
    else video.pause();
    state.playing = playing;
  }

  function seekTo(seconds) {
    state.time = Math.max(0, Math.min(state.duration, seconds));
    video.seek(state.time);
  }

  function seekAtX(x) {
    if (state.duration <= 0) return;
    const ratio = Math.max(0, Math.min(1, (x - progressX) / progressWidth));
    seekTo(state.duration * ratio);
  }

  let lastFrameTime = performance.now();

  function renderFrame(now) {
    const delta = Math.min(0.05, (now - lastFrameTime) / 1000);
    lastFrameTime = now;

    watermarkX -= delta * layout.watermark.speed;
    if (watermarkX < -layout.watermark.textWidth) watermarkX = layout.width;
    watermark.translate(watermarkX, layout.watermark.y);

    for (let i = confettiBursts.length - 1; i >= 0; i--) {
      const burst = confettiBursts[i];
      const progress = (now - burst.startedAt) / burst.durationMs;
      if (progress >= 1) {
        canvas.remove(burst.picture);
        burst.animation.dispose();
        confettiBursts.splice(i, 1);
        continue;
      }
      burst.animation.frame(burst.totalFrames * progress);
    }

    updateControls();
    canvas.update().render();
    rafId = requestAnimationFrame(renderFrame);
  }

  function pointerPosition(event) {
    const rect = canvasEl.getBoundingClientRect();
    return {
      x: (event.clientX - rect.left) / rect.width * layout.width,
      y: (event.clientY - rect.top) / rect.height * layout.height,
    };
  }

  function hitButton(point, centerX) {
    const { buttonRowY: cy, buttonRadius: r } = layout;
    const dx = point.x - centerX;
    const dy = point.y - cy;
    return dx * dx + dy * dy <= (r + 4) * (r + 4);
  }

  function hitProgressBar(point) {
    return point.x >= progressX - 8
      && point.x <= progressX + progressWidth + 8
      && point.y >= cy - 14
      && point.y <= cy + 14;
  }

  let audioUnlocked = false;

  function unlockAudio() {
    if (audioUnlocked) return;
    audioUnlocked = true;
    if (state.playing) {
      video.pause();
      video.play(onVideoFrame);
    }
  }

  function onPointerDown(event) {
    unlockAudio();
    spawnConfetti();

    const point = pointerPosition(event);
    if (hitButton(point, transport.back)) { seekTo(state.time - 10); return; }
    if (hitButton(point, transport.play)) { setPlaying(!state.playing); return; }
    if (hitButton(point, transport.forward)) { seekTo(state.time + 10); return; }
    if (hitButton(point, layout.loop)) { state.looping = !state.looping; video.loop(state.looping); return; }
    if (hitButton(point, layout.mute)) { state.muted = !state.muted; video.mute(state.muted); return; }
    if (hitButton(point, layout.volume.down)) {
      state.volume = Math.max(0, +(state.volume - 0.1).toFixed(2));
      video.volume(state.volume);
      return;
    }
    if (hitButton(point, layout.volume.up)) {
      state.volume = Math.min(1, +(state.volume + 0.1).toFixed(2));
      video.volume(state.volume);
      return;
    }
    if (hitProgressBar(point)) {
      state.seeking = true;
      seekAtX(point.x);
    }
  }

  function onPointerMove(event) {
    if (state.seeking) seekAtX(pointerPosition(event).x);
  }

  function onPointerUp(event) {
    if (!state.seeking) return;
    state.seeking = false;
    seekAtX(pointerPosition(event).x);
  }

  canvasEl.addEventListener('pointerdown', onPointerDown);
  window.addEventListener('pointermove', onPointerMove);
  window.addEventListener('pointerup', onPointerUp);

  globalThis.__videoPlayerDemo = {
    dispose() {
      cancelAnimationFrame(rafId);
      canvasEl.removeEventListener('pointerdown', onPointerDown);
      window.removeEventListener('pointermove', onPointerMove);
      window.removeEventListener('pointerup', onPointerUp);
      for (const burst of confettiBursts) burst.animation.dispose();
      video.dispose();
    },
  };

  rafId = requestAnimationFrame(renderFrame);
})();
`
};
