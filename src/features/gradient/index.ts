import vscode from 'vscode';
import { readFile } from 'node:fs/promises';

import { GradientStyle } from '@/common/consts';
import i18n from '@/common/i18n';
import configs from '@/common/configs';
import popSuggest from '@/common/pop-suggest';

import { Css } from './consts';
import hacker from './hacker';

class Gradient {
  private readonly Enable = i18n.Features.gradient;

  async suggest() {
    // 如果已经记载了主css路径并嵌入了样式，则无需弹出建议
    const cssPath = configs.workbenchCssPath;
    if (configs.workbenchCssPath) {
      const content = await readFile(cssPath, 'utf8');
      if (content.includes(Css.Token)) {
        return;
      }
    }

    // 不建议的话只会阻止suggestInfo弹窗，要手动返回
    if (!configs.showSuggest) {
      return;
    }
    const now = await popSuggest(this.Enable.suggest.msg, this.Enable.suggest.yes);
    if (now !== this.Enable.suggest.yes) {
      return;
    }
    await this.enable();
  }

  async enable() {
    const cssPath = await hacker.getWorkbenchCssPath();
    if (!cssPath) {
      return;
    }

    const gradientStyle = await vscode.window.showQuickPick([
      this.Enable.style[GradientStyle.BrightCenter],
      this.Enable.style[GradientStyle.BrightLeft],
      this.Enable.style[GradientStyle.ArcLeft],
    ]);
    if (!gradientStyle) {
      return;
    }

    // & 已确保cssPath是能用的
    await hacker.inject(cssPath, gradientStyle);
  }

  async disable() {
    const cssPath = await hacker.getWorkbenchCssPath();
    if (!cssPath) {
      return;
    }
    await hacker.restore(cssPath);
  }
}

export default new Gradient();
