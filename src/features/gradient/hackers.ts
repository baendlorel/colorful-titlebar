import vscode from 'vscode';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { configs } from '@/common/configs';
import { AfterStyle, Css } from './consts';
import { Msg } from '@/common/i18n';

const Enable = Msg.Commands.enableGradient;

/**
 * 获取主css文件的路径
 * @returns 如果路径上没找到文件或用户放弃输入，返回`null`
 */
export const getMainCssPath = async (): Promise<string | null> => {
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
export const hackCss = async (cssPath: string, gradientStyle: string): Promise<void> => {
  let rawStyle = AfterStyle.BrightLeft;
  switch (gradientStyle) {
    case Enable.style.brightCenter:
      rawStyle = AfterStyle.BrightCenter;
      break;
    case Enable.style.brightLeft:
      rawStyle = AfterStyle.BrightLeft;
      break;
    case Enable.style.arcLeft:
      rawStyle = AfterStyle.ArcLeft;
      break;
  }

  const style = rawStyle
    .replaceAll('{darkness}', configs.gradientDarkness.toString())
    .replaceAll('{brightness}', configs.gradientBrightness.toString())
    .replace(/\n[\s]+/g, '');

  // vscode.window.showInformationMessage(style);

  let css = await readFile(cssPath, 'utf8');

  // 消除旧的注入
  css = css.replace(new RegExp(`${Css.Token}[^\n]*\n`), '');

  // 添加新的注入
  css = `${css}\n${Css.Token}${style}\n`;

  await writeFile(cssPath, css, 'utf8');
  vscode.window.showInformationMessage(Enable.success);
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
export const backupCss = async (cssPath: string): Promise<void> => {
  const buffer = await readFile(cssPath);
  await writeFile(`${cssPath}.${Css.BackupSuffix}`, buffer);
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
export const restoreCss = async (cssPath: string): Promise<void> => {
  const backupPath = `${cssPath}.${Css.BackupSuffix}`;
  if (!existsSync(backupPath)) {
    vscode.window.showErrorMessage(Enable.backup.notFound(backupPath));
    return;
  }
  const buffer = await readFile(backupPath);
  await writeFile(cssPath, buffer);
  vscode.window.showInformationMessage(Enable.restore.success);
};
