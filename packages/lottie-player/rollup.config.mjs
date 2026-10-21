import { swc } from 'rollup-plugin-swc3';
import { dts } from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import pkg from './package.json' with { type: 'json' };
import path from 'path';

const name = 'lottie-player';
const globals = {
  lit: 'lit',
  'lit/decorators.js': 'lit/decorators.js',
};
const commonOutput = {
  name,
  globals,
  minifyInternalExports: true,
  inlineDynamicImports: true,
  sourcemap: true,
};

const PresetModule = {
  Default: 'lottie-player',
  SW: 'lottie-player-sw',
  GL: 'lottie-player-gl',
  WG: 'lottie-player-wg',
  SW_LITE: 'lottie-player-sw-lite',
  GL_LITE: 'lottie-player-gl-lite',
  WG_LITE: 'lottie-player-wg-lite',
  THREAD: 'lottie-player-thread',
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
};

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
};

const sharedPlugins = ({ thread = false, ...config }) => [
  browserImportMetaUrl(),
  replace({
    include: ['src/**/*.ts'],
    preventAssignment: true,
    values: {
      '__WASM_PATH__': config.path + '/thorvg.wasm',
      '__RENDERER__': config.renderer,
      '__THREAD_SUPPORT__': String(thread),
      '__PACKAGE_VERSION__': pkg.version,
      '__THORVG_VERSION__': process.env.THORVG_VERSION,
    },
  }),
  commonjs({
    include: /node_modules/,
  }),
  swc({
    include: /\.[mc]?[jt]sx?$/,
    exclude: /node_modules/,
    tsconfig: 'tsconfig.json',
    sourceMaps: true,
    jsc: {
      externalHelpers: true,
      parser: {
        syntax: 'typescript',
        tsx: false,
        decorators: true,
        declaration: true,
        dynamicImport: true,
      },
      target: 'es2022',
    },
  }),
  nodeResolve(config.options),
  terser({
    mangle: true,
    compress: {
      passes: 3,
      pure_getters: true,
      drop_console: true,
      drop_debugger: true,
    },
    output: {
      comments: false,
    },
  }),
];

const presetMap = {
  [PresetModule.Default]: {
    path: 'dist',
    renderer: 'sw',
    input: './src/lottie-player.ts',
    options: {},
    plugins: [],
    output: {
      umd: './dist/lottie-player.js',
      cjs: pkg.main,
      esm: pkg.module,
    },
  },
  [PresetModule.SW]: {
    path: 'dist/sw',
    renderer: 'sw',
    input: './src/lottie-standard-player.ts',
    options: {},
    plugins: [],
    output: {
      umd: './dist/sw/lottie-player.js',
      cjs: pkg.exports['./sw'].require,
      esm: pkg.exports['./sw'].import,
    },
  },
  [PresetModule.GL]: {
    path: 'dist/gl',
    renderer: 'gl',
    input: './src/lottie-standard-player.ts',
    options: {},
    plugins: [],
    output: {
      umd: './dist/gl/lottie-player.js',
      cjs: pkg.exports['./gl'].require,
      esm: pkg.exports['./gl'].import,
    },
  },
  [PresetModule.WG]: {
    path: 'dist/wg',
    renderer: 'wg',
    input: './src/lottie-standard-player.ts',
    options: {},
    plugins: [],
    output: {
      umd: './dist/wg/lottie-player.js',
      cjs: pkg.exports['./wg'].require,
      esm: pkg.exports['./wg'].import,
    },
  },
  [PresetModule.SW_LITE]: {
    path: 'dist/sw-lite',
    renderer: 'sw',
    input: './src/lottie-lite-player.ts',
    options: {},
    plugins: [],
    output: {
      umd: './dist/sw-lite/lottie-player.js',
      cjs: pkg.exports['./sw-lite'].require,
      esm: pkg.exports['./sw-lite'].import,
    },
  },
  [PresetModule.GL_LITE]: {
    path: 'dist/gl-lite',
    renderer: 'gl',
    input: './src/lottie-lite-player.ts',
    options: {},
    plugins: [],
    output: {
      umd: './dist/gl-lite/lottie-player.js',
      cjs: pkg.exports['./gl-lite'].require,
      esm: pkg.exports['./gl-lite'].import,
    },
  },
  [PresetModule.WG_LITE]: {
    path: 'dist/wg-lite',
    renderer: 'wg',
    input: './src/lottie-lite-player.ts',
    options: {},
    plugins: [],
    output: {
      umd: './dist/wg-lite/lottie-player.js',
      cjs: pkg.exports['./wg-lite'].require,
      esm: pkg.exports['./wg-lite'].import,
    },
  },
  [PresetModule.THREAD]: {
    path: 'dist/thread',
    renderer: 'sw',
    thread: true,
    input: './src/lottie-thread-player.ts',
    options: {
      exportConditions: ['node'], // DOM shim for lit in pthread workers
    },
    plugins: [threadWorker()],
    output: {
      esm: pkg.exports['./thread'].import,
    },
  },
};

const createLottieConfig = (preset) => {
  const config = presetMap[preset];
  return {
    input: config.input,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false,
    },
    output: [
      {
        file: config.output.umd,
        format: 'umd',
        ...commonOutput,
      },
      {
        file: config.output.cjs,
        format: 'cjs',
        ...commonOutput,
      },
      {
        file: config.output.esm,
        format: 'esm',
        ...commonOutput,
      },
    ].filter((output) => output.file),
    plugins: [
      alias({
        entries: [
          { find: '../dist/thorvg.js', replacement: path.join('..', config.path, 'thorvg') },
        ],
      }),
      ...config.plugins,
      ...sharedPlugins(config),
    ],
  };
};

const createTypesConfig = (input, file) => {
  const tagNameMap = [
    `declare global {`,
    `  interface HTMLElementTagNameMap {`,
    `    '${name}': LottiePlayer;`,
    `  }`,
    `}`,
  ].join('\n');

  return {
    input,
    treeshake: true,
    output: [
      {
        file,
        format: 'esm',
        footer: tagNameMap,
      },
    ],
    plugins: [
      dts(),
    ],
  };
};

export default [
  createLottieConfig(PresetModule.Default),
  createLottieConfig(PresetModule.SW),
  createLottieConfig(PresetModule.GL),
  createLottieConfig(PresetModule.WG),
  createLottieConfig(PresetModule.SW_LITE),
  createLottieConfig(PresetModule.GL_LITE),
  createLottieConfig(PresetModule.WG_LITE),
  createLottieConfig(PresetModule.THREAD),
  createTypesConfig('./src/lottie-player.ts', pkg.types),
  createTypesConfig('./src/lottie-standard-player.ts', pkg.exports['./sw'].types),
  createTypesConfig('./src/lottie-lite-player.ts', pkg.exports['./sw-lite'].types),
  createTypesConfig('./src/lottie-thread-player.ts', pkg.exports['./thread'].types),
];
