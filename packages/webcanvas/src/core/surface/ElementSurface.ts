import { Surface } from './Surface';

export class ElementSurface extends Surface {
  #canvas: HTMLCanvasElement;

  constructor(element: HTMLCanvasElement) {
    super();
    this.#canvas = element;
  }

  public override dpr(): number {
    // ThorVG DPR formula: interpolate between 1.0 and devicePixelRatio using a 0.75 factor
    return 1 + ((window.devicePixelRatio - 1) * 0.75);
  }

  public resize(logicalWidth: number, logicalHeight: number, physicalWidth: number, physicalHeight: number): void {
    this.#canvas.style.width = `${logicalWidth}px`;
    this.#canvas.style.height = `${logicalHeight}px`;

    this.#canvas.width = physicalWidth;
    this.#canvas.height = physicalHeight;
  }

  public present(buffer: ArrayBuffer, width: number, height: number): void {
    const ctx = this.#canvas.getContext('2d') as CanvasRenderingContext2D;
    const imageData = new ImageData(new Uint8ClampedArray(buffer), width, height);
    ctx.putImageData(imageData, 0, 0);
  }

  public clear(): void {
    const ctx = this.#canvas.getContext('2d') as CanvasRenderingContext2D;
    ctx.clearRect(0, 0, this.#canvas.width, this.#canvas.height);
  }
}
