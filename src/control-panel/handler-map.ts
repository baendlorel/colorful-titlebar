import { existsSync } from 'node:fs';

import { GradientStyle, HashSource, TitleBarConsts } from '@/common/consts';
import configs from '@/common/configs';
import i18n from '@/common/i18n';
import RGBA from '@/common/rgba';
import { getHashSource, getColor, getColorByK } from '@/core/colors';

import { AfterStyle } from '@/features/gradient/consts';
import hacker from '@/features/gradient/hacker';
import { ControlName, ThemeSet } from './consts';
import { HandelResult, PostedValue } from './types';

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
    await applyManualColor(color);
    result.msg = Panel.refresh.success(token, color.toString());
  },
  [ControlName['RandomColor.colorSet']]: async (_result: HandelResult, _value: PostedValue) => {
    const color = getColorByK(Math.random());
    await applyManualColor(color);
  },
  [ControlName['RandomColor.pure']]: async (_result: HandelResult, _value: PostedValue) => {
    const color = RGBA.uniformRandom();
    await applyManualColor(color);
  },
  [ControlName['RandomColor.specify']]: async (result: HandelResult, value: PostedValue) => {
    if (typeof value !== 'string') {
      result.succ = false;
      result.msg = Panel.typeError(value, 'a string');
      throw null;
    }
    await applyManualColor(value);
  },
  [ControlName.ProjectIndicators]: async (result: HandelResult, value: PostedValue) => {
    if (typeof value !== 'string') {
      result.succ = false;
      result.msg = Panel.typeError(value, 'a string');
      throw null;
    }
    const indicators = value
      .split(';')
      .map((item) => item.trim())
      .filter(Boolean);
    await configs.set.projectIndicators(indicators);
  },
  [ControlName.PalettesChange]: async (result: HandelResult, value: Record<ThemeSet, string[]>) => {
    if (typeof value !== 'object' || value === null) {
      result.succ = false;
      result.msg = Panel.typeError(value, 'an object');
      throw null;
    }
    const light = value[ThemeSet.LightThemeColors];
    const dark = value[ThemeSet.DarkThemeColors];

    // 必须至少有一个是正常的
    let validCount = 0;
    if (Array.isArray(light)) {
      if (light.length === 0) {
        result.succ = false;
        result.msg = Panel.themePalette.emptyPalette;
        throw null;
      }
      validCount++;
      await configs.set.lightThemeColors(light);
    }
    if (Array.isArray(dark)) {
      if (dark.length === 0) {
        result.succ = false;
        result.msg = Panel.themePalette.emptyPalette;
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
      result.msg = Panel.themePalette.allSaved;
    }
  },
};

/**
 * Apply manually selected color to titlebar
 */
const applyManualColor = async (color: string | RGBA) => {
  if (typeof color === 'string') {
    color = new RGBA(color);
  }
  const newStyle = {
    [TitleBarConsts.ActiveBg]: color.toString(),
    [TitleBarConsts.InactiveBg]: color.toGreyDarkenString(),
  };

  await configs.setWorkspace[TitleBarConsts.WorkbenchSection](newStyle);
};
