import * as path from 'node:path';
import * as fs from 'node:fs';
import * as vscode from 'vscode';

let isGradientEnabled = false;
let originalCSS = '';

export function activate(context: vscode.ExtensionContext) {
  console.log('Idea Gradient Titlebar extension is now active!');

  // 注册命令
  const enableCommand = vscode.commands.registerCommand('idea-gradient-titlebar.enable', () => {
    enableGradientTitlebar();
  });

  const disableCommand = vscode.commands.registerCommand('idea-gradient-titlebar.disable', () => {
    disableGradientTitlebar();
  });

  const configureCommand = vscode.commands.registerCommand(
    'idea-gradient-titlebar.configure',
    () => {
      configureGradientTitlebar();
    }
  );

  context.subscriptions.push(enableCommand, disableCommand, configureCommand);

  // 监听配置变化
  const configChangeListener = vscode.workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration('idea-gradient-titlebar')) {
      const config = vscode.workspace.getConfiguration('idea-gradient-titlebar');
      if (config.get('enabled') && isGradientEnabled) {
        applyGradientEffect();
      }
    }
  });

  context.subscriptions.push(configChangeListener);

  // 启动时检查配置
  const config = vscode.workspace.getConfiguration('idea-gradient-titlebar');
  if (config.get('enabled')) {
    enableGradientTitlebar();
  }
}

function enableGradientTitlebar() {
  try {
    const vscodePath = getVSCodePath();
    if (!vscodePath) {
      vscode.window.showErrorMessage('无法找到VS Code安装路径');
      return;
    }

    backupOriginalCSS(vscodePath);
    applyGradientEffect();
    isGradientEnabled = true;

    vscode.window.showInformationMessage('渐变标题栏已启用！请重启VS Code以查看效果。');
  } catch (error) {
    vscode.window.showErrorMessage(`启用渐变标题栏失败: ${error}`);
  }
}

function disableGradientTitlebar() {
  try {
    const vscodePath = getVSCodePath();
    if (!vscodePath) {
      vscode.window.showErrorMessage('无法找到VS Code安装路径');
      return;
    }

    restoreOriginalCSS(vscodePath);
    isGradientEnabled = false;

    vscode.window.showInformationMessage('渐变标题栏已禁用！请重启VS Code以查看效果。');
  } catch (error) {
    vscode.window.showErrorMessage(`禁用渐变标题栏失败: ${error}`);
  }
}

async function configureGradientTitlebar() {
  const config = vscode.workspace.getConfiguration('idea-gradient-titlebar');

  // 选择渐变方向
  const directions = ['horizontal', 'vertical', 'diagonal'];
  const selectedDirection = await vscode.window.showQuickPick(directions, {
    placeHolder: '选择渐变方向',
  });

  if (selectedDirection) {
    await config.update('direction', selectedDirection, vscode.ConfigurationTarget.Global);
  }

  // 配置透明度
  const opacity = await vscode.window.showInputBox({
    prompt: '输入透明度 (0-1)',
    value: config.get('opacity')?.toString() || '0.8',
    validateInput: (value) => {
      const num = parseFloat(value);
      if (isNaN(num) || num < 0 || num > 1) {
        return '请输入0到1之间的数字';
      }
      return null;
    },
  });

  if (opacity) {
    await config.update('opacity', parseFloat(opacity), vscode.ConfigurationTarget.Global);
  }

  vscode.window.showInformationMessage('配置已更新！');
}

function applyGradientEffect() {
  const config = vscode.workspace.getConfiguration('idea-gradient-titlebar');
  const colors = (config.get('gradientColors') as string[]) || ['#667eea', '#764ba2'];
  const direction = (config.get('direction') as string) || 'horizontal';
  const opacity = (config.get('opacity') as number) || 0.8;

  let gradientDirection = 'to right';
  switch (direction) {
    case 'vertical':
      gradientDirection = 'to bottom';
      break;
    case 'diagonal':
      gradientDirection = 'to bottom right';
      break;
  }

  const gradientCSS = `
        .titlebar {
            background: linear-gradient(${gradientDirection}, ${colors.join(', ')}) !important;
            opacity: ${opacity} !important;
        }
        
        .titlebar .window-title {
            color: white !important;
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5) !important;
        }
        
        .titlebar .window-controls-container .codicon {
            color: white !important;
        }
    `;

  const vscodePath = getVSCodePath();
  if (vscodePath) {
    injectCSS(vscodePath, gradientCSS);
  }
}

function getVSCodePath(): string | null {
  // 这里需要根据不同操作系统找到VS Code的安装路径
  // 这是一个简化的实现，实际应用中需要更复杂的逻辑
  const possiblePaths = [
    '/usr/share/code/resources/app/out/vs/workbench/workbench.desktop.main.css',
    '/opt/visual-studio-code/resources/app/out/vs/workbench/workbench.desktop.main.css',
    path.join(
      process.env.HOME || '',
      '.vscode',
      'resources',
      'app',
      'out',
      'vs',
      'workbench',
      'workbench.desktop.main.css'
    ),
  ];

  for (const cssPath of possiblePaths) {
    if (fs.existsSync(cssPath)) {
      return path.dirname(cssPath);
    }
  }

  return null;
}

function backupOriginalCSS(vscodePath: string) {
  const cssPath = path.join(vscodePath, 'workbench.desktop.main.css');
  const backupPath = path.join(vscodePath, 'workbench.desktop.main.css.backup');

  if (fs.existsSync(cssPath) && !fs.existsSync(backupPath)) {
    originalCSS = fs.readFileSync(cssPath, 'utf8');
    fs.writeFileSync(backupPath, originalCSS);
  }
}

function restoreOriginalCSS(vscodePath: string) {
  const cssPath = path.join(vscodePath, 'workbench.desktop.main.css');
  const backupPath = path.join(vscodePath, 'workbench.desktop.main.css.backup');

  if (fs.existsSync(backupPath)) {
    const backupCSS = fs.readFileSync(backupPath, 'utf8');
    fs.writeFileSync(cssPath, backupCSS);
  }
}

function injectCSS(vscodePath: string, customCSS: string) {
  const cssPath = path.join(vscodePath, 'workbench.desktop.main.css');

  if (fs.existsSync(cssPath)) {
    let cssContent = fs.readFileSync(cssPath, 'utf8');

    // 移除之前的自定义CSS
    cssContent = cssContent.replace(
      /\/\* IDEA_GRADIENT_TITLEBAR_START \*\/[\s\S]*?\/\* IDEA_GRADIENT_TITLEBAR_END \*\//g,
      ''
    );

    // 添加新的自定义CSS
    cssContent += `\n/* IDEA_GRADIENT_TITLEBAR_START */\n${customCSS}\n/* IDEA_GRADIENT_TITLEBAR_END */`;

    fs.writeFileSync(cssPath, cssContent);
  }
}

export function deactivate() {
  if (isGradientEnabled) {
    disableGradientTitlebar();
  }
}
