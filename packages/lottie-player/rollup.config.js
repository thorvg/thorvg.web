import { swc } from "rollup-plugin-swc3";
import { dts } from "rollup-plugin-dts";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import commonjs from "@rollup/plugin-commonjs";
import { terser } from "rollup-plugin-terser";
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
  SW_LITE: "lottie-player-sw-lite",
  GL_LITE: "lottie-player-gl-lite",
}

const presetMap = {
  [PresetModule.Default]: {
    path: '/dist',
    renderer: 'sw',
    input: "./src/lottie-player.ts",
    output: {
      umd: './dist/lottie-player.js',
      cjs: pkg.main,
      esm: pkg.module,
    }
  },
  [PresetModule.SW]: {
    path: '/dist/sw',
    renderer: 'sw',
    input: "./src/lottie-preset-player.ts",
    output: {
      umd: './dist/sw/lottie-player.js',
      cjs: pkg.exports['./sw'].require,
      esm: pkg.exports['./sw'].import,
    }
  },
  [PresetModule.GL]: {
    path: '/dist/gl',
    renderer: 'gl',
    input: "./src/lottie-preset-player.ts",
    output: {
      umd: './dist/gl/lottie-player.js',
      cjs: pkg.exports['./gl'].require,
      esm: pkg.exports['./gl'].import,
    }
  },
  [PresetModule.SW_LITE]: {
    path: '/dist/sw-lite',
    renderer: 'sw',
    input: "./src/lottie-preset-player.ts",
    output: {
      umd: './dist/sw-lite/lottie-player.js',
      cjs: pkg.exports['./sw-lite'].require,
      esm: pkg.exports['./sw-lite'].import,
    }
  },
  [PresetModule.GL_LITE]: {
    path: '/dist/gl-lite',
    renderer: 'gl',
    input: "./src/lottie-preset-player.ts",
    output: {
      umd: './dist/gl-lite/lottie-player.js',
      cjs: pkg.exports['./gl-lite'].require,
      esm: pkg.exports['./gl-lite'].import,
    }
  },
}

const createLottieConfig = (preset) => {
  return {
    input: presetMap[preset].input,
    treeshake: {
      moduleSideEffects: false,
      propertyReadSideEffects: false,
      tryCatchDeoptimization: false
    },
    output: [
      {
        file: presetMap[preset].output.umd,
        format: "umd",
        hoistTransitiveImports: true,
        ...commonOutput, 
      },
      {
        file: presetMap[preset].output.cjs,
        format: "cjs",
        ...commonOutput,
      },
      {
        file: presetMap[preset].output.esm,
        format: "esm",
        ...commonOutput,
      },
    ],
    plugins: [
      alias({
        entries: [
          { find: '../dist/thorvg.js', replacement: path.join('..', presetMap[preset].path, 'thorvg')  },
        ]
      }),
      replace({
        include: ['src/**/*.ts'],
        preventAssignment: true,
        values: {
          '/dist': presetMap[preset].path,
          '__THORVG_VERSION__': process.env.THORVG_VERSION,
          '__RENDERER__': presetMap[preset].renderer,
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
        jsc: {
          parser: {
            syntax: "typescript",
            tsx: false,
            decorators: true,
            declaration: true,
            dynamicImport: true,
          },
          target: "esnext",
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
  createLottieConfig(PresetModule.Default),
  createLottieConfig(PresetModule.SW),
  createLottieConfig(PresetModule.GL),
  createLottieConfig(PresetModule.SW_LITE),
  createLottieConfig(PresetModule.GL_LITE),
  {
    input: "./src/lottie-player.ts",
    treeshake: true,
    output: [
      {
        file: './dist/lottie-player.d.ts',
        format: "esm",
      }
    ],
    plugins: [
      dts(),
    ],
  }
];
