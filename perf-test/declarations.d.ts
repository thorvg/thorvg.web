// WASM modules are loaded as URLs, checkout next.config.js
declare module "*.wasm" {
  const url: string;
  export default url;
}
