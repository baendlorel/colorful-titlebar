import vscode from 'vscode';
import { basename } from 'node:path';
import { readdir } from 'node:fs/promises';

import { Msg } from './core/i18n';
import { defaultColorSet, getColor } from './colors';
import { isTitleBarStyleCustom } from './core/ensure-custom';

const enum ConfigKey {
  Enabled = 'enabled',
  ShowInformationMessages = 'showInformationMessages',
  LightThemeColors = 'lightThemeColors',
  DarkThemeColors = 'darkThemeColors',
  ProjectIndicators = 'projectIndicators',
}

const enum TitleBarStyleConfig {
  Section = 'workbench.colorCustomizations',
  ActiveBackground = 'titleBar.activeBackground',
  InactiveBackground = 'titleBar.inactiveBackground',
}

interface PartialTitleBarStyleConfig {
  [TitleBarStyleConfig.ActiveBackground]: string;
  [TitleBarStyleConfig.InactiveBackground]: string;
}

export const activate = async (_context: vscode.ExtensionContext) => {
  const isCustom = await isTitleBarStyleCustom();
  if (!isCustom) {
    return;
  }

  const config = vscode.workspace.getConfiguration('colorful-titlebar');
  const enabled = config.get<boolean>(ConfigKey.Enabled, true);
  if (!enabled) {
    return;
  }

  const cwd = vscode.workspace.workspaceFolders?.[0];
  if (!cwd) {
    showInfo(Msg.NotWorkspace);
    return;
  }

  const isProject = await indicateProject(config, cwd);
  if (!isProject) {
    showInfo(Msg.NotProject);
    return;
  }

  const projectName = basename(cwd.uri.fsPath);
  const colorSet = getColorSet(config);
  const color = getColor(projectName, colorSet);
  const configValue = {
    [TitleBarStyleConfig.ActiveBackground]: color.toString(),
    [TitleBarStyleConfig.InactiveBackground]: color.toGreyDarkenString(),
  };

  // 将状态栏项添加到订阅中，确保在扩展停用时清理
  const workspaceConfig = vscode.workspace.getConfiguration();
  const curStyle = workspaceConfig.get<PartialTitleBarStyleConfig>(TitleBarStyleConfig.Section);
  if (curStyle && isSameStyle(curStyle, configValue)) {
    // 如果当前标题栏颜色已经是预期的颜色，则不需要更新
    return;
  }

  await workspaceConfig.update(
    TitleBarStyleConfig.Section,
    configValue,
    vscode.ConfigurationTarget.Workspace
  );
  // await purgeSettingsFile(section, value);
};

const isSameStyle = (a: PartialTitleBarStyleConfig, b: PartialTitleBarStyleConfig) =>
  a[TitleBarStyleConfig.ActiveBackground] === b[TitleBarStyleConfig.ActiveBackground] &&
  a[TitleBarStyleConfig.InactiveBackground] === b[TitleBarStyleConfig.InactiveBackground];

let showInfo: (message: string) => void = async (m: string) => {
  const config = vscode.workspace.getConfiguration('colorful-titlebar');
  const show = config.get<boolean>(ConfigKey.ShowInformationMessages, true);
  if (show) {
    showInfo = async (m: string) => {
      const result = await vscode.window.showInformationMessage(m, Msg.NoMoreInfoPop);
      if (result === Msg.NoMoreInfoPop) {
        await config.update(ConfigKey.Enabled, false, vscode.ConfigurationTarget.Global);
        await vscode.window.showInformationMessage(Msg.NoMoreInfoPopSet);
      }
    };
    await showInfo(m);
  } else {
    showInfo = async (m: string) => {};
  }
};

const indicateProject = async (
  config: vscode.WorkspaceConfiguration,
  cwd: vscode.WorkspaceFolder
): Promise<boolean> => {
  const list = await readdir(cwd.uri.fsPath);
  const indicators = config.get<string[]>(ConfigKey.ProjectIndicators, []);
  for (let i = 0; i < indicators.length; i++) {
    if (list.includes(indicators[i])) {
      return true;
    }
  }
  return false;
};

const getColorSet = (config: vscode.WorkspaceConfiguration): string[] => {
  switch (vscode.window.activeColorTheme.kind) {
    case vscode.ColorThemeKind.Dark:
    case vscode.ColorThemeKind.HighContrast:
      return config.get<string[]>(ConfigKey.DarkThemeColors, defaultColorSet.dark);
    case vscode.ColorThemeKind.Light:
    case vscode.ColorThemeKind.HighContrastLight:
      return config.get<string[]>(ConfigKey.LightThemeColors, defaultColorSet.light);
  }
};

export const deactivate = () => true;
