import type { Surface } from './Surface';
import { ElementSurface } from './ElementSurface';

/**
 * Creates the surface matching the given canvas target.
 *
 * @returns The surface, or null when the target cannot be created.
 * @internal
 */
export function createSurface(target: string): Surface | null {
  const element = globalThis.document?.querySelector<HTMLCanvasElement>(target);
  return element ? new ElementSurface(element) : null;
}
