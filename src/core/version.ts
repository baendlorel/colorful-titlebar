import vscode from 'vscode';
import { Consts } from '@/common/consts';
import i18n from '@/common/i18n';
import controlPanel from './control-panel';

class Version {
  get(context: vscode.ExtensionContext) {
    const extension = vscode.extensions.getExtension(context.extension.id);
    if (!extension) {
      vscode.window.showErrorMessage(i18n.Version.selfNotFound);
    }
    return extension?.packageJSON.version ?? 'outdated';
  }

  async updated(context: vscode.ExtensionContext) {
    const lastVersion = context.globalState.get('lastVersion');
    const currentVersion = this.get(context);
    if (currentVersion !== lastVersion) {
      await context.globalState.update('lastVersion', currentVersion);
      vscode.window.showInformationMessage(
        `🎉 ${Consts.DisplayName} ${i18n.Version.updated}${currentVersion}`
      );
      await controlPanel.call(context);
    }
  }
}

export default new Version();
