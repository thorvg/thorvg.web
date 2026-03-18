/**
 * Load and manage fonts
 * @category Font
 */

import { getModule } from '../interop/module';
import { checkResult } from '../common/errors';
import type { FontProvider } from './FontProvider';
import { FontsourceProvider } from '../providers/FontsourceProvider';

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
 * Font loader class for managing custom fonts.
 * Fonts are loaded globally and can be referenced by name in {@link Text} objects.
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
 * // Auto-load from the configured font provider (fontsource CDN by default)
 * await TVG.Font.load('poppins');
 * await TVG.Font.load('roboto', { weight: 700, style: 'italic' });
 *
 * const text = new TVG.Text();
 * text.font('poppins').fontSize(48).text('Hello!').fill(50, 50, 50);
 * ```
 *
 * @example
 * ```typescript
 * // Use a custom font provider
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
export class Font {
  private static _provider: FontProvider = new FontsourceProvider();
  private static readonly _loaded = new Set<string>();

  /**
   * Set the font provider used when calling `Font.load()` without raw data.
   *
   * The default provider fetches from the [fontsource](https://fontsource.org) CDN.
   * Replace it to load fonts from your own CDN or any other source.
   *
   * @param provider - A {@link FontProvider} implementation
   * @beta
   *
   * @example
   * ```typescript
   * TVG.Font.provider({
   *   fetch: async (name) => {
   *     const res = await fetch(`https://my-cdn.com/fonts/${name}.ttf`);
   *     return { data: new Uint8Array(await res.arrayBuffer()), type: 'ttf' };
   *   }
   * });
   * ```
   */
  public static provider(provider: FontProvider): void {
    Font._provider = provider;
  }


  /**
   * Load font from raw data.
   * @param name - Unique name to identify this font
   * @param data - Raw font binary data
   * @param options - Load options
   */
  public static load(name: string, data: Uint8Array, options?: LoadFontOptions): void;

  /**
   * Auto-load a font using the configured font provider.
   *
   * With the default {@link FontsourceProvider}, the name must match a fontsource
   * package slug (e.g. `'poppins'`, `'open-sans'`).
   *
   * @param name - Font name passed to the provider
   * @param options - Provider-specific options (see {@link FontsourceOptions} for defaults)
   *
   * @example
   * ```typescript
   * await TVG.Font.load('poppins');
   * await TVG.Font.load('roboto', { weight: 700 });
   * await TVG.Font.load('noto-sans', { subset: 'latin-ext' });
   * ```
   */
  public static load(name: string, options?: Record<string, unknown>): Promise<void>;

  public static load(
    name: string,
    dataOrOptions?: Uint8Array | Record<string, unknown>,
    loadOptions?: LoadFontOptions,
  ): void | Promise<void> {
    if (dataOrOptions instanceof Uint8Array) {
      Font._loadData(name, dataOrOptions, loadOptions);
      return;
    }

    if (Font._loaded.has(name)) {
      return Promise.resolve();
    }

    Font._loaded.add(name);

    return Font._provider
      .fetch(name, dataOrOptions)
      .then((result) => {
        Font._loadData(name, result.data, { type: result.type });
      })
      .catch((err) => {
        Font._loaded.delete(name);
        throw err;
      });
  }

  /**
   * Unload a previously loaded font.
   * @param name - Font name to unload
   */
  public static unload(name: string): void {
    Font._loaded.delete(name);
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
