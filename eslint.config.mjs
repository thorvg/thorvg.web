import js from '@eslint/js';
import tseslint from 'typescript-eslint';

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
    files: ['**/src/**/*.ts'],
    extends: [js.configs.recommended, tseslint.configs.recommended],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // General
      'eol-last': 'error',
      eqeqeq: ['error', 'always'],
      indent: ['error', 2, { SwitchCase: 1 }],
      'no-tabs': 'error',
      'no-trailing-spaces': 'error',
      'prefer-template': 'error',
      quotes: ['error', 'single', { avoidEscape: true, allowTemplateLiterals: true }],
      semi: ['error', 'always'],
      '@typescript-eslint/consistent-type-imports': 'error',

      // Types
      '@typescript-eslint/consistent-type-definitions': ['error', 'interface'],
      '@typescript-eslint/explicit-module-boundary-types': 'error',

      // Methods / Functions
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],

      // Asynchronous Code
      'no-void': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-misused-promises': ['error', { checksVoidReturn: false }],

      // Conditions / Loops
      'no-restricted-syntax': [
        'error',
        {
          selector: 'SwitchCase[consequent.length>1]',
          message: 'Wrap a multi-line case block in braces.',
        },
      ],
      '@typescript-eslint/no-for-in-array': 'error',
      '@typescript-eslint/prefer-for-of': 'error',

      // Comments
      'no-console': ['error', { allow: ['warn', 'error'] }],
    },
  },
);
