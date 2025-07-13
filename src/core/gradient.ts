import vscode from 'vscode';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { Msg } from './i18n';
import { configs } from './configs';

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

const getBackground = (gradientStyle: string) => {
  switch (gradientStyle) {
    case Msg.Commands.enableGradient.gradientStyle.brightCenter:
      return Css.BrightCenter;
    case Msg.Commands.enableGradient.gradientStyle.brightLeft:
      return Css.BrightLeft;
    default:
      return Css.BrightLeft;
  }
};

const compact = (strings: TemplateStringsArray, ...values: any[]) => {
  const strs: string[] = [];
  for (let i = 0; i < values.length; i++) {
    strs.push(strings[i].replace(/\s/g, ''), values[i]);
  }
  strs.push(strings[strings.length - 1].replace(/\s/g, ''));
  return strs.join('');
};

export const ensureValidCssPath = async (): Promise<string | null> => {
  let cssPath = configs.workbenchCssPath;
  if (existsSync(cssPath)) {
    return cssPath;
  }

  const input = await vscode.window.showInputBox({
    prompt: Msg.Commands.enableGradient.prompt,
    placeHolder: '例如：linear-gradient(to right, #ff7e5f, #feb47b)',
  });
  if (!input) {
    return null;
  }

  cssPath = input.trim();
  if (!existsSync(cssPath)) {
    vscode.window.showWarningMessage(Msg.Commands.enableGradient.workbenchCssPathInvalid);
    return null;
  }
  await configs.set.workbenchCssPath(cssPath);
  return cssPath;
};

// fixme 测试发现改了主css文件后，启动会报错，提示vscode损坏
/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
export const hackCss = async (cssPath: string, gradientStyle: string) => {
  const background = getBackground(gradientStyle);
  const style = compact`${Css.Token}${Css.Selector} {
    content: "";
    position: absolute;
    top: 50%;
    left: 50%;
    width: 100%;
    height: 100%;
    transform: translate(-50%, -50%);
    background: ${background};
    mix-blend-mode: overlay;
    pointer-events: none;
  }\n`;

  try {
    let css = await readFile(cssPath, 'utf8');

    if (css.includes(Css.Token)) {
      css = css.replace(new RegExp(`${Css.Token}[^\n]*\n`), style);
    } else {
      css = `${css}\n${style}\n`;
    }

    await writeFile(cssPath, css, 'utf8');
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(`${Msg.Commands.enableGradient.failed} ${error.message}`);
    }
  }
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
export const backupCss = async (cssPath: string) => {
  try {
    const buffer = await readFile(cssPath);
    await writeFile(`${cssPath}.${Css.BackupSuffix}`, buffer);
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(
        `${Msg.Commands.enableGradient.backup.failed} ${error.message}`
      );
    }
  }
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
export const restoreCss = async (cssPath: string) => {
  try {
    const backupPath = `${cssPath}.${Css.BackupSuffix}`;
    if (!existsSync(backupPath)) {
      vscode.window.showWarningMessage(Msg.Commands.enableGradient.backup.notFound(backupPath));
      return;
    }
    const buffer = await readFile(backupPath);
    await writeFile(cssPath, buffer);
  } catch (error) {
    if (error instanceof Error) {
      vscode.window.showErrorMessage(
        `${Msg.Commands.enableGradient.backup.restoredFailed} ${error.message}`
      );
    }
  }
};
