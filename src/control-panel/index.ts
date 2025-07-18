import vscode from 'vscode';
import { join } from 'node:path';

import { Consts, GradientStyle, HashSource } from '@/common/consts';
import i18n from '@/common/i18n';
import configs from '@/common/configs';
import RGBA from '@/common/rgba';
import version from '@/core/version';

import { handlerMap } from './handler-map';
import { HandelResult } from './types';
import { ControlName, Prod } from './consts';

const Panel = i18n.ControlPanel;

let controlPanel: vscode.WebviewPanel | null = null;

export default async function (this: vscode.ExtensionContext) {
  if (controlPanel !== null) {
    return; // 防止创建多个设置页面
  }
  (controlPanel = vscode.window.createWebviewPanel(
    'controllPanel',
    Panel.title,
    vscode.ViewColumn.One,
    {
      enableScripts: true,
      localResourceRoots: [vscode.Uri.joinPath(this.extensionUri, 'html')],
      retainContextWhenHidden: true,
    }
  )).onDidDispose(() => (controlPanel = null));

  // 准备导入路径
  const scriptPath = vscode.Uri.file(join(this.extensionPath, 'html', 'control-panel.js'));
  const cssPath = vscode.Uri.file(join(this.extensionPath, 'html', 'style.css'));
  const cssThemeSwitchPath = vscode.Uri.file(join(this.extensionPath, 'html', 'theme-switch.css'));
  const cssPalettePath = vscode.Uri.file(join(this.extensionPath, 'html', 'palette.css'));

  const scriptUri = controlPanel.webview.asWebviewUri(scriptPath);
  const cssUri = controlPanel.webview.asWebviewUri(cssPath);
  const cssThemeSwitchUri = controlPanel.webview.asWebviewUri(cssThemeSwitchPath);
  const cssPaletteUri = controlPanel.webview.asWebviewUri(cssPalettePath);

  // 准备一些数据
  const currentColor = configs.currentColor ?? '#007ACC';
  const gradientBrightness = Math.floor(configs.gradientBrightness * 100);
  const gradientDarkness = Math.floor(configs.gradientDarkness * 100);
  const projectIndicators = configs.projectIndicators.join(Prod.Separator);
  const lightThemeColors = configs.lightThemeColors
    .map((c) => new RGBA(c).toRGBString())
    .join(Prod.Separator);
  const darkThemeColors = configs.darkThemeColors
    .map((c) => new RGBA(c).toRGBString())
    .join(Prod.Separator);

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
      separator: '${Prod.Env}' === 'prod' ? '${Prod.Separator}' : ';',
      configs: {
        theme: '${configs.theme}' === 'light',
        showSuggest: '${configs.showSuggest}' === 'true',
        workbenchCssPath: '${configs.workbenchCssPath}',
        hashSource: '${configs.hashSource}',
        gradientBrightness: '${gradientBrightness}',
        gradientDarkness: '${gradientDarkness}',
        currentColor: '${currentColor}',
        projectIndicators: '${projectIndicators}',
        lightThemeColors: '${lightThemeColors}',
        darkThemeColors: '${darkThemeColors}',
      },
      names: {
        // 这些都是指令=控制名的情况
        showSuggest: '${ControlName.ShowSuggest}',
        workbenchCssPath: '${ControlName.WorkbenchCssPath}',
        gradient: '${ControlName.Gradient}',
        hashSource: '${ControlName.HashSource}',
        gradientBrightness: '${ControlName.GradientBrightness}',
        gradientDarkness: '${ControlName.GradientDarkness}',
        refresh: '${ControlName.Refresh}',
        'randomColor.specify': "${ControlName['RandomColor.specify']}",
        projectIndicators: '${ControlName.ProjectIndicators}',
        // 这两个是配置决定的名字
        lightThemeColors: "${ControlName['ThemeColors.light']}",
        darkThemeColors: "${ControlName['ThemeColors.dark']}",
        themeColors: '${ControlName.ThemeColors}',
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
            <input type="checkbox" class="control-input" name="${ControlName.ShowSuggest}">
            <span class="slider"></span>
          </label>
        </div>
        <div class="control-error" name="${ControlName.ShowSuggest}"></div>
        <div class="control-succ" name="${ControlName.ShowSuggest}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.workbenchCssPath.label}<small>${Panel.workbenchCssPath.description}</small>
        </div>
        <div class="control-form">
          <textarea class="control-input textarea" name="${
            ControlName.WorkbenchCssPath
          }"></textarea>
        </div>
        <div class="control-error" name="${ControlName.WorkbenchCssPath}"></div>
        <div class="control-succ" name="${ControlName.WorkbenchCssPath}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.gradient.label}<small>${Panel.gradient.description}</small>
        </div>
        <div class="control-form">
          <select class="control-input select" name="${ControlName.Gradient}">
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
        <div class="control-error" name="${ControlName.Gradient}"></div>
        <div class="control-succ" name="${ControlName.Gradient}"></div>
      </div>

      <div class="control-item-double">
        <div class="control-item" style="grid-template-columns: 1fr auto;">
          <div class="control-label">
            ${Panel.gradientBrightness.label}<small>${Panel.gradientBrightness.description}</small>
          </div>
          <div class="control-form input-percent">
            <input type="number" min="0" max="100" step="5" class="control-input" name="${
              ControlName.GradientBrightness
            }" />
          </div>
          <div class="control-error" name="${ControlName.GradientBrightness}"></div>
          <div class="control-succ" name="${ControlName.GradientBrightness}"></div>
        </div>

        <div class="control-item" style="grid-template-columns: 1fr auto;">
          <div class="control-label">
            ${Panel.gradientDarkness.label}<small>${Panel.gradientDarkness.description}</small>
          </div>
          <div class="control-form input-percent">
            <input type="number" min="0" max="100" step="5" class="control-input" name="${
              ControlName.GradientDarkness
            }" />
          </div>
          <div class="control-error" name="${ControlName.GradientDarkness}"></div>
          <div class="control-succ" name="${ControlName.GradientDarkness}"></div>
        </div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.hashSource.label}<small>${Panel.hashSource.description}</small>
        </div>
        <div class="control-form">
          <select class="control-input select" name="${ControlName.HashSource}">
            <option value="${HashSource.ProjectName}">
              ${Panel.hashSource[HashSource.ProjectName]}
            </option>
            <option value="${HashSource.FullPath}">${Panel.hashSource[HashSource.FullPath]}</option>
            <option value="${HashSource.ProjectNameDate}">
              ${Panel.hashSource[HashSource.ProjectNameDate]}
            </option>
          </select>
        </div>
        <div class="control-error" name="${ControlName.HashSource}"></div>
        <div class="control-succ" name="${ControlName.HashSource}"></div>
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
                ControlName['RandomColor.colorSet']
              }">
                ${Panel.randomColor.colorSet}
              </button>
              <button type="button" class="control-input dropdown-item" name="${
                ControlName['RandomColor.pure']
              }">
                ${Panel.randomColor.pure}
              </button>
              <!--control-input 不需要，因为这个按钮是靠选颜色来变更的-->
              <button type="button" class="dropdown-item color-picker" title="${
                Panel.randomColor.specify
              }" name="${ControlName['RandomColor.specify']}">
                <span>&nbsp;&nbsp;${Panel.randomColor.specify}</span>
                <input type="color" class="control-input" name="${
                  ControlName['RandomColor.specify']
                }">
              </button>
            </div>
          </div>
        </div>
        <div class="control-error" name="${ControlName.RandomColor}"></div>
        <div class="control-succ" name="${ControlName.RandomColor}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.refresh.label}<small>${Panel.refresh.description}</small>
        </div>
        <div class="control-form">
          <button type="button" class="control-input control-button" name="${ControlName.Refresh}">
            <span>${Panel.refresh.button}</span>
          </button>
        </div>
        <div class="control-error" name="${ControlName.Refresh}"></div>
        <div class="control-succ" name="${ControlName.Refresh}"></div>
      </div>

      <div class="control-item">
        <div class="control-label">
          ${Panel.projectIndicators.label}<small>${Panel.projectIndicators.description}</small>
        </div>
        <div class="control-form textarea-wrapper" max-height="120">
          <textarea class="control-input textarea" name="${
            ControlName.ProjectIndicators
          }"></textarea>
        </div>
        <div class="control-error" name="${ControlName.ProjectIndicators}"></div>
        <div class="control-succ" name="${ControlName.ProjectIndicators}"></div>
      </div>

      <div class="control-item" style="grid-template-columns: 1fr 1.8fr;">
        <div class="control-label">
          ${Panel.themeColors.label}<small>${Panel.themeColors.description}</small>
        </div>
        <div class="control-form" style="display: flex; flex-direction: column; gap: 8px;">
          <div class="palette" name="${ControlName['ThemeColors.light']}">
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
          <div class="palette" name="${ControlName['ThemeColors.dark']}">
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
        <div class="control-error" name="${ControlName.ThemeColors}"></div>
        <div class="control-succ" name="${ControlName.ThemeColors}"></div>
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
