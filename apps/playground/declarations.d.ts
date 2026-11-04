// WASM modules are loaded as URLs, checkout next.config.js
declare module "*.wasm" {
  const url: string;
  export default url;
}

// ?url imports are emitted as assets and resolve to their URL, checkout next.config.mjs
declare module "*?url" {
  const url: string;
  export default url;
}
