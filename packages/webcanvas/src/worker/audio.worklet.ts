const workletMain = (): void => {
  class TvgAudioProcessor extends AudioWorkletProcessor {
    declare chunks: Float32Array[][];
    declare readOffset: number;
    declare buffered: number;
    declare gen: number;
    declare base: number;
    declare consumed: number;
    declare held: boolean;
    declare videoReady: boolean;
    declare sinceReport: number;
    declare feeder: MessagePort | null;
    declare primeFrames: number;

    constructor() {
      super();
      this.chunks = [];
      this.readOffset = 0;
      this.buffered = 0;
      this.gen = 0;
      this.base = 0;
      this.consumed = 0;
      this.held = true;
      this.videoReady = false;
      this.sinceReport = 0;
      this.feeder = null;
      this.primeFrames = Math.round(sampleRate * 0.15);

      this.port.onmessage = ({ data }: MessageEvent) => {
        switch (data.type) {
          case 'feeder': {
            this.feeder = data.port as MessagePort;
            this.feeder.onmessage = ({ data: pcm }: MessageEvent) => {
              if (pcm.gen !== this.gen) return;
              const planes = (pcm.planes as ArrayBuffer[]).map((p) => new Float32Array(p));
              this.chunks.push(planes);
              this.buffered += planes[0]!.length;
            };
            break;
          }
          case 'flush': {
            this.chunks = [];
            this.readOffset = 0;
            this.buffered = 0;
            this.gen = data.gen;
            this.base = data.time;
            this.consumed = 0;
            this.videoReady = false;
            this.hold();
            break;
          }
          case 'videoReady': {
            this.videoReady = true;
            break;
          }
        }
      };
    }

    media(): number {
      return this.base + this.consumed / sampleRate;
    }

    hold(): void {
      if (this.held) return;
      this.held = true;
      this.port.postMessage({ held: true, media: this.media() });
    }

    process(_inputs: Float32Array[][], outputs: Float32Array[][]): boolean {
      const out = outputs[0]!;
      const quantum = out[0]!.length;

      if (this.held) {
        if (!this.videoReady || this.buffered < this.primeFrames) return true;
        this.held = false;
        this.port.postMessage({ held: false, media: this.media(), ctxTime: currentTime });
      }

      let filled = 0;
      while (filled < quantum && this.chunks.length > 0) {
        const chunk = this.chunks[0]!;
        const avail = chunk[0]!.length - this.readOffset;
        const n = Math.min(avail, quantum - filled);
        for (let c = 0; c < out.length; c++) {
          const src = chunk[Math.min(c, chunk.length - 1)]!;
          out[c]!.set(src.subarray(this.readOffset, this.readOffset + n), filled);
        }
        filled += n;
        this.readOffset += n;
        if (this.readOffset >= chunk[0]!.length) {
          this.chunks.shift();
          this.readOffset = 0;
        }
      }

      this.buffered -= filled;
      this.consumed += filled;
      this.sinceReport += filled;
      if (filled < quantum) this.hold();
      if (this.sinceReport >= 2048 && this.feeder) {
        this.feeder.postMessage({ gen: this.gen, frames: this.consumed });
        this.sinceReport = 0;
      }
      return true;
    }
  }

  registerProcessor('tvg-audio', TvgAudioProcessor);
};

let workletUrl: string | null = null;

/** Blob URL of the worklet module, created once and shared across sinks. */
export function getWorkletUrl(): string {
  if (!workletUrl) {
    workletUrl = URL.createObjectURL(new Blob([`(${workletMain.toString()})();`], { type: 'text/javascript' }));
  }
  return workletUrl;
}
