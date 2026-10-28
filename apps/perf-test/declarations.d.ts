// WASM modules are loaded as URLs, see next.config.mjs
declare module '*.wasm' {
  const url: string;
  export default url;
}
