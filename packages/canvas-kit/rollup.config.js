import { swc } from "rollup-plugin-swc3";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
import pkg from './package.json' assert { type: 'json' };

const name = 'canvas-kit';
const commonOutput = {
  name,
  minifyInternalExports: true,
  inlineDynamicImports: true,
  sourcemap: true,
};

const createCanvasKitConfig = () => {
  return {
    input: "./src/index.ts",
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    },
    output: [
      {
        file: pkg.exports['.'].import,
        format: "esm",
        ...commonOutput,
      },
      {
        file: pkg.exports['.'].require,
        format: "cjs",
        ...commonOutput,
      },
      {
        file: './dist/canvas-kit.js',
        format: "umd",
        hoistTransitiveImports: true,
        ...commonOutput,
      },
    ],
    plugins: [
      commonjs({
        include: /node_modules/
      }),
      swc({
        include: /\.[mc]?[jt]sx?$/,
        exclude: /node_modules/,
        tsconfig: "tsconfig.json",
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: false,
            decorators: false,
            declaration: true,
            dynamicImport: true,
          },
          target: "es2020",
        },
      }),
      nodeResolve(),
      terser({
        compress: {
          pure_getters: true,
          passes: 3,
          drop_console: true,
          drop_debugger: true
        },
        mangle: true,
        output: {
          comments: false,
        },
      }),
    ],
  };
}

export default [
  createCanvasKitConfig(),
  {
    input: "./src/index.ts",
    treeshake: true,
    output: [
      {
        file: pkg.types,
        format: "esm",
      }
    ],
    plugins: [
      dts(),
    ],
  }
];
