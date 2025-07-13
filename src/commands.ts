import vscode from 'vscode';
import { Commands } from './core/consts';
import { Msg } from './core/i18n';
import { backupCss, getMainCssPath, hackCss, restoreCss } from './core/gradient';
import { catcher } from './core/catcher';

export const registerCommands = (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(
      Commands.EnableGradient,
      catcher(async () => {
        const cssPath = await getMainCssPath();
        if (!cssPath) {
          return;
        }

        const gradientStyle = await vscode.window.showQuickPick([
          Msg.Commands.enableGradient.style.brightCenter,
          Msg.Commands.enableGradient.style.brightLeft,
        ]);
        if (!gradientStyle) {
          return;
        }

        // & 已确保cssPath是能用的
        await backupCss(cssPath);
        await hackCss(cssPath, gradientStyle);
      })
    ),
    vscode.commands.registerCommand(
      Commands.DisableGradient,
      catcher(async () => {
        const cssPath = await getMainCssPath();
        if (!cssPath) {
          return;
        }
        await restoreCss(cssPath);
      })
    ),
  ];

  context.subscriptions.push(...commands);
};
