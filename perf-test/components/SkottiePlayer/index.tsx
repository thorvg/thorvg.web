import { useEffect, useRef, useState } from "react";
import { CanvasKit } from "canvaskit-wasm";
import { v4 as uuidv4 } from 'uuid';

let canvasKit: CanvasKit | undefined = undefined;
export const setCanvasKit = (ck: CanvasKit) => {
  if (canvasKit) {
    return;
  }
  canvasKit = ck;
}

interface Props {
  lottieURL: string;
  width: number;
  height: number;
}

export default function Skottie ({ lottieURL, width, height }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [id, setId] = useState<string>('');
  let [ratio, setRatio] = useState<number>(1.0);
  let initialized = false;
  let changingRatio = false;

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    if (initialized || !canvasKit) {
      return;
    }
    initialized = true;

    const id = uuidv4();
    setId(id);

    const dpr = window.devicePixelRatio || 1
    setRatio(dpr);

    const data = await fetch(lottieURL);
    const lottieJSON = await data.text();

    const animation = canvasKit.MakeManagedAnimation(lottieJSON);
    let surface = canvasKit!.MakeSWCanvasSurface(id);
    let canvas = surface!.getCanvas();
    let bounds = canvasKit!.LTRBRect(0, 0, width * dpr, height * dpr);
    let beginTime = Date.now() / 1000;

    const damageRect = Float32Array.of(0, 0, 0, 0);
    const clearColor = canvasKit.TRANSPARENT;
    function drawFrame() {
      const dpr = window.devicePixelRatio || 1;
      if (dpr !== ratio && !changingRatio) {
        changingRatio = true;

        surface!.delete();
        surface = canvasKit!.MakeSWCanvasSurface(id);
  
        if (!surface) {
          throw new Error('[Skia] Failed to create canvas surface');
        }
        canvas = surface!.getCanvas();
        bounds = canvasKit!.LTRBRect(0, 0, width * dpr, height * dpr);

        ratio = dpr;
        setRatio(dpr);
        changingRatio = false;
      }

      let currentTime = Date.now() / 1000;
      let currentFrame = (currentTime - beginTime) / animation.duration();

      if (currentFrame > 1) {
        currentFrame = 0;
        beginTime = currentTime;
      }

      let damage = animation.seek(currentFrame, damageRect);
      if (damage[2] > damage[0] && damage[3] > damage[1]) {
        canvas.clear(clearColor);
        animation.render(canvas, bounds);
        surface?.flush();
      }
      window.requestAnimationFrame(drawFrame);
    };

    window.requestAnimationFrame(drawFrame);
  }

  return (
    <canvas id={id} ref={canvasRef} style={{ width, height }} width={width * ratio} height={height * ratio} />
  );
}
