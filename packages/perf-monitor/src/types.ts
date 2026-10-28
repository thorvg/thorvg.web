export interface GpuMemory {
  total: number;
  peak: number;
  breakdown: Record<string, number>;
  resources: Record<string, number>;
}

export interface MemorySample {
  js: number | null;
  wasm: number | null;
  gpu: GpuMemory | null;
}
