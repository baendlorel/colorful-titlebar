import vscode from 'vscode';

import { configs } from './core/configs';
import { registerCommands } from './commands';
import { checkDirIsProject } from './core/indicate';
import { isCustom, updateTitleBarColor } from './core/style';
import { catcher } from './core/ct-error';

export const activate = async (context: vscode.ExtensionContext) => {
  // 注册命令
  registerCommands(context);

  // 应用标题栏颜色
  await applyTitleBarColor();
};

// eslint-disable-next-line @typescript-eslint/no-empty-function
export const deactivate = () => {};

/**
 * 加载核心逻辑
 */
const applyTitleBarColor = catcher(async () => {
  if (!configs.cwd) {
    return;
  }

  const globalTitleBarStyleIsCustom = await isCustom();
  if (!globalTitleBarStyleIsCustom) {
    return;
  }

  const isProject = await checkDirIsProject();
  if (!isProject) {
    return;
  }

  await updateTitleBarColor();
});
