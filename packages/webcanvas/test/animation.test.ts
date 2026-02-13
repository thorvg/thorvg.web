import { describe, it, expect } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { Animation } from '../src/core/Animation';
import { Picture } from '../src/core/Picture';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

const MINIMAL_LOTTIE = JSON.stringify({
  v: '5.0.0', fr: 30, ip: 0, op: 30, w: 100, h: 100, layers: [],
});

function createLoadedAnimation(): Animation {
  const TVG = getTVG();
  const anim = new TVG.Animation();
  anim.load(MINIMAL_LOTTIE);
  return anim;
}

describe('Animation', () => {
  it('constructor creates animation', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(anim).toBeInstanceOf(Animation);
  });

  it('ptr is greater than 0', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(anim.ptr).toBeGreaterThan(0);
  });

  it('picture getter returns Picture', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    const picture = anim.picture;
    expect(picture).toBeInstanceOf(Picture);
  });

  it('picture getter is cached', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    const pic1 = anim.picture;
    const pic2 = anim.picture;
    expect(pic1).toBe(pic2);
  });

  it('isPlaying defaults to false', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(anim.isPlaying()).toBe(false);
  });

  it('getLoop defaults to true', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(anim.getLoop()).toBe(true);
  });

  it('setLoop changes loop state', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    const result = anim.setLoop(false);
    expect(result).toBe(anim);
    expect(anim.getLoop()).toBe(false);
  });

  it('frame getter returns 0 by default', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(anim.frame()).toBe(0);
  });

  it('getCurrentTime returns 0 when no animation loaded', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(anim.getCurrentTime()).toBe(0);
  });

  it('info returns null when no animation loaded', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(anim.info()).toBeNull();
  });

  it('load returns this', () => {
    const anim = createLoadedAnimation();
    expect(anim).toBeInstanceOf(Animation);
  });

  it('info returns AnimationInfo after load', () => {
    const anim = createLoadedAnimation();
    const info = anim.info();
    expect(info).not.toBeNull();
    expect(info).toHaveProperty('totalFrames');
    expect(info).toHaveProperty('duration');
    expect(info).toHaveProperty('fps');
  });

  it('frame setter returns this', () => {
    const anim = createLoadedAnimation();
    const result = anim.frame(10);
    expect(result).toBe(anim);
  });

  it('segment returns this', () => {
    const anim = createLoadedAnimation();
    const result = anim.segment(0);
    expect(result).toBe(anim);
  });

  it('seek returns this', () => {
    const anim = createLoadedAnimation();
    // move away from frame 0 before calling seek
    anim.frame(10);
    const result = anim.seek(0);
    expect(result).toBe(anim);
  });

  it('stop returns this', () => {
    const anim = createLoadedAnimation();
    // move away from frame 0 before calling stop
    anim.frame(10);
    const result = anim.stop();
    expect(result).toBe(anim);
  });

  it('pause returns this', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    const result = anim.pause();
    expect(result).toBe(anim);
  });

  it('dispose cleans up', () => {
    const TVG = getTVG();
    const anim = new TVG.Animation();
    expect(() => anim.dispose()).not.toThrow();
  });
});
