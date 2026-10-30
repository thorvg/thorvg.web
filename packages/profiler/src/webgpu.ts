type Category = 'buffer' | 'texture' | 'canvas' | 'querySet';

export interface WebGPUMemoryUsage {
  total: number;
  peak: number;
  breakdown: Record<Category, number>;
  resources: Record<Category, number>;
}

interface TextureShape {
  format: string;
  width: number;
  height: number;
  depthOrArrayLayers: number;
  mipLevelCount: number;
  sampleCount: number;
  dimension: string;
}

interface Device {
  lost: Promise<unknown>;
}

interface CanvasContext {
  canvas: { width: number; height: number };
}

interface GPUGlobals {
  GPUDevice?: { prototype: object };
  GPUBuffer: { prototype: object };
  GPUTexture: { prototype: object };
  GPUQuerySet: { prototype: object };
  GPUCanvasContext: { prototype: object };
}

interface Entry {
  category: Category;
  bytes: number;
  owner: Set<Entry>;
  live: boolean;
}

const kTexturesPerCanvas = 2;

const kBytesPerTexel: Record<string, number> = {
  r8unorm: 1,
  rg8unorm: 2,
  rgba8unorm: 4,
  'rgba8unorm-srgb': 4,
  bgra8unorm: 4,
  'bgra8unorm-srgb': 4,
  rgba16float: 8,
  stencil8: 1,
  depth16unorm: 2,
  depth24plus: 4,
  'depth24plus-stencil8': 4,
  depth32float: 4,
};

const entries = new WeakMap<object, Entry>();
const devices = new WeakMap<Device, Set<Entry>>();
const finalizer = new FinalizationRegistry<Entry>(release);
const warned = new Set<string>();
const breakdown: Record<Category, number> = { buffer: 0, texture: 0, canvas: 0, querySet: 0 };
const resources: Record<Category, number> = { buffer: 0, texture: 0, canvas: 0, querySet: 0 };
let total = 0;
let peak = 0;
let installed = false;
let tracking = false;

function textureBytes(texture: TextureShape): number {
  const texel = kBytesPerTexel[texture.format];
  if (texel === undefined) {
    if (!warned.has(texture.format)) {
      warned.add(texture.format);
      console.warn(`@thorvg/profiler: unknown texture format '${texture.format}', counted as 0 bytes`);
    }
    return 0;
  }
  let bytes = 0;
  let width = texture.width;
  let height = texture.height;
  let depth = texture.depthOrArrayLayers;
  for (let level = 0; level < texture.mipLevelCount; level++) {
    bytes += width * height * depth * texel * texture.sampleCount;
    width = Math.max(1, width >> 1);
    height = Math.max(1, height >> 1);
    if (texture.dimension === '3d') depth = Math.max(1, depth >> 1);
  }
  return bytes;
}

function canvasBytes(context: CanvasContext, format: string): number {
  const { width, height } = context.canvas;
  return textureBytes({ format, width, height, depthOrArrayLayers: 1, mipLevelCount: 1, sampleCount: 1, dimension: '2d' }) * kTexturesPerCanvas;
}

function ownerOf(device: Device): Set<Entry> {
  let owner = devices.get(device);
  if (!owner) {
    const set = new Set<Entry>();
    devices.set(device, set);
    tracking = true;
    device.lost.then(() => {
      for (const entry of set) release(entry);
    });
    owner = set;
  }
  return owner;
}

function resize(entry: Entry, bytes: number): void {
  const delta = bytes - entry.bytes;
  entry.bytes = bytes;
  breakdown[entry.category] += delta;
  total += delta;
  peak = Math.max(peak, total);
}

function track(object: object, device: Device, category: Category, bytes: number): void {
  const owner = ownerOf(device);
  const entry: Entry = { category, bytes: 0, owner, live: true };
  entries.set(object, entry);
  owner.add(entry);
  finalizer.register(object, entry, entry);
  resources[category]++;
  resize(entry, bytes);
}

function release(entry: Entry): void {
  if (!entry.live) return;
  entry.live = false;
  resources[entry.category]--;
  resize(entry, 0);
  entry.owner.delete(entry);
  finalizer.unregister(entry);
}

function free(object: object): void {
  const entry = entries.get(object);
  if (entry) release(entry);
}

function wrap<S, R, A extends unknown[] = unknown[]>(proto: object, name: string, after: (self: S, result: R, args: A) => void): void {
  const methods = proto as Record<string, (this: unknown, ...args: unknown[]) => unknown>;
  const original = methods[name]!;
  methods[name] = function (this: unknown, ...args: unknown[]) {
    const result = original.apply(this, args);
    after(this as S, result as R, args as A);
    return result;
  };
}

export function install(): void {
  const g = globalThis as unknown as GPUGlobals;
  if (installed || !g.GPUDevice) return;
  installed = true;

  wrap(g.GPUDevice.prototype, 'createBuffer', (device: Device, buffer: { size: number }) => track(buffer, device, 'buffer', buffer.size));
  wrap(g.GPUDevice.prototype, 'createTexture', (device: Device, texture: TextureShape) => track(texture, device, 'texture', textureBytes(texture)));
  wrap(g.GPUDevice.prototype, 'createQuerySet', (device: Device, querySet: { count: number }) => track(querySet, device, 'querySet', querySet.count * 8));
  wrap(g.GPUBuffer.prototype, 'destroy', free);
  wrap(g.GPUTexture.prototype, 'destroy', free);
  wrap(g.GPUQuerySet.prototype, 'destroy', free);

  wrap(g.GPUCanvasContext.prototype, 'configure', (context: CanvasContext, _: unknown, [config]: [{ device: Device; format: string }]) => {
    free(context);
    track(context, config.device, 'canvas', canvasBytes(context, config.format));
  });
  wrap(g.GPUCanvasContext.prototype, 'unconfigure', free);
  wrap(g.GPUCanvasContext.prototype, 'getCurrentTexture', (context: CanvasContext, texture: TextureShape) => {
    const entry = entries.get(context);
    if (entry?.live) resize(entry, textureBytes(texture) * kTexturesPerCanvas);
  });
}

export function usage(): WebGPUMemoryUsage {
  return { total, peak, breakdown: { ...breakdown }, resources: { ...resources } };
}

export function resetPeak(): void {
  peak = total;
}

export function active(): boolean {
  return tracking;
}
