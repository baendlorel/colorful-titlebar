import vscode from 'vscode';
import aes from '@/core/aes';

import { Consts, HashSource, TitleBarConsts } from './consts';
import RGBA from './rgba';
import i18n from './i18n';
import safe from './safe';

const enum Defaults {
  LightThemeColors = 'rgb(167, 139, 250);rgb(147, 197, 253);rgb(128, 203, 196);rgb(172, 243, 157);rgb(250, 204, 21);rgb(253, 151, 31);rgb(251, 113, 133)',
  DarkThemeColors = 'rgb(68, 0, 116);rgb(0, 47, 85);rgb(0, 66, 66);rgb(0, 75, 28);rgb(124, 65, 1);rgb(133, 33, 33)',
  ProjectIndicators = '.git;package.json;pom.xml;Cargo.toml;go.mod;README.md;LICENSE;tsconfig.json;yarn.lock;pnpm-lock.yaml;package-lock.json;webpack.config.js;vite.config.js;vite.config.ts;next.config.js;pyproject.toml;setup.py;CMakeLists.txt;Makefile;build.gradle;composer.json;Gemfile;.nvmrc;.node-version;Deno.json;deno.jsonc',
  GradientBrightness = 62,
  GradientDarkness = 21,
}

interface Config {
  currentVersion: string;
  showSuggest: boolean;
  lightThemeColors: RGBA[];
  darkThemeColors: RGBA[];
  projectIndicators: string[];
  hashSource: HashSource;
  workbenchCssPath: string;
  gradientBrightness: number;
  gradientDarkness: number;
}

interface TitleBarStyleCustomization {
  [TitleBarConsts.ActiveBg]: string;
  [TitleBarConsts.InactiveBg]: string;
}

class Configs {
  /**
   * 本插件的配置数据
   */
  private my!: Config;

  /**
   * 全局配置数据
   */
  private global = vscode.workspace.getConfiguration();

  readonly cwd: string = vscode.workspace.workspaceFolders?.[0].uri.fsPath ?? '';

  readonly lang = vscode.env.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

  readonly theme =
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.Dark ||
    vscode.window.activeColorTheme.kind === vscode.ColorThemeKind.HighContrast
      ? 'dark'
      : 'light';

  constructor() {
    // 异步加载配置
    const needDefaults = this.load();
    if (needDefaults) {
      this.overrideWithDefaults();
    }
  }

  private getDefault(): Config {
    return {
      currentVersion: '1.0.0',
      showSuggest: true,
      lightThemeColors: Defaults.LightThemeColors.split(';').map((color) => new RGBA(color)),
      darkThemeColors: Defaults.DarkThemeColors.split(';').map((color) => new RGBA(color)),
      projectIndicators: Defaults.ProjectIndicators.split(';'),
      hashSource: HashSource.ProjectName,
      workbenchCssPath: '',
      gradientBrightness: Defaults.GradientBrightness as number,
      gradientDarkness: Defaults.GradientDarkness as number,
    };
  }

  private deserialize(akasha: string): Config {
    const raw = JSON.parse(aes.decrypt(akasha)) as Partial<Config>;
    const defaults = this.getDefault();
    // 下面对配置字段进行校验
    raw.currentVersion =
      typeof raw.currentVersion === 'string' ? raw.currentVersion : defaults.currentVersion;

    raw.showSuggest = typeof raw.showSuggest === 'boolean' ? raw.showSuggest : defaults.showSuggest;

    raw.lightThemeColors = safe.colors(raw.lightThemeColors) ?? defaults.lightThemeColors;
    raw.darkThemeColors = safe.colors(raw.darkThemeColors) ?? defaults.darkThemeColors;

    raw.projectIndicators = Array.isArray(raw.projectIndicators)
      ? raw.projectIndicators.map((indicator) => String(indicator).trim())
      : defaults.projectIndicators;

    raw.hashSource = [
      HashSource.ProjectName,
      HashSource.FullPath,
      HashSource.ProjectNameDate,
    ].includes(raw.hashSource as HashSource)
      ? raw.hashSource
      : defaults.hashSource;

    raw.workbenchCssPath =
      typeof raw.workbenchCssPath === 'string' ? raw.workbenchCssPath : defaults.workbenchCssPath;

    raw.gradientBrightness = safe.percent(raw.gradientBrightness) ?? defaults.gradientBrightness;

    raw.gradientDarkness = safe.percent(raw.gradientDarkness) ?? defaults.gradientDarkness;

    // & 至此，已经严谨地确保了所有配置都是正确的数据和类型
    return raw as Config;
  }

  private serialize(): string {
    const plain = {
      currentVersion: this.my.currentVersion,
      showSuggest: this.my.showSuggest,
      lightThemeColors: this.my.lightThemeColors.map((color) => color.toRGBString()),
      darkThemeColors: this.my.darkThemeColors.map((color) => color.toRGBString()),
      projectIndicators: this.my.projectIndicators,
      hashSource: this.my.hashSource as number,
      workbenchCssPath: this.my.workbenchCssPath,
      gradientBrightness: this.my.gradientBrightness,
      gradientDarkness: this.my.gradientDarkness,
    };
    return JSON.stringify(plain);
  }

