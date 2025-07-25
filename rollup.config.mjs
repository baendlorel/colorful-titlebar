import path from 'path';
import typescript from '@rollup/plugin-typescript';
import resolve from '@rollup/plugin-node-resolve';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';
import babel from '@rollup/plugin-babel';

const tsconfigFile = './tsconfig.build.json';

/**
 * @type {import('rollup').RollupOptions}
 */
export default [
  // 主打包配置 - 混淆版
  {
    input: 'src/extension.ts',
    output: [
      {
        file: 'out/extension.js',
        format: 'cjs', // 指定为CommonJS格式
        sourcemap: true,
        name: 'Colorful Titlebar', // 全局名称
        globals: {
          vscode: 'vscode', // 确保 vscode 被视为外部依赖
        },
      },
    ],
    plugins: [
      alias({
        entries: [{ find: /^@/, replacement: path.resolve(import.meta.dirname, 'src') }],
      }),
      replace({
        preventAssignment: true, // 防止替换赋值语句
        values: {
          __IS_DEV__: process.env.__IS_DEV__ || 'false',
        },
      }),
      resolve(),
      commonjs(),
      typescript({
        tsconfig: tsconfigFile,
      }),
      babel({
        babelHelpers: 'bundled',
        extensions: ['.ts', '.tsx', '.js', '.jsx'],
        presets: [['@babel/preset-env', { targets: { node: '14' } }]],
        plugins: [
          [
            '@babel/plugin-proposal-decorators',
            {
              version: '2021-12', // 使用新版装饰器，如需旧版使用 legacy: true
            },
          ],
        ],
      }),
      terser({
        format: {
          comments: false, // 移除所有注释
        },
        compress: {
          drop_console: true,
          // 安全的常量折叠和死代码消除
          dead_code: true, // ✅ 安全：移除死代码
          evaluate: true, // ✅ 安全：计算常量表达式
          // fold_constants 在新版本的 terser 中已被 evaluate 包含
        },
        mangle: {
          properties: {
            regex: /^_/, // 只混淆以下划线开头的属性
          },
        },
      }),
    ].filter(Boolean), // 过滤掉未使用的插件
    external: [], // 如果要包含所有依赖，这里保持空数组
  },
];
