import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import rc from './.eslintrc.json' with { type: 'json' };

const [base] = rc.overrides;

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/coverage/**',
      '**/build_wasm*/**',
      '**/*.d.ts',
      'thorvg/**',
      'apps/**',
      'examples/**',
    ],
  },

  // Baseline rules.
  {
    files: base.files,
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      ...base.rules,
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],
      '@typescript-eslint/no-for-in-array': 'error',
    },
  },
);
