export function normalizeThreads(raw: unknown): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n
}

export function readThreadsFromUrl(search: string): number {
  return normalizeThreads(new URLSearchParams(search).get('threads'));
}
