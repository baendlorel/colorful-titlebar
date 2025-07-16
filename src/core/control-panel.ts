import vscode from 'vscode';
import { existsSync } from 'node:fs';

import { GradientStyle, HashSource, TitleBarConsts } from '@/common/consts';
import i18n from '@/common/i18n';
import configs from '@/common/configs';

import hacker from '@/features/gradient/hacker';
import { AfterStyle } from '@/features/gradient/consts';
import RGBA from '@/common/rgba';
import style from './style';

const enum ControlName {
  ShowSuggest = 'showSuggest',
  WorkbenchCssPath = 'workbenchCssPath',
  Gradient = 'gradient',
  GradientBrightness = 'gradientBrightness',
  GradientDarkness = 'gradientDarkness',
  HashSource = 'hashSource',
  Refresh = 'refresh',
  PickColor = 'pickColor',
}

/**
 * Opens a color picker to manually select titlebar color
 */
export default async () => {
  const Panel = i18n.ControlPanel;
  const controlPanel = vscode.window.createWebviewPanel(
    'controllPanel',
    Panel.title,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  // 准备一些数据
  const env = 'prod';
  const currentColorStyle = configs.global.get(TitleBarConsts.WorkbenchSection) ?? {};
  const currentColor = Reflect.get(currentColorStyle, TitleBarConsts.ActiveBg) || '#007ACC';
  const gradientBrightness = Math.floor(configs.gradientBrightness * 100);
  const gradientDarkness = Math.floor(configs.gradientDarkness * 100);

  controlPanel.webview.html = `<!DOCTYPE html>
<html lang="zh-CN">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${Panel.title}</title>
  <style>
    :root {
      --ct-primary-color: #4285f4;
      --ct-success-color: #34a853;
      --ct-danger-color: #ea4335;
      --ct-warning-color: #fbbc05;
      --ct-text-color: #202124;
      --ct-text-color-weak: rgba(32, 33, 36, 0.7);
      --ct-bg-color: #f8f9fa;
      --ct-panel-bg: #ffffff;
      --ct-border-color: rgba(224, 224, 224, 0.5);
      --ct-shadow-color: rgba(0, 0, 0, 0.1);
      --ct-loading-bg-color: rgba(71, 73, 78, 0.12);
      --ct-focus-shadow: rgba(66, 133, 244, 0.2);
    }

    [theme="dark"] {
      --ct-primary-color: #4285f4;
      --ct-success-color: #34a853;
      --ct-danger-color: #ea4335;
      --ct-warning-color: #fbbc05;
      --ct-text-color: #e8eaed;
      --ct-text-color-weak: rgba(232, 234, 237, 0.7);
      --ct-bg-color: #202124;
      --ct-panel-bg: #292a2d;
      --ct-border-color: rgba(60, 64, 67, 0.5);
      --ct-shadow-color: rgba(0, 0, 0, 0.3);
      --ct-loading-bg-color: rgba(241, 241, 241, 0.12);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-size: 14px;
    }

    .body {
      font-family: 'Roboto', sans-serif;
      background-color: transparent;
      color: var(--ct-text-color);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      transition: background-color 0.3s, color 0.3s;
    }

    .control-panel {
      position: relative;
      padding: 30px;
      width: 100%;
      max-width: 500px;
      background-color: var(--ct-panel-bg);
      border-radius: 16px;
      box-shadow: 0 10px 30px var(--ct-shadow-color);
      transition: background-color 0.3s;
      border: 1px solid var(--ct-border-color);
    }

    .control-panel::after {
      content: "${Panel.loading}";
      font-size: 60px;
      text-align: center;
      line-height: 382px;
      color: rgb(237, 237, 237);
      text-shadow: 1px 3px 6px rgb(107, 107, 107);

      position: absolute;
      width: 100%;
      height: 100%;
      left: 0;
      top: 0;
      border-radius: 16px;
      pointer-events: none;
      background-color: var(--ct-loading-bg-color);
      opacity: 0;
      transition: opacity 0.3s;
    }

    .freeze::after {
      opacity: 1;
      pointer-events: all;
    }

    .header {
      margin-bottom: 40px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      color: var(--ct-text-color);
      font-weight: 500;
      font-size: 20px;
    }

    .header p {
      color: var(--ct-text-color);
      opacity: 0.7;
    }


    .control-item {
      display: grid;
      grid-template-columns: 1fr auto;
      grid-template-rows: auto auto auto;
      margin-bottom: 10px;
      padding-bottom: 10px;
      align-items: center;
      border-bottom: 1px solid var(--ct-border-color);
    }

    .control-label-group {
      display: grid;
      grid-template-rows: auto auto;
      color: var(--ct-text-color);
      font-weight: 500;
      margin-right: 20px;
    }

    .control-label {}

    .control-desc {
      font-size: 0.8em;
      color: var(--ct-text-color-weak);
    }

    .control-error {
      grid-column: 1 / span 2;
      font-size: 0.8em;
      color: var(--ct-danger-color);
    }

    .control-succ {
      grid-column: 1 / span 2;
      font-size: 0.8em;
      color: var(--ct-success-color);
    }

    .control-input {
      display: flex;
      align-items: center;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 44px;
      height: 24px;
    }

    .toggle-switch input {
      opacity: 0;
      width: 0;
      height: 0;
    }

    .slider {
      position: absolute;
      cursor: pointer;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background-color: #ccc;
      transition: .4s;
      border-radius: 34px;
    }

    .slider:before {
      position: absolute;
      content: "";
      height: 18px;
      width: 18px;
      left: 3px;
      bottom: 3px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked+.slider {
      background-color: var(--ct-primary-color);
    }

    input:checked+.slider:before {
      transform: translateX(20px);
    }

    [theme="dark"] .slider {
      background-color: #555;
    }

    [theme="dark"] .slider:before {
      background-color: #f1f1f1;
    }

    [theme="dark"] input:checked+.slider {
      background-color: var(--ct-primary-color);
    }

    .btn {
      border: none;
      border-radius: 8px;
      padding: 8px 12px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--ct-primary-color);
      color: white;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .picker {
      width: 0;
      height: 0;
      opacity: 0;
      border: 0;
    }

    .select {
      min-width: 120px;
    }

    .input-text {
      width: 200px;
      min-width: 150px;
    }

    .select,
    .input-text,
    .input-percent input[type="number"] {
      border: 1px solid var(--ct-border-color);
      border-radius: 8px;
      padding: 8px 30px 8px 12px;
      background-color: var(--ct-panel-bg);
      color: var(--ct-text-color);
    }

    .input-percent input[type="number"] {
      position: relative;
      width: 75px;
      text-align: right;
    }

    .input-percent input[type="number"]::-webkit-inner-spin-button,
    .input-percent input[type="number"]::-webkit-outer-spin-button {
      -webkit-appearance: none;
      margin: 0;
    }

    .input-percent::after {
      position: absolute;
      content: '%';
      right: 40px;
      margin-top: -2px;
      color: var(--ct-text-color-weak);
    }

    .select {
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 8px center;
      background-repeat: no-repeat;
      background-size: 16px;
      padding-right: 26px;
      cursor: pointer;
    }

    button,
    input,
    select {
      transition: all 0.3s ease;
    }

    .select:hover {
      border-color: var(--ct-primary-color);
      box-shadow: 0 0 0 1px var(--ct-primary-color);
    }

    .select:focus,
    .input-text:focus,
    .input-percent input[type="number"]:focus {
      outline: none;
      border-color: var(--ct-primary-color);
      box-shadow: 0 0 0 2px var(--ct-focus-shadow);
    }

    .btn:focus {
      outline: none;
      box-shadow: 0 0 0 2px var(--ct-focus-shadow);
    }

    .toggle-switch input:focus+.slider {
      box-shadow: 0 0 0 2px var(--ct-focus-shadow);
    }

    [theme="dark"] .select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23abadb4' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    }
  </style>
</head>

<body>
  <div class="body" theme="${configs.theme}">
    <form name="settings" class="control-panel">
      <div class="header" onclick="theme()">
        <div>
          <h1>${Panel.title}</h1>
          <p>${Panel.description}</p>
        </div>
      </div>

      <div class="control-item">
        <div class="control-label-group">
          <div class="control-label">${Panel.showSuggest.label}</div>
          <div class="control-desc">${Panel.showSuggest.description}</div>
        </div>
        <div class="control-input">
          <label class="toggle-switch">
            <input type="checkbox" name="showSuggest">
            <span class="slider"></span>
          </label>
        </div>
        <div class="control-error" name="showSuggest"></div>
        <div class="control-succ" name="showSuggest"></div>
      </div>

      <div class="control-item">
        <div class="control-label-group">
          <div class="control-label">${Panel.workbenchCssPath.label}</div>
          <div class="control-desc">${Panel.workbenchCssPath.description}</div>
        </div>
        <div class="control-input">
          <input type="text" class="input-text" name="workbenchCssPath" />
        </div>
        <div class="control-error" name="workbenchCssPath"></div>
        <div class="control-succ" name="workbenchCssPath"></div>
      </div>

      <div class="control-item">
        <div class="control-label-group">
          <label class="control-label">${Panel.gradient.label}</label>
          <div class="control-desc">${Panel.gradient.description}</div>
        </div>
        <div class="control-input">
          <select name="gradient" class="select">
            <option value="" selected>${Panel.gradient.empty}</option>
            <option value="${GradientStyle.BrightCenter}">${
    Panel.gradient[GradientStyle.BrightCenter]
  }</option>
            <option value="${GradientStyle.BrightLeft}">${
    Panel.gradient[GradientStyle.BrightLeft]
  }</option>
            <option value="${GradientStyle.ArcLeft}">${
    Panel.gradient[GradientStyle.ArcLeft]
  }</option>
          </select>
        </div>
        <div class="control-error" name="gradient"></div>
        <div class="control-succ" name="gradient"></div>
      </div>

      <div class="control-item">
        <div class="control-label-group">
          <div class="control-label">${Panel.gradientBrightness.label}</div>
          <div class="control-desc">${Panel.gradientBrightness.description}</div>
        </div>
        <div class="control-input input-percent">
          <input type="number" min="0" max="100" step="5" class="" name="gradientBrightness" />
        </div>
        <div class="control-error" name="gradientBrightness"></div>
        <div class="control-succ" name="gradientBrightness"></div>
      </div>

      <div class="control-item">
        <div class="control-label-group">
          <div class="control-label">${Panel.gradientDarkness.label}</div>
          <div class="control-desc">${Panel.gradientDarkness.description}</div>
        </div>
        <div class="control-input input-percent">
          <input type="number" min="0" max="100" step="5" class="" name="gradientDarkness" />
        </div>
        <div class="control-error" name="gradientDarkness"></div>
        <div class="control-succ" name="gradientDarkness"></div>
      </div>

      <div class="control-item">
        <div class="control-label-group">
          <div class="control-label">${Panel.hashSource.label}</div>
          <div class="control-desc">${Panel.hashSource.description}</div>
        </div>
        <div class="control-input">
          <select name="hashSource" class="select">
            <option value="${HashSource.FullPath}">${Panel.hashSource[HashSource.FullPath]}</option>
            <option value="${HashSource.ProjectName}">${
    Panel.hashSource[HashSource.ProjectName]
  }</option>
            <option value="${HashSource.ProjectNameDate}">${
    Panel.hashSource[HashSource.ProjectNameDate]
  }</option>
          </select>
        </div>
        <div class="control-error" name="hashSource"></div>
        <div class="control-succ" name="hashSource"></div>
      </div>

      <div class="control-item">
        <div class="control-label-group">
          <div class="control-label">${Panel.refresh.label}</div>
          <div class="control-desc">${Panel.refresh.description}</div>
        </div>
        <div class="control-input">
          <button type="button" class="btn" name="refresh">
            <span>${Panel.refresh.button}</span>
          </button>
        </div>
        <div class="control-error" name="refresh"></div>
        <div class="control-succ" name="refresh"></div>
      </div>

      <div class="control-item">
        <div class="control-label-group">
          <div class="control-label">${Panel.pickColor.label}</div>
          <div class="control-desc">${Panel.pickColor.description}</div>
        </div>
        <div class="control-input">
          <button type="button" class="btn" name="pickerBtn">
            ${Panel.pickColor.button}
          </button>
          <input type="color" class="picker" name="pickColor" value="${currentColor}">
        </div>
        <div class="control-error" name="pickColor"></div>
        <div class="control-succ" name="pickColor"></div>
      </div>
    </form>
  </div>

  <script>
    const isProd = '${env}' === 'prod';

    // functions
    const freeze = () => {
      document.querySelectorAll('.control-error,.control-succ').forEach(el => el.textContent = '');
      if (isProd) {
        setTimeout(() => settings.classList.add('freeze'), 600);
        Array.from(settings.elements).forEach((el) => el.disabled = true);
      }
    }

    const unfreeze = () => {
      setTimeout(() => settings.classList.remove('freeze'), 1000);
      Array.from(settings.elements).forEach((el) => el.disabled = false)
    }

    const vspost = (() => {
      let o = isProd ? acquireVsCodeApi() : {
        postMessage: (a) => console.log('vscode.postMessage', a)
      };
      return (data) => {
        freeze();
        o.postMessage({
          from: 'colorful-titlebar',
          ...data
        });
      }
    })();

    const theme = () => {
      const body = document.querySelector('.body');
      const currentTheme = body.getAttribute('theme');
      body.setAttribute('theme', currentTheme === 'dark' ? 'light' : 'dark');
    }

    // tp = form | error | succ
    const find = (name, tp = 'form') => {
      switch (tp) {
        case 'succ':
          return document.querySelector(['.control-succ[name=', name, ']'].join(''));
        case 'error':
          return document.querySelector(['.control-error[name=', name, ']'].join(''));
        case 'form':
        default:
          return document.querySelector(['[name=', name, ']:not(.control-error):not(.control-succ)'].join(''))
      }
    };

    const i18n = (() => {
      const zh = {
        NumberLimit: (min, max, isInt = true) => ['请输入', min, '到', max, '之间的', isInt ? '整数' : '数'].join('')
      }
      const en = {
        NumberLimit: (min, max, isInt = true) => ['Please input', isInt ? 'an integer' : 'a number', 'between', min, 'and', max].join(' ')
      }
      switch ('${configs.lang}') {
        case 'zh':
          return zh;
        case 'en':
          return en;
        default:
          return zh;
      }
    })()

    /**
     * @type {HTMLFormElement} 
     */
    const settings = find('settings');
    const pickColor = find('pickColor');
    const pickerBtn = find('pickerBtn');
    const refresh = find('refresh');

    // init
    if (isProd) {
      find('showSuggest').checked = '${configs.showSuggest}' === 'true';
      find('workbenchCssPath').value = '${configs.workbenchCssPath}';
      find('hashSource').value = '${configs.hashSource}';
      find('gradientBrightness').value = '${gradientBrightness}';
      find('gradientDarkness').value = '${gradientDarkness}';
      find('pickerBtn').style.backgroundColor = '${currentColor}';
    } else {
      find('showSuggest').checked = false;
      find('workbenchCssPath').value = '/d/work/aaa.css';
      find('hashSource').value = '';
      find('gradientBrightness').value = '99';
      find('gradientDarkness').value = '12';
      find('pickerBtn').style.backgroundColor = '#007ACC';
    }

    // events

    refresh.onclick = () => vspost({ name: 'refresh', value: null })

    pickerBtn.onclick = pickColor.click.bind(pickColor);
    pickColor.addEventListener('input', function () {
      const color = this.value;
      const [r, g, b] = color.replace('#', '').match(/.{2}/g).map(hex => parseInt(hex, 16));
      const brightness = Math.floor((r * 299 + g * 587 + b * 114) / 1000);
      pickerBtn.style.color = brightness > 128 ? '#000' : '#fff';
      pickerBtn.style.backgroundColor = color;
    });

    settings.addEventListener('change', function (event) {
      event.preventDefault();
      const input = event.target;
      const data = {
        name: input.name,
        value: input.value
      };
      // 如果数字类不符合要求，则返回并提示
      if (input.type === 'number') {
        const value = parseInt(input.value, 10);
        let max = parseInt(input.max, 10);
        let min = parseInt(input.min, 10);
        max = Number.isNaN(max) ? Infinity : max;
        min = Number.isNaN(min) ? Infinity : min;

        if (Number.isNaN(value) || value < min || value > max) {
          find(input.name, 'error').innerText = i18n.NumberLimit(min, max, true);
          input.value = input.defaultValue; // 恢复默认值
          return;
        }
        data.value = value;
      } else if (input.type === 'checkbox') {
        data.value = input.checked;
      }

      vspost(data);
    });

    window.addEventListener('message', (event) => {
      const resp = event.data;
      if (resp.from !== 'colorful-titlebar') {
        return;
      }
      unfreeze();

      if (!resp.succ) {
        find(resp.name, 'error').textContent = resp.msg;
        return;
      }

      if (resp.msg) {
        find(resp.name, 'succ').textContent = resp.msg;

        // 如果调整了渐变配置，那么置空渐变选项以备重新选择
        if (resp.name === 'gradientBrightness' || resp.name === 'gradientDarkness') {
          find('gradient').value = '';
        }
      }
    });
  </script>
</body>

</html>`;

  controlPanel.webview.onDidReceiveMessage(async (message) => {
    const result = {
      from: 'colorful-titlebar',
      name: message.name,
      msg: Panel.success,
      succ: true,
    };
    try {
      vscode.window.showInformationMessage(JSON.stringify(message));
      const name = message.name as ControlName;
      const value = message.value;
      switch (name) {
        case ControlName.ShowSuggest:
          if (typeof value !== 'boolean') {
            result.succ = false;
            result.msg = Panel.typeError(value, 'a boolean');
            throw null;
          }
          await configs.set.showSuggest(value);
          break;

        case ControlName.WorkbenchCssPath: {
          if (typeof value !== 'string') {
            result.succ = false;
            result.msg = Panel.typeError(value, 'a string');
            throw null;
          }
          const cssPath = value.trim();
          if (!existsSync(cssPath)) {
            result.succ = false;
            result.msg = Panel.workbenchCssPath.notExist;
            throw null;
          }
          await configs.set.workbenchCssPath(cssPath);
          break;
        }

        case ControlName.Gradient: {
          let gradientStyle: AfterStyle;
          switch (Number(value)) {
            case GradientStyle.BrightCenter:
              gradientStyle = AfterStyle.BrightCenter;
              break;
            case GradientStyle.BrightLeft:
              gradientStyle = AfterStyle.BrightLeft;
              break;
            case GradientStyle.ArcLeft:
              gradientStyle = AfterStyle.ArcLeft;
              break;
            default:
              result.succ = false;
              result.msg = Panel.typeError(
                value,
                [
                  'one of ',
                  GradientStyle.BrightCenter,
                  GradientStyle.BrightLeft,
                  GradientStyle.ArcLeft,
                ].join()
              );
              throw null;
          }
          const cssPath = await hacker.getWorkbenchCssPath();
          if (!cssPath) {
            return;
          }
          await hacker.inject(cssPath, gradientStyle);
          result.msg = Panel.gradient.success;
          break;
        }

        case ControlName.GradientBrightness: {
          const d = parseInt(value, 10) / 100;
          if (Number.isNaN(d) || d < 0 || d > 1) {
            result.succ = false;
            result.msg = Panel.typeError(value);
            throw null;
          }
          await configs.set.gradientBrightness(d);
          result.msg = Panel.gradient.success;
          break;
        }
        case ControlName.GradientDarkness: {
          const d = parseInt(value, 10) / 100;
          if (Number.isNaN(d) || d < 0 || d > 1) {
            result.succ = false;
            result.msg = Panel.typeError(value);
            throw null;
          }
          await configs.set.gradientDarkness(d);
          result.msg = Panel.gradient.success;
          break;
        }

        // fixme 为什么三种算出来都是紫色?
        case ControlName.HashSource: {
          const d = parseInt(value, 10) as HashSource;
          const arr = [HashSource.FullPath, HashSource.ProjectName, HashSource.ProjectNameDate];
          if (!arr.includes(d)) {
            result.succ = false;
            result.msg = Panel.typeError(value, `one of ${arr.join(', ')}`);
            throw null;
          }
          await configs.set.hashSource(d);
          result.msg = Panel.hashSource.success;
          break;
        }

        case ControlName.Refresh: {
          await style.refresh(true);
          break;
        }

        case ControlName.PickColor: {
          await applyManualColor(value);
          break;
        }

        default:
          throw new Error('Unknown control name: ' + name);
      }
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(error.message);
      }
    } finally {
      // controlPanel.dispose();
      await controlPanel.webview.postMessage(result);
    }
  });

  // 发送测试消息到webview
  setTimeout(() => {
    controlPanel.webview.postMessage({ command: 'fromExtension', text: '开局消息！' });
  }, 1000);
};

/**
 * Apply manually selected color to titlebar
 */
const applyManualColor = async (colorHex: string) => {
  const color = new RGBA(colorHex);
  const newStyle = {
    [TitleBarConsts.ActiveBg]: color.toString(),
    [TitleBarConsts.InactiveBg]: color.toGreyDarkenString(),
  };

  await configs.global.update(
    TitleBarConsts.WorkbenchSection,
    newStyle,
    vscode.ConfigurationTarget.Workspace
  );
};
