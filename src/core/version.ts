import vscode from 'vscode';
import { Consts } from '@/common/consts';
import i18n from '@/common/i18n';
import controlPanel from './control-panel';
import configs from '@/common/configs';

class Version {
  get(context: vscode.ExtensionContext) {
    const extension = vscode.extensions.getExtension(context.extension.id);
    if (!extension) {
      vscode.window.showErrorMessage(i18n.Version.selfNotFound);
    }
    return extension?.packageJSON.version ?? 'outdated';
  }

  async updated(context: vscode.ExtensionContext) {
    const version = configs.currentVersion;
    const actualVersion = this.get(context);
    if (actualVersion !== version) {
      vscode.window.showInformationMessage(
        `🎉 ${Consts.DisplayName} ${i18n.Version.updated(actualVersion)}`
      );
      configs.set.currentVersion(actualVersion);
      await controlPanel.call(context);
      return true;
    }
    return false;
  }
}

export default new Version();
