import type { CanvasTarget } from '../../common/constants';
import type { Surface } from './Surface';
import { ElementSurface } from './ElementSurface';
import { OffscreenSurface } from './OffscreenSurface';

/**
 * Creates the surface matching the given canvas target.
 *
 * @returns The surface, or null when the target cannot be created.
 * @internal
 */
export function createSurface(target: CanvasTarget): Surface | null {
  if (typeof OffscreenCanvas !== 'undefined' && target instanceof OffscreenCanvas) {
    return new OffscreenSurface(target);
  }

  let element: HTMLCanvasElement | null = null;
  if (target instanceof HTMLCanvasElement) {
    element = target;
  } else if (typeof target === 'string') {
    element = globalThis.document?.querySelector<HTMLCanvasElement>(target);
  }

  return element ? new ElementSurface(element) : null;
}
