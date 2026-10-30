export type Renderer = 'sw' | 'gl' | 'wg';

const RENDERERS: readonly string[] = ['sw', 'gl', 'wg'];

export function isRenderer(value: string | null): value is Renderer {
  return value !== null && RENDERERS.includes(value);
}

export function normalizeThreads(raw: unknown): number {
  const n = Math.floor(Number(raw));
  if (!Number.isFinite(n) || n <= 0) return 0;
  return n
}

export function readThreadsFromUrl(search: string): number {
  return normalizeThreads(new URLSearchParams(search).get('threads'));
}

export function readThreadsParam(search: string): number | null {
  const raw = new URLSearchParams(search).get('threads');
  return raw === null ? null : normalizeThreads(raw);
}

export function readRendererFromUrl(search: string): Renderer {
  const raw = new URLSearchParams(search).get('renderer');
  return isRenderer(raw) ? raw : 'gl';
}

export function readRendererParam(search: string): Renderer | null {
  const raw = new URLSearchParams(search).get('renderer');
  return isRenderer(raw) ? raw : null;
}

export function buildExampleUrl(exampleId: string, rendererParam: Renderer | null): string {
  return rendererParam ? `/showcase/${exampleId}?renderer=${rendererParam}` : `/showcase/${exampleId}`;
}
