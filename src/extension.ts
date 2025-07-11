import vscode from 'vscode';
import { basename } from 'node:path';
import { readdir } from 'node:fs/promises';

import { defaultColorSet, getColor } from './colors';
import { Msg } from './i18n';

const enum ConfigKey {
  Enabled = 'enabled',
  showInformationMessages = 'showInformationMessages',
  LightThemeColors = 'lightThemeColors',
  DarkThemeColors = 'darkThemeColors',
  ProjectIndicators = 'projectIndicators',
}

export const activate = async (_context: vscode.ExtensionContext) => {
  const titleBarStyleCheckResult = await ensureTitleBarStyleIsCustom();
  switch (titleBarStyleCheckResult) {
    case TitleBarStyleCheckResult.Custom:
      break;
    case TitleBarStyleCheckResult.NotCustom:
      return;
    case TitleBarStyleCheckResult.JustSet:
      return;
  }

  const config = vscode.workspace.getConfiguration('colorful-titlebar');
  const enabled = config.get<boolean>(ConfigKey.Enabled, true);
  if (!enabled) {
    return false;
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

  // 将状态栏项添加到订阅中，确保在扩展停用时清理
  const workspaceConfig = vscode.workspace.getConfiguration();
  const section = 'workbench.colorCustomizations';
  const value = {
    'titleBar.activeBackground': color.toString(),
    'titleBar.inactiveBackground': color.toGreyDarkenString(),
  };

  await workspaceConfig.update(section, value, vscode.ConfigurationTarget.Workspace);
  // await purgeSettingsFile(section, value);
};

let showInfo: (message: string) => void = async (m: string) => {
  const config = vscode.workspace.getConfiguration('colorful-titlebar');
  const show = config.get<boolean>(ConfigKey.showInformationMessages, true);
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

const enum TitleBarStyleCheckResult {
  Custom,
  NotCustom,
  JustSet,
}

const ensureTitleBarStyleIsCustom = async (): Promise<TitleBarStyleCheckResult> => {
  // 检测当前标题栏样式设置
  const titleBarStyle = vscode.workspace.getConfiguration('window').get<string>('titleBarStyle');

  const titleBarStyleInspect = vscode.workspace
    .getConfiguration('window')
    .inspect<string>('titleBarStyle');

  let configurationTarget = vscode.ConfigurationTarget.Global;
  if (titleBarStyleInspect?.workspaceFolderValue === titleBarStyle) {
    configurationTarget = vscode.ConfigurationTarget.WorkspaceFolder;
  } else if (titleBarStyleInspect?.workspaceValue === titleBarStyle) {
    configurationTarget = vscode.ConfigurationTarget.Workspace;
  }

  if (titleBarStyle === 'custom') {
    return TitleBarStyleCheckResult.Custom;
  }

  const result = await vscode.window.showWarningMessage(
    Msg.NotCustomTitleBarStyleHint(Msg.ConfigLevel[configurationTarget]),
    Msg.SetTitleBarStyleToCustom,
    Msg.Cancel
  );

  if (result === Msg.SetTitleBarStyleToCustom) {
    await vscode.workspace
      .getConfiguration('window')
      .update('titleBarStyle', 'custom', configurationTarget);
    vscode.window.showInformationMessage(Msg.SetTitleBarStyleToCustomSuccess);
    return TitleBarStyleCheckResult.JustSet;
  } else {
    return TitleBarStyleCheckResult.NotCustom;
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
