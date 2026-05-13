declare module '*.wasm?url' {
  const url: string;
  export default url;
}

declare var __TVG: import('../src/index').ThorVGNamespace | undefined;
declare var __TEST_ENV: 'browser' | 'happy-dom' | undefined;
declare var __RENDERER: import('../src/common/constants').RendererType | undefined;
declare var gc: (() => void) | undefined;
