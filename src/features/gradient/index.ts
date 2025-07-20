import vscode from 'vscode';

import { GradientStyle } from '@/common/consts';
import i18n from '@/common/i18n';
import hacker from './hacker';

class Gradient {
  async apply(style: GradientStyle): Promise<void> {
    const cssPath = await hacker.getWorkbenchCssPath();
    if (!cssPath) {
      return;
    }
    await hacker.inject(cssPath, style);
  }

  async none() {
    const cssPath = await hacker.getWorkbenchCssPath();
    if (!cssPath) {
      return;
    }
    await hacker.clean(cssPath);
  }
}

export default new Gradient();
