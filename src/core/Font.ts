/**
 * Load and manage fonts
 * @category Font
 */

import { getModule } from '../interop/module';
import { checkResult } from '../common/errors';
import { FontRegistry } from '../utils/FontRegistry';

/**
 * Supported font file types.
 * - `'ttf'`: TrueType Font
 * @category Font
 */
export type FontType = 'ttf';

/**
 * @category Font
 */
export interface LoadFontOptions {
  /** Font type ('ttf') */
  type?: FontType;
}

/**
 * Options for loading a font from fontsource CDN.
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

/** @internal */
const FONTSOURCE_CDN = 'https://cdn.jsdelivr.net/fontsource/fonts';

/**
 * Font loader class for managing custom fonts.
 * Fonts are loaded globally and can be referenced by name in Text objects.
 * @category Font
 *
 * @example
 * ```typescript
 * // Load font from raw data
 * const fontData = await fetch('/fonts/Roboto-Regular.ttf').then(r => r.arrayBuffer());
 * TVG.Font.load('Roboto', new Uint8Array(fontData));
 *
 * const text = new TVG.Text();
 * text.font('Roboto').fontSize(48).text('Hello!').fill(50, 50, 50);
 * ```
 *
 * @example
 * ```typescript
 * // Auto-load from fontsource CDN (no manual fetch needed)
 * await TVG.Font.load('poppins');
 * await TVG.Font.load('roboto', { weight: 700, style: 'italic' });
 *
 * const text = new TVG.Text();
 * text.font('poppins').fontSize(48).text('Hello!').fill(50, 50, 50);
 * ```
 */
export class Font {
  /**
   * Load font from raw data (Uint8Array)
   * @param name - Unique name to identify this font
   * @param data - Raw font data
   * @param options - Load options
   */
  public static load(name: string, data: Uint8Array, options?: LoadFontOptions): void;

  /**
   * Auto-load a font from the fontsource CDN
   *
   * The font name must match a package on fontsource (e.g. `'poppins'`, `'roboto'`).
   * Calling this multiple times with the same arguments is safe — the CDN is only
   * fetched once regardless of how many times you call it.
   *
   * @param name - Font slug as it appears on fontsource (e.g. `'poppins'`, `'open-sans'`)
   * @param options - Weight, style, and subset options
   *
   * @example
   * ```typescript
   * await TVG.Font.load('poppins');
   * await TVG.Font.load('roboto', { weight: 700 });
   * await TVG.Font.load('noto-sans', { subset: 'latin-ext' });
   * ```
   */
  public static load(name: string, options?: FontsourceOptions): Promise<void>;

  public static load(
    name: string,
    dataOrOptions?: Uint8Array | FontsourceOptions,
    loadOptions?: LoadFontOptions,
  ): void | Promise<void> {
    if (dataOrOptions instanceof Uint8Array) {
      Font._loadData(name, dataOrOptions, loadOptions);
      return;
    }

    const opts = {
      weight: 400,
      style: 'normal' as const,
      subset: 'latin',
      ...dataOrOptions,
    };

    const key = `${name.toLowerCase()}:${opts.subset}:${opts.weight}:${opts.style}`;

    return FontRegistry.ensure(key, async () => {
      const slug = name.toLowerCase().replace(/\s+/g, '-');
      const url = `${FONTSOURCE_CDN}/${slug}@latest/${opts.subset}-${opts.weight}-${opts.style}.ttf`;

      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(
          `Font "${name}" could not be loaded from fontsource (HTTP ${res.status}). ` +
          `Check that the font exists at https://fontsource.org/fonts/${slug}`,
        );
      }

      Font._loadData(name, new Uint8Array(await res.arrayBuffer()), { type: 'ttf' });
    });
  }

  /**
   * Unload a previously loaded font.
   * @param name - Font name to unload
   */
  public static unload(name: string): void {
    const Module = getModule();

    const namePtr = Module._malloc(name.length + 1);
    Module.HEAPU8.set(new TextEncoder().encode(name), namePtr);
    Module.HEAPU8[namePtr + name.length] = 0;

    try {
      const result = Module._tvg_font_unload(namePtr);
      checkResult(result, `Font.unload("${name}")`);
    } finally {
      Module._free(namePtr);
    }
  }

  /** @internal */
  private static _loadData(name: string, data: Uint8Array, options: LoadFontOptions = {}): void {
    const Module = getModule();
    const { type = 'ttf' } = options;

    const namePtr = Module._malloc(name.length + 1);
    Module.HEAPU8.set(new TextEncoder().encode(name), namePtr);
    Module.HEAPU8[namePtr + name.length] = 0;

    const dataPtr = Module._malloc(data.length);
    Module.HEAPU8.set(data, dataPtr);

    const mimePtr = Module._malloc(type.length + 1);
    Module.HEAPU8.set(new TextEncoder().encode(type), mimePtr);
    Module.HEAPU8[mimePtr + type.length] = 0;

    try {
      const result = Module._tvg_font_load_data(namePtr, dataPtr, data.length, mimePtr, 1);
      checkResult(result, `Font.load("${name}")`);
    } finally {
      Module._free(namePtr);
      Module._free(dataPtr);
      Module._free(mimePtr);
    }
  }
}
