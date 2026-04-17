import base from './eslint.config.base.mjs';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.nuxt/**',
      '**/.turbo/**',
      '**/build/**',
      '**/out/**',
    ],
  },
  ...base,
  // NestJS (api) Specific Overrides for Master Config
  {
    files: ['apps/api/**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname + '/apps/api',
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
    },
  },
  // Nuxt (web) Specific Overrides for Master Config
  {
    files: ['apps/web/**/*.{ts,js,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
      },
    },
    rules: {
      // Nuxt/Vue specific rules here if needed at root level
    },
  },
);
