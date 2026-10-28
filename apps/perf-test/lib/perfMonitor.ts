import type PerfMonitor from '@thorvg/perf-monitor';

export type { MemorySample } from '@thorvg/perf-monitor';

let pending: Promise<PerfMonitor> | null = null;

export function loadPerfMonitor(): Promise<PerfMonitor> {
  return pending ??= import('@thorvg/perf-monitor').then(({ default: PerfMonitor }) => new PerfMonitor());
}

export function toMB(bytes: number): number {
  return bytes / 1048576;
}
