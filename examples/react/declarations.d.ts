import type { HTMLAttributes } from "react";
import type { LottiePlayer } from "../../dist/lottie-player";

declare module "react/jsx-runtime" {
  namespace JSX {
    interface IntrinsicElements {
      "lottie-player": Partial<LottiePlayer>;
    }
  }
}
