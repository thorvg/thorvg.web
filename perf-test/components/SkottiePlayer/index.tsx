import { useEffect, useState } from "react";
import { CanvasKit, Surface } from "canvaskit-wasm";
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
  const [id, setId] = useState<string>('');
  let initialized = false;

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

    const data = await fetch(lottieURL);
    const lottieJSON = await data.text();

    const animation = canvasKit.MakeManagedAnimation(lottieJSON);
    const MAX_FRAMES = animation.duration() * animation.fps();
    let surface: Surface | null;

    surface = canvasKit.MakeSWCanvasSurface(id);
    if (!surface) {
      throw new Error('[Skia] Failed to create canvas surface');
    }

    let beginTime = Date.now() / 1000;

    const canvas = surface.getCanvas();
    const damageRect = Float32Array.of(0, 0, 0, 0);
    const bounds = canvasKit.LTRBRect(0, 0, width, height);
    const clearColor = canvasKit.TRANSPARENT;

    function drawFrame() {

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
    <canvas id={id} width={width} height={height} />
  );
}
