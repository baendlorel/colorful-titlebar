import vscode from 'vscode';

import { Commands } from '@/common/consts';
import { gradient } from '@/features/gradient';
import { pickColor } from '@/core/pick-color';

export const register = (context: vscode.ExtensionContext) => {
  //  vscode.workspace.onDidChangeConfiguration(async (event) => {
  //    // 影响颜色相关的配置
  //    if (
  //      event.affectsConfiguration(ConfigSection.DarkThemeColors) ||
  //      event.affectsConfiguration(ConfigSection.LightThemeColors) ||
  //      event.affectsConfiguration(ConfigSection.HashSource) ||
  //      event.affectsConfiguration(ConfigSection.ProjectIndicators)
  //    ) {
  //      // 重新应用颜色
  //      return await applyTitleBarColor();
  //    }

  //    // * 影响渐变相关的配置
  //    // 路径配置必须有效
  //    if (event.affectsConfiguration(ConfigSection.WorkbenchCssPath)) {
  //      const cssPath = configs.workbenchCssPath;
  //      // 空白路径直接返回防止无限递归
  //      if (cssPath === '') {
  //        return;
  //      }
  //      if (!existsSync(cssPath)) {
  //        // 如果路径无效，清空配置
  //        await configs.set.workbenchCssPath('');
  //        return vscode.window.showErrorMessage(
  //          Msg.Commands.enableGradient.workbenchCssPathInvalid + cssPath
  //        );
  //      }
  //      return;
  //    }

  //    if (
  //      event.affectsConfiguration(ConfigSection.GradientBrightness) ||
  //      event.affectsConfiguration(ConfigSection.GradientDarkness)
  //    ) {
  //      // 只关心渐变相关的配置
  //      // 检查当前是否已经应用了渐变
  //      const cssPath = configs.workbenchCssPath;
  //      if (cssPath && existsSync(cssPath)) {
  //        vscode.window.showInformationMessage(Msg.Config.changed);
  //      } else {
  //        vscode.window.showInformationMessage(Msg.Config.gradientChangedButInvalidCssPath);
  //      }
  //    }
  //  });
  const commands: vscode.Disposable[] = [
    vscode.commands.registerCommand(Commands.EnableGradient, gradient.enable),
    vscode.commands.registerCommand(Commands.DisableGradient, gradient.disable),
    vscode.commands.registerCommand(Commands.PickColor, pickColor),
  ].filter((v) => v !== undefined);
  context.subscriptions.push(...commands);
};
