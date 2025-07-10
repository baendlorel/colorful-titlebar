import * as vscode from 'vscode';
import * as path from 'path';
import { generateColor } from './utils';

export function activate(context: vscode.ExtensionContext) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];

  let color = '';
  if (workspaceFolder) {
    const folderPath = workspaceFolder.uri.fsPath;
    const projectName = path.basename(folderPath);
    vscode.window.showInformationMessage(`projectName:${projectName}`);
    color = generateColor(projectName, getBrightness());
  }

  vscode.window.showInformationMessage(`process.execPath: ${process.execPath}`);

  // 将状态栏项添加到订阅中，确保在扩展停用时清理
  vscode.window.showInformationMessage(`插件已激活！颜色: ${color}`);

  const config = vscode.workspace.getConfiguration();
  config.update(
    'workbench.colorCustomizations',
    {
      'titleBar.activeBackground': color,
      'titleBar.inactiveBackground': color,
    },
    null
    // vscode.ConfigurationTarget.Global
  );
}

function getBrightness() {
  switch (vscode.window.activeColorTheme.kind) {
    case vscode.ColorThemeKind.Dark:
    case vscode.ColorThemeKind.HighContrast:
      return { max: 40, min: 25 }; // 暗色主题: 25-40% (深色)
    case vscode.ColorThemeKind.Light:
    case vscode.ColorThemeKind.HighContrastLight:
      return { max: 100, min: 70 }; // 暗色主题: 25-40% (深色)
  }
}

export function deactivate() {}
