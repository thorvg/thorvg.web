import { fixture, html, expect } from '@open-wc/testing';
import '../dist/lottie-player.esm.js';
import type { LottiePlayer } from '../dist/lottie-player';

describe("Lottie Player", () => {
  let lottiePlayer: LottiePlayer;

  beforeEach(async () => {
    lottiePlayer = await fixture(html`
      <lottie-player
        loop
        style="width: 300px; height: 300px;"
        wasmUrl="/dist/thorvg.wasm"
      ></lottie-player>`);

    await lottiePlayer.load('https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json');

    expect(lottiePlayer.getElementsByClassName('thorvg').length).to.equal(1);
  });

  describe("play", () => {
    it("should start playing the animation", () => {
      lottiePlayer.play();
      expect(lottiePlayer.currentState).to.equal('playing');
    });
  });

  describe("pause", () => {
    it("should pause the animation", () => {
      lottiePlayer.pause();
      expect(lottiePlayer.currentState).to.equal('paused');
    });
  });

  describe("stop", () => {
    it("should stop the animation and reset frame", () => {
      lottiePlayer.stop();
      expect(lottiePlayer.currentState).to.equal('paused');
      expect(lottiePlayer.currentFrame).to.equal(0);
    });
  });

  describe("freeze", () => {
    it("should freeze the animation", () => {
      lottiePlayer.freeze();
      expect(lottiePlayer.currentState).to.equal('frozen');
    });
  });

  describe("seek", () => {
    it("should seek to specific frame", async () => {
      await lottiePlayer.seek(10);
      expect(lottiePlayer.currentFrame).to.equal(10);
    });
  });

  describe("resize", () => {
    it("should resize the canvas", () => {
      lottiePlayer.resize(600, 600);
      const canvas = lottiePlayer.getElementsByClassName('thorvg')[0];
      expect(canvas.getAttribute('width')).to.equal('600');
      expect(canvas.getAttribute('height')).to.equal('600');
    });
  });

  describe("setLooping", () => {
    it("should set loop property", () => {
      lottiePlayer.setLooping(false);
      expect(lottiePlayer.loop).to.equal(false);
    });
  });

  describe("setDirection", () => {
    it("should set direction property", () => {
      lottiePlayer.setDirection(-1);
      expect(lottiePlayer.direction).to.equal(-1);
    });
  });

  describe("setSpeed", () => {
    it("should set speed property", () => {
      lottiePlayer.setSpeed(2.0);
      expect(lottiePlayer.speed).to.equal(2.0);
    });
  });

  describe("setBgColor", () => {
    it("should set background color", () => {
      lottiePlayer.setBgColor('red');
      const canvas = lottiePlayer.getElementsByClassName('thorvg')[0] as HTMLCanvasElement;
      expect(canvas.style.backgroundColor).to.equal('red');
    });
  });

  describe("setQuality", () => {
    it("should set quality property", () => {
      lottiePlayer.setQuality(50);
      expect(lottiePlayer.currentState).to.not.equal('error');
    });
  });

  describe("save2png", () => {
    it("should execute save2png without error", () => {
      expect(() => lottiePlayer.save2png()).to.not.throw();
    });
  });

  describe("save2gif", () => {
    it("should execute save2gif without error", () => {
      expect(async () => await lottiePlayer.save2gif('https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json')).to.not.throw();
    });
  });

  describe("getVersion", () => {
    it("should return version object", () => {
      const version = lottiePlayer.getVersion();
      expect(version).to.have.property('THORVG_VERSION');
      expect(version.THORVG_VERSION).to.be.a('string');
    });
  });

  describe("destroy", () => {
    it("should destroy the player and set state to destroyed", () => {
      lottiePlayer.destroy();
      expect(lottiePlayer.currentState).to.equal('destroyed');
      expect(document.querySelector('lottie-player')).to.equal(null);
    });
  });
  
  describe("term", () => {
    it("should terminate module without error", () => {
      expect(() => lottiePlayer.term()).to.not.throw();
    });
  });
});