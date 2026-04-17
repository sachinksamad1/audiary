import base from '../../eslint.config.base.mjs';
import tseslint from 'typescript-eslint';
import globals from 'globals';

export default tseslint.config(
  ...base,
  {
    files: ['**/*.{ts,js,vue}'],
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
      },
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: ['.vue'],
      },
    },
    rules: {
      'vue/multi-word-component-names': 'off',
    },
  },
  {
    ignores: ['.nuxt/**', '.output/**', 'dist/**', 'node_modules/**'],
  },
);
