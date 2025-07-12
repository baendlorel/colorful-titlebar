import vscode from 'vscode';
import { Msg } from './core/i18n';
import { configs } from './core/configs';
import { existsSync } from 'node:fs';
import { hackCss } from './core/gradient';

export const registerCommands = (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand('colorful-titlebar.enableGradient', async () => {
      let cssPath = configs.workbenchCssPath;
      if (!existsSync(cssPath)) {
        const input = await vscode.window.showInputBox({
          prompt: Msg.Commands.enableGradient.prompt,
          placeHolder: '例如：linear-gradient(to right, #ff7e5f, #feb47b)',
        });
        if (!input) {
          return;
        }

        cssPath = input.trim();
        if (!existsSync(cssPath)) {
          vscode.window.showWarningMessage(Msg.Commands.enableGradient.workbenchCssPathInvalid);
          return;
        }
        await configs.set.workbenchCssPath(cssPath);
      }

      await hackCss(cssPath);
    }),
    vscode.commands.registerCommand('colorful-titlebar.disableGradient', async () => {}),
  ];
  context.subscriptions.push(...commands);
};
