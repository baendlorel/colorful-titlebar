import { existsSync } from 'node:fs';

import { getHashSource, getColor, getColorByK } from '@/core/colors';
import style from '@/core/style';
import { Consts, GradientStyle, HashSource } from '@/common/consts';
import configs from '@/common/configs';
import i18n from '@/common/i18n';
import RGBA from '@/common/rgba';
import sanitizer from '@/common/sanitizer';
import gradient from '@/features/gradient';

import { Controls } from './consts';
import { HandelResult, PostedValue } from './types';

const Panel = i18n.ControlPanel;

interface PostedValueMap {
  string: string;
  number: number;
  boolean: boolean;
  object: Record<string, any>;
}

const expect: <T extends keyof PostedValueMap>(
  result: HandelResult,
  value: PostedValue,
  tp: T
) => asserts value is PostedValueMap[T] = (
  result: HandelResult,
  value: PostedValue,
  tp: keyof PostedValueMap
) => {
  if (tp === 'object') {
    if (typeof value !== 'object' || value === null) {
      result.succ = false;
      result.msg = Panel.typeError(value, 'an object');
      throw null;
    }
  } else if (typeof value !== tp) {
    result.succ = false;
    result.msg = Panel.typeError(value, `a ${tp}`);
    throw null;
  }
};

export const handlerMap = {
  [Controls.ShowSuggest]: async (result: HandelResult, value: PostedValue) => {
    expect(result, value, 'boolean');
    await configs.setShowSuggest(value);
  },
  [Controls.WorkbenchCssPath]: async (result: HandelResult, value: PostedValue) => {
    expect(result, value, 'string');
    const cssPath = value.trim();
    if (!existsSync(cssPath)) {
      result.succ = false;
      result.msg = Panel.workbenchCssPath.notExist;
      throw null;
    }
    await configs.setWorkbenchCssPath(cssPath);
  },
  [Controls.Gradient]: async (result: HandelResult, value: PostedValue) => {
    expect(result, value, 'number');
    switch (value) {
      case GradientStyle.BrightLeft:
      case GradientStyle.BrightCenter:
      case GradientStyle.ArcLeft:
        await gradient.apply(value);
        break;
      case GradientStyle.None:
      default:
        await gradient.none();
        break;
    }
    result.msg = Panel.gradient.success;
  },
  [Controls.GradientBrightness]: async (result: HandelResult, value: PostedValue) => {
    expect(result, value, 'number');
    const percent = sanitizer.percent(value);
    if (percent === null) {
      result.succ = false;
      result.msg = Panel.typeError(value);
      throw null;
    }
    await configs.setGradientBrightness(percent);
    result.msg = Panel.gradientBrightness.success;
  },
  [Controls.GradientDarkness]: async (result: HandelResult, value: PostedValue) => {
    expect(result, value, 'number');
    const percent = sanitizer.percent(value);
    if (percent === null) {
      result.succ = false;
      result.msg = Panel.typeError(value);
      throw null;
    }
    await configs.setGradientDarkness(percent);
    result.msg = Panel.gradientDarkness.success;
  },
  [Controls.HashSource]: async (result: HandelResult, value: HashSource) => {
    expect(result, value, 'number');
    const arr = [HashSource.FullPath, HashSource.ProjectName, HashSource.ProjectNameDate];
    if (!arr.includes(value)) {
      result.succ = false;
      result.msg = Panel.typeError(value, `one of ${arr.join(', ')}`);
      throw null;
    }
    await configs.setHashSource(value);
    result.msg = Panel.hashSource.success;
  },
  [Controls.Refresh]: async (result: HandelResult, _value: PostedValue) => {
    const token = getHashSource(configs.cwd);
    const color = getColor(configs.cwd);
    await style.applyColor(color);
    result.msg = Panel.refresh.success(token, color.toRGBString());
    result.other.color = color.toRGBString();
  },
  [Controls.RandomColor]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('RandomColor只是个标记，应该具体有颜色套组、纯粹、指定');
  },
  [Controls['RandomColor.colorSet']]: async (result: HandelResult, _value: PostedValue) => {
    const color = getColorByK(Math.random());
    await style.applyColor(color);
    result.other.color = color.toRGBString();
  },
  [Controls['RandomColor.pure']]: async (result: HandelResult, _value: PostedValue) => {
    const color = RGBA.randomRGB();
    await style.applyColor(color);
    result.other.color = color;
  },
  [Controls['RandomColor.specify']]: async (result: HandelResult, value: PostedValue) => {
    expect(result, value, 'string');
    await style.applyColor(value);
  },
  [Controls.ProjectIndicators]: async (result: HandelResult, value: PostedValue) => {
    expect(result, value, 'string');
    const indicators = value
      .split(Consts.ConfigSeparator)
      .map((item) => item.trim())
      .filter(Boolean);
    await configs.setProjectIndicators(indicators);
  },
  [Controls.ThemeColors]: async (
    result: HandelResult,
    value: Record<string, RGBA[] | undefined>
  ) => {
    expect(result, value, 'object');

    // 必须至少有一个是正常的
    const errors: string[] = [];

    const rawLight = value[Controls['ThemeColors.light']];
    if (rawLight) {
      const light = sanitizer.colors(rawLight);
      if (light) {
        if (light.length === 0) {
          errors.push(Panel.themeColors.emptyPalette(Panel.themeColors.light));
        } else {
          await configs.setLightThemeColors(light);
        }
      } else {
        errors.push(Panel.themeColors.invalidPaletteColor(Panel.themeColors.light));
      }
    }

    const rawDark = value[Controls['ThemeColors.dark']];
    if (rawDark) {
      const dark = sanitizer.colors(rawDark);
      if (dark) {
        if (dark.length === 0) {
          errors.push(Panel.themeColors.emptyPalette(Panel.themeColors.dark));
        } else {
          await configs.setDarkThemeColors(dark);
        }
      } else {
        errors.push(Panel.themeColors.invalidPaletteColor(Panel.themeColors.dark));
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
  [Controls['ThemeColors.light']]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('ThemeColors.light只是个标记');
  },
  [Controls['ThemeColors.dark']]: async (_result: HandelResult, _value: PostedValue) => {
    throw new Error('ThemeColors.dark只是个标记');
  },
};
