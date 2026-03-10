import { expect, vi } from 'vitest';
import type { WasmObject } from '../src/interop/WasmObject';
import { getModule } from '../src/interop/module';

export const canForceGC = typeof (globalThis as any).gc === 'function';

// Force GC and wait for FinalizationRegistry callbacks to fire.
export async function forceFinalization(): Promise<void> {
  (globalThis as any).gc();
  await new Promise((r) => setTimeout(r, 10)); // wait for the GC to finish
}

export async function assertGCCleanup(create: () => WasmObject): Promise<void> {
  const Module = getModule();
  const freedPtrs: number[] = [];
  const noop = (...args: any[]) => { freedPtrs.push(args[0]); return 0; };

  const spy1 = vi.spyOn(Module, '_tvg_paint_unref').mockImplementation(noop);
  const spy2 = vi.spyOn(Module, '_tvg_gradient_del').mockImplementation(noop);

  // Drain pending finalizations from previous tests
  await forceFinalization();
  freedPtrs.length = 0;

  let ptr: number;
  (() => {
    const obj = create();
    ptr = obj.ptr;
  })();

  await forceFinalization();

  expect(freedPtrs).toContain(ptr!);
  spy1.mockRestore();
  spy2.mockRestore();
}

export function assertNoDoubleFree(create: () => WasmObject): void {
  let capturedToken: { ptr: number } | null = null;
  const originalRegister = FinalizationRegistry.prototype.register;
  FinalizationRegistry.prototype.register = function (target: any, heldValue: any, unregisterToken?: any) {
    capturedToken = heldValue;
    return originalRegister.call(this, target, heldValue, unregisterToken);
  };

  try {
    const obj = create();
    expect(capturedToken!.ptr).toBe(obj.ptr);
    obj.dispose();
    expect(capturedToken!.ptr).toBe(0);
  } finally {
    FinalizationRegistry.prototype.register = originalRegister;
  }
}
