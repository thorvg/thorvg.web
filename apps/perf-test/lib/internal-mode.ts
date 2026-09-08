'use client';

import { useEffect, useState } from 'react';

// State saved in the session
const KEY = 'tvg-internal';

declare global {
  interface Window {
    __tvg?: { internal: (on?: boolean) => void };
  }
}

export function isInternalMode(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return sessionStorage.getItem(KEY) === '1';
  } catch {
    return false;
  }
}

function installConsoleCommand(): void {
  if (window.__tvg) return;
  window.__tvg = {
    internal(on: boolean = true) {
      try {
        if (on) sessionStorage.setItem(KEY, '1');
        else sessionStorage.removeItem(KEY);
      } catch { /* */ }
      window.location.reload();
    },
  };
}

export function useInternalMode(): boolean {
  const [enabled, setEnabled] = useState(false);
  useEffect(() => {
    installConsoleCommand();
    setEnabled(isInternalMode());
  }, []);
  return enabled;
}
