import type { LottiePlayer } from "@thorvg/lottie-player";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "lottie-player": Partial<LottiePlayer>;
    }
  }
}
