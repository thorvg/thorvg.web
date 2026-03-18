/**
 * Font provider abstraction for pluggable font sources.
 * @category Font
 */

import type { FontType } from './Font';

/**
 * Result returned by a {@link FontProvider} after fetching font data.
 * @category Font
 */
export interface FontProviderResult {
  /** Raw font binary data */
  data: Uint8Array;
  /** Font format */
  type: FontType;
}

/**
 * Interface for pluggable font sources.
 *
 * A font provider resolves a font name into binary font data.
 * Implement this interface to load fonts from any source — a self-hosted
 * CDN, a local server, or any custom storage.
 *
 * @category Font
 * @beta
 *
 * @example
 * ```typescript
 * TVG.Font.provider({
 *   fetch: async (name) => {
 *     const res = await fetch(`/my-fonts/${name}.ttf`);
 *     return { data: new Uint8Array(await res.arrayBuffer()), type: 'ttf' };
 *   }
 * });
 *
 * await TVG.Font.load('my-font');
 * ```
 */
export interface FontProvider {
  /**
   * Fetch font data by name.
   * @param name - Font name as provided by the caller
   * @param options - Provider-specific options
   * @returns Font binary data and format
   */
  fetch(name: string, options?: Record<string, unknown>): Promise<FontProviderResult>;
}
