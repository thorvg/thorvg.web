import type { GpuMemory, MemorySample } from './types';
import * as webgl from './webgl';
import * as webgpu from './webgpu';
import * as wasmMemory from './wasm';
import { el, metric, row, shell, sparkline, type Metric, type Row } from './panel';

const SAMPLE_MS = 1000;
const HISTORY = 60;

type Key = 'fps' | 'js' | 'wasm' | 'gpu' | 'total';

const toMB = (bytes: number) => bytes / 1048576;

export default class Profiler {
  readonly dom: HTMLElement;

  #frames = 0;
  #manual = false;
  #raf = 0;
  #timer: ReturnType<typeof setInterval>;
  #windowStart = performance.now();
  #windowFrames = 0;
  #fps = 0;
  #open = false;
  #sampled = false;
  #history: Record<Key, number[]> = { fps: [], js: [], wasm: [], gpu: [], total: [] };
  #sum: Record<Key, { acc: number; count: number }> = {
    fps: { acc: 0, count: 0 }, js: { acc: 0, count: 0 }, wasm: { acc: 0, count: 0 }, gpu: { acc: 0, count: 0 }, total: { acc: 0, count: 0 },
  };
  #ui: { details: HTMLElement; arrow: HTMLElement; fps: Metric; mem: Metric; js: Row; wasm: Row; gpu: Row };

  constructor() {
    const { host, details, bar } = shell();
    this.dom = host;

    const fps = metric('FPS', '#00deb5', sparkline('#00deb5', { min: 0 }));
    const fpsCell = el('div', 'cell');
    fpsCell.append(fps.element);

    const mem = metric('MEM', '#a78bfa', sparkline('#a78bfa'));
    const arrow = el('span', 'arrow', '▴');
    const memCell = el('button', 'cell');
    memCell.title = 'Total memory in MB, JS + WASM + GPU';
    memCell.append(mem.element, arrow);
    memCell.addEventListener('click', () => {
      this.#open = !this.#open;
      this.#render();
    });
    bar.append(fpsCell, el('div', 'divider'), memCell);

    const js = row('JS', '#d1d5db', 'Used JS heap (Chromium only)');
    const wasm = row('WASM', '#38bdf8', 'Committed wasm memory, high-water mark');
    const gpu = row('GPU', '#fbbf24', 'GPU buffers, textures and canvas');
    details.append(js.element, wasm.element, gpu.element);

    this.#ui = { details, arrow, fps, mem, js, wasm, gpu };
    this.#timer = setInterval(() => this.#sample(), SAMPLE_MS);
    this.#tick();
  }

  frame(): void {
    if (!this.#manual) {
      this.#manual = true;
      cancelAnimationFrame(this.#raf);
      this.#frames = 0;
      this.#windowFrames = 0;
      this.#windowStart = performance.now();
    }
    this.#frames++;
  }

  get fps(): number {
    return this.#fps;
  }

  get tracksGpu(): boolean {
    return webgl.active() || webgpu.active();
  }

  memory(): MemorySample {
    return { js: js(), wasm: wasm(), gpu: gpu() };
  }

  resetPeak(): void {
    webgl.resetPeak();
    webgpu.resetPeak();
  }

  dispose(): void {
    clearInterval(this.#timer);
    cancelAnimationFrame(this.#raf);
    this.dom.remove();
  }

  #tick = () => {
    this.#frames++;
    this.#raf = requestAnimationFrame(this.#tick);
  };

  #sample(): void {
    const now = performance.now();
    this.#fps = ((this.#frames - this.#windowFrames) * 1000) / (now - this.#windowStart);
    this.#windowStart = now;
    this.#windowFrames = this.#frames;

    const mem = this.memory();
    this.#add('fps', this.#fps);
    if (mem.js !== null) this.#add('js', toMB(mem.js));
    if (mem.wasm !== null) this.#add('wasm', toMB(mem.wasm));
    if (mem.gpu) this.#add('gpu', toMB(mem.gpu.total));
    this.#add('total', toMB((mem.js ?? 0) + (mem.wasm ?? 0) + (mem.gpu?.total ?? 0)));
    this.#sampled = true;
    this.#render(mem);
  }

  #add(key: Key, value: number): void {
    const values = this.#history[key];
    values.push(value);
    if (values.length > HISTORY) values.shift();
    const running = this.#sum[key];
    running.acc += value;
    running.count++;
  }

  #avg(key: Key): number {
    const { acc, count } = this.#sum[key];
    return count ? acc / count : 0;
  }

  #render(mem?: MemorySample): void {
    const ui = this.#ui;
    const history = this.#history;
    ui.arrow.textContent = this.#open ? '▾' : '▴';
    ui.details.hidden = !(this.#open && this.#sampled);
    if (!mem) return;

    ui.fps.set(`${Math.round(this.#fps)} (${Math.round(this.#avg('fps'))})`, history.fps);
    ui.mem.set(`${Math.round(history.total[history.total.length - 1]!)} MB (${Math.round(this.#avg('total'))})`, history.total);

    const mb = (value: number | null, key: Key) => (value === null ? 'n/a' : `${toMB(value).toFixed(1)} MB (${this.#avg(key).toFixed(1)})`);
    ui.js.set(mb(mem.js, 'js'), history.js);
    ui.wasm.set(mb(mem.wasm, 'wasm'), history.wasm);
    ui.gpu.element.hidden = !this.tracksGpu;
    ui.gpu.set(mb(mem.gpu?.total ?? null, 'gpu'), history.gpu);
  }
}

function js(): number | null {
  return (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory?.usedJSHeapSize ?? null;
}

function wasm(): number | null {
  return wasmMemory.usage();
}

function gpu(): GpuMemory | null {
  const usage = webgpu.active() ? webgpu.usage() : webgl.usage();
  if (!usage) return null;
  return { ...usage, resources: nonZero(usage.resources) };
}

function nonZero(counts: Record<string, number>): Record<string, number> {
  const out: Record<string, number> = {};
  for (const [k, v] of Object.entries(counts)) if (v) out[k] = v;
  return out;
}
