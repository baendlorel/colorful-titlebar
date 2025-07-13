import vscode from 'vscode';
import { Commands } from './core/consts';
import { Msg } from './core/i18n';
import { backupCss, ensureValidCssPath, hackCss, restoreCss } from './core/gradient';
import { showErrMsg, showInfoMsg } from './core/notifications';

export const registerCommands = (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(Commands.EnableGradient, async () => {
      const cssPathResult = await ensureValidCssPath();
      if (cssPathResult.fail) {
        return showErrMsg(cssPathResult);
      }
      const cssPath = cssPathResult.data as string;

      const gradientStyle = await vscode.window.showQuickPick([
        Msg.Commands.enableGradient.gradientStyle.brightCenter,
        Msg.Commands.enableGradient.gradientStyle.brightLeft,
      ]);

      if (gradientStyle === undefined) {
        return;
      }

      // & 已确保cssPath是能用的
      const backup = await backupCss(cssPath);
      if (backup.fail) {
        return showErrMsg(backup);
      }

      const hack = await hackCss(cssPath, gradientStyle);
      if (hack.fail) {
        return showErrMsg(backup);
      }

      showInfoMsg(hack.msg + backup.msg);
    }),
    vscode.commands.registerCommand(Commands.DisableGradient, async () => {
      const cssPathResult = await ensureValidCssPath();
      if (cssPathResult.fail) {
        return showErrMsg(cssPathResult);
      }
      const cssPath = cssPathResult.data as string;

      const restoreResult = await restoreCss(cssPath);
      (restoreResult.succ ? showInfoMsg : showErrMsg)(restoreResult);
    }),
  ];
  context.subscriptions.push(...commands);
};
