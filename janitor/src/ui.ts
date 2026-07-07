import pkg from '../node_modules/@thorvg/webcanvas/package.json';

const RENDERERS = [
  { value: 'sw', label: 'Software' },
  { value: 'gl', label: 'WebGL' },
  { value: 'wg', label: 'WebGPU' },
] as const;

let modalOpen = false;

export function isSettingsOpen(): boolean {
  return modalOpen;
}

export function initUI(renderer: string, engineVersion: string): void {
  const overlay = document.getElementById('modal-overlay')!;
  const btn = document.getElementById('settings-btn') as HTMLButtonElement;
  const closeBtn = document.getElementById('modal-close') as HTMLButtonElement;

  const open = (): void => {
    overlay.hidden = false;
    modalOpen = true;
  };
  const close = (): void => {
    overlay.hidden = true;
    modalOpen = false;
  };

  btn.addEventListener('click', () => {
    open();
    btn.blur(); //keep Space/A from re-triggering the button during gameplay
  });
  closeBtn.addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });
  window.addEventListener('keydown', (e) => {
    if (modalOpen && e.code === 'Escape') close();
  });

  //renderer options — switching reloads with the URL param
  const options = document.getElementById('renderer-options')!;
  for (const r of RENDERERS) {
    if (r.value === 'wg' && !('gpu' in navigator)) continue;
    const label = document.createElement('label');
    if (r.value === renderer) label.classList.add('active');

    const input = document.createElement('input');
    input.type = 'radio';
    input.name = 'renderer';
    input.value = r.value;
    input.checked = r.value === renderer;
    input.addEventListener('change', () => {
      const url = new URL(location.href);
      url.searchParams.set('renderer', r.value);
      location.href = url.href;
    });

    label.append(input, r.label);
    options.append(label);
  }

  //versions
  document.getElementById('ver-pkg')!.textContent = pkg.version;
  document.getElementById('ver-engine')!.textContent = engineVersion;

  //embed snippet
  const embedUrl = new URL(location.pathname, location.origin);
  embedUrl.searchParams.set('renderer', renderer);
  const snippet = [
    `<iframe src="${embedUrl.href}"`,
    '  width="960" height="540"',
    '  style="border:0;background:#000"',
    '  allow="fullscreen" loading="lazy"></iframe>',
  ].join('\n');

  const textarea = document.getElementById('embed-snippet') as HTMLTextAreaElement;
  textarea.value = snippet;

  const copyBtn = document.getElementById('embed-copy') as HTMLButtonElement;
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(snippet);
      copyBtn.textContent = 'Copied!';
    } catch {
      textarea.select();
      document.execCommand('copy');
      copyBtn.textContent = 'Copied!';
    }
    setTimeout(() => (copyBtn.textContent = 'Copy snippet'), 1500);
  });
}
