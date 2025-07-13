import vscode from 'vscode';
import { Commands } from './core/consts';
import { Msg } from './core/i18n';
import { backupCss, getCssPath, hackCss, restoreCss } from './core/gradient';
import { showInfoMsg } from './core/notifications';
import { catcher } from './core/ct-error';

export const registerCommands = (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(
      Commands.EnableGradient,
      catcher(async () => {
        const cssPath = await getCssPath();

        const gradientStyle = await vscode.window.showQuickPick([
          Msg.Commands.enableGradient.style.brightCenter,
          Msg.Commands.enableGradient.style.brightLeft,
        ]);
        if (gradientStyle === undefined) {
          return;
        }

        // & 已确保cssPath是能用的
        const backupSuccMsg = await backupCss(cssPath);
        const hackSuccMsg = await hackCss(cssPath, gradientStyle);
        showInfoMsg(hackSuccMsg + backupSuccMsg);
      })
    ),
    vscode.commands.registerCommand(
      Commands.DisableGradient,
      catcher(async () => {
        const cssPath = await getCssPath();
        const restoreSuccMsg = await restoreCss(cssPath);
        showInfoMsg(restoreSuccMsg);
      })
    ),
  ];

  context.subscriptions.push(...commands);
};
