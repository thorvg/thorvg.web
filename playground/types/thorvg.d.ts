declare module '@thorvg/canvas-kit' {
  export interface InitOptions {
    renderer?: 'gl' | 'wg' | 'sw';
    locateFile?: (path: string) => string;
  }

  export interface CanvasOptions {
    width: number;
    height: number;
    renderer?: 'gl' | 'wg' | 'sw';
  }

  export interface ThorVGModule {
    Canvas: new (selector: string, options: CanvasOptions) => Canvas;
    Shape: new () => Shape;
    Text: new () => Text;
    Picture: new () => Picture;
    Animation: new () => Animation;
    LinearGradient: new (x1: number, y1: number, x2: number, y2: number) => LinearGradient;
    RadialGradient: new (cx: number, cy: number, radius: number) => RadialGradient;
    Font: {
      load: (name: string, data: Uint8Array, options?: { format?: string }) => void;
    };
  }

  export interface Canvas {
    add(...items: (Shape | Text | Picture | Animation)[]): void;
    render(): void;
    clear(): void;
    update(): void;
  }

  export interface Shape {
    appendRect(x: number, y: number, w: number, h: number, options?: { rx?: number; ry?: number }): Shape;
    appendCircle(cx: number, cy: number, rx: number, ry: number): Shape;
    moveTo(x: number, y: number): Shape;
    lineTo(x: number, y: number): Shape;
    close(): Shape;
    fill(r: number, g: number, b: number, a?: number): Shape;
    fill(gradient: LinearGradient | RadialGradient): Shape;
    stroke(options: { width: number; color: [number, number, number, number] }): Shape;
    translate(x: number, y: number): Shape;
    rotate(angle: number): Shape;
    scale(scale: number): Shape;
  }

  export interface Text {
    font(name: string): Text;
    text(content: string): Text;
    fontSize(size: number): Text;
    fill(r: number, g: number, b: number, a?: number): Text;
    fill(gradient: LinearGradient | RadialGradient): Text;
    outline(width: number, r: number, g: number, b: number, a?: number): Text;
    align(options: { horizontal?: string; vertical?: string }): Text;
    translate(x: number, y: number): Text;
    rotate(angle: number): Text;
  }

  export interface Picture {
    loadData(data: string | Uint8Array, options: { format: string }): Picture;
    size(width?: number, height?: number): { width: number; height: number } | Picture;
    translate(x: number, y: number): Picture;
  }

  export interface Animation {
    load(data: Uint8Array): void;
    play(callback: (frame: number) => void): void;
    pause(): void;
    isPlaying(): boolean;
    frame(frameNumber: number): void;
    info(): { totalFrames: number; duration: number; fps: number };
    dispose(): void;
    picture: Picture;
  }

  export interface LinearGradient {
    addStop(offset: number, color: [number, number, number, number]): void;
  }

  export interface RadialGradient {
    addStop(offset: number, color: [number, number, number, number]): void;
  }

  export function init(options?: InitOptions): Promise<ThorVGModule>;
}
