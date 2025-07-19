import vscode from 'vscode';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { GradientStyle } from '@/common/consts';
import i18n from '@/common/i18n';
import configs from '@/common/configs';

import { AfterStyle, Css } from './consts';

class Hacker {
  private readonly Enable = i18n.Features.gradient;

  /**
   * 获取主css文件的路径
   * @returns 如果路径上没找到文件或用户放弃输入，返回`null`
   */
  async getWorkbenchCssPath(): Promise<string | null> {
    let cssPath = configs.workbenchCssPath;
    if (existsSync(cssPath)) {
      return cssPath;
    }

    const input = await vscode.window.showInputBox({
      title: this.Enable.title,
      prompt: this.Enable.prompt,
      placeHolder: this.Enable.placeHolder,
      ignoreFocusOut: true,
    });
    if (!input || !existsSync(input.trim())) {
      return null;
    }

    cssPath = input.trim();
    await configs.setWorkbenchCssPath(cssPath);
    return cssPath;
  }

  /**
   * 已包含backup
   *
   * 会在command注册的地方就确认`cssPath`是否存在
   */
  async inject(cssPath: string, gradientStyle: string): Promise<void> {
    const backupPath = `${cssPath}.${Css.BackupSuffix}`;
    if (!existsSync(backupPath)) {
      const buffer = await readFile(cssPath);
      await writeFile(`${cssPath}.${Css.BackupSuffix}`, buffer);
    }

    let rawStyle = AfterStyle.BrightLeft;
    switch (gradientStyle) {
      case this.Enable.style[GradientStyle.BrightCenter]:
        rawStyle = AfterStyle.BrightCenter;
        break;
      case this.Enable.style[GradientStyle.BrightLeft]:
        rawStyle = AfterStyle.BrightLeft;
        break;
      case this.Enable.style[GradientStyle.ArcLeft]:
        rawStyle = AfterStyle.ArcLeft;
        break;
    }

    const darkness = (configs.gradientDarkness / 100).toString();
    const brightness = (configs.gradientBrightness / 100).toString();
    const style = rawStyle
      .replaceAll('{darkness}', darkness)
      .replaceAll('{brightness}', brightness)
      .replace(/\n[\s]+/g, '');

    // vscode.window.showInformationMessage(style);

    let css = await readFile(cssPath, 'utf8');

    // 消除旧的注入
    css = css.replace(new RegExp(`${Css.Token}[^\n]*\n`), '');

    // 添加新的注入
    css = `${css}\n${Css.Token}${style}\n`;

    await writeFile(cssPath, css, 'utf8');
    vscode.window.showInformationMessage(this.Enable.success);
  }

  /**
   * 会在command注册的地方就确认`cssPath`是否存在
   */
  async restore(cssPath: string): Promise<void> {
    const backupPath = `${cssPath}.${Css.BackupSuffix}`;
    if (!existsSync(backupPath)) {
      vscode.window.showErrorMessage(this.Enable.backup.notFound(backupPath));
      return;
    }
    const buffer = await readFile(backupPath);
    await writeFile(cssPath, buffer);
    vscode.window.showInformationMessage(this.Enable.restore.success);
  }
}

export default new Hacker();
