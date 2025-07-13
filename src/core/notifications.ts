import vscode from 'vscode';

import { configs } from './configs';
import { Msg } from './i18n';

export const popInfo = configs.showInfoPop
  ? async (msg: string) => {
      const result = await vscode.window.showInformationMessage(msg, Msg.NoMoreInfoPop);
      if (result === Msg.NoMoreInfoPop) {
        await configs.set.showInfoPop(false);
        vscode.window.showInformationMessage(Msg.NoMoreInfoPopSet);
      }
    }
  : // eslint-disable-next-line @typescript-eslint/no-empty-function
    async (_: string) => {};

/**
 * 如果message为`falsy`则不显示
 * @param o 字符串或Result对象
 */
export const showErrMsg = vscode.window.showErrorMessage;

/**
 * 如果message为`falsy`则不显示
 * @param o 字符串或Result对象
 */
export const showWarnMsg = vscode.window.showWarningMessage;

/**
 * 如果message为`falsy`则不显示
 * @param o 字符串或Result对象
 */
export const showInfoMsg = vscode.window.showInformationMessage;
