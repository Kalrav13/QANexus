const tsParser = require('@typescript-eslint/parser');
const tsPlugin = require('@typescript-eslint/eslint-plugin');
const playwrightPlugin = require('eslint-plugin-playwright');

module.exports = [
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/reports/**',
      '**/allure-results/**',
      '**/playwright/.auth/**'
    ]
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      '@typescript-eslint': tsPlugin,
      'playwright': playwrightPlugin
    },
    rules: {
      // TypeScript rules
      ...tsPlugin.configs.recommended.rules,
      '@typescript-eslint/no-unused-vars': ['warn', { 
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',

      // Playwright rules
      ...playwrightPlugin.configs.recommended.rules,
      'playwright/no-focused-test': 'error',
      'playwright/no-skipped-test': 'off', // We use test.skip dynamically in this project
      'playwright/valid-expect': 'error',

      // Custom framework adaptations (Disable static title and tag checking due to dynamic wrappers)
      'playwright/valid-title': 'off',
      'playwright/valid-test-tags': 'off',
      'playwright/expect-expect': 'off' // We wrap assertions in custom assertion helpers like assertLoginOutcome
    }
  }
];
