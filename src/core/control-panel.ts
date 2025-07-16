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
  const lang = configs.lang;
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
  <style category="theme-switch">
    .kskb-theme-switch {
      --kskb-border: 1px;
      --kskb-base: 20px;
      --kskb-emoji-size: 20px;
      --kskb-pad: 2px;
      --kskb-width: calc(var(--kskb-base) * 4);
      --kskb-height: calc(var(--kskb-base) * 2);
      --kskb-emoji-diameter: calc(var(--kskb-base) * 2 - var(--kskb-pad) * 2 - var(--kskb-border) * 2);
      --kskb-sun-x: calc(var(--kskb-width) - var(--kskb-emoji-diameter) - var(--kskb-pad) - var(--kskb-border));
      --kskb-moon-x: calc(var(--kskb-pad) + var(--kskb-border));
      --kskb-func: cubic-bezier(0.23, 1, 0.32, 1);
    }

    .kskb-theme-switch {
      position: relative;
      display: inline-block;
      width: var(--kskb-width);
      height: var(--kskb-height);
      border-width: var(--kskb-border);
      border-style: solid;
      border-radius: calc(var(--kskb-base) + var(--kskb-border));
      cursor: pointer;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      overflow: hidden;
      transition: all 0.8s var(--kskb-func);

      background-color: #3F3F3F;
      border-color: #8e8e8e;
    }

    .kskb-theme-switch::before,
    .kskb-theme-switch::after {
      position: absolute;
      content: '';
      border-radius: calc(var(--kskb-base) + var(--kskb-border));
      transition: all 0.5s;
      pointer-events: none;
      opacity: 0;
    }

    .kskb-theme-switch::before {
      width: 100%;
      height: 100%;
      top: 0;
      left: 0;
    }

    .kskb-theme-switch::after {
      width: 300%;
      height: 600%;
      top: -250%;
      left: -75%;
    }

    .kskb-theme-switch::before {
      background: radial-gradient(circle at top left, rgba(255, 255, 255, 0.36) 0%, transparent 50%);
      z-index: 10;
    }

    .kskb-theme-switch:has(.kskb-dummy:not(:checked)):hover::before {
      opacity: 1;
    }

    /* 太阳射线 */
    .kskb-theme-switch::after {
      background:
        repeating-conic-gradient(rgba(255, 255, 251, 0.26) 0deg 18deg,
          transparent 18deg 40deg);
      animation: kskbSunRays 12s infinite linear, kskbSunGlow 3s infinite alternate ease-in-out;
    }

    @keyframes kskbSunRays {
      0% {
        transform: rotate(0deg);
      }

      100% {
        transform: rotate(360deg);
      }
    }

    @keyframes kskbSunGlow {
      0% {
        opacity: 0;
      }

      100% {
        opacity: 1;
      }
    }

    .kskb-theme-switch:has(.kskb-dummy:checked):hover::after {
      animation-play-state: running;
    }

    .kskb-theme-switch:has(.kskb-dummy:not(:checked))::after {
      animation-play-state: paused;
      display: none;
    }

    .kskb-dummy {
      width: 0;
      height: 0;
      border: 0;
    }

    .kskb-moon,
    .kskb-sun {
      position: absolute;
      top: calc(var(--kskb-pad) + var(--kskb-border));
      width: var(--kskb-emoji-diameter);
      height: var(--kskb-emoji-diameter);
      border-radius: var(--kskb-base);
      transition: all 0.5s var(--kskb-func);
      z-index: 5;
    }

    .kskb-icon::before {
      position: absolute;
      width: 100%;
      height: 100%;
      text-align: center;
    }

    .kskb-sun .kskb-icon::before {
      content: '☀️';
      font-size: var(--kskb-emoji-size);
    }

    .kskb-moon .kskb-icon::before {
      content: '🌙';
      font-size: var(--kskb-emoji-size);
    }

    .kskb-moon {
      left: var(--kskb-moon-x);
      background: linear-gradient(145deg, #5a5a5a, #424242);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }

    .kskb-sun {
      left: var(--kskb-sun-x);
      background: linear-gradient(145deg, #fffac1, #ffd06c);
      box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
    }


    /* 当 checkbox 被选中时的样式 */
    .kskb-dummy:not(:checked)~.kskb-moon {
      left: var(--kskb-moon-x);
      opacity: 1;
    }

    .kskb-dummy:checked~.kskb-moon {
      left: var(--kskb-sun-x);
      opacity: 0;
    }

    .kskb-dummy:not(:checked)~.kskb-sun {
      left: var(--kskb-moon-x);
      opacity: 0;
    }

    .kskb-dummy:checked~.kskb-sun {
      left: var(--kskb-sun-x);
      opacity: 1;
    }

    .kskb-theme-switch:has(.kskb-dummy:checked) {
      background-color: #b8f0ff;
      border-color: #fbfbfb;
    }
  </style>

  <style category="stars">
    /* 添加星星装饰（仅在暗色模式下可见） */
    .kskb-stars {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transition: opacity 0.5s var(--kskb-func);
      z-index: 10;
    }

    .kskb-dummy:not(:checked)~.kskb-stars {
      opacity: 0.45;
    }

    .kskb-star {
      position: absolute;
      background-color: white;
      border-radius: 50%;
      animation: kskbTwinkle 2.4s infinite alternate;
      transition: left 0.6s var(--kskb-func);
    }

    @keyframes kskbTwinkle {
      0% {
        opacity: 0.2;
      }

      100% {
        opacity: 1;
      }
    }

    /* 创建一些随机星星 */
    .kskb-star:nth-child(1) {
      width: 2px;
      height: 2px;
      top: 8%;
      left: 48%;
      animation-delay: 0.2s;
    }

    .kskb-dummy:checked~.kskb-stars .kskb-star:nth-child(1) {
      left: 148%;
    }

    .kskb-star:nth-child(2) {
      width: 3px;
      height: 3px;
      top: 20%;
      left: 16%;
      animation-delay: 0.5s;
    }

    .kskb-dummy:checked~.kskb-stars .kskb-star:nth-child(2) {
      left: 116%;
    }

    .kskb-star:nth-child(3) {
      width: 2px;
      height: 2px;
      top: 72%;
      left: 51%;
      animation-delay: 0.8s;
    }

    .kskb-dummy:checked~.kskb-stars .kskb-star:nth-child(3) {
      left: 151%;
    }

    .kskb-star:nth-child(4) {
      width: 3px;
      height: 3px;
      top: 20%;
      left: 80%;
      animation-delay: 1.1s;
    }

    .kskb-dummy:checked~.kskb-stars .kskb-star:nth-child(4) {
      left: 180%;
    }

    .kskb-star:nth-child(5) {
      width: 2px;
      height: 2px;
      top: 52%;
      left: 72%;
      animation-delay: 1.4s;
    }

    .kskb-dummy:checked~.kskb-stars .kskb-star:nth-child(5) {
      left: 172%;
    }
  </style>

  <style category="clouds">
    /* 添加云朵装饰（仅在明亮模式下可见） */
    .kskb-clouds {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      opacity: 0;
      transition: opacity 0.5s var(--kskb-func);
    }

    .kskb-dummy:checked~.kskb-clouds {
      opacity: 0.6;
    }

    .kskb-cloud {
      position: absolute;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 20px;
      animation: float 4s infinite ease-in-out;
      transition: left 0.8s var(--kskb-func);
      scale: 3.5;
    }

    .kskb-cloud::before,
    .kskb-cloud::after {
      content: '';
      position: absolute;
      background-color: rgba(255, 255, 255, 0.8);
      border-radius: 20px;
    }

    @keyframes float {

      0%,
      100% {
        transform: translateY(0px);
      }

      50% {
        transform: translateY(-2px);
      }
    }

    /* 创建不同大小的云朵 */
    .kskb-cloud:nth-child(1) {
      width: 8px;
      height: 4px;
      top: 5%;
      left: -120%;
      animation-delay: 0.3s;
    }

    .kskb-cloud:nth-child(1)::before {
      width: 6px;
      height: 6px;
      top: -3px;
      left: 2px;
    }

    .kskb-cloud:nth-child(1)::after {
      width: 4px;
      height: 4px;
      top: -2px;
      right: 1px;
    }

    .kskb-dummy:checked~.kskb-clouds .kskb-cloud:nth-child(1) {
      left: 26%;
    }

    .kskb-cloud:nth-child(2) {
      width: 10px;
      height: 5px;
      top: 92%;
      left: -25%;
      animation-delay: 0.8s;
    }

    .kskb-cloud:nth-child(2)::before {
      width: 7px;
      height: 7px;
      top: -4px;
      left: 3px;
    }

    .kskb-cloud:nth-child(2)::after {
      width: 5px;
      height: 5px;
      top: -3px;
      right: 2px;
    }

    .kskb-dummy:checked~.kskb-clouds .kskb-cloud:nth-child(2) {
      left: 75%;
    }

    .kskb-cloud:nth-child(3) {
      width: 6px;
      height: 3px;
      top: 92%;
      left: -110%;
      animation-delay: 1.2s;
    }

    .kskb-cloud:nth-child(3)::before {
      width: 4px;
      height: 4px;
      top: -2px;
      left: 2px;
    }

    .kskb-cloud:nth-child(3)::after {
      width: 3px;
      height: 3px;
      top: -1px;
      right: 1px;
    }

    .kskb-dummy:checked~.kskb-clouds .kskb-cloud:nth-child(3) {
      left: 24%;
    }
  </style>
</head>

<body>
  <div class="body" theme="${configs.theme}">
    <form name="settings" class="control-panel">
      <div class="header">
        <div>
          <h1>${Panel.title}</h1>
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
      switch ('${lang}') {
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
      find('theme').checked = "${configs.theme}" === 'light';
      find('showSuggest').checked = '${configs.showSuggest}' === 'true';
      find('workbenchCssPath').value = '${configs.workbenchCssPath}';
      find('hashSource').value = '${configs.hashSource}';
      find('gradientBrightness').value = '${gradientBrightness}';
      find('gradientDarkness').value = '${gradientDarkness}';
      find('pickerBtn').style.backgroundColor = '${currentColor}';
    } else {
      find('theme').checked = true;
      find('showSuggest').checked = false;
      find('workbenchCssPath').value = '/d/work/aaa.css';
      find('hashSource').value = '';
      find('gradientBrightness').value = '99';
      find('gradientDarkness').value = '12';
      find('pickerBtn').style.backgroundColor = '#007ACC';
    }

    // events
    find('theme').addEventListener('change', theme);

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
      // 控制面板的主题变更不需要推送给插件
      if (input.name === 'theme') {
        return;
      }

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
      // vscode.window.showInformationMessage(JSON.stringify(message));
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
