import vscode from 'vscode';

import { RGBA } from '@/common/rgb';
import { configs } from '@/common/configs';
import { HashSource, TitleBarStyle } from '@/common/consts';
import { Msg } from '@/common/i18n';
import { refreshTitleBar } from './style';

/**
 * Opens a color picker to manually select titlebar color
 */
export const pickColor = async () => {
  const Panel = Msg.ControlPanel;
  const Style = Msg.Commands.enableGradient.style;
  const panel = vscode.window.createWebviewPanel(
    'controllPanel',
    Panel.title,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );
  panel.webview.html = `
<!DOCTYPE html>
<html lang="zh-CN" theme="${configs.theme}">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    :root {
      --primary-color: #4285f4;
      --secondary-color: #34a853;
      --danger-color: #ea4335;
      --warning-color: #fbbc05;
      --text-color: #202124;
      --bg-color: #f8f9fa;
      --panel-bg: #ffffff;
      --border-color: #e0e0e0;
      --shadow-color: rgba(0, 0, 0, 0.1);
    }

    [theme="dark"] {
      --primary-color: #8ab4f8;
      --secondary-color: #81c995;
      --danger-color: #f28b82;
      --warning-color: #fde293;
      --text-color: #e8eaed;
      --bg-color: #202124;
      --panel-bg: #292a2d;
      --border-color: #3c4043;
      --shadow-color: rgba(0, 0, 0, 0.3);
    }

    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
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
      font-size: 24px;
    }

    .header p {
      color: var(--text-color);
      opacity: 0.7;
      font-size: 14px;
    }

    .theme-toggle {
      background: none;
      border: none;
      color: var(--text-color);
      cursor: pointer;
      font-size: 20px;
      padding: 5px;
      border-radius: 50%;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
      transition: background-color 0.2s;
    }

    .theme-toggle:hover {
      background-color: rgba(0, 0, 0, 0.1);
    }

    [theme="dark"] .theme-toggle:hover {
      background-color: rgba(255, 255, 255, 0.1);
    }

    .control-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      margin-bottom: 20px;
    }

    .control-label {
      font-size: 16px;
      color: var(--text-color);
      font-weight: 500;
      margin-right: 20px;
      flex: 1;
    }

    .control-input {
      display: flex;
      align-items: center;
    }

    .toggle-switch {
      position: relative;
      display: inline-block;
      width: 60px;
      height: 34px;
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
      height: 26px;
      width: 26px;
      left: 4px;
      bottom: 4px;
      background-color: white;
      transition: .4s;
      border-radius: 50%;
    }

    input:checked+.slider {
      background-color: var(--primary-color);
    }

    input:checked+.slider:before {
      transform: translateX(26px);
    }

    .btn {
      border: none;
      border-radius: 8px;
      padding: 10px 16px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--primary-color);
      color: white;
    }

    .btn:hover {
      opacity: 0.9;
    }

    .color-picker-container {
      position: relative;
      width: 40px;
      height: 40px;
      border-radius: 8px;
      overflow: hidden;
      border: 1px solid var(--border-color);
    }

    .color-picker {
      position: absolute;
      top: -5px;
      left: -5px;
      width: 50px;
      height: 50px;
      border: none;
      cursor: pointer;
      opacity: 0;
    }

    .color-preview {
      width: 100%;
      height: 100%;
      background-color: var(--primary-color);
    }

    .icon {
      margin-right: 8px;
      font-size: 16px;
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
      <label class="control-label">${Panel.gradientSwitch.label}</label>
      <label class="control-label">${Panel.gradientSwitch.description}</label>
      <div class="control-input">
        <label class="toggle-switch">
          <input type="checkbox" id="gradientSwitch">
          <span class="slider"></span>
        </label>
      </div>
    </div>

    <div class="control-item">
      <label class="control-label">${Panel.gradient.label}</label>
      <div class="control-input">
        <select id="gradient">
          <option value="${Style.brightCenter}">${Panel.gradient.brightCenter}</option>
          <option value="${Style.brightLeft}">${Panel.gradient.brightLeft}</option>
          <option value="${Style.arcLeft}">${Panel.gradient.arcLeft}</option>
        </select>
      </div>
    </div>

    <div class="control-item">
      <label class="control-label">${Panel.hashSource.label}</label>
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
      <label class="control-label">${Panel.refresh.label}</label>
      <label class="control-label">${Panel.refresh.description}</label>
      <div class="control-input">
        <button class="btn" id="refresh">
          <span class="icon">${Panel.refresh.button}</span>
        </button>
      </div>
    </div>

    <div class="control-item">
      <label class="control-label">${Panel.pickColor.label}</label>
      <label class="control-label">${Panel.pickColor.description}</label>
      <div class="control-input">
        <div class="color-picker-container">
          <input type="color" class="color-picker" id="colorPicker" value="#007ACC">
          <div class="color-preview"></div>
        </div>
      </div>
    </div>
  </div>

  <script>
    const find = document.getElementById.bind(document);
    const gradientSwitch = find('gradientSwitch');
    const gradient = find('gradient');
    const hashSource = find('hashSource');
    const refresh = find('refresh');
    const colorPicker = find('colorPicker');
    const colorPreview = document.querySelector('.color-preview');

    let isGlobalEnabled = false;

    gradientSwitch.addEventListener('change', function () {
      isGlobalEnabled = this.checked;
      console.log('全局状态:', isGlobalEnabled ? '已开启' : '已关闭');

      document.documentElement.style.setProperty(
        '--primary-color',
        isGlobalEnabled ? '#34a853' : '#4285f4'
      );
    });

    refresh.addEventListener('click', function () {
      console.log('正在重新计算...');
      alert('系统正在重新计算，请稍候...');
    });

    colorPicker.addEventListener('input', function () {
      const selectedColor = this.value;
      console.log('选择的颜色:', selectedColor);
      document.documentElement.style.setProperty('--primary-color', selectedColor);
      colorPreview.style.backgroundColor = selectedColor;
    });

    colorPreview.style.backgroundColor = colorPicker.value;
  </script>
</body>

</html>`;

  panel.webview.onDidReceiveMessage(async (message) => {
    try {
      switch (message.command) {
        case 'reset':
          await refreshTitleBar(true);
          vscode.window.showInformationMessage(PickColor.colorReset);
          panel.dispose();
          break;
      }
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(PickColor.error(error.message));
      } else {
        vscode.window.showErrorMessage(String(error));
      }
    }
  });
};
