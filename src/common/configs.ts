import vscode from 'vscode';
import chacha20 from '@/core/chacha20';

import { Consts, HashSource, TitleBarConsts } from './consts';
import RGBA from './rgba';
import i18n from './i18n';
import sanitizer from './sanitizer';
import { deflateRawSync, inflateRawSync } from 'node:zlib';

const enum Defaults {
  LightThemeColors = `rgb(167, 139, 250)${Consts.ConfigSeparator}rgb(147, 197, 253)${Consts.ConfigSeparator}rgb(128, 203, 196)${Consts.ConfigSeparator}rgb(172, 243, 157)${Consts.ConfigSeparator}rgb(250, 204, 21)${Consts.ConfigSeparator}rgb(253, 151, 31)${Consts.ConfigSeparator}rgb(251, 113, 133)`,
  DarkThemeColors = `rgb(68, 0, 116)${Consts.ConfigSeparator}rgb(0, 47, 85)${Consts.ConfigSeparator}rgb(0, 66, 66)${Consts.ConfigSeparator}rgb(0, 75, 28)${Consts.ConfigSeparator}rgb(124, 65, 1)${Consts.ConfigSeparator}rgb(133, 33, 33)`,
  ProjectIndicators = `.git${Consts.ConfigSeparator}package.json${Consts.ConfigSeparator}pom.xml${Consts.ConfigSeparator}Cargo.toml${Consts.ConfigSeparator}go.mod${Consts.ConfigSeparator}README.md${Consts.ConfigSeparator}LICENSE${Consts.ConfigSeparator}tsconfig.json${Consts.ConfigSeparator}yarn.lock${Consts.ConfigSeparator}pnpm-lock.yaml${Consts.ConfigSeparator}package-lock.json${Consts.ConfigSeparator}webpack.config.js${Consts.ConfigSeparator}vite.config.js${Consts.ConfigSeparator}vite.config.ts${Consts.ConfigSeparator}next.config.js${Consts.ConfigSeparator}pyproject.toml${Consts.ConfigSeparator}setup.py${Consts.ConfigSeparator}CMakeLists.txt${Consts.ConfigSeparator}Makefile${Consts.ConfigSeparator}build.gradle${Consts.ConfigSeparator}composer.json${Consts.ConfigSeparator}Gemfile${Consts.ConfigSeparator}.nvmrc${Consts.ConfigSeparator}.node-version${Consts.ConfigSeparator}Deno.json${Consts.ConfigSeparator}deno.jsonc`,
  GradientBrightness = 62,
  GradientDarkness = 21,
}

/**
 * 配置字段的PropertyKey常量组
 *
 * ! **确定好以后这个顺序就不可以变了！**
 * - 这个顺序决定了序列化的字段顺序
 * - 如果配置发生了变化，下面的序列化代码可以删掉属性，但这里的配置不可以删掉，否则编号会出现错位
 */
const enum Prop {
  CurrentVersion,
  ShowSuggest,
  WorkbenchCssPath,
  GradientBrightness,
  GradientDarkness,
  HashSource,
  ProjectIndicators,
  LightThemeColors,
  DarkThemeColors,
}

interface Config {
  currentVersion: string;
  showSuggest: boolean;
  workbenchCssPath: string;
  gradientBrightness: number;
  gradientDarkness: number;
  hashSource: HashSource;
  projectIndicators: string[];
  lightThemeColors: RGBA[];
  darkThemeColors: RGBA[];
}

interface ColorCustomization {
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
  private get global() {
    return vscode.workspace.getConfiguration();
  }

  private get newDefault(): Config {
    return {
      currentVersion: '1.0.0',
      showSuggest: true,
      workbenchCssPath: '',
      gradientBrightness: Defaults.GradientBrightness as number,
      gradientDarkness: Defaults.GradientDarkness as number,
      hashSource: HashSource.ProjectName,
      projectIndicators: this.split(Defaults.ProjectIndicators),
      lightThemeColors: this.split(Defaults.LightThemeColors).map((color) => new RGBA(color)),
      darkThemeColors: this.split(Defaults.DarkThemeColors).map((color) => new RGBA(color)),
    };
  }

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

  // #region 序列化工具
  /**
   * 将字符串数组或RGBA对象数组转换为字符串
   * @param arr
   * @returns
   */
  private join(arr: string[] | RGBA[]): string {
    return arr.map((a) => (a instanceof RGBA ? a.toRGBString() : a)).join(Consts.ConfigSeparator);
  }

  /**
   * 拆分为数组，将会去掉首尾空格，并去掉空项
   * @param str
   * @returns
   */
  private split(str: string): string[] {
    return str
      .split(Consts.ConfigSeparator)
      .map((s) => s.trim())
      .filter(Boolean);
  }

  /**
   * 将配置对象序列化为字符串
   * - 压缩后再加密，减少存储空间
   * @returns 加密后的配置字符串
   */
  private serialize(): string {
    const plain = [
      `${Prop.CurrentVersion}:${this.my.currentVersion}`,
      `${Prop.ShowSuggest}:${this.my.showSuggest ? 1 : 0}`,
      `${Prop.WorkbenchCssPath}:${this.my.workbenchCssPath}`,
      `${Prop.GradientBrightness}:${this.my.gradientBrightness}`,
      `${Prop.GradientDarkness}:${this.my.gradientDarkness}`,
      `${Prop.HashSource}:${this.my.hashSource}`,
      `${Prop.ProjectIndicators}:${this.join(this.my.projectIndicators)}`,
      `${Prop.LightThemeColors}:${this.join(this.my.lightThemeColors)}`,
      `${Prop.DarkThemeColors}:${this.join(this.my.darkThemeColors)}`,
    ];
    const str = plain.join(Consts.SerializerSeparator);
    const zipped = deflateRawSync(str);
    vscode.window.showInformationMessage(`before zip:${str.length}, after zip:${zipped.length}`);
    const encrypted = chacha20.encrypt(zipped);
    vscode.window.showInformationMessage(`after encrypt: ${encrypted.length}`);
    return encrypted;
  }

