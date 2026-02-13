import { fixture, html, expect } from '@open-wc/testing';
import { LottiePlayer } from '../dist/lottie-player.esm.js';
import '../dist/lottie-player.esm.js';

declare const EXPECTED_THORVG_VERSION: string;

const ANIMATION = 'https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json';
const WASM_URL = '/dist/thorvg.wasm';
const WIDTH = 300;
const HEIGHT = 300;

class IntersectionObserver {
  constructor(callback: (entries: IntersectionObserverEntry[]) => void) {
    callback([
      {
        isIntersecting: true,
        target: document.querySelector('lottie-player'),
      } as unknown as IntersectionObserverEntry,
    ]);
  }
  observe = (_: HTMLElement): void => {}
  disconnect = (): void => {}
  unobserve = (): void => {}
}

describe('Lottie Player', () => {
  let lottiePlayer: LottiePlayer;

  before(() => {
    // @ts-expect-error: disable IntersectionObserver
    window.IntersectionObserver = IntersectionObserver;
  });

  it('should create the player', async () => {
    let isReady = false;
    lottiePlayer = await fixture(html`
      <lottie-player
        src="${ANIMATION}"
        style="width: ${WIDTH}px; height: ${HEIGHT}px;"
        wasmUrl="${WASM_URL}"
      ></lottie-player>
    `);

    lottiePlayer.addEventListener('ready', () => {
      isReady = true;
    });

    await lottiePlayer.updateComplete;
    while (!isReady) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    expect(document.querySelector('lottie-player')).to.be.instanceOf(
      LottiePlayer,
    );
  });

  it('should play the animation', async () => {
    lottiePlayer.play();
    await lottiePlayer.updateComplete;
    expect(lottiePlayer.currentState).to.equal('playing');
  });

  it('should pause the animation', async () => {
    lottiePlayer.pause();
    await lottiePlayer.updateComplete;
    expect(lottiePlayer.currentState).to.equal('paused');
  });

  it('should stop the animation and reset frame', async () => {
    lottiePlayer.stop();
    await lottiePlayer.updateComplete;
    expect(lottiePlayer.currentState).to.equal('paused');
    expect(lottiePlayer.currentFrame).to.equal(0);
  });

  it('should freeze the animation', async () => {
    lottiePlayer.freeze();
    await lottiePlayer.updateComplete;
    expect(lottiePlayer.currentState).to.equal('frozen');
  });

  it('should replay the animation', async () => {
    lottiePlayer.play();
    await lottiePlayer.updateComplete;
    expect(lottiePlayer.currentState).to.equal('playing');
  });

  it('should seek to specific frame', async () => {
    await lottiePlayer.seek(10);
    await lottiePlayer.updateComplete;
    expect(lottiePlayer.currentFrame).to.equal(10);
  });

  it('should set loop property', () => {
    lottiePlayer.setLooping(false);
    expect(lottiePlayer.loop).to.equal(false);
  });

  it('should set direction property', () => {
    lottiePlayer.setDirection(-1);
    expect(lottiePlayer.direction).to.equal(-1);
  });

  it('should set speed property', () => {
    lottiePlayer.setSpeed(2.0);
    expect(lottiePlayer.speed).to.equal(2.0);
  });

  it('should set background color', () => {
    expect(() => lottiePlayer.setBgColor('red')).to.not.throw();
  });

  it('should set quality property', () => {
    expect(() => lottiePlayer.setQuality(50)).to.not.throw();
  });

  it('should execute save2png without error', () => {
    expect(() => lottiePlayer.save2png()).to.not.throw();
  });

  it('should execute save2gif without error', async () => {
    return lottiePlayer.save2gif(ANIMATION);
  });

  it('should return version object', () => {
    const { THORVG_VERSION } = lottiePlayer.getVersion();
    expect(THORVG_VERSION).to.equal(EXPECTED_THORVG_VERSION);
  });

  it('should destroy the player and set state to destroyed', () => {
    lottiePlayer.destroy();
    expect(lottiePlayer.currentState).to.equal('destroyed');
    expect(document.querySelector('lottie-player')).to.equal(null);
  });

  it('should terminate module without error', () => {
    expect(() => lottiePlayer.term()).to.not.throw();
  });
});
