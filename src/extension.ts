import vscode from 'vscode';
import { join } from 'node:path';

import { configs } from './core/configs';
import { Msg } from './core/i18n';
import { registerCommands } from './commands';
import { beProject } from './core/indicate';
import { beCustom, updateTitleBarColor } from './core/style';
import { FileCreationWatcher } from './core/watcher';
import { popInfo, showInfoMsg, showWarnMsg } from './core/notifications';

export const activate = async (context: vscode.ExtensionContext) => {
  // 注册命令
  registerCommands(context);

  // 应用标题栏颜色
  await applyTitleBarColor();
};

export const deactivate = () => true;

/**
 * 加载核心逻辑
 */
const applyTitleBarColor = async () => {
  const beCustomResult = await beCustom();
  if (beCustomResult.fail) {
    return showWarnMsg(beCustomResult);
  }

  if (!configs.cwd) {
    return;
  }

  const beProjectResult = await beProject();
  if (beProjectResult.fail) {
    return showInfoMsg(beProjectResult);
  }

  // const fw = new FileCreationWatcher(join(configs.cwd, '.vscode', 'settings.json'));
  await updateTitleBarColor();
  // 不再显示
  // popInfo(Msg.TitleBarColorSet(fw.isNew));
};
