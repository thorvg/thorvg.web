export abstract class Surface {
  public dpr(): number {
    return 1;
  }

  public abstract resize(logicalWidth: number, logicalHeight: number, physicalWidth: number, physicalHeight: number): void;

  public abstract present(buffer: Uint8Array, width: number, height: number): void;

  public abstract clear(): void;

  public dispose(): void {}
}
