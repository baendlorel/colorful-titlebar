import vscode from 'vscode';
import { join } from 'node:path';
import { readdir, readFile, rm } from 'node:fs/promises';

import { Msg } from './i18n';
import { configs } from './configs';
import { getColor } from './colors';

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

export const updateTitleBarColor = async () => {
  const color = getColor(configs.dir);

  const newStyle = {
    [TBS.ActiveBg]: color.toString(),
    [TBS.InactiveBg]: color.toGreyDarkenString(),
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

export const clearTitleBarColor = async () => {
  const emptyStyle = {
    [TBS.ActiveBg]: undefined,
    [TBS.InactiveBg]: undefined,
  };
  await configs.global.update(TBS.Section, emptyStyle, vscode.ConfigurationTarget.Workspace);

  // 如果.vscode下只有settings一个文件，而且内容和上面的compact一样，那么删除.vscode
  const settingsPath = join(configs.dir, '.vscode'); // , 'settings.json'
  const list = await readdir(settingsPath);
  const content = await readFile(join(settingsPath, 'settings.json'), 'utf-8');

  if (list.length === 1 && content.replace(/\s/g, '') === `{"workbench.colorCustomizations":{}}`) {
    await rm(settingsPath, { recursive: true, force: true });
    return true;
  }
  return false;
};
