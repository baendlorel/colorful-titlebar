import vscode from 'vscode';

import { RGBA } from '@/common/rgb';
import configs from '@/common/configs';
import { GradientStyle, HashSource, TitleBarConsts } from '@/common/consts';
import i18n from '@/common/i18n';
import style from './style';

/**
 * Opens a color picker to manually select titlebar color
 */
export default async () => {
  const Panel = i18n.ControlPanel;
  const Style = i18n.Commands.enableGradient.style;
  const panel = vscode.window.createWebviewPanel(
    'controllPanel',
    Panel.title,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );
  panel.webview.html = `<!DOCTYPE html>
<html lang="zh-CN" theme="${configs.theme}">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --vscode-button-background: #4285f4;
      --primary-color: #4285f4;
      --secondary-color: #34a853;
      --danger-color: #ea4335;
      --warning-color: #fbbc05;
      --text-color: #202124;
      --text-color-weak: rgba(32, 33, 36, 0.7);
      --bg-color: #f8f9fa;
      --panel-bg: #ffffff;
      --border-color: #e0e0e0;
      --shadow-color: rgba(0, 0, 0, 0.1);
    }

    [theme="dark"] {
      --vscode-button-background: #8ab4f8;
      --primary-color: #8ab4f8;
      --secondary-color: #81c995;
      --danger-color: #f28b82;
      --warning-color: #fde293;
      --text-color: #e8eaed;
      --text-color-weak: rgba(32, 33, 36, 0.7);
      --bg-color: #202124;
      --panel-bg: #292a2d;
      --border-color: #3c4043;
      --shadow-color: rgba(0, 0, 0, 0.3);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
      font-size: 14px;
    }

    body {
      font-family: 'Roboto', sans-serif;
      background-color: var(--bg-color);
      color: var(--text-color);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      transition: background-color 0.3s, color 0.3s;
    }

    .control-panel {
      background-color: var(--panel-bg);
      border-radius: 16px;
      box-shadow: 0 10px 30px var(--shadow-color);
      width: 100%;
      max-width: 500px;
      padding: 30px;
      transition: background-color 0.3s;
      border: 1px solid var(--border-color);
    }

    .header {
      margin-bottom: 30px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    .header h1 {
      color: var(--text-color);
      font-weight: 500;
      font-size: 20px;
    }

    .header p {
      color: var(--text-color);
      opacity: 0.7;
    }


    .control-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .control-label-group {
      flex: 1;
      display: grid;
      grid-template-rows: auto auto;
      color: var(--text-color);
      font-weight: 500;
      margin-right: 20px;
    }

    .control-label {}

    .control-desc {
      font-size: 0.8em;
      color: var(--text-color-weak)
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
      background-color: var(--vscode-button-background);
    }

    input:checked+.slider:before {
      transform: translateX(20px);
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
      background-color: var(--vscode-button-background);
      color: white;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .picker-container {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
      cursor: pointer;
    }

    .picker {
      width: 0;
      height: 0;
      opacity: 0;
    }

    .color-preview {
      width: 100%;
      height: 100%;
      background-color: var(--vscode-button-background);
    }

    select {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 8px 12px;
      background-color: var(--panel-bg);
      color: var(--text-color);
      cursor: pointer;
      transition: all 0.3s ease;
      appearance: none;
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
      background-position: right 8px center;
      background-repeat: no-repeat;
      background-size: 16px;
      padding-right: 32px;
      min-width: 120px;
    }

    select:hover {
      border-color: var(--vscode-button-background);
      box-shadow: 0 0 0 1px var(--vscode-button-background);
    }

    select:focus {
      outline: none;
      border-color: var(--vscode-button-background);
      box-shadow: 0 0 0 2px rgba(66, 133, 244, 0.2);
    }

    [theme="dark"] select {
      background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%9ca3af' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3e%3c/svg%3e");
    }
  </style>
</head>

<body>
  <div class="control-panel">
    <div class="header">
      <div>
        <h1>${Panel.title}</h1>
        <p>${Panel.description}</p>
      </div>
    </div>


    <div class="control-item">
      <div class="control-label-group">
        <label class="control-label">${Panel.gradient.label}</label>
        <div class="control-desc">${Panel.gradient.description}</div>
      </div>
      <div class="control-input">
        <select id="gradient">
          <option value="${GradientStyle.BrightCenter}">${
    Panel.gradient[GradientStyle.BrightCenter]
  }</option>
          <option value="${GradientStyle.BrightLeft}">${
    Panel.gradient[GradientStyle.BrightLeft]
  }</option>
          <option value="${GradientStyle.ArcLeft}">${Panel.gradient[GradientStyle.ArcLeft]}</option>
        </select>
      </div>
    </div>

    <div class="control-item">
      <div class="control-label-group">
        <div class="control-label">${Panel.hashSource.label}</div>
        <div class="control-desc">${Panel.hashSource.description}</div>
      </div>
      <div class="control-input">
        <select id="hashSource">
          <option value="${HashSource.FullPath}">${Panel.hashSource[HashSource.FullPath]}</option>
          <option value="${HashSource.ProjectName}">${
    Panel.hashSource[HashSource.ProjectName]
  }</option>
          <option value="${HashSource.ProjectNameDate}">${
    Panel.hashSource[HashSource.ProjectNameDate]
  }</option>
        </select>
      </div>
    </div>

    <div class="control-item">
      <div class="control-label-group">
        <div class="control-label">${Panel.refresh.label}</div>
        <div class="control-desc">${Panel.refresh.description}</div>
      </div>
      <div class="control-input">
        <button class="btn" id="refresh">
          <span>${Panel.refresh.button}</span>
        </button>
      </div>
    </div>

    <div class="control-item">
      <div class="control-label-group">
        <div class="control-label">${Panel.pickColor.label}</div>
        <div class="control-desc">${Panel.pickColor.description}</div>
      </div>
      <div class="control-input">
        <div id="pickerContainer" class="picker-container" style="background-color: #007ACC;">
          <input type="color" class="picker" id="picker" value="#007ACC">
        </div>
      </div>
    </div>
  </div>

  <script>
    const find = document.getElementById.bind(document);
    const gradientSwitch = find('gradientSwitch');
    const refresh = find('refresh');
    const picker = find('picker');
    const pickerContainer = find('pickerContainer');

    let isGlobalEnabled = false;

    gradientSwitch.addEventListener('change', function () {
      isGlobalEnabled = this.checked;
      console.log('全局状态:', isGlobalEnabled ? '已开启' : '已关闭');
    });

    refresh.addEventListener('click', function () {
      console.log('正在重新计算...');
      // 这里可以添加实际的重新计算逻辑
      alert('系统正在重新计算，请稍候...');
    });

    pickerContainer.addEventListener('click', function () {
      picker.click();
    });

    picker.addEventListener('input', function () {
      const selectedColor = this.value;
      console.log('选择的颜色:', selectedColor);
      pickerContainer.style.backgroundColor = selectedColor;
    });
  </script>
</body>

</html>
`;

  panel.webview.onDidReceiveMessage(async (message) => {
    try {
      switch (message.command) {
        case 'reset':
          await style.refresh(true);
          vscode.window.showInformationMessage('');
          panel.dispose();
          break;
      }
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage('');
      } else {
        vscode.window.showErrorMessage(String(error));
      }
    }
  });
};
