import type LottiePlayer from "../../dist/lottie-player";

declare namespace svelte.JSX {
  interface IntrinsicElements {
    "lottie-player": Partial<LottiePlayer>;
  }
}

declare module "*.svelte" {
  import type { ComponentType } from "svelte";
  const component: ComponentType;
  export default component;
}
