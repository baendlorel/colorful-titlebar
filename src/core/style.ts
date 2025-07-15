import vscode from 'vscode';
import { join } from 'node:path';
import { readdir, readFile, rm } from 'node:fs/promises';

import i18n from '@/common/i18n';
import configs from '@/common/configs';
import { Commands, SettingsJson, TitleBarConsts } from '@/common/consts';
import { suggestInfo } from '@/common/notifications';

import { getColor } from './colors';

interface ConfigOpt {
  [TitleBarConsts.ActiveBg]: string;
  [TitleBarConsts.InactiveBg]: string;
}

class TitleBarStyle {
  /**
   * 设置标题栏颜色
   * @param satisfied 是否是满意的情况下调用，如果不满意那么会弹窗提示是否要手选颜色
   */
  async refresh(satisfied = false) {
    if (!configs.cwd) {
      return;
    }

    // 如果标题栏样式不是custom，则不设置颜色
    const globalTitleBarStyleIsCustom = await this.tryCustom();
    if (!globalTitleBarStyleIsCustom) {
      return;
    }

    const isProject = await this.checkDirIsProject();
    if (!isProject) {
      return;
    }

    const color = getColor(configs.cwd);
    const newStyle = {
      [TitleBarConsts.ActiveBg]: color.toString(),
      [TitleBarConsts.InactiveBg]: color.toGreyDarkenString(),
    };
    const oldStyle = configs.global.get<ConfigOpt>(TitleBarConsts.WorkbenchSection);
    if (
      oldStyle &&
      oldStyle[TitleBarConsts.ActiveBg] === newStyle[TitleBarConsts.ActiveBg] &&
      oldStyle[TitleBarConsts.InactiveBg] === newStyle[TitleBarConsts.InactiveBg]
    ) {
      return;
    }
    await configs.global.update(
      TitleBarConsts.WorkbenchSection,
      newStyle,
      vscode.ConfigurationTarget.Workspace
    );

    if (!satisfied) {
      const suggest = i18n.Commands.pickColor.suggest;

      // 询问用户是否要手动选择颜色
      const result = await suggestInfo(suggest.msg, suggest.yes, suggest.no);

      if (result === suggest.yes) {
        // 通过命令ID拉起颜色选择器，避免循环引用
        await vscode.commands.executeCommand(Commands.PickColor);
      }
    }
  }

  async applyIfNotSet() {
    if (this.alreadySet()) {
      return;
    }
    await this.refresh();
  }

  /**
   * 将计算的标题栏颜色清空
   * @deprecated
   */
  async clear() {
    const emptyStyle = {
      [TitleBarConsts.ActiveBg]: undefined,
      [TitleBarConsts.InactiveBg]: undefined,
    };
    await configs.global.update(
      TitleBarConsts.WorkbenchSection,
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
  }

  /**
   * 看看是不是已经设置了颜色，已经设置了就不要重复了
   */
  private alreadySet(): boolean {
    const workspaceConfig = configs.global.inspect(TitleBarConsts.WorkbenchSection);
    const workspaceValue = workspaceConfig?.workspaceValue as ConfigOpt | undefined;

    if (!workspaceValue) {
      return false;
    }

    return (
      workspaceValue[TitleBarConsts.ActiveBg] !== undefined &&
      workspaceValue[TitleBarConsts.InactiveBg] !== undefined
    );
  }

  private async checkDirIsProject() {
    const list = await readdir(configs.cwd);
    const indicators = configs.projectIndicators;
    for (let i = 0; i < list.length; i++) {
      if (indicators.includes(list[i])) {
        return true;
      }
    }
    return false;
  }

  /**
   * 全局的`titleBarStyle`配置必须是`custom`，修改标题栏颜色的操作才能生效
   */
  private async tryCustom(): Promise<boolean> {
    // 检测当前标题栏样式设置
    const Global = vscode.ConfigurationTarget.Global;
    const value = configs.global.get<string>(TitleBarConsts.Section);
    if (value === TitleBarConsts.Expected) {
      return true;
    }

    const result = await vscode.window.showWarningMessage(
      i18n.NotCustomTitleBarStyle(i18n.ConfigLevel[Global]),
      i18n.SetTitleBarStyleToCustom,
      i18n.Cancel
    );
    if (result !== i18n.SetTitleBarStyleToCustom) {
      throw false;
    }

    await configs.global.update(TitleBarConsts.Section, TitleBarConsts.Expected, Global);
    vscode.window.showInformationMessage(i18n.SetTitleBarStyleToCustomSuccess);
    return true;
  }
}

export default new TitleBarStyle();
