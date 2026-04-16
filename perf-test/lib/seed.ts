import { ANIM_NAMES, URL_PREFIX } from './constants';

export interface AnimEntry {
  name: string;
  url: string;
}

export function encodeSeed(names: string[]): string {
  return btoa(names.join(','));
}

export function decodeSeed(seed: string): string[] {
  try {
    return atob(seed).split(',').map((s) => s.trim()).filter(Boolean);
  } catch {
    return [];
  }
}

export function buildAnimList(names: string[]): AnimEntry[] {
  return names.map((name) => {
    const safe = ANIM_NAMES.includes(name) ? name : ANIM_NAMES[0];
    return { name: safe, url: `${URL_PREFIX}${safe}.json` };
  });
}

export function randomAnimList(count: number): AnimEntry[] {
  const names: string[] = [];
  for (let i = 0; i < count; i++) {
    names.push(ANIM_NAMES[Math.floor(Math.random() * ANIM_NAMES.length)]);
  }
  return buildAnimList(names);
}
