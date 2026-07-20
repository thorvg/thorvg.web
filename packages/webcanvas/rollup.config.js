import { swc } from "rollup-plugin-swc3";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import pkg from './package.json' assert { type: 'json' };
import path from 'path';

const name = 'ThorVG';
const commonOutput = {
  name,
  minifyInternalExports: true,
  inlineDynamicImports: true,
  sourcemap: true,
};

const sharedPlugins = (aliasEntries = []) => [
  ...(aliasEntries.length ? [alias({ entries: aliasEntries })] : []),
  replace({
    include: ['src/**/*.ts'],
    preventAssignment: true,
    values: {
      '__THORVG_VERSION__': process.env.THORVG_VERSION,
      '__PACKAGE_VERSION__': pkg.version,
    },
  }),
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
];

const createWebCanvasConfig = () => {
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
        file: './dist/webcanvas.js',
        format: "umd",
        hoistTransitiveImports: true,
        ...commonOutput,
      },
    ],
    plugins: sharedPlugins(),
  };
}

const createThreadConfig = () => {
  return {
    input: "./src/index.ts",
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    },
    output: [
      {
        file: pkg.exports['./thread'].import,
        format: "esm",
        ...commonOutput,
      },
    ],
    plugins: sharedPlugins([
      { find: '../dist/thorvg.js', replacement: path.resolve('./dist/thread/thorvg.js') },
    ]),
  };
}

export default [
  createWebCanvasConfig(),
  createThreadConfig(),
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
      dts({ compilerOptions: { stripInternal: true } }),
    ],
  }
];
