declare namespace svelte.JSX {
  interface IntrinsicElements {
    "lottie-player": any;
  }
}

declare module "*.svelte" {
  import type { ComponentType } from "svelte";
  const component: ComponentType;
  export default component;
}

declare module "@thorvg/lottie-player";
