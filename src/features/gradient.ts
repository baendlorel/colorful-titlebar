import vscode from 'vscode';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { Msg } from '@/common/i18n';
import { configs } from '@/common/configs';
import { catcher } from '@/common/catcher';
import { suggestInfo } from '@/common/notifications';
import { AfterStyle, Css } from './consts';

const Enable = Msg.Commands.enableGradient;

// # region Main
const suggest = async () => {
  // 如果已经记载了主css路径并嵌入了样式，则无需弹出建议
  const cssPath = configs.workbenchCssPath;
  if (configs.workbenchCssPath) {
    const content = await readFile(cssPath, 'utf8');
    if (content.includes(Css.Token)) {
      return;
    }
  }

  const now = await suggestInfo(Enable.suggest.msg, Enable.suggest.button);
  if (now !== Enable.suggest.button) {
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
    Enable.style.brightCenter,
    Enable.style.brightLeft,
    Enable.style.arcLeft,
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
// # endregion

/**
 * 获取主css文件的路径
 * @returns 如果路径上没找到文件或用户放弃输入，返回`null`
 */
const getMainCssPath = async (): Promise<string | null> => {
  let cssPath = configs.workbenchCssPath;
  if (existsSync(cssPath)) {
    return cssPath;
  }

  const input = await vscode.window.showInputBox({
    title: Enable.title,
    prompt: Enable.prompt,
    placeHolder: Enable.placeHolder,
    ignoreFocusOut: true,
  });
  if (!input || !existsSync(input.trim())) {
    return null;
  }

  cssPath = input.trim();
  await configs.set.workbenchCssPath(cssPath);
  return cssPath;
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
const hackCss = async (cssPath: string, gradientStyle: string): Promise<void> => {
  let style = AfterStyle.BrightLeft;
  switch (gradientStyle) {
    case Enable.style.brightCenter:
      style = AfterStyle.BrightCenter;
      break;
    case Enable.style.brightLeft:
      style = AfterStyle.BrightLeft;
      break;
    case Enable.style.arcLeft:
      style = AfterStyle.ArcLeft;
      break;
  }

  const tokened = `${Css.Token}${style}`.replace(/\n[\s]+/g, '');

  let css = await readFile(cssPath, 'utf8');
  css = css.replace(new RegExp(`${Css.Token}[^\n]*\n`), '');
  css = `${css}\n${tokened}\n`;
  await writeFile(cssPath, css, 'utf8');
  vscode.window.showInformationMessage(Enable.success);
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
const backupCss = async (cssPath: string): Promise<void> => {
  const buffer = await readFile(cssPath);
  await writeFile(`${cssPath}.${Css.BackupSuffix}`, buffer);
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
const restoreCss = async (cssPath: string): Promise<void> => {
  const backupPath = `${cssPath}.${Css.BackupSuffix}`;
  if (!existsSync(backupPath)) {
    vscode.window.showErrorMessage(Enable.backup.notFound(backupPath));
    return;
  }
  const buffer = await readFile(backupPath);
  await writeFile(cssPath, buffer);
  vscode.window.showInformationMessage(Enable.restore.success);
};
