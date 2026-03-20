/**
 * Fontsource CDN font provider.
 * @category Font
 */

import type { FontProvider, FontProviderResult } from '../core/FontProvider';

const FONTSOURCE_CDN = 'https://cdn.jsdelivr.net/fontsource/fonts';

/**
 * Options for loading a font from the fontsource CDN.
 * @category Font
 */
export interface FontsourceOptions {
  /**
   * Font weight to load.
   * @default 400
   */
  weight?: 100 | 200 | 300 | 400 | 500 | 600 | 700 | 800 | 900;
  /**
   * Font style to load.
   * @default 'normal'
   */
  style?: 'normal' | 'italic';
  /**
   * Unicode subset to load.
   * @default 'latin'
   */
  subset?: string;
}

/**
 * Font provider that fetches fonts from the [fontsource](https://fontsource.org) CDN.
 *
 * This is the default provider used by {@link Font.load} when no raw data is supplied.
 *
 * @category Font
 *
 * @example
 * ```typescript
 * // Restore to default (if you previously swapped it out)
 * TVG.Font.setProvider(new FontsourceProvider());
 * ```
 */
export class FontsourceProvider implements FontProvider {
  async fetch(name: string, options?: FontsourceOptions): Promise<FontProviderResult> {
    const opts = {
      weight: 400 as const,
      style: 'normal' as const,
      subset: 'latin',
      ...options,
    };

    const slug = name.toLowerCase().replace(/\s+/g, '-');
    const url = `${FONTSOURCE_CDN}/${slug}@latest/${opts.subset}-${opts.weight}-${opts.style}.ttf`;

    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(
        `Font "${name}" could not be loaded from fontsource (HTTP ${res.status}). ` +
        `Check that the font exists at https://fontsource.org/fonts/${slug}`,
      );
    }

    return {
      data: new Uint8Array(await res.arrayBuffer()),
      type: 'ttf',
    };
  }
}
