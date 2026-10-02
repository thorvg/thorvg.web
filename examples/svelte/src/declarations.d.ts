import type { HTMLAttributes } from "svelte/elements";
import type { LottiePlayer } from "@thorvg/lottie-player";

declare module "svelte/elements" {
  interface SvelteHTMLElements {
    "lottie-player": HTMLAttributes<LottiePlayer> & Partial<Omit<LottiePlayer, keyof HTMLElement>>;
  }
}
