import type { ThorVGModule } from './emscripten';

declare global {
  // Runtime variables
  var __ThorVGModule: ThorVGModule | undefined;
  var __THORVG_THREAD_COUNT: number | undefined;

  // Compile-time constants
  const __THREAD_SUPPORT__: boolean;
}
