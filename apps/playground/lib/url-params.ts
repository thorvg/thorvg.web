export type Renderer = 'sw' | 'gl' | 'wg';

const RENDERERS: readonly string[] = ['sw', 'gl', 'wg'];

export function isRenderer(value: string | null): value is Renderer {
  return value !== null && RENDERERS.includes(value);
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
