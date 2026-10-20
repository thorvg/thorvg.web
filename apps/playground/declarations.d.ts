// WASM modules are loaded as URLs, checkout next.config.js
declare module "*.wasm" {
  const url: string;
  export default url;
}

// The thread glue is emitted as an asset URL, checkout next.config.mjs
declare module "*/dist/thread/webcanvas.esm.js" {
  const url: string;
  export default url;
}
