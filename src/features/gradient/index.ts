import vscode from 'vscode';

import { GradientStyle } from '@/common/consts';
import i18n from '@/common/i18n';
import hacker from './hacker';

class Gradient {
  private readonly Enable = i18n.Features.gradient;

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
