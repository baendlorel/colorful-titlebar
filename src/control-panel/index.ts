import vscode from 'vscode';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

import { Consts, GradientStyle, HashSource } from '@/common/consts';
import i18n from '@/common/i18n';
import configs from '@/common/configs';
import version from '@/core/version';

import { handlerMap } from './handler-map';
import { HandelResult } from './types';
import { Controls } from './consts';

const Panel = i18n.ControlPanel;

let controlPanel: vscode.WebviewPanel | null = null;
let template: string | null = null;

export default async function (this: vscode.ExtensionContext) {
  if (controlPanel !== null) {
    return; // 防止创建多个设置页面
  }
  (controlPanel = vscode.window.createWebviewPanel(
    'controlPanel',
    Panel.title,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'html')],
      retainContextWhenHidden: true,
    }
  )).onDidDispose(() => (controlPanel = null));

  // 准备导入路径
  const extPath = this.extensionPath;
  const scriptPath = vscode.Uri.file(join(extPath, 'html', 'control-panel.js'));
  const cssPath = vscode.Uri.file(join(extPath, 'html', 'style.css'));
  const cssThemeSwitchPath = vscode.Uri.file(join(extPath, 'html', 'theme-switch.css'));
  const cssPalettePath = vscode.Uri.file(join(extPath, 'html', 'palette.css'));
  if (template === null) {
    const templatePath = vscode.Uri.file(join(extPath, 'html', 'control-panel.template.html'));
    template = readFileSync(templatePath.fsPath, 'utf8');
  }
  vscode.window.showInformationMessage(template);

  const scriptUri = controlPanel.webview.asWebviewUri(scriptPath);
  const cssUri = controlPanel.webview.asWebviewUri(cssPath);
  const cssThemeSwitchUri = controlPanel.webview.asWebviewUri(cssThemeSwitchPath);
  const cssPaletteUri = controlPanel.webview.asWebviewUri(cssPalettePath);

  // 准备一些数据
  const currentColor = configs.titleBarColor ?? '#007ACC';
  const projectIndicators = configs.projectIndicators.join(Consts.ConfigSeparator);
  const lightThemeColors = configs.lightThemeColors
    .map((c) => c.toRGBString())
    .join(Consts.ConfigSeparator);
  const darkThemeColors = configs.darkThemeColors
    .map((c) => c.toRGBString())
    .join(Consts.ConfigSeparator);

  const map = {
    VERSION: version.get(this),

    // 资源路径类 (RESOURCE_)
    RESOURCE_CSS_URI: cssUri,
    RESOURCE_CSS_THEME_SWITCH_URI: cssThemeSwitchUri,
    RESOURCE_CSS_PALETTE_URI: cssPaletteUri,
    RESOURCE_SCRIPT_URI: scriptUri,

    // 枚举常量类 (ENUM_)
    ENUM_ENV: 'prod',
    ENUM_DISPLAY_NAME: Consts.DisplayName,
    ENUM_CONFIG_SEPARATOR: Consts.ConfigSeparator,
    ENUM_GRADIENT_BRIGHT_CENTER: GradientStyle.BrightCenter,
    ENUM_GRADIENT_BRIGHT_LEFT: GradientStyle.BrightLeft,
    ENUM_GRADIENT_ARC_LEFT: GradientStyle.ArcLeft,
    ENUM_HASH_SOURCE_PROJECT_NAME: HashSource.ProjectName,
    ENUM_HASH_SOURCE_FULL_PATH: HashSource.FullPath,
    ENUM_HASH_SOURCE_PROJECT_NAME_DATE: HashSource.ProjectNameDate,

    // 配置数据类 (CFG_)
    CFG_THEME: configs.theme,
    CFG_LANG: configs.lang,
    CFG_SHOW_SUGGEST: configs.showSuggest,
    CFG_WORKBENCH_CSS_PATH: configs.workbenchCssPath,
    CFG_HASH_SOURCE: configs.hashSource,
    CFG_GRADIENT_BRIGHTNESS: configs.gradientBrightness,
    CFG_GRADIENT_DARKNESS: configs.gradientDarkness,

    // 控制名称类 (CTRL_)
    CTRL_SHOW_SUGGEST: Controls.ShowSuggest,
    CTRL_WORKBENCH_CSS_PATH: Controls.WorkbenchCssPath,
    CTRL_GRADIENT: Controls.Gradient,
    CTRL_GRADIENT_BRIGHTNESS: Controls.GradientBrightness,
    CTRL_GRADIENT_DARKNESS: Controls.GradientDarkness,
    CTRL_HASH_SOURCE: Controls.HashSource,
    CTRL_REFRESH: Controls.Refresh,
    CTRL_RANDOM_COLOR: Controls.RandomColor,
    CTRL_RANDOM_COLOR_COLOR_SET: Controls['RandomColor.colorSet'],
    CTRL_RANDOM_COLOR_PURE: Controls['RandomColor.pure'],
    CTRL_RANDOM_COLOR_SPECIFY: Controls['RandomColor.specify'],
    CTRL_PROJECT_INDICATORS: Controls.ProjectIndicators,
    CTRL_THEME_COLORS: Controls.ThemeColors,
    CTRL_THEME_COLORS_LIGHT: Controls['ThemeColors.light'],
    CTRL_THEME_COLORS_DARK: Controls['ThemeColors.dark'],

    // 国际化文本类 (I18N_)
    I18N_PANEL_TITLE: Panel.title,
    I18N_PANEL_DESCRIPTION: Panel.description,
    I18N_SHOW_SUGGEST_LABEL: Panel.showSuggest.label,
    I18N_SHOW_SUGGEST_DESC: Panel.showSuggest.description,
    I18N_WORKBENCH_CSS_PATH_LABEL: Panel.workbenchCssPath.label,
    I18N_WORKBENCH_CSS_PATH_DESC: Panel.workbenchCssPath.description,
    I18N_GRADIENT_LABEL: Panel.gradient.label,
    I18N_GRADIENT_DESC: Panel.gradient.description,
    I18N_GRADIENT_EMPTY: Panel.gradient.empty,
    I18N_GRADIENT_BRIGHT_CENTER: Panel.gradient[GradientStyle.BrightCenter],
    I18N_GRADIENT_BRIGHT_LEFT: Panel.gradient[GradientStyle.BrightLeft],
    I18N_GRADIENT_ARC_LEFT: Panel.gradient[GradientStyle.ArcLeft],
    I18N_GRADIENT_BRIGHTNESS_LABEL: Panel.gradientBrightness.label,
    I18N_GRADIENT_BRIGHTNESS_DESC: Panel.gradientBrightness.description,
    I18N_GRADIENT_DARKNESS_LABEL: Panel.gradientDarkness.label,
    I18N_GRADIENT_DARKNESS_DESC: Panel.gradientDarkness.description,
    I18N_HASH_SOURCE_LABEL: Panel.hashSource.label,
    I18N_HASH_SOURCE_DESC: Panel.hashSource.description,
    I18N_HASH_SOURCE_PROJECT_NAME: Panel.hashSource[HashSource.ProjectName],
    I18N_HASH_SOURCE_FULL_PATH: Panel.hashSource[HashSource.FullPath],
    I18N_HASH_SOURCE_PROJECT_NAME_DATE: Panel.hashSource[HashSource.ProjectNameDate],
    I18N_RANDOM_COLOR_LABEL: Panel.randomColor.label,
    I18N_RANDOM_COLOR_DESC: Panel.randomColor.description,
    I18N_RANDOM_COLOR_COLOR_SET: Panel.randomColor.colorSet,
    I18N_RANDOM_COLOR_PURE: Panel.randomColor.pure,
    I18N_RANDOM_COLOR_SPECIFY: Panel.randomColor.specify,
    I18N_REFRESH_LABEL: Panel.refresh.label,
    I18N_REFRESH_DESC: Panel.refresh.description,
    I18N_REFRESH_BUTTON: Panel.refresh.button,
    I18N_PROJECT_INDICATORS_LABEL: Panel.projectIndicators.label,
    I18N_PROJECT_INDICATORS_DESC: Panel.projectIndicators.description,
    I18N_THEME_COLORS_LABEL: Panel.themeColors.label,
    I18N_THEME_COLORS_DESC: Panel.themeColors.description,
    I18N_THEME_COLORS_LIGHT_COLORS: Panel.themeColors.lightColors,
    I18N_THEME_COLORS_DARK_COLORS: Panel.themeColors.darkColors,
    I18N_THEME_COLORS_ADD_COLOR: Panel.themeColors.addColor,
    I18N_THEME_COLORS_DRAG_HINT: Panel.themeColors.dragHint,

    // 计算数据类 (DATA_)
    DATA_CURRENT_COLOR: currentColor,
    DATA_PROJECT_INDICATORS: projectIndicators,
    DATA_LIGHT_THEME_COLORS: lightThemeColors,
    DATA_DARK_THEME_COLORS: darkThemeColors,
  };

  controlPanel.webview.html = template;

  controlPanel.webview.onDidReceiveMessage(async (message) => {
    if (typeof message !== 'object' || !message.name) {
      vscode.window.showErrorMessage('从控制面板接收到了无效的message：' + String(message));
      return;
    }

    const result: HandelResult = {
      from: Consts.Name,
      name: message.name,
      succ: true,
      msg: Panel.success,
      other: {},
    };

    // vscode.window.showInformationMessage(JSON.stringify(message));

    try {
      const handler = handlerMap[result.name];
      if (!handler) {
        throw new Error('居然未找到处理函数：' + JSON.stringify(result));
      }
      await handler(result, message.value);
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(error.message);
      }
    } finally {
      if (controlPanel) {
        await controlPanel.webview.postMessage(result);
      } else {
        vscode.window.showErrorMessage('控制面板被dispose了？');
      }
    }
  });
}
