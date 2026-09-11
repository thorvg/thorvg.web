export function getParam(name: string, fallback: string): string {
  if (typeof window === 'undefined') return fallback;
  return new URLSearchParams(window.location.search).get(name) ?? fallback;
}

export function setParam(name: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(name, value);
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}

export function setParams(entries: Record<string, string>) {
  const params = new URLSearchParams(window.location.search);
  for (const [k, v] of Object.entries(entries)) params.set(k, v);
  window.history.replaceState({}, '', `${window.location.pathname}?${params}`);
}
