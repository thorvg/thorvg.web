import type { ThorVGModule } from './emscripten';

declare global {
  var __ThorVGModule: ThorVGModule | undefined;
}
