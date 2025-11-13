import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { copyFileSync, mkdirSync, existsSync } from "fs";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: "copy-wasm",
      buildStart() {
        const wasmSource = resolve(__dirname, "../../dist/thorvg.wasm");
        const wasmDest = resolve(__dirname, "public");
        if (!existsSync(wasmDest)) mkdirSync(wasmDest, { recursive: true });
        if (existsSync(wasmSource))
          copyFileSync(wasmSource, resolve(wasmDest, "thorvg.wasm"));
      },
    },
  ],
});
