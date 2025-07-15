import vscode from 'vscode';
import { join } from 'node:path';
import { readdir, readFile, rm } from 'node:fs/promises';

import { Msg } from '@/common/i18n';
import { configs } from '@/common/configs';
import { Commands, SettingsJson, TitleBarStyle } from '@/common/consts';
import { getColor } from './colors';
import { popInfo } from '@/common/notifications';

interface StyleConfig {
  [TitleBarStyle.ActiveBg]: string;
  [TitleBarStyle.InactiveBg]: string;
}

/**
 * 设置标题栏颜色
 * @param satisfied 是否是满意的情况下调用，如果不满意那么会弹窗提示是否要手选颜色
 */
export const refreshTitleBar = async (satisfied = false) => {
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

  if (!satisfied) {
    const suggest = Msg.Commands.pickColor.suggest;

    // 询问用户是否要手动选择颜色
    const result = await popInfo(suggest.msg, suggest.yes, suggest.no);

    if (result === suggest.yes) {
      // 通过命令ID拉起颜色选择器，避免循环引用
      await vscode.commands.executeCommand(Commands.PickColor);
    }
  }
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

// # region Checking

/**
 * 看看是不是已经设置了颜色，已经设置了就不要重复了
 */
export const alreadySetTitleBarColor = (): boolean => {
  const workspaceConfig = configs.global.inspect(TitleBarStyle.WorkbenchSection);
  const workspaceValue = workspaceConfig?.workspaceValue as StyleConfig | undefined;

  if (!workspaceValue) {
    return false;
  }

  return (
    workspaceValue[TitleBarStyle.ActiveBg] !== undefined &&
    workspaceValue[TitleBarStyle.InactiveBg] !== undefined
  );
};

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

  const result = await vscode.window.showWarningMessage(
    Msg.NotCustomTitleBarStyle(Msg.ConfigLevel[Global]),
    Msg.SetTitleBarStyleToCustom,
    Msg.Cancel
  );
  if (result !== Msg.SetTitleBarStyleToCustom) {
    throw false;
  }

  await configs.global.update(TitleBarStyle.Section, TitleBarStyle.Expected, Global);
  vscode.window.showInformationMessage(Msg.SetTitleBarStyleToCustomSuccess);
  return true;
};
// # endregion
