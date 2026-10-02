import type { DefineComponent } from "vue";
import type { LottiePlayer } from "@thorvg/lottie-player";

declare module "vue" {
  interface GlobalComponents {
    "lottie-player": DefineComponent<Partial<Omit<LottiePlayer, keyof HTMLElement>>>;
  }
}
