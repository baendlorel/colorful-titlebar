import vscode from 'vscode';
import { Commands } from './core/consts';
import { Msg } from './core/i18n';
import { backupCss, ensureValidCssPath, hackCss, restoreCss } from './core/gradient';

export const registerCommands = (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(Commands.EnableGradient, async () => {
      const cssPath = await ensureValidCssPath();
      if (cssPath === null) {
        return;
      }

      const gradientStyle = await vscode.window.showQuickPick([
        Msg.Commands.enableGradient.gradientStyle.brightCenter,
        Msg.Commands.enableGradient.gradientStyle.brightLeft,
      ]);

      if (gradientStyle === undefined) {
        return;
      }

      // & 已确保cssPath是能用的
      await backupCss(cssPath);
      await hackCss(cssPath, gradientStyle);
      const backupSucc = Msg.Commands.enableGradient.backup.success;
      const succ = Msg.Commands.enableGradient.success;
      vscode.window.showInformationMessage(`${backupSucc} ${succ}`);
    }),
    vscode.commands.registerCommand(Commands.DisableGradient, async () => {
      const cssPath = await ensureValidCssPath();
      if (cssPath === null) {
        const notFound = Msg.Commands.enableGradient.backup.notFound();
        vscode.window.showErrorMessage(`${Msg.Commands.enableGradient.failed} ${notFound}`);
        return;
      }
      await restoreCss(cssPath);
      vscode.window.showInformationMessage(Msg.Commands.enableGradient.backup.restoredSucceeded);
    }),
  ];
  context.subscriptions.push(...commands);
};
