import { existsSync } from 'node:fs';

import { GradientStyle, HashSource } from '@/common/consts';
import configs from '@/common/configs';
import i18n from '@/common/i18n';
import RGBA from '@/common/rgba';
import { getHashSource, getColor, getColorByK } from '@/core/colors';

import { AfterStyle } from '@/features/gradient/consts';
import hacker from '@/features/gradient/hacker';
import { ControlName } from './consts';
import { HandelResult, PostedValue } from './types';
import style from '@/core/style';

const Panel = i18n.ControlPanel;
export const handlerMap = {
  [ControlName.ShowSuggest]: async (result: HandelResult, value: PostedValue) => {
    if (typeof value !== 'boolean') {
      result.succ = false;
      result.msg = Panel.typeError(value, 'a boolean');
      throw null;
    }
    await configs.set.showSuggest(value);
  },
  [ControlName.WorkbenchCssPath]: async (result: HandelResult, value: PostedValue) => {
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
  },
  [ControlName.Gradient]: async (result: HandelResult, value: PostedValue) => {
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
  },
  [ControlName.GradientBrightness]: async (result: HandelResult, value: PostedValue) => {
    const d = parseInt(String(value), 10) / 100;
    if (Number.isNaN(d) || d < 0 || d > 1) {
      result.succ = false;
      result.msg = Panel.typeError(value);
      throw null;
    }
    await configs.set.gradientBrightness(d);
    result.msg = Panel.gradient.success;
  },
  [ControlName.GradientDarkness]: async (result: HandelResult, value: PostedValue) => {
    const d = parseInt(String(value), 10) / 100;
    if (Number.isNaN(d) || d < 0 || d > 1) {
      result.succ = false;
      result.msg = Panel.typeError(value);
      throw null;
    }
    await configs.set.gradientDarkness(d);
    result.msg = Panel.gradient.success;
  },
  [ControlName.HashSource]: async (result: HandelResult, value: PostedValue) => {
    const d = parseInt(String(value), 10) as HashSource;
    const arr = [HashSource.FullPath, HashSource.ProjectName, HashSource.ProjectNameDate];
    if (!arr.includes(d)) {
      result.succ = false;
      result.msg = Panel.typeError(value, `one of ${arr.join(', ')}`);
      throw null;
    }
    await configs.set.hashSource(d);
    result.msg = Panel.hashSource.success;
  },
  [ControlName.Refresh]: async (result: HandelResult, _value: PostedValue) => {
    const token = getHashSource(configs.cwd);
    const color = getColor(configs.cwd);
    await style.applyColor(color);
    result.msg = Panel.refresh.success(token, color.toString());
  },
  [ControlName.RandomColor]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('RandomColor只是个标记，应该具体有颜色套组、纯粹、指定');
  },
  [ControlName['RandomColor.colorSet']]: async (_result: HandelResult, _value: PostedValue) => {
    const color = getColorByK(Math.random());
    await style.applyColor(color);
  },
  [ControlName['RandomColor.pure']]: async (_result: HandelResult, _value: PostedValue) => {
    const color = RGBA.uniformRandom();
    await style.applyColor(color);
  },
  [ControlName['RandomColor.specify']]: async (result: HandelResult, value: PostedValue) => {
    if (typeof value !== 'string') {
      result.succ = false;
      result.msg = Panel.typeError(value, 'a string');
      throw null;
    }
    await style.applyColor(value);
  },
  [ControlName.ProjectIndicators]: async (result: HandelResult, value: PostedValue) => {
    if (typeof value !== 'string') {
      result.succ = false;
      result.msg = Panel.typeError(value, 'a string');
      throw null;
    }
    const indicators = value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean);
    await configs.set.projectIndicators(indicators);
  },
  [ControlName.ThemeColors]: async (result: HandelResult, value: Record<string, string[]>) => {
    if (typeof value !== 'object' || value === null) {
      result.succ = false;
      result.msg = Panel.typeError(value, 'an object');
      throw null;
    }
    // const vscode = await import('vscode');
    // vscode.window.showInformationMessage('调色板变化' + JSON.stringify(value));

    const light = value[ControlName['ThemeColors.light']];
    const dark = value[ControlName['ThemeColors.dark']];

    // 必须至少有一个是正常的
    let validCount = 0;
    if (Array.isArray(light)) {
      if (light.length === 0) {
        result.succ = false;
        result.msg = Panel.themeColors.emptyPalette;
        throw null;
      }
      validCount++;
      await configs.set.lightThemeColors(light);
    }
    if (Array.isArray(dark)) {
      if (dark.length === 0) {
        result.succ = false;
        result.msg = Panel.themeColors.emptyPalette;
        throw null;
      }
      validCount++;
      await configs.set.darkThemeColors(dark);
    }
    if (validCount === 0) {
      result.succ = false;
      result.msg = Panel.typeError(value, 'an object with arrays');
      throw null;
    } else if (validCount === 2) {
      result.msg = Panel.themeColors.allSaved;
    }
  },
  [ControlName['ThemeColors.light']]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('ThemeColors.light只是个标记');
  },
  [ControlName['ThemeColors.dark']]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('ThemeColors.dark只是个标记');
  },
};
