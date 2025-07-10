import * as vscode from 'vscode';
import * as path from 'path';
import * as crypto from 'crypto';

export function activate(context: vscode.ExtensionContext) {
  const workspaceFolder = vscode.workspace.workspaceFolders?.[0];
  vscode.window.showInformationMessage(`workspaceFolder:${workspaceFolder}`);

  let color: string;
  // set default color
  if (workspaceFolder) {
    const folderPath = workspaceFolder.uri.fsPath;
    const projectName = path.basename(folderPath);
    vscode.window.showInformationMessage(`projectName:${projectName}`);
    color = generateColorFromName(projectName);
    return;
  } else {
    color = '#FF2222';
  }

  vscode.window.showInformationMessage(`color:${color}`);

  const config = vscode.workspace.getConfiguration();
  config.update(
    'workbench.colorCustomizations',
    {
      'titleBar.activeBackground': color,
      'titleBar.inactiveBackground': color,
      'titleBar.activeForeground': '#ffffff',
      'titleBar.inactiveForeground': '#dddddd',
    },
    vscode.ConfigurationTarget.Global
  );
}

function generateColorFromName(name: string): string {
  // 创建稳定哈希（取前两个字节）
  const hash = crypto.createHash('md5').update(name).digest();
  const h = hash[0] % 360; // hue: 0 ~ 359
  const s = 60 + (hash[1] % 30); // saturation: 60% ~ 89%
  const l = 50; // lightness: 固定亮度

  return `hsl(${h}, ${s}%, ${l}%)`;
}

export function deactivate() {}
