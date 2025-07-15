import vscode from 'vscode';

import { Commands } from '@/common/consts';
import { pickColor } from '@/core/pick-color';
import { refreshTitleBar } from '@/core/style';

import catcher from '@/common/catcher';
import gradient from '@/features/gradient';

export default (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(Commands.EnableGradient, catcher(gradient.enable)),
    vscode.commands.registerCommand(Commands.DisableGradient, catcher(gradient.disable)),
    vscode.commands.registerCommand(Commands.Refresh, refreshTitleBar),
    vscode.commands.registerCommand(Commands.PickColor, pickColor),
  ].filter((v) => v !== undefined);
  context.subscriptions.push(...commands);
};
