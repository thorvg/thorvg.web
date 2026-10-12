// TEMPORARY: CodeFactor lint probe. Do not merge.
// Every marked line violates exactly one rule of eslint.config.mjs.
import { getModule } from './interop/module';
import { ThorVGModule } from './types/emscripten'; // P01 consistent-type-imports

export const p02 = "double"; // P02 quotes
export const p03 = 1 // P03 semi
export const p04 = (name: string): string => 'a' + name; // P04 prefer-template
export const p05 = (): undefined => void 0; // P05 no-void
export type P06 = { a: number }; // P06 consistent-type-definitions

export function p07(value: number) { // P07 explicit-module-boundary-types
  return value;
}

export function p08(value: number): boolean {
  const module: ThorVGModule = getModule();
  console.log(module); // P08 no-console
  return value == 1; // P09 eqeqeq
}

export function p10(): number {
      return 1; // P10 indent
}

export function p11(): number {
  return 1; // P11 no-trailing-spaces   
}

// P12 no-tabs:	tab
export function p13(): void {
  try {
    getModule();
  } catch (e) { // P13 no-unused-vars
    // ignored
  }
}

export function p14(value: number): number {
  let result = 0;
  switch (value) {
    case 1: // P14 no-restricted-syntax
      result = 1;
      break;
    default: {
      result = 2;
    }
  }
  return result;
}

export function p15(list: number[]): number {
  let sum = 0;
  for (let i = 0; i < list.length; i++) { // P15 prefer-for-of
    sum += list[i] ?? 0;
  }
  return sum;
}

// Rules inherited from the recommended sets.
export function p16(value: any): void { // P16 no-explicit-any
  if (value) {} // P17 no-empty
}

export function p18(): number {
  let count = 1; // P18 prefer-const
  return count;
}

// Type-aware rules.
export async function p19(): Promise<void> {
  await 1; // P19 await-thenable
}

export function p20(): object {
  const promise = Promise.resolve({ a: 1 });
  return { ...promise }; // P20 no-misused-promises
}

export function p21(list: number[]): void {
  for (const key in list) { // P21 no-for-in-array
    console.warn(key);
  }
}
