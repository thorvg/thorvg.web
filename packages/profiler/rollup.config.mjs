import { swc } from 'rollup-plugin-swc3';
import { dts } from 'rollup-plugin-dts';
import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import pkg from './package.json' with { type: 'json' };

const commonOutput = {
  name: 'ThorVGProfiler',
  exports: 'default',
  sourcemap: true,
};

export default [
  {
    input: './src/index.ts',
    output: [
      { file: pkg.exports['.'].import, format: 'esm', ...commonOutput },
      { file: pkg.exports['.'].require, format: 'cjs', ...commonOutput },
      { file: pkg.unpkg, format: 'umd', ...commonOutput },
    ],
    plugins: [
      nodeResolve(),
      commonjs({ include: /node_modules/ }),
      swc({
        include: /\.ts$/,
        tsconfig: 'tsconfig.json',
        sourceMaps: true,
        jsc: { parser: { syntax: 'typescript' }, target: 'es2022' },
      }),
      terser({
        compress: { passes: 2, drop_debugger: true },
        output: { comments: /webgl-memory|@license/i },
      }),
    ],
  },
  {
    input: './src/index.ts',
    output: [{ file: pkg.types, format: 'esm' }],
    plugins: [dts()],
  },
];
