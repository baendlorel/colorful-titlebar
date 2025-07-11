import vscode from 'vscode';

import { Msg } from './i18n';

const enum TitleBarStyleCheckResult {
  Custom,
  NotCustom,
  JustSet,
}

const enum TitleBarStyle {
  ParentSection = 'window',
  Section = 'titleBarStyle',
  ExpectedValue = 'custom',
}

/**
 * 按照层级一层层往外，谁有配置就改谁
 * @param style
 * @returns
 */
const getConfigTarget = (
  style:
    | {
        globalValue?: string | undefined;
        workspaceValue?: string | undefined;
        workspaceFolderValue?: string | undefined;
      }
    | undefined
): vscode.ConfigurationTarget => {
  if (typeof style !== 'object' || style === null) {
    return vscode.ConfigurationTarget.Global;
  }

  if (style.workspaceFolderValue) {
    return vscode.ConfigurationTarget.WorkspaceFolder;
  }

  if (style.workspaceValue) {
    return vscode.ConfigurationTarget.Workspace;
  }

  // if (style.globalValue) {
  return vscode.ConfigurationTarget.Global;
};

const ensureTitleBarStyleIsCustom = async (): Promise<TitleBarStyleCheckResult> => {
  // 检测当前标题栏样式设置
  const windowConfig = vscode.workspace.getConfiguration(TitleBarStyle.ParentSection);
  const titleBarStyle = windowConfig.get<string>(TitleBarStyle.Section);
  if (titleBarStyle === TitleBarStyle.ExpectedValue) {
    return TitleBarStyleCheckResult.Custom;
  }

  const style = windowConfig.inspect<string>(TitleBarStyle.Section);
  const configTarget = getConfigTarget(style);
  const result = await vscode.window.showWarningMessage(
    Msg.NotCustomTitleBarStyle(Msg.ConfigLevel[configTarget]),
    Msg.SetTitleBarStyleToCustom,
    Msg.Cancel
  );

  if (result !== Msg.SetTitleBarStyleToCustom) {
    return TitleBarStyleCheckResult.NotCustom;
  }

  await windowConfig.update(TitleBarStyle.Section, TitleBarStyle.ExpectedValue, configTarget);
  vscode.window.showInformationMessage(Msg.SetTitleBarStyleToCustomSuccess);
  return TitleBarStyleCheckResult.JustSet;
};

export const isTitleBarStyleCustom = async () => {
  const result = await ensureTitleBarStyleIsCustom();
  switch (result) {
    case TitleBarStyleCheckResult.Custom:
      return true;
    case TitleBarStyleCheckResult.NotCustom:
      return false;
    case TitleBarStyleCheckResult.JustSet:
      return false;
  }
};
