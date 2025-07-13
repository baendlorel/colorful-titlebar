import vscode from 'vscode';
import { Commands } from './common/consts';
import { gradient } from './core/gradient';

export const registerCommands = (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(Commands.EnableGradient, gradient.enable),
    vscode.commands.registerCommand(Commands.DisableGradient, gradient.disable),
  ];
  context.subscriptions.push(...commands);
};
