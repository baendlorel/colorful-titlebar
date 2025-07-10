import * as vscode from 'vscode';
import { basename, join } from 'node:path';
import { readFile } from 'node:fs';

import { getColor } from './colors';

export function activate(_context: vscode.ExtensionContext) {
  const cwd = vscode.workspace.workspaceFolders?.[0];
  const projectName = cwd ? basename(cwd.uri.fsPath) : 'kasukabe-tsumugi';
  const color = getColor(projectName, isDarkTheme());

  // 将状态栏项添加到订阅中，确保在扩展停用时清理
  const config = vscode.workspace.getConfiguration();
  const section = 'workbench.colorCustomizations';
  const value = {
    'titleBar.activeBackground': color.toString(),
    'titleBar.inactiveBackground': color.toGreyDarkenString(),
  };
  config.update(section, value, vscode.ConfigurationTarget.Workspace);

  // 删除配置文件
  purgeSettingsFile(section, value);
}

function isDarkTheme(): boolean {
  switch (vscode.window.activeColorTheme.kind) {
    case vscode.ColorThemeKind.Dark:
    case vscode.ColorThemeKind.HighContrast:
      return true;
    case vscode.ColorThemeKind.Light:
    case vscode.ColorThemeKind.HighContrastLight:
      return false;
  }
}

function purgeSettingsFile(section: string, value: any) {
  const cwd = vscode.workspace.workspaceFolders?.[0];
  vscode.window.showInformationMessage(`cwd? ${typeof cwd}`);
  if (!cwd) {
    vscode.window.showInformationMessage(`没有找到工作目录`);
    return;
  }
  const workspacePath = cwd.uri.fsPath;
  const configFilePath = join(workspacePath, '.vscode', 'settings.json');
  vscode.window.showInformationMessage(`configFilePath: ${configFilePath}`);
  readFile(configFilePath, 'utf8', (err, data) => {
    if (err) {
      vscode.window.showErrorMessage(`读取失败: ${err.message}`);
    } else {
      vscode.window.showInformationMessage(`文件内容是: ${data}`);
    }
  });
}

export function deactivate() {}
