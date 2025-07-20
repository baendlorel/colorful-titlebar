import { existsSync } from 'node:fs';

import { getHashSource, getColor, getColorByK } from '@/core/colors';
import style from '@/core/style';
import { Consts, GradientStyle, HashSource } from '@/common/consts';
import configs from '@/common/configs';
import i18n from '@/common/i18n';
import RGBA from '@/common/rgba';
import safe from '@/common/safe';

import { AfterStyle } from '@/features/gradient/consts';
import hacker from '@/features/gradient/hacker';
import { ControlName } from './consts';
import { HandelResult, PostedValue } from './types';

const Panel = i18n.ControlPanel;

export const handlerMap = {
  [ControlName.ShowSuggest]: async (result: HandelResult, value: PostedValue) => {
    if (typeof value !== 'boolean') {
      result.succ = false;
      result.msg = Panel.typeError(value, 'a boolean');
      throw null;
    }
    await configs.setShowSuggest(value);
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
    await configs.setWorkbenchCssPath(cssPath);
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
    const raw = parseInt(String(value), 10);
    const percent = safe.percent(raw);
    if (percent === null) {
      result.succ = false;
      result.msg = Panel.typeError(value);
      throw null;
    }
    await configs.setGradientBrightness(percent);
    result.msg = Panel.gradientBrightness.success;
  },
  [ControlName.GradientDarkness]: async (result: HandelResult, value: PostedValue) => {
    const raw = parseInt(String(value), 10);
    const percent = safe.percent(raw);
    if (percent === null) {
      result.succ = false;
      result.msg = Panel.typeError(value);
      throw null;
    }
    await configs.setGradientDarkness(percent);
    result.msg = Panel.gradientDarkness.success;
  },
  [ControlName.HashSource]: async (result: HandelResult, value: PostedValue) => {
    const d = parseInt(String(value), 10) as HashSource;
    const arr = [HashSource.FullPath, HashSource.ProjectName, HashSource.ProjectNameDate];
    if (!arr.includes(d)) {
      result.succ = false;
      result.msg = Panel.typeError(value, `one of ${arr.join(', ')}`);
      throw null;
    }
    await configs.setHashSource(d);
    result.msg = Panel.hashSource.success;
  },
  [ControlName.Refresh]: async (result: HandelResult, _value: PostedValue) => {
    const token = getHashSource(configs.cwd);
    const color = getColor(configs.cwd);
    await style.applyColor(color);
    result.msg = Panel.refresh.success(token, color.toRGBString());
    result.other.color = color.toRGBString();
  },
  [ControlName.RandomColor]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('RandomColor只是个标记，应该具体有颜色套组、纯粹、指定');
  },
  [ControlName['RandomColor.colorSet']]: async (result: HandelResult, _value: PostedValue) => {
    const color = getColorByK(Math.random());
    await style.applyColor(color);
    result.other.color = color.toRGBString();
  },
  [ControlName['RandomColor.pure']]: async (result: HandelResult, _value: PostedValue) => {
    const color = RGBA.uniformRandom();
    await style.applyColor(color);
    result.other.color = color;
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
      .split(Consts.ConfigSeparator)
      .map((item) => item.trim())
      .filter(Boolean);
    await configs.setProjectIndicators(indicators);
  },
  [ControlName.ThemeColors]: async (
    result: HandelResult,
    value: Record<string, RGBA[] | undefined>
  ) => {
    if (typeof value !== 'object' || value === null) {
      result.succ = false;
      result.msg = Panel.typeError(value, 'an object');
      throw null;
    }

    // 必须至少有一个是正常的
    const errors: string[] = [];

    const rawLight = value[ControlName['ThemeColors.light']];
    if (rawLight) {
      const light = safe.colors(rawLight);
      if (light) {
        if (light.length === 0) {
          errors.push(Panel.themeColors.emptyPalette(Panel.themeColors.lightColors));
        } else {
          await configs.setLightThemeColors(light);
        }
      } else {
        errors.push(Panel.themeColors.invalidPaletteColor(Panel.themeColors.lightColors));
      }
    }

    const rawDark = value[ControlName['ThemeColors.dark']];
    if (rawDark) {
      const dark = safe.colors(rawDark);
      if (dark) {
        if (dark.length === 0) {
          errors.push(Panel.themeColors.emptyPalette(Panel.themeColors.darkColors));
        } else {
          await configs.setDarkThemeColors(dark);
        }
      } else {
        errors.push(Panel.themeColors.invalidPaletteColor(Panel.themeColors.darkColors));
      }
    }

    if (!rawDark && !rawLight) {
      errors.push('意外地一个颜色都没有？');
    }

    if (errors.length > 0) {
      result.succ = false;
      result.msg = errors.join('\n');
      throw null;
    }
  },
  [ControlName['ThemeColors.light']]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('ThemeColors.light只是个标记');
  },
  [ControlName['ThemeColors.dark']]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('ThemeColors.dark只是个标记');
  },
};
