export type ThorVGVersion = 'local' | string;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThorVGModule = Record<string, any>;

let _cache: { version: ThorVGVersion; mod: ThorVGModule } | null = null;

export async function loadThorVGModule(version: ThorVGVersion): Promise<ThorVGModule> {
  if (_cache?.version === version) return _cache.mod;

  let mod: ThorVGModule;
  if (version === 'local') {
    mod = (await import('@thorvg/webcanvas')).default;
  } else {
    const url = `https://unpkg.com/@thorvg/webcanvas@${version}/dist/webcanvas.esm.js`;
    mod = (await import(/* webpackIgnore: true */ url as string)).default;
  }

  _cache = { version, mod };
  return mod;
}

export function getWasmUrl(version: ThorVGVersion, localWasmUrl: string): string {
  if (version === 'local') return localWasmUrl;
  return `https://unpkg.com/@thorvg/webcanvas@${version}/dist/thorvg.wasm`;
}

let _versionsCache: string[] | null = null;

export async function fetchNpmVersions(): Promise<string[]> {
  if (_versionsCache) return _versionsCache;
  try {
    const res = await fetch('https://registry.npmjs.org/@thorvg/webcanvas', {
      headers: { Accept: 'application/vnd.npm.install-v1+json' },
    });
    if (!res.ok) return [];
    const data = await res.json();
    const versions = Object.keys(data.versions ?? {}).reverse();
    _versionsCache = versions;
    return versions;
  } catch {
    return [];
  }
}
