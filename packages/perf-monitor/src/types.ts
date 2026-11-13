export interface PerfMonitorOptions {
  position?: 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right';
}

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
