import tseslint from 'typescript-eslint';
import jsdoc from 'eslint-plugin-jsdoc';
// Native ESLint 9/10 drop-in replacement for the legacy `eslint-plugin-header`.
import header from '@tony.ganchev/eslint-plugin-header';

export default tseslint.config(
  {
    ignores: [
      '**/*.js',
      'src/templates/lightningcomponent/lwc/typeScript/**',
      'src/templates/uiBundles/reactbasic/**/*',
      'src/templates/project/reactinternalapp/**/*',
      'src/templates/project/reactexternalapp/**/*',
      'src/templates/project/angularintapp/**/*',
      'src/templates/project/angularextapp/**/*',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.ts'],
    languageOptions: {
      parser: tseslint.parser,
      ecmaVersion: 2015,
      sourceType: 'module',
    },
    plugins: {
      '@typescript-eslint': tseslint.plugin,
      jsdoc,
      header,
    },
    rules: {
      'ban-ts-ignore': 'off',
      '@typescript-eslint/ban-ts-ignore': 'off',
      camelcase: 'off',
      '@typescript-eslint/camelcase': 'off',
      'constructor-super': 'warn',
      curly: 'error',
      eqeqeq: 'error',
      'no-buffer-constructor': 'error',
      'no-caller': 'error',
      'no-debugger': 'warn',
      'no-duplicate-case': 'error',
      'no-duplicate-imports': 'error',
      'no-eval': 'error',
      'no-extra-semi': 'warn',
      'no-redeclare': 'error',
      'no-sparse-arrays': 'error',
      'no-throw-literal': 'error',
      'no-unsafe-finally': 'warn',
      'no-unused-labels': 'warn',
      // non-complete list of globals that are easy to access unintentionally
      'no-restricted-globals': [
        'warn',
        'name',
        'length',
        'event',
        'closed',
        'external',
        'status',
        'origin',
        'context',
      ],
      'no-var': 'error',
      'jsdoc/no-types': 'warn',
      // `@typescript-eslint/semi` was removed in typescript-eslint v8; use the core rule.
      semi: 'warn',
      'header/header': [
        2,
        'block',
        [
          '',
          {
            pattern: ' \\* Copyright \\(c\\) \\d{4}, salesforce\\.com, inc\\.',
            template: ' * Copyright (c) 2021, salesforce.com, inc.',
          },
          ' * All rights reserved.',
          ' * Licensed under the BSD 3-Clause license.',
          ' * For full license text, see LICENSE.txt file in the repo root or https://opensource.org/licenses/BSD-3-Clause',
          ' ',
        ],
      ],
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': ['off'],
      '@typescript-eslint/no-empty-function': ['off'],
      '@typescript-eslint/no-explicit-any': ['off'],
      '@typescript-eslint/ban-ts-comment': ['off'],
      '@typescript-eslint/no-non-null-assertion': ['off'],
      '@typescript-eslint/no-var-requires': ['off'],
    },
  }
);
