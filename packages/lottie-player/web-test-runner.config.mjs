import { esbuildPlugin } from "@web/dev-server-esbuild";

export default {
  files: ["tests/**/*.test.ts"],
  nodeResolve: true,
  plugins: [
    esbuildPlugin({ ts: true }),
  ],
  testRunnerHtml: (testFramework) => `
<!DOCTYPE html>
<html>
<head></head>
<body>
  <script>window.EXPECTED_THORVG_VERSION = ${JSON.stringify(process.env.THORVG_VERSION ?? "")};</script>
  <script type="module" src="${testFramework}"></script>
</body>
</html>`,
};
