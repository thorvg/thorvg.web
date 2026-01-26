import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: ["tests/**/*.test.ts"],
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ ts: true }),
  ],
};
