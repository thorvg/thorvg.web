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

function waitForLoadOrError(el: LottiePlayer): Promise<'load' | 'error'> {
  return new Promise(resolve => {
    el.addEventListener('load',  () => resolve('load'),  { once: true });
    el.addEventListener('error', () => resolve('error'), { once: true });
  });
}

function hasPixels(player: LottiePlayer): boolean {
  const src = player.querySelector('.thorvg') as HTMLCanvasElement | null;
  if (!src || src.width === 0 || src.height === 0) return false;

  const ctx2d = src.getContext('2d');
  if (ctx2d) {
    const { data } = ctx2d.getImageData(0, 0, src.width, src.height);
    return data.some(v => v > 0);
  }

  return true;
}

function makePNGDataURL(): string {
  // Create a 10x10 blue square
  const c = document.createElement('canvas');
  c.width = 10;
  c.height = 10;
  const ctx = c.getContext('2d')!;
  ctx.fillStyle = 'blue';
  ctx.fillRect(0, 0, 10, 10);
  return c.toDataURL('image/png');
}

const SVG_DATA_URL =
  `data:image/svg+xml,${encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100">' +
    '<rect width="100" height="100" fill="green"/></svg>',
  )}`;

async function createReadyPlayer(): Promise<LottiePlayer> {
  const player = await fixture<LottiePlayer>(html`
    <lottie-player
      src="${ANIMATION}"
      style="width: ${WIDTH}px; height: ${HEIGHT}px;"
      wasmUrl="${WASM_URL}"
    ></lottie-player>
  `);

  await new Promise<void>((resolve, reject) => {
    player.addEventListener('load',  () => resolve(), { once: true });
    player.addEventListener('error', () => reject(new Error('Initial animation failed to load')), { once: true });
  });

  return player;
}

describe('Lottie Player', () => {
  before(() => {
    // @ts-expect-error: disable IntersectionObserver
    window.IntersectionObserver = IntersectionObserver;
  });

  describe('Initialization', () => {
    let player: LottiePlayer;

    before(async () => {
      player = await createReadyPlayer();
    });

    after(() => {
      player.destroy();
    });

    it('should be a LottiePlayer instance', () => {
      expect(player).to.be.instanceOf(LottiePlayer);
    });

    it('should return correct version', () => {
      const { THORVG_VERSION } = player.getVersion();
      expect(THORVG_VERSION).to.equal(EXPECTED_THORVG_VERSION);
    });
  });

  describe('Playback controls', () => {
    let player: LottiePlayer;

    before(async () => {
      player = await createReadyPlayer();
    });

    after(() => {
      player.destroy();
    });

    it('play', async () => {
      player.play();
      await player.updateComplete;
      expect(player.currentState).to.equal('playing');
    });

    it('pause', async () => {
      player.pause();
      await player.updateComplete;
      expect(player.currentState).to.equal('paused');
    });

    it('stop resets to frame 0', async () => {
      player.stop();
      await player.updateComplete;
      expect(player.currentState).to.equal('paused');
      expect(player.currentFrame).to.equal(0);
    });

    it('freeze', async () => {
      player.freeze();
      await player.updateComplete;
      expect(player.currentState).to.equal('frozen');
    });

    it('seek to frame 10', async () => {
      await player.seek(10);
      await player.updateComplete;
      expect(player.currentFrame).to.equal(10);
    });

    it('resize immediately after load completes without error', async () => {
      const resultPromise = waitForLoadOrError(player);
      player.load(ANIMATION);
      await resultPromise;
      expect(() => player.resize(200, 200)).to.not.throw();
      expect(player.currentState).to.not.equal('error');
    });
  });

  describe('Properties', () => {
    let player: LottiePlayer;

    before(async () => {
      player = await createReadyPlayer();
    });

    after(() => {
      player.destroy();
    });

    it('setLooping', () => {
      player.setLooping(false);
      expect(player.loop).to.equal(false);
    });

    it('setDirection', () => {
      player.setDirection(-1);
      expect(player.direction).to.equal(-1);
    });

    it('setSpeed', () => {
      player.setSpeed(2.0);
      expect(player.speed).to.equal(2.0);
    });

    it('setBgColor', () => {
      expect(() => player.setBgColor('red')).to.not.throw();
    });

    it('setQuality', () => {
      expect(() => player.setQuality(50)).to.not.throw();
    });
  });

  describe('Export', () => {
    let player: LottiePlayer;

    before(async () => {
      player = await createReadyPlayer();
    });

    after(() => {
      player.destroy();
    });

    it('save2png', () => {
      expect(() => player.save2png()).to.not.throw();
    });

    it('save2gif', async () => {
      return player.save2gif(ANIMATION);
    });
  });

  describe('Error paths', () => {
    let player: LottiePlayer;

    before(async () => {
      player = await createReadyPlayer();
    });

    after(() => {
      player.destroy();
    });

    it('fires error event for an invalid source', async () => {
      const resultPromise = waitForLoadOrError(player);
      player.load('not-json-not-url');
      expect(await resultPromise).to.equal('error');
      expect(player.currentState).to.equal('error');
    });

    it('fires error event for malformed JSON', async () => {
      const resultPromise = waitForLoadOrError(player);
      player.load('{"not":"lottie"}');
      expect(await resultPromise).to.equal('error');
      expect(player.currentState).to.equal('error');
    });
  });

  describe('Format verification', () => {
    let player: LottiePlayer;

    beforeEach(async () => {
      player = await createReadyPlayer();
    });

    afterEach(() => {
      player.destroy();
    });

    it('SVG loads and renders pixels', async () => {
      const resultPromise = waitForLoadOrError(player);
      await player.load(SVG_DATA_URL, 'svg' as any);
      expect(await resultPromise).to.equal('load');
      expect(hasPixels(player)).to.equal(true);
    });

    it('PNG loads and renders pixels', async () => {
      const resultPromise = waitForLoadOrError(player);
      player.load(makePNGDataURL(), 'png' as any);
      expect(await resultPromise).to.equal('load');
      expect(hasPixels(player)).to.equal(true);
    });

    it('Lottie JSON loads and renders pixels', async () => {
      const resultPromise = waitForLoadOrError(player);
      player.load(ANIMATION);
      expect(await resultPromise).to.equal('load');
      expect(hasPixels(player)).to.equal(true);
    });
  });

  describe('Lifecycle', () => {
    let player: LottiePlayer;

    before(async () => {
      player = await createReadyPlayer();
    });

    it('should destroy the player and set state to destroyed', () => {
      player.destroy();
      expect(player.currentState).to.equal('destroyed');
      expect(document.querySelector('lottie-player')).to.equal(null);
    });

    it('should terminate module without error', () => {
      expect(() => player.term()).to.not.throw();
    });
  });
});
