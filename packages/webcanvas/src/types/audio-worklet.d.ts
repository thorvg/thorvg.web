declare class AudioWorkletProcessor {
  readonly port: MessagePort;
}

declare function registerProcessor(name: string, processorCtor: new () => AudioWorkletProcessor): void;

declare const sampleRate: number;
declare const currentTime: number;
