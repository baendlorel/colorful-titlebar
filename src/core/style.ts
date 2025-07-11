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
  GlobalSection = 'window.titleBarStyle',
  ExpectedValue = 'custom',
  Section = 'workbench.colorCustomizations',
  ActiveBg = 'titleBar.activeBackground',
  InactiveBg = 'titleBar.inactiveBackground',
}

interface TBSConfig {
  [TBS.ActiveBg]: string;
  [TBS.InactiveBg]: string;
}

/**
 * 全局的`titleBarStyle`配置必须是`custom`，修改标题栏颜色的操作才能生效
 * @returns
 */
const ensureIsCustom = async (): Promise<TBSCheckResult> => {
  // 检测当前标题栏样式设置
  const Global = vscode.ConfigurationTarget.Global;
  const value = configs.global.get<string>(TBS.GlobalSection);
  if (value === TBS.ExpectedValue) {
    return TBSCheckResult.Custom;
  }

  const result = await vscode.window.showWarningMessage(
    Msg.NotCustomTitleBarStyle(Msg.ConfigLevel[Global]),
    Msg.SetTitleBarStyleToCustom,
    Msg.Cancel
  );

  if (result !== Msg.SetTitleBarStyleToCustom) {
    return TBSCheckResult.NotCustom;
  }

  await configs.global.update(TBS.GlobalSection, TBS.ExpectedValue, Global);
  vscode.window.showInformationMessage(Msg.SetTitleBarStyleToCustomSuccess);
  return TBSCheckResult.JustSet;
};

export const isTitleBarStyleCustom = async () => {
  const result = await ensureIsCustom();
  switch (result) {
    case TBSCheckResult.Custom:
      return true;
    case TBSCheckResult.NotCustom:
      return false;
    case TBSCheckResult.JustSet:
      return false;
  }
};

export const updateTitleBarColor = async (active: string, inactive: string) => {
  const newStyle = {
    [TBS.ActiveBg]: active,
    [TBS.InactiveBg]: inactive,
  };

  const oldStyle = configs.global.get<TBSConfig>(TBS.Section);
  if (
    oldStyle &&
    oldStyle[TBS.ActiveBg] === newStyle[TBS.ActiveBg] &&
    oldStyle[TBS.InactiveBg] === newStyle[TBS.InactiveBg]
  ) {
    return;
  }
  await configs.global.update(TBS.Section, newStyle, vscode.ConfigurationTarget.Workspace);
};
