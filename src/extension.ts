import * as vscode from 'vscode';
import { basename, join } from 'node:path';
import fs from 'node:fs/promises';

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

  config.update(section, value, vscode.ConfigurationTarget.Workspace).then((v) => {
    vscode.window.showInformationMessage(`设置完成 ${typeof v}`);
  });
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

// todo 试试看删除文件后是否还能正常显示颜色
async function purgeSettingsFile(section: string, value: unknown) {
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
    const content = fs.readFile(configFilePath, 'utf8');
    vscode.window.showInformationMessage(`文件内容是: ${content}`);
  } catch (error) {
    vscode.window.showErrorMessage(`读取失败: ${(error as Error).message}`);
  }
}

export function deactivate() {
  return true;
}
