import * as webgl from './webgl';
import * as webgpu from './webgpu';
import * as wasm from './wasm';
import Profiler from './profiler';

webgl.install();
webgpu.install();
wasm.install();

export type { GpuMemory, MemorySample } from './types';
export default Profiler;
