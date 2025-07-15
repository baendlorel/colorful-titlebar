import vscode from 'vscode';

import { alreadySetTitleBarColor, refreshTitleBar } from './core/style';
import catcher from './common/catcher';
import register from './registers';
import gradient from './features/gradient';

export const activate = catcher(async (context: vscode.ExtensionContext) => {
  // 注册命令
  register(context);

  // 如果颜色没有设置过，那么应用标题栏颜色
  if (!alreadySetTitleBarColor()) {
    await refreshTitleBar();
  }

  // 建议开启渐变
  await gradient.suggest();
});

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const deactivate = () => {};
