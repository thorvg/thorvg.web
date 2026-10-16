import { swc } from "rollup-plugin-swc3";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import webWorkerLoader from 'rollup-plugin-web-worker-loader';
import pkg from './package.json' assert { type: 'json' };
import path from 'path';

const name = 'ThorVG';
const commonOutput = {
  name,
  minifyInternalExports: true,
  inlineDynamicImports: true,
  sourcemap: true,
};

const browserImportMetaUrl = () => {
  // cjs/umd: remove rollup's require("url") shim
  return {
    name: 'browser-import-meta-url',
    resolveImportMeta(property, { format }) {
      if (property !== 'url' || format === 'es') return null;
      return 'location.href';
    },
  };
}

const threadWorker = () => {
  // thread: enable Blob worker via mainScriptUrlOrBlob
  // https://emscripten.org/docs/api_reference/module.html#Module.mainScriptUrlOrBlob
  return {
    name: 'thorvg-worker-blob',
    transform(code, id) {
      if (!id.endsWith(path.join('dist', 'thread', 'thorvg.js'))) return null;
      if (!code.includes('mainScriptUrlOrBlob')) this.error(`mainScriptUrlOrBlob not found in ${id}.`);
      return {
        code: code.replace(/import\.meta\.url/g, 'location.href'), // used for bundler compatibility
        map: null,
      };
    },
  };
}

const sharedPlugins = ({ thread = false } = {}) => [
  browserImportMetaUrl(),
  webWorkerLoader({
    targetPlatform: 'browser',
    inline: true,
    extensions: ['.js', '.ts'],
  }),
  replace({
    include: ['src/**/*.ts'],
    preventAssignment: true,
    values: {
      '__THORVG_VERSION__': process.env.THORVG_VERSION,
      '__PACKAGE_VERSION__': pkg.version,
      '__WASM_PATH__': thread ? 'dist/thread/thorvg.wasm' : 'dist/thorvg.wasm',
      '__THREAD_SUPPORT__': String(thread),
    },
  }),
  commonjs({
    include: /node_modules/
  }),
  swc({
    include: /\.[mc]?[jt]sx?$/,
    exclude: /node_modules/,
    tsconfig: "tsconfig.json",
    sourceMaps: true,
    jsc: {
      parser: {
        syntax: "typescript",
        tsx: false,
        decorators: false,
        declaration: true,
        dynamicImport: true,
      },
      target: "es2022",
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
    plugins: [
      alias({ entries: [{ find: '../dist/thorvg.js', replacement: path.resolve('./dist/thread/thorvg.js') }] }),
      threadWorker(),
      ...sharedPlugins({ thread: true }),
    ],
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
