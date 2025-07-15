import vscode from 'vscode';

import { Commands } from '@/common/consts';
import { gradient } from '@/features/gradient';
import { pickColor } from '@/core/pick-color';
import { refreshTitleBar } from './core/style';

export const register = (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(Commands.EnableGradient, gradient.enable),
    vscode.commands.registerCommand(Commands.DisableGradient, gradient.disable),
    vscode.commands.registerCommand(Commands.Refresh, refreshTitleBar),
    vscode.commands.registerCommand(Commands.PickColor, pickColor),
  ].filter((v) => v !== undefined);
  context.subscriptions.push(...commands);
};
