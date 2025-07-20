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
   * 删去含有`Css.Token`的行，返回一个新数组
   * @param lines
   */
  private purge(lines: string[]): string[] {
    return lines.filter((line) => !line.trim().startsWith(Css.Token));
  }

  /**
   * 已包含backup
   *
   * 会在command注册的地方就确认`cssPath`是否存在
   */
  async inject(cssPath: string, gradientStyle: GradientStyle): Promise<void> {
    const backupPath = `${cssPath}.${Css.BackupSuffix}`;
    if (!existsSync(backupPath)) {
      const buffer = await readFile(cssPath);
      await writeFile(`${cssPath}.${Css.BackupSuffix}`, buffer);
    }

    let rawStyle = AfterStyle.BrightLeft;
    switch (gradientStyle) {
      case GradientStyle.BrightLeft:
        rawStyle = AfterStyle.BrightLeft;
        break;
      case GradientStyle.BrightCenter:
        rawStyle = AfterStyle.BrightCenter;
        break;
      case GradientStyle.ArcLeft:
        rawStyle = AfterStyle.ArcLeft;
        break;
    }

    const darkness = (configs.gradientDarkness / 100).toString();
    const brightness = (configs.gradientBrightness / 100).toString();
    const style = rawStyle
      .replaceAll('{{darkness}}', darkness)
      .replaceAll('{{brightness}}', brightness)
      .replace(/\n[\s]+/g, '');

    const css = await readFile(cssPath, 'utf8');
    const lines = this.purge(css.split('\n'));

    lines.push(`${css}\n${Css.Token}${style}\n`);
    await writeFile(cssPath, lines.join('\n'), 'utf8');
    vscode.window.showInformationMessage(this.Enable.success);
  }

  /**
   * 消除注入
   * @param cssPath
   */
  async clean(cssPath: string): Promise<void> {
    const css = await readFile(cssPath, 'utf8');
    // 消除旧的注入
    const lines = this.purge(css.split('\n'));
    await writeFile(cssPath, lines.join('\n'), 'utf8');
    vscode.window.showInformationMessage(this.Enable.success);
  }

  /**
   * 会在command注册的地方就确认`cssPath`是否存在
   * @deprecated 暂时无处使用
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
