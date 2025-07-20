import vscode from 'vscode';
import { join } from 'node:path';
import { readFileSync } from 'node:fs';

import { Consts, GradientStyle, HashSource } from '@/common/consts';
import i18n from '@/common/i18n';
import configs from '@/common/configs';
import version from '@/core/version';

import { handlerMap } from './handler-map';
import { HandelResult } from './types';
import { Controls, Prod } from './consts';

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

  controlPanel.webview.html = `<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${Panel.title}</title>
  <script purpose="常量套组">
    window.__kskb_consts = {
      isProd: '${Prod.Env}' === 'prod',
      lang: '${configs.lang}',
      separator: '${Prod.Env}' === 'prod' ? '${Consts.ConfigSeparator}' : ';',
      configs: {
        theme: '${configs.theme}' === 'light',
        showSuggest: '${configs.showSuggest}' === 'true',
        workbenchCssPath: '${configs.workbenchCssPath}',
        hashSource: '${configs.hashSource}',
        gradientBrightness: '${configs.gradientBrightness}',
        gradientDarkness: '${configs.gradientDarkness}',
        currentColor: '${currentColor}',
        projectIndicators: '${projectIndicators}',
        lightThemeColors: '${lightThemeColors}',
        darkThemeColors: '${darkThemeColors}',
      },
      names: {
        // 这些都是指令=控制名的情况
        showSuggest: '${Controls.ShowSuggest}',
        workbenchCssPath: '${Controls.WorkbenchCssPath}',
        gradient: '${Controls.Gradient}',
        hashSource: '${Controls.HashSource}',
        gradientBrightness: '${Controls.GradientBrightness}',
        gradientDarkness: '${Controls.GradientDarkness}',
        refresh: '${Controls.Refresh}',
        randomColor: '${Controls.RandomColor}',
        'randomColor.colorSet': "${Controls['RandomColor.colorSet']}",
        'randomColor.pure': "${Controls['RandomColor.pure']}",
        'randomColor.specify': "${Controls['RandomColor.specify']}",
        isRandomColor: (s) => s === "${Controls['RandomColor.colorSet']}" || s === "${
    Controls['RandomColor.pure']
  }" || s === "${Controls['RandomColor.specify']}",
        projectIndicators: '${Controls.ProjectIndicators}',
        // 这两个是配置决定的名字
        lightThemeColors: "${Controls['ThemeColors.light']}",
        darkThemeColors: "${Controls['ThemeColors.dark']}",
        themeColors: '${Controls.ThemeColors}',
      }
    }
  </script>

  <script purpose="加载css">
    {
      const css = document.createElement('link');
      css.href = window.__kskb_consts.isProd ? '${cssUri}' : './style.css';
      css.rel = 'stylesheet';
      css.type = 'text/css';
      document.head.appendChild(css);

      const cssThemeSwitch = document.createElement('link');
      cssThemeSwitch.href = window.__kskb_consts.isProd ? '${cssThemeSwitchUri}' : './theme-switch.css';
      cssThemeSwitch.rel = 'stylesheet';
      cssThemeSwitch.type = 'text/css';
      document.head.appendChild(cssThemeSwitch);

      const cssPalette = document.createElement('link');
      cssPalette.href = window.__kskb_consts.isProd ? '${cssPaletteUri}' : './palette.css';
      cssPalette.rel = 'stylesheet';
      cssPalette.type = 'text/css';
      document.head.appendChild(cssPalette);
    }
  </script>

</head>

<body>
  <div class="body" style="display: none;opacity: 0;" theme="${configs.theme}">
    <form id="settings" class="control-panel">
      <div class="header">
        <div>
          <h1>
            <span class="colorful-title">${Consts.DisplayName}</span>
            <span class="version">v${version.get(this)}</span>
          </h1>
          <p>by<a href="https://github.com/baendlorel">Kasukabe Tsumugi</a></p>
          <p>${Panel.description}</p>
        </div>
        <div>
          <label for="theme" class="kskb-theme-switch">
            <input type="checkbox" id="theme" name="theme" class="kskb-dummy">
            <div class="kskb-moon">
              <div class="kskb-icon"></div>
            </div>
            <div class="kskb-sun">
              <div class="kskb-icon"></div>
            </div>
            <div class="kskb-stars">
              <div class="kskb-star"></div>
              <div class="kskb-star"></div>
              <div class="kskb-star"></div>
              <div class="kskb-star"></div>
              <div class="kskb-star"></div>
            </div>
            <div class="kskb-clouds">
              <div class="kskb-cloud"></div>
              <div class="kskb-cloud"></div>
              <div class="kskb-cloud"></div>
            </div>
          </label>
        </div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.showSuggest.label}<small>${Panel.showSuggest.description}</small>
        </div>
        <div class="control-form">
          <label class="toggle-switch">
            <input type="checkbox" class="control-input" name="${Controls.ShowSuggest}">
            <span class="slider"></span>
          </label>
        </div>
        <div class="control-error" name="${Controls.ShowSuggest}"></div>
        <div class="control-succ" name="${Controls.ShowSuggest}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.workbenchCssPath.label}<small>${Panel.workbenchCssPath.description}</small>
        </div>
        <div class="control-form">
          <textarea class="control-input textarea" name="${Controls.WorkbenchCssPath}"></textarea>
        </div>
        <div class="control-error" name="${Controls.WorkbenchCssPath}"></div>
        <div class="control-succ" name="${Controls.WorkbenchCssPath}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.gradient.label}<small>${Panel.gradient.description}</small>
        </div>
        <div class="control-form">
          <select class="control-input select" name="${Controls.Gradient}">
            <option value="" selected>${Panel.gradient.empty}</option>
            <option value="${GradientStyle.BrightCenter}">
              ${Panel.gradient[GradientStyle.BrightCenter]}
            </option>
            <option value="${GradientStyle.BrightLeft}">
              ${Panel.gradient[GradientStyle.BrightLeft]}
            </option>
            <option value="${GradientStyle.ArcLeft}">${
    Panel.gradient[GradientStyle.ArcLeft]
  }</option>
          </select>
        </div>
        <div class="control-error" name="${Controls.Gradient}"></div>
        <div class="control-succ" name="${Controls.Gradient}"></div>
      </div>

      <div class="control-item-double">
        <div class="control-item" style="grid-template-columns: 1fr auto;">
          <div class="control-label">
            ${Panel.gradientBrightness.label}<small>${Panel.gradientBrightness.description}</small>
          </div>
          <div class="control-form input-percent">
            <input type="number" min="0" max="100" step="5" class="control-input" name="${
              Controls.GradientBrightness
            }" />
          </div>
          <div class="control-error" name="${Controls.GradientBrightness}"></div>
          <div class="control-succ" name="${Controls.GradientBrightness}"></div>
        </div>

        <div class="control-item" style="grid-template-columns: 1fr auto;">
          <div class="control-label">
            ${Panel.gradientDarkness.label}<small>${Panel.gradientDarkness.description}</small>
          </div>
          <div class="control-form input-percent">
            <input type="number" min="0" max="100" step="5" class="control-input" name="${
              Controls.GradientDarkness
            }" />
          </div>
          <div class="control-error" name="${Controls.GradientDarkness}"></div>
          <div class="control-succ" name="${Controls.GradientDarkness}"></div>
        </div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.hashSource.label}<small>${Panel.hashSource.description}</small>
        </div>
        <div class="control-form">
          <select class="control-input select" name="${Controls.HashSource}">
            <option value="${HashSource.ProjectName}">
              ${Panel.hashSource[HashSource.ProjectName]}
            </option>
            <option value="${HashSource.FullPath}">${Panel.hashSource[HashSource.FullPath]}</option>
            <option value="${HashSource.ProjectNameDate}">
              ${Panel.hashSource[HashSource.ProjectNameDate]}
            </option>
          </select>
        </div>
        <div class="control-error" name="${Controls.HashSource}"></div>
        <div class="control-succ" name="${Controls.HashSource}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.randomColor.label}<small>${Panel.randomColor.description}</small>
        </div>
        <div class="control-form">
          <div class="dropdown">
            <button type="button" class="dropdown-button" tabindex="0">
              ${Panel.randomColor.label}
            </button>
            <div class="dropdown-menu">
              <button type="button" class="control-input dropdown-item" name="${
                Controls['RandomColor.colorSet']
              }">
                ${Panel.randomColor.colorSet}
              </button>
              <button type="button" class="control-input dropdown-item" name="${
                Controls['RandomColor.pure']
              }">
                ${Panel.randomColor.pure}
              </button>
              <!--control-input 不需要，因为这个按钮是靠选颜色来变更的-->
              <button type="button" class="dropdown-item color-picker" title="${
                Panel.randomColor.specify
              }" name="${Controls['RandomColor.specify']}">
                <span>&nbsp;&nbsp;${Panel.randomColor.specify}</span>
                <input type="color" class="control-input" name="${Controls['RandomColor.specify']}">
              </button>
            </div>
          </div>
        </div>
        <div class="control-error" name="${Controls.RandomColor}"></div>
        <div class="control-succ" name="${Controls.RandomColor}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.refresh.label}<small>${Panel.refresh.description}</small>
        </div>
        <div class="control-form">
          <button type="button" class="control-input control-button" name="${Controls.Refresh}">
            <span>${Panel.refresh.button}</span>
          </button>
        </div>
        <div class="control-error" name="${Controls.Refresh}"></div>
        <div class="control-succ" name="${Controls.Refresh}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.projectIndicators.label}<small>${Panel.projectIndicators.description}</small>
        </div>
        <div class="control-form textarea-wrapper" max-height="120">
          <textarea class="control-input textarea" name="${Controls.ProjectIndicators}"></textarea>
        </div>
        <div class="control-error" name="${Controls.ProjectIndicators}"></div>
        <div class="control-succ" name="${Controls.ProjectIndicators}"></div>
      </div>

      <div class="control-item" style="grid-template-columns: 1fr 1.8fr;">
        <div class="control-label">
          ${Panel.themeColors.label}<small>${Panel.themeColors.description}</small>
        </div>
        <div class="control-form" style="display: flex; flex-direction: column; gap: 8px;">
          <div class="palette" name="${Controls['ThemeColors.light']}">
            <div class="palette-label">
              ${Panel.themeColors.lightColors}
              <span class="palette-hint">${Panel.themeColors.dragHint}</span>
            </div>
            <div class="color-list">
              <button type="button" class="palette-add-color" title="${
                Panel.themeColors.addColor
              }">+</button>
            </div>
          </div>
          <div class="palette" name="${Controls['ThemeColors.dark']}">
            <div class="palette-label">
              ${Panel.themeColors.darkColors}
              <span class="palette-hint">${Panel.themeColors.dragHint}</span>
            </div>
            <div class="color-list">
              <button type="button" class="palette-add-color" title="${
                Panel.themeColors.addColor
              }">+</button>
            </div>
          </div>
        </div>
        <div class="control-error" name="${Controls.ThemeColors}"></div>
        <div class="control-succ" name="${Controls.ThemeColors}"></div>
      </div>
    </form>
  </div>

  <script purpose="加载测试UI文本">
    if (!window.__kskb_consts.isProd) {
      const testScript = document.createElement('script');
      testScript.src = '../tests/template-replacer.js';
      document.body.appendChild(testScript);
    }
  </script>
  <script purpose="加载js">
    {
      const script = document.createElement('script');
      script.src = window.__kskb_consts.isProd ? '${scriptUri}' : './control-panel.js';
      document.body.appendChild(script);
    }
  </script>
</body>

</html>`;

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
