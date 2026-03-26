const { defineConfig } = require('eslint/config');
const eslintJs = require('@eslint/js');
const jestPlugin = require('eslint-plugin-jest');
const auraConfig = require('@salesforce/eslint-plugin-aura');
const lwcConfig = require('@salesforce/eslint-config-lwc/recommended-ts');
const tseslint = require('typescript-eslint');
const globals = require('globals');

module.exports = defineConfig([
    // Aura configuration
    {
        files: ['**/aura/**/*.js'],
        extends: [
            ...auraConfig.configs.recommended,
            ...auraConfig.configs.locker
        ]
    },

    // LWC configuration for both JavaScript and TypeScript
    // Following internal Salesforce pattern: single TypeScript ESLint parser for both
    {
        files: ['**/lwc/**/*.{js,ts}'],
        extends: [
            lwcConfig,
            ...tseslint.configs.base,
            ...tseslint.configs.recommended
        ],
        languageOptions: {
            parser: tseslint.parser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module'
            }
        },
        plugins: {
            '@typescript-eslint': tseslint.plugin
        },
        rules: {
            '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^_' }]
        }
    },

    // LWC test files configuration
    // Test files match the main LWC config, only need to specify differences
    {
        files: ['**/lwc/**/*.test.{js,ts}'],
        languageOptions: {
            globals: {
                ...globals.node
            }
        },
        rules: {
            '@lwc/lwc/no-unexpected-wire-adapter-usages': 'off'
        }
    },

    // Jest mocks configuration
    {
        files: ['**/jest-mocks/**/*.js'],
        languageOptions: {
            sourceType: 'module',
            ecmaVersion: 'latest',
            globals: {
                ...globals.node,
                ...globals.es2021,
                ...jestPlugin.environments.globals.globals
            }
        },
        plugins: {
            eslintJs
        },
        extends: ['eslintJs/recommended']
    }
]);
