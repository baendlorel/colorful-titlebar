import vscode from 'vscode';

import { catcher } from './common/catcher';
import { alreadySetTitleBarColor, refreshTitleBar } from './core/style';
import { gradient } from './features/gradient';
import { register } from './registers';

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
