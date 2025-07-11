import vscode from 'vscode';
import { basename } from 'node:path';

import { configs } from './core/configs';
import { Msg } from './core/i18n';
import { clearTitleBarColor, isTitleBarStyleCustom, updateTitleBarColor } from './core/style';
import { getColor } from './core/colors';
import { indicateProject } from './core/indicate';
import { SettingsCreationWatcher } from './core/watcher';

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

  const cwd = vscode.workspace.workspaceFolders?.[0];
  if (!cwd) {
    console.log(Msg.NotWorkspace);
    return;
  }

  const isProject = await indicateProject(cwd);
  if (!isProject) {
    console.log(Msg.NotProject);
    return;
  }

  const projectName = basename(cwd.uri.fsPath);
  const color = getColor(cwd.uri.fsPath);
  const scw = new SettingsCreationWatcher(cwd.uri.fsPath);
  await updateTitleBarColor(color.toString(), color.toGreyDarkenString());
  showInfo(Msg.TitleBarColorSet(projectName, color.toString(), scw.isNew));
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
function registerCommands(context: vscode.ExtensionContext) {
  const enableCommand = vscode.commands.registerCommand('colorful-titlebar.enable', async () => {
    await configs.set.enabled(true);
    vscode.window.showInformationMessage(Msg.CommandEnable);
    // 重新执行插件逻辑
    await applyTitleBarColor();
  });

  const disableCommand = vscode.commands.registerCommand('colorful-titlebar.disable', async () => {
    await configs.set.enabled(false);
    await clearTitleBarColor();
    vscode.window.showInformationMessage(Msg.CommandDisable);
  });

  context.subscriptions.push(enableCommand, disableCommand);
}
