// @ts-check
/**
 * Typescript ESLint configuration file.
 * @version 2025.06.29
 */

import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.strict,
  tseslint.configs.stylistic,
  {
    ignores: [
      'node_modules/**/*', // 排除 node_modules（通常默认排除）
      'plugins/**/*', // 排除 plugins 文件夹
      'dist/**/*', // 排除 dist 文件夹
      'tests/**/*', // 排除 test 文件夹
      'coverage/**/*', // 排除测试覆盖率文件夹
      '*.config.js', // 排除所有配置文件
    ],
  },
  {
    rules: {
      '@typescript-eslint/prefer-literal-enum-member': 'off',
      '@typescript-eslint/no-inferrable-types': 'warn',
      '@typescript-eslint/prefer-for-of': 'off',
      '@typescript-eslint/unified-signatures': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
      // 命名约定
      '@typescript-eslint/naming-convention': [
        'warn',
        {
          selector: 'variableLike',
          format: ['camelCase', 'PascalCase', 'UPPER_CASE'],
          // 允许以下划线开头的变量（用于未使用的变量）
          leadingUnderscore: 'allow',
        },
        {
          selector: 'typeLike',
          format: ['PascalCase'],
        },
      ],
      // 复杂度限制
      complexity: ['warn', { max: 15 }],
    },
  }
);
