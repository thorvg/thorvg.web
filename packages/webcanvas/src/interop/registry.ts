/**
 * FinalizationRegistry instances for automatic memory management
 */

import { getModule, hasModule } from './module';

export interface RegistryToken {
  ptr: number;
  cleanup: (ptr: number) => void;
}

function createRegistry(): FinalizationRegistry<RegistryToken> {
  return new FinalizationRegistry<RegistryToken>((heldValue) => {
    if (heldValue.ptr && hasModule()) {
      heldValue.cleanup(heldValue.ptr);
    }
  });
}

/**
 * Registry for Shape objects
 */
export const shapeRegistry = createRegistry();

/**
 * Registry for Scene objects
 */
export const sceneRegistry = createRegistry();

/**
 * Registry for Picture objects
 */
export const pictureRegistry = createRegistry();

/**
 * Registry for Text objects
 */
export const textRegistry = createRegistry();

/**
 * Registry for gradient fills
 */
export const gradientRegistry = createRegistry();

// Automatic cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (hasModule()) {
      const Module = getModule();
      Module.term();
    }
  });
}
