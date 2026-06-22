/**
 * FinalizationRegistry instances for automatic memory management
 */

import { getModule, hasModule } from './module';
import type { VideoResource } from '../core/media/Video';

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

// Used for emscripten function-table entries (addFunction)
function createFunctionRegistry(): FinalizationRegistry<number> {
  return new FinalizationRegistry<number>((funcPtr) => {
    if (hasModule()) {
      getModule().removeFunction(funcPtr);
    }
  });
}

// off-thread resources for media objects
function createMediaRegistry(): FinalizationRegistry<VideoResource> {
  return new FinalizationRegistry<VideoResource>((res) => {
    res.worker?.terminate();
    res.audio?.close();
    if (hasModule()) {
      if (res.ptr) getModule()._tvg_video_del(res.ptr);
      if (res.bufPtr) getModule()._free(res.bufPtr);
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

/**
 * Registry for Accessor objects
 */
export const accessorRegistry = createRegistry();

/**
 * Registry for Animation objects
 */
export const animationRegistry = createRegistry();

/**
 * Registry for callback functions
 */
export const callbackRegistry = createFunctionRegistry();

/**
 * Registry for Video objects
 */
export const videoRegistry = createMediaRegistry();

// Automatic cleanup on page unload (browser only)
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    if (hasModule()) {
      const Module = getModule();
      Module.term();
    }
  });
}
