import { swc } from "rollup-plugin-swc3";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import terser from "@rollup/plugin-terser";
import nodePolyfills from 'rollup-plugin-polyfill-node';
import replace from '@rollup/plugin-replace';
import alias from '@rollup/plugin-alias';
import pkg from './package.json';
import path from 'path';

const name = 'lottie-player';
const globals = {
  url: "url",
  lit: "lit",
  "lit/decorators.js": "lit/decorators.js",
};
const commonOutput = {
  name,
  minifyInternalExports: true,
  inlineDynamicImports: true,
  sourcemap: true,
  globals,
};

const PresetModule = {
  Default: "lottie-player",
  SW: "lottie-player-sw",
  GL: "lottie-player-gl",
  WG: "lottie-player-wg",
  SW_LITE: "lottie-player-sw-lite",
  GL_LITE: "lottie-player-gl-lite",
  WG_LITE: "lottie-player-wg-lite",
  THREAD: "lottie-player-thread",
}

const threadWorker = () => {
  const workerPattern = /new Worker\(new URL\("thorvg\.js",import\.meta\.url\),(\{[^}]*\})\)/;
  const bundleFile = path.basename(pkg.exports['./thread'].import);
  return {
    name: 'thorvg-worker-url',
    transform(code, id) {
      if (!id.endsWith(path.join('dist', 'thread', 'thorvg.js'))) return null;
      if (!workerPattern.test(code)) this.error(`pthread worker not found in ${id}.`);
      return {
        code: code.replace(workerPattern, (_, options) =>
          `(new URL(import.meta.url).origin===location.origin` +
          `?new Worker(new URL("./${bundleFile}",import.meta.url),${options})` +
          `:new Worker(URL.createObjectURL(new Blob(['import"'+import.meta.url+'"'],{type:"text/javascript"})),${options}))`),
        map: null,
      };
    },
  };
}

const presetMap = {
  [PresetModule.Default]: {
    path: '/dist',
    renderer: 'sw',
    input: "./src/lottie-player.ts",
    options: {},
    plugins: [],
    output: {
      umd: './dist/lottie-player.js',
      cjs: pkg.main,
      esm: pkg.module,
    }
  },
  [PresetModule.SW]: {
    path: '/dist/sw',
    renderer: 'sw',
    input: "./src/lottie-standard-player.ts",
    options: {},
    plugins: [],
    output: {
      umd: './dist/sw/lottie-player.js',
      cjs: pkg.exports['./sw'].require,
      esm: pkg.exports['./sw'].import,
    }
  },
  [PresetModule.GL]: {
    path: '/dist/gl',
    renderer: 'gl',
    input: "./src/lottie-standard-player.ts",
    options: {},
    plugins: [],
    output: {
      umd: './dist/gl/lottie-player.js',
      cjs: pkg.exports['./gl'].require,
      esm: pkg.exports['./gl'].import,
    }
  },
  [PresetModule.SW_LITE]: {
    path: '/dist/sw-lite',
    renderer: 'sw',
    input: "./src/lottie-lite-player.ts",
    options: {},
    plugins: [],
    output: {
      umd: './dist/sw-lite/lottie-player.js',
      cjs: pkg.exports['./sw-lite'].require,
      esm: pkg.exports['./sw-lite'].import,
    }
  },
  [PresetModule.GL_LITE]: {
    path: '/dist/gl-lite',
    renderer: 'gl',
    input: "./src/lottie-lite-player.ts",
    options: {},
    plugins: [],
    output: {
      umd: './dist/gl-lite/lottie-player.js',
      cjs: pkg.exports['./gl-lite'].require,
      esm: pkg.exports['./gl-lite'].import,
    }
  },
  [PresetModule.WG]: {
    path: '/dist/wg',
    renderer: 'wg',
    input: "./src/lottie-standard-player.ts",
    options: {},
    plugins: [],
    output: {
      umd: './dist/wg/lottie-player.js',
      cjs: pkg.exports['./wg'].require,
      esm: pkg.exports['./wg'].import,
    }
  },
  [PresetModule.WG_LITE]: {
    path: '/dist/wg-lite',
    renderer: 'wg',
    input: "./src/lottie-lite-player.ts",
    options: {},
    plugins: [],
    output: {
      umd: './dist/wg-lite/lottie-player.js',
      cjs: pkg.exports['./wg-lite'].require,
      esm: pkg.exports['./wg-lite'].import,
    }
  },
  [PresetModule.THREAD]: {
    path: '/dist/thread',
    renderer: 'sw',
    input: "./src/lottie-thread-player.ts",
    options: {
      exportConditions: ['node'],
    },
    plugins: [threadWorker()],
    output: {
      esm: pkg.exports['./thread'].import,
    }
  },
}

const resolveCommonPlugins = (config) => [
  replace({
    include: ['src/**/*.ts'],
    preventAssignment: true,
    values: {
      '__WASM_PATH__': pkg.version + config.path,
      '__THORVG_VERSION__': process.env.THORVG_VERSION,
      '__RENDERER__': config.renderer,
    },
  }),
  nodePolyfills(),
  commonjs({
    include: /node_modules/
  }),
  swc({
    include: /\.[mc]?[jt]sx?$/,
    exclude: /node_modules/,
    tsconfig: "tsconfig.json",
    sourceMaps: true,
    jsc: {
      externalHelpers: true,
      parser: {
        syntax: "typescript",
        tsx: false,
        decorators: true,
        declaration: true,
        dynamicImport: true,
      },
      target: "es2022",
    },
  }),
  nodeResolve(config.options),
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

const createLottieConfig = (preset) => {
  const config = presetMap[preset];
  return {
    input: config.input,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    },
    output: [
      {
        file: config.output.umd,
        format: "umd",
        ...commonOutput,
      },
      {
        file: config.output.cjs,
        format: "cjs",
        ...commonOutput,
      },
      {
        file: config.output.esm,
        format: "esm",
        ...commonOutput,
      },
    ].filter((output) => output.file),
    plugins: [
      alias({
        entries: [
          { find: '../dist/thorvg.js', replacement: path.join('..', config.path, 'thorvg')  },
        ]
      }),
      ...config.plugins,
      ...resolveCommonPlugins(config),
    ],
  };
}

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
        format: "esm",
        footer: tagNameMap,
      }
    ],
    plugins: [
      dts(),
    ],
  };
}

export default [
  createLottieConfig(PresetModule.Default),
  createLottieConfig(PresetModule.SW),
  createLottieConfig(PresetModule.GL),
  createLottieConfig(PresetModule.WG),
  createLottieConfig(PresetModule.SW_LITE),
  createLottieConfig(PresetModule.GL_LITE),
  createLottieConfig(PresetModule.WG_LITE),
  createLottieConfig(PresetModule.THREAD),
  createTypesConfig("./src/lottie-player.ts", pkg.types),
  createTypesConfig("./src/lottie-standard-player.ts", pkg.exports['./sw'].types),
  createTypesConfig("./src/lottie-lite-player.ts", pkg.exports['./sw-lite'].types),
  createTypesConfig("./src/lottie-thread-player.ts", pkg.exports['./thread'].types),
];
