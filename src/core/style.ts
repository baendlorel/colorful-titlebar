import vscode from 'vscode';
import { join } from 'node:path';
import { readdir, readFile, rm } from 'node:fs/promises';

import { Msg } from '@/common/i18n';
import { configs } from '@/common/configs';
import { getColor } from './colors';
import { SettingsJson, TitleBarStyle } from '../common/consts';
import { showInfoMsg, showWarnMsg } from '../common/notifications';

interface StyleConfig {
  [TitleBarStyle.ActiveBg]: string;
  [TitleBarStyle.InactiveBg]: string;
}

const checkDirIsProject = async () => {
  const list = await readdir(configs.cwd);
  const indicators = configs.projectIndicators;
  for (let i = 0; i < list.length; i++) {
    if (indicators.includes(list[i])) {
      return true;
    }
  }
  return false;
};

/**
 * 全局的`titleBarStyle`配置必须是`custom`，修改标题栏颜色的操作才能生效
 */
const tryCustom = async (): Promise<boolean> => {
  // 检测当前标题栏样式设置
  const Global = vscode.ConfigurationTarget.Global;
  const value = configs.global.get<string>(TitleBarStyle.Section);
  if (value === TitleBarStyle.Expected) {
    return true;
  }

  const result = await showWarnMsg(
    Msg.NotCustomTitleBarStyle(Msg.ConfigLevel[Global]),
    Msg.SetTitleBarStyleToCustom,
    Msg.Cancel
  );
  if (result !== Msg.SetTitleBarStyleToCustom) {
    throw false;
  }

  await configs.global.update(TitleBarStyle.Section, TitleBarStyle.Expected, Global);
  showInfoMsg(Msg.SetTitleBarStyleToCustomSuccess);
  return true;
};

/**
 * 设置标题栏颜色
 */
export const applyTitleBarColor = async () => {
  if (!configs.cwd) {
    return;
  }

  // 如果标题栏样式不是custom，则不设置颜色
  const globalTitleBarStyleIsCustom = await tryCustom();
  if (!globalTitleBarStyleIsCustom) {
    return;
  }

  const isProject = await checkDirIsProject();
  if (!isProject) {
    return;
  }

  const color = getColor(configs.cwd);
  const newStyle = {
    [TitleBarStyle.ActiveBg]: color.toString(),
    [TitleBarStyle.InactiveBg]: color.toGreyDarkenString(),
  };
  const oldStyle = configs.global.get<StyleConfig>(TitleBarStyle.WorkbenchSection);
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

/**
 * 将计算的标题栏颜色清空
 */
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
  }
};
