import vscode from 'vscode';
import { basename, join } from 'node:path';
import fs from 'node:fs/promises';

import { defaultColorSet, getColor } from './colors';
import { Msg } from './i18n';

const enum ConfigKey {
  Enabled = 'enabled',
  LightThemeColors = 'lightThemeColors',
  DarkThemeColors = 'darkThemeColors',
  ProjectIndicators = 'projectIndicators',
}

export const activate = async (_context: vscode.ExtensionContext) => {
  const config = vscode.workspace.getConfiguration('colorful-titlebar');

  const enabled = config.get<boolean>(ConfigKey.Enabled, true);
  if (!enabled) {
    return false;
  }

  const cwd = vscode.workspace.workspaceFolders?.[0];
  if (!cwd) {
    vscode.window.showInformationMessage(Msg.notOpenWorkspace);
    return;
  }

  const isProject = await indicateProject(config, cwd);
  if (isProject) {
    vscode.window.showInformationMessage(Msg.notProject);
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

const indicateProject = async (
  config: vscode.WorkspaceConfiguration,
  cwd: vscode.WorkspaceFolder
): Promise<boolean> => {
  const list = await fs.readdir(cwd.uri.fsPath);
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
