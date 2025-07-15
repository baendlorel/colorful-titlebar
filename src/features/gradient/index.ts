import vscode from 'vscode';
import { readFile } from 'node:fs/promises';

import { Msg } from '@/common/i18n';
import { configs } from '@/common/configs';
import { catcher } from '@/common/catcher';
import { suggestInfo } from '@/common/notifications';
import { GradientStyle } from '@/common/consts';

import { Css } from './consts';
import { getMainCssPath, backupCss, hackCss, restoreCss } from './hackers';

const Enable = Msg.Commands.enableGradient;

const suggest = async () => {
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
  const now = await suggestInfo(Enable.suggest.msg, Enable.suggest.yes);
  if (now !== Enable.suggest.yes) {
    return;
  }
  await enable();
};

const enable = catcher(async () => {
  const cssPath = await getMainCssPath();
  if (!cssPath) {
    return;
  }

  const gradientStyle = await vscode.window.showQuickPick([
    Enable.style[GradientStyle.BrightCenter],
    Enable.style[GradientStyle.BrightLeft],
    Enable.style[GradientStyle.ArcLeft],
  ]);
  if (!gradientStyle) {
    return;
  }

  // & 已确保cssPath是能用的
  await backupCss(cssPath);
  await hackCss(cssPath, gradientStyle);
});

const disable = catcher(async () => {
  const cssPath = await getMainCssPath();
  if (!cssPath) {
    return;
  }
  await restoreCss(cssPath);
});

export const gradient = { disable, enable, suggest };