  /**
   *
   * @returns 是否需要以默认配置覆盖
   */
  private load(): boolean {
    const self = vscode.workspace.getConfiguration(Consts.Name);
    const akasha = self.inspect<string>(Consts.Akasha)?.globalValue;
    if (typeof akasha !== 'string') {
      return true;
    }

    try {
      this.my = this.deserialize(akasha);
      return false;
    } catch (error) {
      vscode.window.showErrorMessage(i18n.InvalidAkasha);
      return true;
    }
  }

  /**
   * 保存后并不需要重新加载，因为
   * - 每次保存用的self是新取的
   * - config配置一定是最新的
   */
  private async save(): Promise<void> {
    try {
      const self = vscode.workspace.getConfiguration(Consts.Name);
      const akasha = aes.encrypt(this.serialize());
      await self.update(Consts.Akasha, akasha, vscode.ConfigurationTarget.Global);
    } catch (error) {
      throw error;
    }
  }

  private overrideWithDefaults(): Promise<void> {
    this.my = this.getDefault();
    return this.save();
  }

  // #region 系统配置
  /**
   * 当前标题栏的颜色，可能没有配置
   */
  get titleBarColor() {
    return this.workbenchColorCustomizations?.[TitleBarConsts.ActiveBg];
  }

  /**
   * 当前的标题栏颜色配置，可能是`undefined`
   */
  get workbenchColorCustomizations() {
    return this.global.get<TitleBarStyleCustomization>(TitleBarConsts.WorkbenchSection);
  }

  /**
   * 获取所有层级的标题栏颜色配置
   */
  get inspectWorkbenchColorCustomizations() {
    return vscode.workspace
      .getConfiguration()
      .inspect<TitleBarStyleCustomization>(TitleBarConsts.WorkbenchSection);
  }

  /**
   * 设置工作区标题栏颜色
   * @param value 新颜色，其属性可以是`undefined`来删除
   * @returns
   */
  setWorkbenchColorCustomizations(value: Partial<TitleBarStyleCustomization>): Thenable<void> {
    const globalConfig = vscode.workspace.getConfiguration();
    return globalConfig.update(
      TitleBarConsts.WorkbenchSection,
      value,
      vscode.ConfigurationTarget.Workspace
    );
  }

  /**
   * 全局设定，必须是`custom`才行
   */
  get windowTitleBarStyle() {
    return this.global.get<string>(TitleBarConsts.Section);
  }

  /**
   * 直接全局设定为`custom`
   */
  justifyWindowTitleBarStyle() {
    const globalConfig = vscode.workspace.getConfiguration();
    return globalConfig.update(
      TitleBarConsts.Section,
      TitleBarConsts.Expected,
      vscode.ConfigurationTarget.Global
    );
  }
  // #endregion

  // #region 本插件的独有配置

  get currentVersion() {
    return this.my.currentVersion;
  }

  get showSuggest() {
    return this.my.showSuggest;
  }

  get projectIndicators() {
    return this.my.projectIndicators;
  }

  get lightThemeColors() {
    return this.my.lightThemeColors;
  }

  get darkThemeColors() {
    return this.my.darkThemeColors;
  }

  get hashSource() {
    return this.my.hashSource;
  }

  get workbenchCssPath() {
    return this.my.workbenchCssPath;
  }

  get gradientBrightness() {
    return this.my.gradientBrightness;
  }

  get gradientDarkness() {
    return this.my.gradientDarkness;
  }

  setCurrentVersion(value: string): Promise<void> {
    this.my.currentVersion = value;
    return this.save();
  }

  setShowSuggest(value: boolean): Promise<void> {
    this.my.showSuggest = value;
    return this.save();
  }

  setHashSource(value: HashSource): Promise<void> {
    this.my.hashSource = value;
    return this.save();
  }

  setWorkbenchCssPath(value: string): Promise<void> {
    this.my.workbenchCssPath = value;
    return this.save();
  }

  setGradientBrightness(value: number): Promise<void> {
    this.my.gradientBrightness = value;
    return this.save();
  }

  setGradientDarkness(value: number): Promise<void> {
    this.my.gradientDarkness = value;
    return this.save();
  }

  setProjectIndicators(value: string[]): Promise<void> {
    this.my.projectIndicators = value;
    return this.save();
  }

  setLightThemeColors(value: RGBA[]): Promise<void> {
    this.my.lightThemeColors = value;
    return this.save();
  }

  setDarkThemeColors(value: RGBA[]): Promise<void> {
    this.my.darkThemeColors = value;
    return this.save();
  }

  // #endregion
}

export default new Configs();
