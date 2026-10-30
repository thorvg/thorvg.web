import STYLE from './style';

const SVG = 'http://www.w3.org/2000/svg';

export interface Sparkline {
  element: SVGSVGElement;
  update(values: number[]): void;
}

export function sparkline(color: string, { width = 56, height = 18, min, fluid = false }: { width?: number; height?: number; min?: number; fluid?: boolean } = {}): Sparkline {
  const svg = document.createElementNS(SVG, 'svg');
  svg.setAttribute('width', fluid ? '100%' : String(width));
  svg.setAttribute('height', String(height));
  svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
  svg.setAttribute('preserveAspectRatio', 'none');

  const area = document.createElementNS(SVG, 'polygon');
  area.setAttribute('fill', color);
  area.setAttribute('fill-opacity', '0.15');
  const line = document.createElementNS(SVG, 'polyline');
  line.setAttribute('fill', 'none');
  line.setAttribute('stroke', color);
  line.setAttribute('stroke-width', '1.25');
  line.setAttribute('stroke-linejoin', 'round');
  line.setAttribute('vector-effect', 'non-scaling-stroke');
  svg.append(area, line);

  return {
    element: svg,
    update(values) {
      if (values.length < 2) {
        area.removeAttribute('points');
        line.removeAttribute('points');
        return;
      }
      const lo = min ?? Math.min(...values);
      const hi = Math.max(...values);
      const range = hi - lo || 1;
      const step = width / (values.length - 1);
      const x1 = (values.length - 1) * step;
      const pts = values.map((value, index) => `${(index * step).toFixed(1)},${(height - 1 - ((value - lo) / range) * (height - 2)).toFixed(1)}`).join(' ');
      area.setAttribute('points', `0,${height} ${pts} ${x1.toFixed(1)},${height}`);
      line.setAttribute('points', pts);
    },
  };
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

export interface Metric {
  element: HTMLElement;
  set(text: string, values: number[]): void;
}

export function metric(label: string, color: string, spark: Sparkline): Metric {
  const root = el('div', 'metric');
  const head = el('div', '');
  const value = el('span', 'value', '–');
  value.style.color = color;
  head.append(el('span', 'label', label), value);
  root.append(head, spark.element);
  return {
    element: root,
    set(text, values) {
      value.textContent = text;
      spark.update(values);
    },
  };
}

export interface Row {
  element: HTMLElement;
  set(text: string, values: number[]): void;
}

export function row(label: string, color: string, hint: string): Row {
  const root = el('div', 'row');
  root.title = hint;
  const value = el('span', 'value', 'n/a');
  value.style.color = color;
  const spark = sparkline(color, { width: 120, fluid: true });
  root.append(el('span', 'label', label), value, spark.element);
  return {
    element: root,
    set(text, values) {
      value.textContent = text;
      spark.update(values);
    },
  };
}

export function shell(): { host: HTMLElement; root: HTMLElement; details: HTMLElement; bar: HTMLElement } {
  const host = document.createElement('div');
  host.setAttribute('data-thorvg-profiler', '');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = document.createElement('style');
  style.textContent = STYLE;
  const root = el('div', 'root');
  const details = el('div', 'box details');
  details.hidden = true;
  const bar = el('div', 'box bar');
  root.append(details, bar);
  shadow.append(style, root);
  return { host, root, details, bar };
}

export { el };
