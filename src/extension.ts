import vscode from 'vscode';
import { join } from 'node:path';

import { configs } from './core/configs';
import { Msg } from './core/i18n';
import { registerCommands } from './commands';
import { indicateProject } from './core/indicate';
import { isTitleBarStyleCustom, updateTitleBarColor } from './core/style';
import { FileCreationWatcher } from './core/watcher';
import { popInfo } from './core/notifications';

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
  const isCustom = await isTitleBarStyleCustom();
  if (!isCustom || !configs.cwd) {
    return;
  }

  const isProject = await indicateProject();
  if (!isProject) {
    console.log(Msg.NotProject);
    return;
  }

  const fw = new FileCreationWatcher(join(configs.cwd, '.vscode', 'settings.json'));
  await updateTitleBarColor();
  // 不再显示
  // showInfo(Msg.TitleBarColorSet(fw.isNew));
};
