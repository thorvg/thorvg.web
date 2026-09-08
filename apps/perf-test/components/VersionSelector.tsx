'use client';

import { useEffect, useRef, useState } from 'react';
import { fetchNpmVersions, type ThorVGVersion } from '../lib/thorvg-loader';

interface Props {
  current: ThorVGVersion;
  localVersion: string;
  onChange: (version: ThorVGVersion) => void;
}

export function VersionSelector({ current, localVersion, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const [versions, setVersions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch versions lazily when dropdown opens for the first time
  const handleOpen = async () => {
    setOpen((prev) => !prev);
    if (versions.length === 0 && !loading) {
      setLoading(true);
      const list = await fetchNpmVersions();
      setVersions(list);
      setLoading(false);
    }
  };

  const label = current === 'local' ? `Local (${localVersion})` : current;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="flex items-center gap-1.5 px-2.5 py-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded text-xs text-gray-300 hover:text-white transition-colors"
        title="Switch @thorvg/webcanvas version"
      >
        <svg className="w-3 h-3 text-brand shrink-0" viewBox="0 0 16 16" fill="currentColor">
          <path d="M8 1a7 7 0 1 0 0 14A7 7 0 0 0 8 1zm0 1.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zM8 4a.75.75 0 0 1 .75.75v3.19l2.28 1.32a.75.75 0 1 1-.75 1.3l-2.5-1.44A.75.75 0 0 1 7.25 8.5v-3.75A.75.75 0 0 1 8 4z"/>
        </svg>
        <span className="font-mono">{label}</span>
        <svg
          className={`w-3 h-3 text-gray-500 transition-transform ${open ? 'rotate-180' : ''}`}
          viewBox="0 0 16 16"
          fill="currentColor"
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-44 bg-gray-800 border border-white/10 rounded-lg shadow-xl z-50 overflow-hidden">
          <div className="max-h-64 overflow-y-auto">
            {/* Local option */}
            <button
              onClick={() => { setOpen(false); onChange('local'); }}
              className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                current === 'local' ? 'text-brand' : 'text-gray-300'
              }`}
            >
              <span className="font-mono">Local ({localVersion})</span>
              {current === 'local' && (
                <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
            </button>

            <div className="border-t border-white/10 mx-2 my-1" />

            {/* npm versions */}
            {loading && (
              <div className="px-3 py-3 text-xs text-gray-500 text-center">Loading versions…</div>
            )}
            {!loading && versions.length === 0 && (
              <div className="px-3 py-3 text-xs text-gray-500 text-center">Failed to load</div>
            )}
            {versions.map((v) => (
              <button
                key={v}
                onClick={() => { setOpen(false); onChange(v); }}
                className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between hover:bg-white/5 transition-colors ${
                  current === v ? 'text-brand' : 'text-gray-300'
                }`}
              >
                <span className="font-mono">{v}</span>
                {current === v && (
                  <svg className="w-3 h-3 shrink-0" viewBox="0 0 16 16" fill="currentColor">
                    <path d="M2 8l4 4 8-8" stroke="currentColor" strokeWidth="1.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
