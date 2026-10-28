import type Profiler from '@thorvg/profiler';

export type { MemorySample } from '@thorvg/profiler';

let pending: Promise<Profiler> | null = null;

export function loadProfiler(): Promise<Profiler> {
  return pending ??= import('@thorvg/profiler').then(({ default: Profiler }) => new Profiler());
}

export function toMB(bytes: number): number {
  return bytes / 1048576;
}
