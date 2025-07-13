import vscode from 'vscode';
import { existsSync } from 'node:fs';
import { readFile, writeFile } from 'node:fs/promises';

import { Msg } from './i18n';
import { configs } from './configs';
import { PromiseResult, Result } from './consts';

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

const compact = (arr: TemplateStringsArray, ...values: any[]) => {
  const strs: string[] = [];
  for (let i = 0; i < values.length; i++) {
    strs.push(arr[i].replace(/\s/g, ''), values[i]);
  }
  strs.push(arr[arr.length - 1].replace(/\s/g, ''));
  return strs.join('');
};

export const ensureValidCssPath = async (): PromiseResult<string | null> => {
  let cssPath = configs.workbenchCssPath;
  if (existsSync(cssPath)) {
    return Result.resolve(cssPath);
  }

  const input = await vscode.window.showInputBox({
    title: Enable.title,
    prompt: Enable.prompt,
    placeHolder: Enable.placeHolder,
    ignoreFocusOut: true,
    validateInput: (value: string) =>
      existsSync(value.trim()) ? null : Enable.workbenchCssPathInvalid,
  });
  if (!input) {
    return Result.fail();
  }

  cssPath = input.trim();
  await configs.set.workbenchCssPath(cssPath);
  return Result.resolve(cssPath);
};

// fixme 测试发现改了主css文件后，启动会报错，提示vscode损坏
/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
export const hackCss = async (cssPath: string, gradientStyle: string): PromiseResult => {
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
    return Result.succ(Enable.success);
  } catch (error) {
    return Result.err(error, Enable.failed);
  }
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
export const backupCss = async (cssPath: string): PromiseResult => {
  try {
    const buffer = await readFile(cssPath);
    await writeFile(`${cssPath}.${Css.BackupSuffix}`, buffer);
    return Result.succ(Enable.backup.success);
  } catch (error) {
    return Result.err(error, Enable.backup.fail);
  }
};

/**
 * 会在command注册的地方就确认`cssPath`是否存在
 */
export const restoreCss = async (cssPath: string): PromiseResult => {
  try {
    const backupPath = `${cssPath}.${Css.BackupSuffix}`;
    if (!existsSync(backupPath)) {
      return Result.succ(Enable.backup.notFound(backupPath));
    }
    const buffer = await readFile(backupPath);
    await writeFile(cssPath, buffer);

    return Result.succ(Enable.restore.success);
  } catch (error) {
    return Result.err(error, Enable.restore.failed);
  }
};
