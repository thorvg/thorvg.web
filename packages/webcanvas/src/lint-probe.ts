// TEMPORARY: CodeFactor lint probe. Do not merge.
import { getModule } from './interop/module';
import { ThorVGModule } from './types/emscripten';

// quotes
export const probeQuotes: string = "double quotes";

// eqeqeq, no-console, consistent-type-imports (ThorVGModule is type-only)
export function probeBase(value: number): boolean {
  const module: ThorVGModule = getModule();
  console.log(module);
  return value == 1;
}

// await-thenable (type-aware)
export async function probeTypeAware(): Promise<void> {
  await 1;
}
