import vscode from 'vscode';

import { Msg } from './i18n';
import { configs } from './configs';

// $ TBS -> TitleBarStyle

const enum TBSCheckResult {
  Custom,
  NotCustom,
  JustSet,
}

const enum TBS {
  ParentSection = 'window',
  Section = 'titleBarStyle',
  ExpectedValue = 'custom',
  ActiveBg = 'titleBar.activeBackground',
  InactiveBg = 'titleBar.inactiveBackground',
}

interface TBSConfig {
  [TBS.ActiveBg]: string;
  [TBS.InactiveBg]: string;
}

const ensureTitleBarStyleIsCustom = async (): Promise<TBSCheckResult> => {
  // 检测当前标题栏样式设置
  const windowConfig = vscode.workspace.getConfiguration(TBS.ParentSection);
  const { value, target } = configs.inspect<string>(windowConfig, TBS.Section);
  if (value === TBS.ExpectedValue) {
    return TBSCheckResult.Custom;
  }

  const result = await vscode.window.showWarningMessage(
    Msg.NotCustomTitleBarStyle(Msg.ConfigLevel[target]),
    Msg.SetTitleBarStyleToCustom,
    Msg.Cancel
  );

  if (result !== Msg.SetTitleBarStyleToCustom) {
    return TBSCheckResult.NotCustom;
  }

  await windowConfig.update(TBS.Section, TBS.ExpectedValue, target);
  vscode.window.showInformationMessage(Msg.SetTitleBarStyleToCustomSuccess);
  return TBSCheckResult.JustSet;
};

export const isTitleBarStyleCustom = async () => {
  const result = await ensureTitleBarStyleIsCustom();
  switch (result) {
    case TBSCheckResult.Custom:
      return true;
    case TBSCheckResult.NotCustom:
      return false;
    case TBSCheckResult.JustSet:
      return false;
  }
};

export const updateTitleBarStyle = async (active: string, inactive: string) => {
  const newStyle = {
    [TBS.ActiveBg]: active,
    [TBS.InactiveBg]: inactive,
  };

  const workspaceConfig = vscode.workspace.getConfiguration();
  const oldStyle = workspaceConfig.get<TBSConfig>(TBS.Section);
  if (
    oldStyle &&
    oldStyle[TBS.ActiveBg] === newStyle[TBS.ActiveBg] &&
    oldStyle[TBS.InactiveBg] === newStyle[TBS.InactiveBg]
  ) {
    return;
  }
  await workspaceConfig.update(TBS.Section, newStyle, vscode.ConfigurationTarget.Workspace);
};
