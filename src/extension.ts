import vscode from 'vscode';

import { configs } from './core/configs';
import { registerCommands } from './commands';
import { beProject } from './core/indicate';
import { beCustom, clearTitleBarColor, updateTitleBarColor } from './core/style';
import { showInfoMsg } from './core/notifications';
import { catcher } from './core/ct-error';

export const activate = async (context: vscode.ExtensionContext) => {
  // 注册命令
  registerCommands(context);

  // 应用标题栏颜色
  await applyTitleBarColor();
};

export const deactivate = catcher(clearTitleBarColor);

/**
 * 加载核心逻辑
 */
const applyTitleBarColor = catcher(async () => {
  if (!configs.cwd) {
    return;
  }

  await beCustom().then((v) => {
    if (v) {
      showInfoMsg(v);
    }
  });

  await beProject();
  await updateTitleBarColor();
});
