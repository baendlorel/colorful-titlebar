import * as vscode from 'vscode';
import { basename, join } from 'node:path';
import { readFile } from 'node:fs';

import { generateColor } from './utils';
import { RGBColor } from './colors';

export function activate(_context: vscode.ExtensionContext) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  let color = new RGBColor('#007ACC');
  if (workspaceFolder) {
    const folderPath = workspaceFolder.uri.fsPath;
    const projectName = basename(folderPath);
    vscode.window.showInformationMessage(`projectName:${projectName}`);
    color = generateColor(projectName, isDarkTheme());
  }

  vscode.window.showInformationMessage(`process.execPath: ${process.execPath}`);

  // 将状态栏项添加到订阅中，确保在扩展停用时清理
  vscode.window.showInformationMessage(`插件已激活！颜色: ${color.toString()}`);

  const config = vscode.workspace.getConfiguration();
  config.update(
    'workbench.colorCustomizations',
    {
      'titleBar.activeBackground': color.toString(),
      'titleBar.inactiveBackground': color.toGreyDarkenString(),
    },
    null
    // vscode.ConfigurationTarget.Global
  );
  purgeSettingsFile();
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

function purgeSettingsFile() {
  const folders = vscode.workspace.workspaceFolders;
  if (folders && folders.length > 0) {
    vscode.window.showInformationMessage(folders.map((f) => f.name).join(', '));
    const workspacePath = folders[0].uri.fsPath;
    const filePath = join(workspacePath, 'settings.json');
    readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        vscode.window.showErrorMessage(`读取失败: ${err.message}`);
      } else {
        vscode.window.showInformationMessage(`文件内容是: ${data}`);
      }
    });
  } else {
    vscode.window.showInformationMessage(
      `has folders? ${Array.isArray(folders)}, folders?.length: ${folders?.length}`
    );
  }
}

export function deactivate() {}
