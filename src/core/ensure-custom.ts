import vscode from 'vscode';

import { Msg } from './i18n';
import { configs } from './configs';

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

const ensureTitleBarStyleIsCustom = async (): Promise<TitleBarStyleCheckResult> => {
  // 检测当前标题栏样式设置
  const windowConfig = vscode.workspace.getConfiguration(TitleBarStyle.ParentSection);
  const curStyle = windowConfig.get<string>(TitleBarStyle.Section);
  if (curStyle === TitleBarStyle.ExpectedValue) {
    return TitleBarStyleCheckResult.Custom;
  }

  const style = windowConfig.inspect<string>(TitleBarStyle.Section);
  const configTarget = configs.getConfigTarget(curStyle, style);

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
