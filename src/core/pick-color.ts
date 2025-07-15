import vscode from 'vscode';

import { RGBA } from '@/common/rgb';
import { configs } from '@/common/configs';
import { TitleBarStyle } from '@/common/consts';
import { Msg } from '@/common/i18n';
import { clearTitleBarColor } from './style';

/**
 * Opens a color picker to manually select titlebar color
 */
export const pickColor = async () => {
  // Check if titleBarStyle is custom
  const titleBarStyle = configs.global.get<string>(TitleBarStyle.Section);
  if (titleBarStyle !== TitleBarStyle.Expected) {
    const result = await vscode.window.showWarningMessage(
      Msg.Commands.pickColor.titleBarStyleWarning,
      Msg.Commands.pickColor.setStyleButton,
      Msg.Commands.pickColor.cancelButton
    );
    if (result === Msg.Commands.pickColor.setStyleButton) {
      await configs.global.update(
        TitleBarStyle.Section,
        TitleBarStyle.Expected,
        vscode.ConfigurationTarget.Global
      );
      vscode.window.showInformationMessage(Msg.Commands.pickColor.styleSetSuccess);
    } else {
      return;
    }
  }

  const panel = vscode.window.createWebviewPanel(
    'colorPicker',
    Msg.Commands.pickColor.title,
    vscode.ViewColumn.One,
    { enableScripts: true }
  );

  panel.webview.html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body {
          font-family: var(--vscode-font-family);
          padding: 20px;
          background: var(--vscode-editor-background);
          color: var(--vscode-editor-foreground);
        }
        .container {
          max-width: 400px;
          margin: 0 auto;
        }
        .color-input {
          width: 100%;
          height: 60px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          margin: 10px 0;
        }
        .preview {
          padding: 15px;
          border-radius: 4px;
          margin: 10px 0;
          text-align: center;
          font-weight: bold;
        }
        .button {
          background: var(--vscode-button-background);
          color: var(--vscode-button-foreground);
          border: none;
          padding: 10px 20px;
          border-radius: 4px;
          cursor: pointer;
          margin: 5px;
        }
        .button:hover {
          background: var(--vscode-button-hoverBackground);
        }
        .current-color {
          font-family: monospace;
          font-size: 14px;
          margin: 10px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Pick Titlebar Color</h2>
        <p>Select a color for your titlebar:</p>
        
        <input type="color" id="colorPicker" class="color-input" value="#6366f1" />
        
        <div class="current-color">
          Current color: <span id="colorValue">#6366f1</span>
        </div>
        
        <div id="preview" class="preview" style="background-color: #6366f1; color: white;">
          Titlebar Preview
        </div>
        
        <button class="button" onclick="applyColor()">Apply Color</button>
        <button class="button" onclick="resetColor()">Reset to Auto</button>
      </div>

      <script>
        const vscode = acquireVsCodeApi();
        const picker = document.getElementById('colorPicker');
        const preview = document.getElementById('preview');
        const colorValue = document.getElementById('colorValue');

        picker.addEventListener('input', (e) => {
          const color = e.target.value;
          preview.style.backgroundColor = color;
          colorValue.textContent = color;
          
          // Calculate text color for better contrast
          const rgb = hexToRgb(color);
          const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
          preview.style.color = brightness > 128 ? '#000000' : '#ffffff';
        });

        function hexToRgb(hex) {
          const result = /^#?([a-f\\d]{2})([a-f\\d]{2})([a-f\\d]{2})$/i.exec(hex);
          return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
          } : null;
        }

        function applyColor() {
          vscode.postMessage({ 
            command: 'applyColor', 
            color: picker.value 
          });
        }

        function resetColor() {
          vscode.postMessage({ 
            command: 'resetColor' 
          });
        }
      </script>
    </body>
    </html>
  `;

  panel.webview.onDidReceiveMessage(async (message) => {
    try {
      switch (message.command) {
        case 'applyColor':
          await applyManualColor(message.color);
          vscode.window.showInformationMessage(`Titlebar color applied: ${message.color}`);
          panel.dispose();
          break;
        case 'resetColor':
          await clearTitleBarColor();
          vscode.window.showInformationMessage('Titlebar color reset to auto-generated');
          panel.dispose();
          break;
      }
    } catch (error) {
      vscode.window.showErrorMessage(`Error: ${error}`);
    }
  });
};

/**
 * Apply manually selected color to titlebar
 */
const applyManualColor = async (colorHex: string) => {
  const color = new RGBA(colorHex);
  const newStyle = {
    [TitleBarStyle.ActiveBg]: color.toString(),
    [TitleBarStyle.InactiveBg]: color.toGreyDarkenString(),
  };

  await configs.global.update(
    TitleBarStyle.WorkbenchSection,
    newStyle,
    vscode.ConfigurationTarget.Workspace
  );
};
