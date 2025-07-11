import vscode from 'vscode';

import { configs } from './core/configs';
import { Msg } from './core/i18n';
import { clearTitleBarColor, isTitleBarStyleCustom, updateTitleBarColor } from './core/style';
import { indicateProject } from './core/indicate';
import { FileCreationWatcher } from './core/watcher';

export const activate = async (context: vscode.ExtensionContext) => {
  // 注册命令
  registerCommands(context);

  // 应用标题栏颜色
  await applyTitleBarColor();
};

/**
 * 加载核心逻辑s
 */
const applyTitleBarColor = async () => {
  const isCustom = await isTitleBarStyleCustom();
  if (!isCustom) {
    return;
  }

  if (!configs.enabled) {
    return;
  }

  const dir = configs.dir;
  if (!dir) {
    console.log(Msg.NotWorkspace);
    return;
  }

  const isProject = await indicateProject(dir);
  if (!isProject) {
    console.log(Msg.NotProject);
    return;
  }

  const fw = new FileCreationWatcher(dir);
  await updateTitleBarColor();
  showInfo(Msg.TitleBarColorSet(fw.isNew));
};

const showInfo = configs.showInfoPop
  ? async (m: string) => {
      const result = await vscode.window.showInformationMessage(m, Msg.NoMoreInfoPop);
      if (result === Msg.NoMoreInfoPop) {
        await configs.set.showInfoPop(false);
        await vscode.window.showInformationMessage(Msg.NoMoreInfoPopSet);
      }
    }
  : // eslint-disable-next-line @typescript-eslint/no-empty-function
    async (_: string) => {};

export const deactivate = () => true;

/**
 * Register all extension commands
 */
const registerCommands = (context: vscode.ExtensionContext) => {
  const enableCommand = vscode.commands.registerCommand('colorful-titlebar.enable', async () => {
    await configs.set.enabled(true);
    vscode.window.showInformationMessage(Msg.CommandEnable);
    // 重新执行插件逻辑
    await applyTitleBarColor();
  });

  const disableCommand = vscode.commands.registerCommand('colorful-titlebar.disable', async () => {
    await configs.set.enabled(false);
    const settingsRemoved = await clearTitleBarColor();
    vscode.window.showInformationMessage(Msg.CommandDisable(settingsRemoved));
  });

  const clearCommand = vscode.commands.registerCommand('colorful-titlebar.clear', async () => {
    const settingsRemoved = await clearTitleBarColor();
    vscode.window.showInformationMessage(Msg.CommandDisable(settingsRemoved));
  });

  context.subscriptions.push(enableCommand, disableCommand, clearCommand);
};
