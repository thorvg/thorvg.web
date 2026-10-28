const seen = new WeakSet<WebAssembly.Memory>();
let memories: WeakRef<WebAssembly.Memory>[] = [];
let installed = false;

function add(memory: unknown): void {
  if (!(memory instanceof WebAssembly.Memory) || seen.has(memory)) return;
  seen.add(memory);
  memories.push(new WeakRef(memory));
}

function collect(instance: WebAssembly.Instance): void {
  for (const value of Object.values(instance.exports)) add(value);
}

type Instantiate = (...args: unknown[]) => Promise<WebAssembly.Instance | WebAssembly.WebAssemblyInstantiatedSource>;

function construct<T extends new (...args: never[]) => object>(Ctor: T, after: (result: InstanceType<T>) => void): T {
  return new Proxy(Ctor, {
    construct(target, args, newTarget) {
      const result = Reflect.construct(target, args, newTarget) as InstanceType<T>;
      after(result);
      return result;
    },
  });
}

function instantiate(name: 'instantiate' | 'instantiateStreaming'): void {
  const api = WebAssembly as unknown as Record<string, Instantiate | undefined>;
  const original = api[name];
  if (typeof original !== 'function') return;
  api[name] = function (this: unknown, ...args: unknown[]) {
    return original.apply(this, args).then((result) => {
      collect(result instanceof WebAssembly.Instance ? result : result.instance);
      return result;
    });
  };
}

export function install(): void {
  if (installed || typeof WebAssembly === 'undefined' || typeof WeakRef === 'undefined') return;
  installed = true;
  WebAssembly.Memory = construct(WebAssembly.Memory, add);
  WebAssembly.Instance = construct(WebAssembly.Instance, collect);
  instantiate('instantiate');
  instantiate('instantiateStreaming');
}

export function usage(): number | null {
  memories = memories.filter((ref) => ref.deref());
  if (!memories.length) return null;
  let total = 0;
  for (const ref of memories) total += ref.deref()?.buffer.byteLength ?? 0;
  return total;
}
