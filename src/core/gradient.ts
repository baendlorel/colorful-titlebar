import vscode from 'vscode';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { Msg } from './i18n';
import { configs } from './configs';
import { showErrMsg, showInfoMsg, suggestInfo } from './notifications';
import { catcher } from './catcher';

const enum CssParam {
  Darkness = '0.24',
  Brightness = '0.48',
}

const enum Css {
  BackupSuffix = 'bak',
  Token = '\u002F\u002A__COLORFUL_TITLEBAR_KASUKABETSUMUGI__\u002A\u002F',
  Selector = '#workbench\u005C\u002Eparts\u005C\u002Etitlebar::after',
  BrightCenter = `linear-gradient(to right, rgba(5, 5, 5, ${CssParam.Darkness}) 0%, rgba(255, 255, 255, ${CssParam.Brightness}) 50%, transparent 80%)`,
  BrightLeft = `radial-gradient(circle at 15% 50%, rgba(255, 255, 255, ${CssParam.Brightness}) 0%, transparent 24%, rgba(5, 5, 5, ${CssParam.Darkness}) 50%, transparent 80%)`,
}

const Enable = Msg.Commands.enableGradient;

const getBackground = (gradientStyle: string) => {
  switch (gradientStyle) {
    case Enable.style.brightCenter:
      return Css.BrightCenter;
    case Enable.style.brightLeft:
      return Css.BrightLeft;
    default:
      return Css.BrightLeft;
  }
};

const compact = (arr: TemplateStringsArray, ...values: string[]) => {
  const strs: string[] = [];
  for (let i = 0; i < values.length; i++) {
    strs.push(arr[i].replace(/\s/g, ''), values[i]);
  }
  strs.push(arr[arr.length - 1].replace(/\s/g, ''));
  return strs.join('');
};

const suggest = async () => {
  // 如果已经记载了主css路径并嵌入了样式，则无需弹出建议
  const cssPath = configs.workbenchCssPath;
  if (configs.workbenchCssPath) {
    const content = await readFile(cssPath, 'utf8');
    if (content.includes(Css.Token)) {
      return;
    }
  }

  const sugg = Msg.Commands.enableGradient.suggest;
  const now = await suggestInfo(sugg.msg, sugg.button);
  if (now !== sugg.button) {
    return;
  }
  enable();
};

const enable = catcher(async () => {
  const cssPath = await getMainCssPath();
  if (!cssPath) {
    return;
  }

  const gradientStyle = await vscode.window.showQuickPick([
    Msg.Commands.enableGradient.style.brightCenter,
    Msg.Commands.enableGradient.style.brightLeft,
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
  if (!input || existsSync(input.trim())) {
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
  const style = compact`${Css.Token}${Css.Selector} {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    background: ${getBackground(gradientStyle)};
    mix-blend-mode: overlay;
    pointer-events: none;
  }\n`;

  let css = await readFile(cssPath, 'utf8');
  css = css.replace(new RegExp(`${Css.Token}[^\n]*\n`), '');
  css = `${css}\n${style}\n`;
  await writeFile(cssPath, css, 'utf8');
  showInfoMsg(Enable.success);
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
    showErrMsg(Enable.backup.notFound(backupPath));
    return;
  }
  const buffer = await readFile(backupPath);
  await writeFile(cssPath, buffer);
  showInfoMsg(Enable.restore.success);
};
