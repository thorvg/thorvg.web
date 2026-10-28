import type { RendererType } from '@thorvg/webcanvas';

const RENDERERS: readonly string[] = ['sw', 'gl', 'wg'];

export function isRenderer(value: string | null): value is RendererType {
  return value !== null && RENDERERS.includes(value);
}

export function readRendererFromUrl(search: string): RendererType {
  const raw = new URLSearchParams(search).get('renderer');
  return isRenderer(raw) ? raw : 'gl';
}

export function readRendererParam(search: string): RendererType | null {
  const raw = new URLSearchParams(search).get('renderer');
  return isRenderer(raw) ? raw : null;
}

export function buildExampleUrl(exampleId: string, rendererParam: RendererType | null): string {
  const pathname = `/showcase/${exampleId}`;
  if (!rendererParam) return pathname;
  return `${pathname}?${new URLSearchParams({ renderer: rendererParam })}`;
}
