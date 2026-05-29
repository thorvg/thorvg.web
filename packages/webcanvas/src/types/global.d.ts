import type { ThorVGModule } from './emscripten';

declare global {
  var __ThorVGModule: ThorVGModule | undefined;
  var __THORVG_THREAD_COUNT: number | undefined;
}
