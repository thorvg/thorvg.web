import { getModule, hasModule } from '../../interop/module';

let selectorKey = 0; // counter for special HTML targets

export abstract class Surface {
  public readonly key: string;

  protected constructor(canvas: HTMLCanvasElement | OffscreenCanvas) {
    this.key = `!thorvg-${++selectorKey}`;
    getModule().specialHTMLTargets[this.key] = canvas;
  }

  public dpr(): number {
    return 1;
  }

  public abstract resize(logicalWidth: number, logicalHeight: number, physicalWidth: number, physicalHeight: number): void;

  public abstract present(buffer: Uint8Array, width: number, height: number): void;

  public abstract clear(): void;

  public dispose(): void {
    if (hasModule()) {
      delete getModule().specialHTMLTargets[this.key];
    }
  }
}
