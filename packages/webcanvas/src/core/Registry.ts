/**
 * FinalizationRegistry instances for automatic memory management
 */

import { getModule, hasModule } from './Module';

export interface RegistryToken {
  ptr: number;
  cleanup: (ptr: number) => void;
}

/**
 * Registry for Shape objects
 */
export const shapeRegistry = new FinalizationRegistry<RegistryToken>((heldValue) => {
  if (heldValue.ptr && hasModule()) {
    heldValue.cleanup(heldValue.ptr);
  }
});

/**
 * Registry for Scene objects
 */
export const sceneRegistry = new FinalizationRegistry<RegistryToken>((heldValue) => {
  if (heldValue.ptr && hasModule()) {
    heldValue.cleanup(heldValue.ptr);
  }
});

/**
 * Registry for Picture objects
 */
export const pictureRegistry = new FinalizationRegistry<RegistryToken>((heldValue) => {
  if (heldValue.ptr && hasModule()) {
    heldValue.cleanup(heldValue.ptr);
  }
});

/**
 * Registry for Text objects
 */
export const textRegistry = new FinalizationRegistry<RegistryToken>((heldValue) => {
  if (heldValue.ptr && hasModule()) {
    heldValue.cleanup(heldValue.ptr);
  }
});

/**
 * Registry for gradient fills
 */
export const gradientRegistry = new FinalizationRegistry<RegistryToken>((heldValue) => {
  if (heldValue.ptr && hasModule()) {
    heldValue.cleanup(heldValue.ptr);
  }
});

// Automatic cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (hasModule()) {
      const Module = getModule();
      Module.term();
    }
  });
}

// For Node.js or other environments
if (typeof process !== 'undefined' && process.on) {
  process.on('exit', () => {
    if (hasModule()) {
      const Module = getModule();
      Module.term();
    }
  });
}
