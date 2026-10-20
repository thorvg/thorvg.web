import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag === "lottie-player",
        },
      },
    }),
  ],
  server: {
    port: 5175,
    strictPort: true,
  },
});
