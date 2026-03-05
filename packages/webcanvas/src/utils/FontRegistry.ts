/**
 * Font registry for tracking fontsource CDN fetch state.
 * @internal
 */
export class FontRegistry {
  private static readonly _loaded = new Set<string>();
  private static readonly _pending = new Map<string, Promise<void>>();

  /**
   * Ensure a font is loaded once.
   */
  static ensure(key: string, loader: () => Promise<void>): Promise<void> {
    if (this._loaded.has(key)) {
      return Promise.resolve();
    }

    if (this._pending.has(key)) {
      return this._pending.get(key)!;
    }

    const promise = loader()
      .then(() => {
        this._loaded.add(key);
        this._pending.delete(key);
      })
      .catch((err) => {
        // Remove on failure so the caller can retry if desired
        this._pending.delete(key);
        throw err;
      });

    this._pending.set(key, promise);
    return promise;
  }
}
