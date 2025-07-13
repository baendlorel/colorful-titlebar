import vscode from 'vscode';

import { configs } from './configs';
import { Msg } from './i18n';
import { Result } from './consts';

export const popInfo = configs.showInfoPop
  ? async (m: string) => {
      const result = await vscode.window.showInformationMessage(m, Msg.NoMoreInfoPop);
      if (result === Msg.NoMoreInfoPop) {
        await configs.set.showInfoPop(false);
        await vscode.window.showInformationMessage(Msg.NoMoreInfoPopSet);
      }
    }
  : // eslint-disable-next-line @typescript-eslint/no-empty-function
    async (_: string) => {};

/**
 * 如果message为`falsy`则不显示
 * @param o 字符串或Result对象
 */
export const showErrMsg = (o: string | Result<any>, ...items: any[]) => {
  if (o instanceof Result) {
    return o.msg && vscode.window.showErrorMessage(o.msg, ...items);
  }
  return o && vscode.window.showErrorMessage(o, ...items);
};

/**
 * 如果message为`falsy`则不显示
 * @param o 字符串或Result对象
 */
export const showWarnMsg = (o: string | Result<any>, ...items: any[]) => {
  if (o instanceof Result) {
    return o.msg && vscode.window.showWarningMessage(o.msg, ...items);
  }
  return o && vscode.window.showWarningMessage(o, ...items);
};

/**
 * 如果message为`falsy`则不显示
 * @param o 字符串或Result对象
 */
export const showInfoMsg = (o: string | Result<any>, ...items: any[]) => {
  if (o instanceof Result) {
    return o.msg && vscode.window.showInformationMessage(o.msg, ...items);
  }
  return o && vscode.window.showInformationMessage(o, ...items);
};
