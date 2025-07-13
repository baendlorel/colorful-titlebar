import vscode from 'vscode';
import { join } from 'node:path';
import { readdir, readFile, rm } from 'node:fs/promises';

import { Msg } from './i18n';
import { configs } from './configs';
import { getColor } from './colors';
import { SettingsJson, TitleBarStyle } from './consts';
import { showWarnMsg } from './notifications';
import { CTError, poper } from './ct-error';

// $ TBS -> TitleBarStyle
interface TBSConfig {
  [TitleBarStyle.ActiveBg]: string;
  [TitleBarStyle.InactiveBg]: string;
}

/**
 * 全局的`titleBarStyle`配置必须是`custom`，修改标题栏颜色的操作才能生效
 */
export const beCustom = poper(async (): Promise<string> => {
  // 检测当前标题栏样式设置
  const Global = vscode.ConfigurationTarget.Global;
  const value = configs.global.get<string>(TitleBarStyle.Section);
  if (value === TitleBarStyle.Expected) {
    return '';
  }

  const result = await showWarnMsg(
    Msg.NotCustomTitleBarStyle(Msg.ConfigLevel[Global]),
    Msg.SetTitleBarStyleToCustom,
    Msg.Cancel
  );

  if (result !== Msg.SetTitleBarStyleToCustom) {
    throw CTError.cancel;
  }

  await configs.global.update(TitleBarStyle.Section, TitleBarStyle.Expected, Global);
  return Msg.SetTitleBarStyleToCustomSuccess;
});

export const updateTitleBarColor = async () => {
  const color = getColor(configs.cwd);
  const newStyle = {
    [TitleBarStyle.ActiveBg]: color.toString(),
    [TitleBarStyle.InactiveBg]: color.toGreyDarkenString(),
  };
  const oldStyle = configs.global.get<TBSConfig>(TitleBarStyle.WorkbenchSection);
  if (
    oldStyle &&
    oldStyle[TitleBarStyle.ActiveBg] === newStyle[TitleBarStyle.ActiveBg] &&
    oldStyle[TitleBarStyle.InactiveBg] === newStyle[TitleBarStyle.InactiveBg]
  ) {
    return;
  }
  await configs.global.update(
    TitleBarStyle.WorkbenchSection,
    newStyle,
    vscode.ConfigurationTarget.Workspace
  );
};

export const clearTitleBarColor = async () => {
  const emptyStyle = {
    [TitleBarStyle.ActiveBg]: undefined,
    [TitleBarStyle.InactiveBg]: undefined,
  };
  await configs.global.update(
    TitleBarStyle.WorkbenchSection,
    emptyStyle,
    vscode.ConfigurationTarget.Workspace
  );

  // 如果.vscode下只有settings一个文件，而且内容和上面的compact一样，那么删除.vscode
  const settingsPath = join(configs.cwd, SettingsJson.Dir); // , 'settings.json'
  const list = await readdir(settingsPath);
  const content = await readFile(join(settingsPath, SettingsJson.FileName), 'utf-8');

  if (list.length === 1 && content.replace(/\s/g, '') === SettingsJson.MinimumContent) {
    await rm(settingsPath, { recursive: true, force: true });
    return true;
  }
  return false;
};
