import vscode from 'vscode';

import { Consts, HashSource, TitleBarConsts } from './consts';
import RGBA from './rgba';
import aes from '@/core/aes';
import i18n from './i18n';

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

const validColors = (rawColors: RGBA[] | undefined): RGBA[] | null => {
  if (Array.isArray(rawColors)) {
    const colors = rawColors.map((color) => new RGBA(String(color)));
    if (colors.some((c) => !c.valid)) {
      return null;
    } else {
      return colors;
    }
  } else {
    return null;
  }
};

const validPercent = (value: number | undefined): number | null => {
  if (typeof value === 'number' && value >= 0 && value <= 100 && Number.isSafeInteger(value)) {
    return value;
  } else {
    return null;
  }
};

class Configs {
  /**
   * 本插件的配置数据
   */
  private self!: Config;

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

    raw.lightThemeColors = validColors(raw.lightThemeColors) ?? defaults.lightThemeColors;
    raw.darkThemeColors = validColors(raw.darkThemeColors) ?? defaults.darkThemeColors;

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

    raw.gradientBrightness = validPercent(raw.gradientBrightness) ?? defaults.gradientBrightness;

    raw.gradientDarkness = validPercent(raw.gradientDarkness) ?? defaults.gradientDarkness;

    // & 至此，已经严谨地确保了所有配置都是正确的数据和类型
    return raw as Config;
  }

  private serialize(): string {
    const plain = {
      currentVersion: this.self.currentVersion,
      showSuggest: this.self.showSuggest,
      lightThemeColors: this.self.lightThemeColors.map((color) => color.toRGBString()),
      darkThemeColors: this.self.darkThemeColors.map((color) => color.toRGBString()),
      projectIndicators: this.self.projectIndicators,
      hashSource: this.self.hashSource as number,
      workbenchCssPath: this.self.workbenchCssPath,
      gradientBrightness: this.self.gradientBrightness,
      gradientDarkness: this.self.gradientDarkness,
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
      this.self = this.deserialize(akasha);
      return false;
    } catch (error) {
      vscode.window.showErrorMessage(i18n.InvalidAkasha);
      return true;
    }
  }

  private async save() {
    const self = vscode.workspace.getConfiguration(Consts.Name);
    const encrypted = aes.encrypt(this.serialize());
    await self.update(Consts.Akasha, encrypted, vscode.ConfigurationTarget.Global);
  }

  private async overrideWithDefaults() {
    this.self = this.getDefault();
    await this.save();
  }

  get colorSet() {
    switch (vscode.window.activeColorTheme.kind) {
      case vscode.ColorThemeKind.Dark:
      case vscode.ColorThemeKind.HighContrast:
        return this.self.darkThemeColors;
      case vscode.ColorThemeKind.Light:
      case vscode.ColorThemeKind.HighContrastLight:
        return this.self.lightThemeColors;
    }
  }

  get currentColor() {
    return this[TitleBarConsts.WorkbenchSection]?.[TitleBarConsts.ActiveBg];
  }

  /**
   * 当前的标题栏颜色配置，可能是`undefined`
   */
  get [TitleBarConsts.WorkbenchSection]() {
    return this.global.get<TitleBarStyleCustomization>(TitleBarConsts.WorkbenchSection);
  }

  /**
   * 全局设定，必须是`custom`才行
   */
  get [TitleBarConsts.Section]() {
    return this.global.get<string>(TitleBarConsts.Section);
  }

  readonly inspectGlobal = {
    get [TitleBarConsts.WorkbenchSection]() {
      return vscode.workspace
        .getConfiguration()
        .inspect<TitleBarStyleCustomization>(TitleBarConsts.WorkbenchSection);
    },
  };

  readonly setWorkspace = {
    async [TitleBarConsts.WorkbenchSection](value: Partial<TitleBarStyleCustomization>) {
      const globalConfig = vscode.workspace.getConfiguration();
      await globalConfig.update(
        TitleBarConsts.WorkbenchSection,
        value,
        vscode.ConfigurationTarget.Workspace
      );
    },
  };

  readonly setGlobal = {
    async [TitleBarConsts.Section](value: string) {
      const globalConfig = vscode.workspace.getConfiguration();
      await globalConfig.update(TitleBarConsts.Section, value, vscode.ConfigurationTarget.Global);
    },
  };

  // # 本插件的设定

  get currentVersion() {
    return this.self.currentVersion;
  }

  get showSuggest() {
    return this.self.showSuggest;
  }

  get projectIndicators() {
    return this.self.projectIndicators;
  }

  get lightThemeColors() {
    return this.self.lightThemeColors;
  }

  get darkThemeColors() {
    return this.self.darkThemeColors;
  }

  get hashSource() {
    return this.self.hashSource;
  }

  get workbenchCssPath() {
    return this.self.workbenchCssPath;
  }

  get gradientBrightness() {
    return this.self.gradientBrightness;
  }

  get gradientDarkness() {
    return this.self.gradientDarkness;
  }

  async setCurrentVersion(value: string) {
    // 更新加密配置中的版本信息
    this.self.currentVersion = value;
    await this.save();
  }

  async setShowSuggest(value: boolean) {
    this.self.showSuggest = value;
    await this.save();
  }

  async setHashSource(value: HashSource) {
    this.self.hashSource = value;
    await this.save();
  }

  async setWorkbenchCssPath(value: string) {
    this.self.workbenchCssPath = value;
    await this.save();
  }

  async setGradientBrightness(value: number) {
    this.self.gradientBrightness = value;
    await this.save();
  }

  async setGradientDarkness(value: number) {
    this.self.gradientDarkness = value;
    await this.save();
  }

  async setProjectIndicators(value: string[]) {
    this.self.projectIndicators = value;
    await this.save();
  }

  async setLightThemeColors(value: RGBA[]) {
    this.self.lightThemeColors = value;
    await this.save();
  }

  async setDarkThemeColors(value: RGBA[]) {
    this.self.darkThemeColors = value;
    await this.save();
  }
}

export default new Configs();
