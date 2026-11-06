import * as webgl from './webgl';
import * as webgpu from './webgpu';
import * as wasm from './wasm';
import PerfMonitor from './perfMonitor';

webgl.install();
webgpu.install();
wasm.install();

export type { GpuMemory, MemorySample, PerfMonitorOptions } from './types';
export default PerfMonitor;
