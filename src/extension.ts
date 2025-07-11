import vscode from 'vscode';
import { join } from 'node:path';

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

export const deactivate = () => true;

/**
 * 加载核心逻辑
 */
const applyTitleBarColor = async () => {
  const isCustom = await isTitleBarStyleCustom();
  if (!isCustom || !configs.enabled || !configs.dir) {
    return;
  }

  const isProject = await indicateProject();
  if (!isProject) {
    console.log(Msg.NotProject);
    return;
  }

  const fw = new FileCreationWatcher(join(configs.dir, '.vscode', 'settings.json'));
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

const registerCommands = (context: vscode.ExtensionContext) => {
  const commands = [
    vscode.commands.registerCommand('colorful-titlebar.enable', async () => {
      await configs.set.enabled(true);
      vscode.window.showInformationMessage(Msg.CommandEnable);
      await applyTitleBarColor();
    }),
    vscode.commands.registerCommand('colorful-titlebar.disable', async () => {
      await configs.set.enabled(false);
      const settingsRemoved = await clearTitleBarColor();
      vscode.window.showInformationMessage(Msg.CommandDisable(settingsRemoved));
    }),
    // vscode.commands.registerCommand('colorful-titlebar.clear', async () => {
    //   const settingsRemoved = await clearTitleBarColor();
    //   vscode.window.showInformationMessage(Msg.CommandDisable(settingsRemoved));
    // }),
  ];
  context.subscriptions.push(...commands);
};
