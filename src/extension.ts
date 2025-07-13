import vscode from 'vscode';

import { configs } from './core/configs';
import { registerCommands } from './commands';
import { checkDirIsProject } from './core/indicate';
import { checkGlobalStyle, clearTitleBarColor, updateTitleBarColor } from './core/style';
import { catcher } from './core/ct-error';
import { Result } from './core/consts';

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

  const checkResult = await checkGlobalStyle();
  if (checkResult === Result.Cancel) {
    return;
  }

  const isProject = await checkDirIsProject();
  if (!isProject) {
    return;
  }

  await updateTitleBarColor();
});
