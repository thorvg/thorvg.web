// TEMPORARY: CodeFactor lint probe. Do not merge.
// This file passes the repo lint. Anything CodeFactor reports here is wider than our rules.

// TODO: W01 warning comment
export function w02(): void {} // W02 empty function

export function w03(value: string | null): number {
  return value!.length; // W03 non-null assertion
}

export const w04: number = 1; // W04 inferrable type

export function w05(flag: boolean): number {
  if (flag) {
    function inner(): number { // W05 inner declaration
      return 1;
    }
    return inner();
  }
  return 0;
}

export function w06(): number[] {
  return [...[1, 2]]; // W06 useless spread
}

export function w07(): number[] {
  return new Array(3); // W07 new Array
}

export function w08(value: number): boolean {
  return value < 1 && value > 2; // W08 impossible comparison
}
