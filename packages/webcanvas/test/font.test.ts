import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { ThorVGNamespace } from '../src/index';
import { ThorVGError } from '../src/common/errors';

function getTVG(): ThorVGNamespace {
  return (globalThis as any).__TVG;
}

describe('Font', () => {
  it('load with empty data throws', () => {
    const TVG = getTVG();
    expect(() => TVG.Font.load('test-font', new Uint8Array(0))).toThrow();
  });

  it('unload non-existent font throws ThorVGError', () => {
    const TVG = getTVG();
    expect(() => TVG.Font.unload('nonexistent')).toThrow(ThorVGError);
  });
});

describe('Fontsource', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('fetches from fontsource CDN with default options', async () => {
    const TVG = getTVG();
    const fakeFont = new Uint8Array([0, 1, 2, 3]);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(fakeFont.buffer, { status: 200 }),
    );

    await expect(TVG.Font.load('poppins')).rejects.toThrow();

    expect(fetchSpy).toHaveBeenCalledOnce();
    expect(fetchSpy).toHaveBeenCalledWith(
      'https://cdn.jsdelivr.net/fontsource/fonts/poppins@latest/latin-400-normal.ttf',
    );
  });

  it('respects weight, style, and subset options', async () => {
    const TVG = getTVG();
    const fakeFont = new Uint8Array([0, 1, 2, 3]);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(fakeFont.buffer, { status: 200 }),
    );

    await expect(
      TVG.Font.load('roboto', { weight: 700, style: 'italic', subset: 'latin-ext' }),
    ).rejects.toThrow();

    expect(fetchSpy).toHaveBeenCalledWith(
      'https://cdn.jsdelivr.net/fontsource/fonts/roboto@latest/latin-ext-700-italic.ttf',
    );
  });

  it('does not fetch twice for the same font (deduplication)', async () => {
    const TVG = getTVG();
    const fakeFont = new Uint8Array([0, 1, 2, 3]);

    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(fakeFont.buffer, { status: 200 }),
    );

    const p1 = TVG.Font.load('poppins') as Promise<void>;
    const p2 = TVG.Font.load('poppins') as Promise<void>;

    await Promise.allSettled([p1, p2]);
    expect(fetchSpy).toHaveBeenCalledOnce();
  });

  it('throws an error when font is not found on CDN', async () => {
    const TVG = getTVG();

    vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(null, { status: 404 }),
    );

    await expect(TVG.Font.load('nonexistent-font-xyz')).rejects.toThrow();
  });
});
