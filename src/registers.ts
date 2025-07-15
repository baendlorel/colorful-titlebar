import vscode from 'vscode';

import { Commands } from '@/common/consts';
import { pickColor } from '@/core/pick-color';

import catcher from '@/common/catcher';
import gradient from '@/features/gradient';
import style from './core/style';

export default (context: vscode.ExtensionContext) => {
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(Commands.EnableGradient, catcher(gradient.enable)),
    vscode.commands.registerCommand(Commands.DisableGradient, catcher(gradient.disable)),
    vscode.commands.registerCommand(Commands.Refresh, style.refresh.bind(style)),
    vscode.commands.registerCommand(Commands.PickColor, pickColor),
  ].filter((v) => v !== undefined);
  context.subscriptions.push(...commands);
};
