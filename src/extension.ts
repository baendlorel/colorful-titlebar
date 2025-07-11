import * as vscode from 'vscode';
import { basename, join } from 'node:path';
import fs from 'node:fs/promises';

import { defaultColorSet, getColor } from './colors';

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
    vscode.window.showInformationMessage(`没有打开工作区文件夹，不改变颜色`);
    return;
  }

  const isProject = await indicateProject(config, cwd);
  if (isProject) {
    vscode.window.showInformationMessage(`当前不是项目目录，不改变颜色`);
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

// & 删除settings文件后，样式将直接变回去
const purgeSettingsFile = async (section: string, value: unknown) => {
  const cwd = vscode.workspace.workspaceFolders?.[0];
  if (!cwd) {
    vscode.window.showInformationMessage(`没有找到工作目录`);
    return;
  }

  const vscodeSettingsPath = join(cwd.uri.fsPath, '.vscode');
  const configFilePath = join(vscodeSettingsPath, 'settings.json');

  try {
    const files = await fs.readdir(vscodeSettingsPath);
    if (files.length === 1 && files[0] === 'settings.json') {
      vscode.window.showInformationMessage(`删除? ${configFilePath}`);
    }

    const content = await fs.readFile(configFilePath, 'utf8');
    const compactContent = content.replace(/\s/g, '');
    const compactBgColorSetting = JSON.stringify({ [section]: value });

    if (compactContent === compactBgColorSetting) {
      vscode.window.showInformationMessage(`只包含彩色标题栏！: ${compactContent}`);
      await fs.unlink(configFilePath);
    }
  } catch (error) {
    vscode.window.showErrorMessage(`读取失败: ${(error as Error).message}`);
  }
};

export const deactivate = () => true;