  private parse(decrypted: string): Partial<Config> {
    const arr = decrypted.split(Consts.SerializerSeparator);
    const result: Partial<Config> = {};
    for (let i = 0; i < arr.length; i++) {
      const entry = arr[i];
      const index = entry.indexOf(':');
      const k = parseInt(entry.slice(0, index), 10) as Prop;
      const v = entry.slice(index + 1);
      switch (k) {
        case Prop.CurrentVersion:
          result.currentVersion = v;
          break;
        case Prop.ShowSuggest:
          result.showSuggest = v === '1';
          break;
        case Prop.WorkbenchCssPath:
          result.workbenchCssPath = v;
          break;
        case Prop.GradientBrightness:
          result.gradientBrightness = sanitizer.percent(parseInt(v, 10)) ?? undefined;
          break;
        case Prop.GradientDarkness:
          result.gradientDarkness = sanitizer.percent(parseInt(v, 10)) ?? undefined;
          break;
        case Prop.HashSource:
          result.hashSource = sanitizer.hashSource(parseInt(v, 10) as HashSource) ?? undefined;
          break;
        case Prop.ProjectIndicators:
          result.projectIndicators = this.split(v);
          break;
        case Prop.LightThemeColors:
          result.lightThemeColors = sanitizer.colors(this.split(v)) ?? undefined;
          break;
        case Prop.DarkThemeColors:
          result.darkThemeColors = sanitizer.colors(this.split(v)) ?? undefined;
          break;
        default:
          // * 这里有可能是未来被废弃的配置项，无需处理
          break;
      }
    }
    return result;
  }

  /**
   * 包含了解密、解压缩和校验的逻辑
   * @param akasha 先后经历了压缩、加密和base64编码的配置字符串
   * @returns 配置对象
   */
  private deserialize(akasha: string): Config {
    const decrypted = inflateRawSync(chacha20.decrypt(akasha));
    const raw = this.parse(decrypted.toString());
    const defaults = this.newDefault;

    // & 经过parse的处理，这里的值类型一定是对的，只有可能“没有”
    // 这里不宜和parse函数合并，因为真的可能没有值
    raw.currentVersion = raw.currentVersion ?? defaults.currentVersion;
    raw.showSuggest = raw.showSuggest ?? defaults.showSuggest;
    raw.workbenchCssPath = raw.workbenchCssPath ?? defaults.workbenchCssPath;
    raw.gradientBrightness = raw.gradientBrightness ?? defaults.gradientBrightness;
    raw.gradientDarkness = raw.gradientDarkness ?? defaults.gradientDarkness;
    raw.hashSource = raw.hashSource ?? defaults.hashSource;
    raw.projectIndicators = raw.projectIndicators ?? defaults.projectIndicators;
    raw.lightThemeColors = raw.lightThemeColors ?? defaults.lightThemeColors;
    raw.darkThemeColors = raw.darkThemeColors ?? defaults.darkThemeColors;

    // & 至此，已经严谨地确保了所有配置都是正确的数据和类型
    return raw as Config;
  }
  // #endregion

  /**
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
      const akasha = this.serialize();
      await self.update(Consts.Akasha, akasha, vscode.ConfigurationTarget.Global);
    } catch (error) {
      throw error;
    }
  }

  private overrideWithDefaults(): Promise<void> {
    this.my = this.newDefault;
    return this.save();
  }

  // #region 系统配置
  /**
   * 当前标题栏的颜色，可能没有配置
   */
  get titleBarColor() {
    const o = this.global.get<ColorCustomization>(TitleBarConsts.WorkbenchSection);
    return o?.[TitleBarConsts.ActiveBg];
  }

  /**
   * 获取所有层级的标题栏颜色配置
   */
  get inspectWorkbenchColorCustomizations() {
    return vscode.workspace
      .getConfiguration()
      .inspect<ColorCustomization>(TitleBarConsts.WorkbenchSection);
  }

  /**
   * 设置工作区标题栏颜色
   * @param value 新颜色，其属性可以是`undefined`来删除
   * @returns
   */
  setWorkbenchColorCustomizations(value: Partial<ColorCustomization>): Thenable<void> {
    return this.global.update(
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
    return this.global.update(
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

  get workbenchCssPath() {
    return this.my.workbenchCssPath;
  }

  get gradientBrightness() {
    return this.my.gradientBrightness;
  }

  get gradientDarkness() {
    return this.my.gradientDarkness;
  }

  get hashSource() {
    return this.my.hashSource;
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

  setCurrentVersion(value: string): Promise<void> {
    this.my.currentVersion = value;
    return this.save();
  }

  setShowSuggest(value: boolean): Promise<void> {
    this.my.showSuggest = value;
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

  setHashSource(value: HashSource): Promise<void> {
    this.my.hashSource = value;
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
