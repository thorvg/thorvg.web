import { Surface } from './Surface';

export class OffscreenSurface extends Surface {
  #canvas: OffscreenCanvas;

  constructor(canvas: OffscreenCanvas) {
    super(canvas);
    this.#canvas = canvas;
  }

  public resize(_logicalWidth: number, _logicalHeight: number, physicalWidth: number, physicalHeight: number): void {
    this.#canvas.width = physicalWidth;
    this.#canvas.height = physicalHeight;
  }

  public present(buffer: Uint8Array, width: number, height: number): void {
    const ctx = this.#canvas.getContext('2d') as OffscreenCanvasRenderingContext2D;
    const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
    ctx.putImageData(imageData, 0, 0);
  }

  public clear(): void {
    const ctx = this.#canvas.getContext('2d');
    ctx?.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
}
