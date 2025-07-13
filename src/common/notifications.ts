import vscode from 'vscode';

import { configs } from './configs';
import { Msg } from './i18n';

export const popInfo = configs.showInfoPop
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (msg: string, ...items: any[]) => {
      const result = await vscode.window.showInformationMessage(msg, ...items, Msg.DontShowAgain);
      if (result === Msg.DontShowAgain) {
        await configs.set.showInfoPop(false);
      }
      return result;
    }
  : async (_: string) => undefined;

export const suggestInfo = configs.showSuggest
  ? // eslint-disable-next-line @typescript-eslint/no-explicit-any
    async (msg: string, ...items: any[]) => {
      const result = await vscode.window.showInformationMessage(msg, ...items, Msg.DontShowAgain);
      if (result === Msg.DontShowAgain) {
        await configs.set.showSuggest(false);
      }
      return result;
    }
  : async (_: string) => undefined;
