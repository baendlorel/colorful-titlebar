import vscode from 'vscode';
import { basename } from 'node:path';
import { readdir } from 'node:fs/promises';

import { configs } from './core/configs';
import { Msg } from './core/i18n';
import { isTitleBarStyleCustom } from './core/ensure-custom';
import { getColor } from './core/colors';

const enum TitleBarStyle {
  ParentSection = 'colorful-titlebar',
  Section = 'workbench.colorCustomizations',
  ActiveBackground = 'titleBar.activeBackground',
  InactiveBackground = 'titleBar.inactiveBackground',
}

interface PartialTitleBarStyleConfig {
  [TitleBarStyle.ActiveBackground]: string;
  [TitleBarStyle.InactiveBackground]: string;
}

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
    showInfo(Msg.NotWorkspace);
    return;
  }

  const isProject = await indicateProject(cwd);
  if (!isProject) {
    showInfo(Msg.NotProject);
    return;
  }

  const projectName = basename(cwd.uri.fsPath);
  const color = getColor(projectName);

  const configValue = {
    [TitleBarStyle.ActiveBackground]: color.toString(),
    [TitleBarStyle.InactiveBackground]: color.toGreyDarkenString(),
  };

  // 将状态栏项添加到订阅中，确保在扩展停用时清理
  const workspaceConfig = vscode.workspace.getConfiguration();
  const curStyle = workspaceConfig.get<PartialTitleBarStyleConfig>(TitleBarStyle.Section);
  if (curStyle && isSameStyle(curStyle, configValue)) {
    // 如果当前标题栏颜色已经是预期的颜色，则不需要更新
    return;
  }

  await workspaceConfig.update(
    TitleBarStyle.Section,
    configValue,
    vscode.ConfigurationTarget.Workspace
  );
};

const isSameStyle = (a: PartialTitleBarStyleConfig, b: PartialTitleBarStyleConfig) =>
  a[TitleBarStyle.ActiveBackground] === b[TitleBarStyle.ActiveBackground] &&
  a[TitleBarStyle.InactiveBackground] === b[TitleBarStyle.InactiveBackground];

let showInfo: (message: string) => void = async (m: string) => {
  const config = vscode.workspace.getConfiguration(TitleBarStyle.ParentSection);
  if (configs.showInformationMessages) {
    showInfo = async (m: string) => {
      const result = await vscode.window.showInformationMessage(m, Msg.NoMoreInfoPop);
      if (result === Msg.NoMoreInfoPop) {
        await configs.set.showInformationMessages(false);
        await vscode.window.showInformationMessage(Msg.NoMoreInfoPopSet);
      }
    };
    await showInfo(m);
  } else {
    showInfo = async (m: string) => {};
  }
};

const indicateProject = async (cwd: vscode.WorkspaceFolder): Promise<boolean> => {
  const list = await readdir(cwd.uri.fsPath);
  const indicators = configs.projectIndicators;

  for (let i = 0; i < indicators.length; i++) {
    if (list.includes(indicators[i])) {
      return true;
    }
  }
  return false;
};

export const deactivate = () => true;
