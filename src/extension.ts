import vscode from 'vscode';
import { basename } from 'node:path';

import { configs } from './core/configs';
import { Msg } from './core/i18n';
import { isTitleBarStyleCustom, updateTitleBarStyle } from './core/style';
import { getColor } from './core/colors';
import { indicateProject } from './core/indicate';
import { SettingsCreationWatcher } from './core/watcher';

export const activate = async (_context: vscode.ExtensionContext) => {
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
  await updateTitleBarStyle(color.toString(), color.toGreyDarkenString());
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
  : async (m: string) => {};

export const deactivate = () => true;
