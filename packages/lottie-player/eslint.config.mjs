import { defineConfig } from 'eslint/config';
import wc from 'eslint-plugin-wc';
import base from '../../eslint.config.mjs';

export default defineConfig(
  base,

  // Web Component lifecycle rules.
  {
    files: ['src/**/*.ts'],
    extends: [wc.configs['flat/recommended']],
    settings: { wc: { elementBaseClasses: ['LitElement'] } },
    rules: {
      'wc/guard-super-call': 'error',
    },
  },
);
