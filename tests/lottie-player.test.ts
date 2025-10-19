import { join } from 'path';
import { readFileSync } from 'fs';
import { LottiePlayer } from '../src/lottie-player';
import '../dist/lottie-player';


describe("LottiePlayer", () => {
    const template = readFileSync(join(__dirname, 'fixtures/base-template.html'), 'utf-8');

    let lottiePlayer: LottiePlayer;

    beforeEach(async () => {
        jest.useFakeTimers();
        document.documentElement.innerHTML = template;

        const lottie = document.querySelector('.lottie');
        if (lottie === null) {
            throw new Error('Lottie element not found in the template');
        }

        lottiePlayer = document.createElement('lottie-player') as LottiePlayer;
        lottiePlayer.autoPlay = true;
        lottiePlayer.loop = true;
        lottiePlayer.style.width = "500px";
        lottiePlayer.style.height = "500px";
        
        lottie.appendChild(lottiePlayer);

        await jest.runAllTimersAsync(); // wait for timer inside _init() method
        
        expect(document.querySelector('lottie-player')).not.toBeNull();
        expect(lottiePlayer.getElementsByClassName('thorvg').length).toBe(1);

        const thorvgCanvas = lottiePlayer.getElementsByClassName('thorvg')[0];
        // As jsdom cannot compute the layout, the canvas size is set to zero. 
        // Therefore, we manually specify the size.
        thorvgCanvas.setAttribute('width', '500');
        thorvgCanvas.setAttribute('height', '500');

        await lottiePlayer.load("https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json"); // it will load a mock animation from fixtures
        await jest.runAllTimersAsync(); // wait for timer inside _init() method

        jest.useRealTimers();
    });

    describe("play", () => {
        it("should start playing animation", () => {
            lottiePlayer.play();
            // we mock IntersectionObserver so the animation should be in 'frozen' state
            expect(lottiePlayer.currentState).toBe("frozen");
        });
    })

    describe("pause", () => {
        it("should pause the animation", () => {
            lottiePlayer.pause();
            expect(lottiePlayer.currentState).toBe("paused");
        });
    })

    describe("stop", () => {
        it("should stop the animation and reset frame", () => {
            lottiePlayer.stop();
            expect(lottiePlayer.currentState).toBe("paused");
            expect(lottiePlayer.currentFrame).toBe(0);
        });
    })

    describe("freeze", () => {
        it("should freeze the animation", () => {
            lottiePlayer.freeze();
            expect(lottiePlayer.currentState).toBe("frozen");
        });
    })

    describe("seek", () => {
        it("should seek to specific frame", async () => {
            await lottiePlayer.seek(10);
            expect(lottiePlayer.currentFrame).toBe(10);
        });
    })

    describe("resize", () => {
        it("should resize the canvas", () => {
            lottiePlayer.resize(600, 600);
            const canvas = lottiePlayer.getElementsByClassName('thorvg')[0];
            expect(canvas.getAttribute('width')).toBe('600');
            expect(canvas.getAttribute('height')).toBe('600');
        });
    })

    describe("destroy", () => {
        it("should destroy the player and remove element", () => {
            lottiePlayer.destroy();
            expect(lottiePlayer.currentState).toBe("destroyed");
            expect(document.querySelector('lottie-player')).toBeNull();
        });
    })

    describe("setLooping", () => {
        it("should set loop property", () => {
            lottiePlayer.setLooping(false);
            expect(lottiePlayer.loop).toBe(false);
        });
    })

    describe("setDirection", () => {
        it("should set direction property", () => {
            lottiePlayer.setDirection(-1);
            expect(lottiePlayer.direction).toBe(-1);
        });
    })

    describe("setSpeed", () => {
        it("should set speed property", () => {
            lottiePlayer.setSpeed(2.0);
            expect(lottiePlayer.speed).toBe(2.0);
        });
    })

    describe("setBgColor", () => {
        it("should set background color", () => {
            lottiePlayer.setBgColor('red');
            const canvas = lottiePlayer.getElementsByClassName('thorvg')[0] as HTMLCanvasElement;
            expect(canvas.style.backgroundColor).toBe('red');
        });
    })
    
    describe("save2png", () => {
        it("should execute save2png without error", () => {
            expect(() => lottiePlayer.save2png()).not.toThrow();
        });
    })

    describe("save2gif", () => {
        it("should execute save2gif", async () => {
            await expect(lottiePlayer.save2gif("https://lottie.host/6d7dd6e2-ab92-4e98-826a-2f8430768886/NGnHQ6brWA.json")).resolves.not.toThrow();
        });
    })

    describe("getVersion", () => {
        it("should return version object", () => {
            const version = lottiePlayer.getVersion();
            expect(version).toHaveProperty('THORVG_VERSION');
            expect(version).toEqual({ THORVG_VERSION: '1.0.0'})
        });
    })

    describe("term", () => {
        it("should terminate module", () => {
            expect(() => lottiePlayer.term()).not.toThrow();
        });
    })
})





