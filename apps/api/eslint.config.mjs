import base from '../../eslint.config.base.mjs';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export const apiConfig = tseslint.config(
  ...base,
  {
    files: ['**/*.ts'],
    languageOptions: {
      globals: {
        ...globals.node,
        ...globals.jest,
      },
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-floating-promises': 'warn',
      '@typescript-eslint/no-unsafe-argument': 'warn',
      'prettier/prettier': ['error', { endOfLine: 'auto' }],
    },
  },
  {
    ignores: ['eslint.config.mjs', 'dist/**', 'node_modules/**'],
  },
);

export default apiConfig;
