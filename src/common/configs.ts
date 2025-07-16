import vscode from 'vscode';

import { Consts, HashSource, TitleBarConsts } from './consts';

const enum Prop {
  CurrentVersion = 'currentVersion',
  ShowSuggest = 'showSuggest',
  LightThemeColors = 'lightThemeColors',
  DarkThemeColors = 'darkThemeColors',
  ProjectIndicators = 'projectIndicators',
  HashSource = 'hashSource',
  WorkbenchCssPath = 'workbenchCssPath',
  GradientBrightness = 'gradientBrightness',
  GradientDarkness = 'gradientDarkness',
}

const enum Defaults {
  LightThemeColors = 'rgb(167, 139, 250);rgb(147, 197, 253);rgb(128, 203, 196);rgb(172, 243, 157);rgb(250, 204, 21);rgb(253, 151, 31);rgb(251, 113, 133)',
  DarkThemeColors = 'rgb(68, 0, 116);rgb(0, 47, 85);rgb(0, 66, 66);rgb(0, 75, 28);rgb(124, 65, 1);rgb(133, 33, 33)',
  ProjectIndicators = '.git;package.json;pom.xml;Cargo.toml;go.mod;README.md;LICENSE;tsconfig.json;yarn.lock;pnpm-lock.yaml;package-lock.json;webpack.config.js;vite.config.js;vite.config.ts;next.config.js;pyproject.toml;setup.py;CMakeLists.txt;Makefile;build.gradle;composer.json;Gemfile;.nvmrc;.node-version;Deno.json;deno.jsonc',
  GradientBrightness = 0.72,
  GradientDarkness = 0.26,
}

interface TitleBarStyleCustomization {
  [TitleBarConsts.ActiveBg]: string;
  [TitleBarConsts.InactiveBg]: string;
}

class Config {
  /**
   * 本插件的配置数据
   */
  private static self = vscode.workspace.getConfiguration(Consts.Name);

  /**
   * 全局配置数据
   */
  private static global = vscode.workspace.getConfiguration();

  readonly cwd: string;

  readonly lang = vscode.env.language.toLowerCase().startsWith('zh') ? 'zh' : 'en';

  constructor() {
    const cwd = vscode.workspace.workspaceFolders?.[0];
    this.cwd = cwd?.uri.fsPath ?? '';
  }

  get theme(): 'dark' | 'light' {
    switch (vscode.window.activeColorTheme.kind) {
      case vscode.ColorThemeKind.Dark:
      case vscode.ColorThemeKind.HighContrast:
        return 'dark';
      case vscode.ColorThemeKind.Light:
      case vscode.ColorThemeKind.HighContrastLight:
        return 'light';
    }
  }

  get colorSet() {
    let colors: string[];
    switch (vscode.window.activeColorTheme.kind) {
      case vscode.ColorThemeKind.Dark:
      case vscode.ColorThemeKind.HighContrast:
        colors = Defaults.DarkThemeColors.split(';');
        break;
      case vscode.ColorThemeKind.Light:
      case vscode.ColorThemeKind.HighContrastLight:
        colors = Defaults.LightThemeColors.split(';');
        break;
    }
    return Config.self.get<string[]>(Prop.DarkThemeColors, colors);
  }

  // # 全局的设定

  get currentColor() {
    return this[TitleBarConsts.WorkbenchSection]?.[TitleBarConsts.ActiveBg];
  }

  /**
   * 当前的标题栏颜色配置，可能是`undefined`
   */
  get [TitleBarConsts.WorkbenchSection]() {
    return Config.global.get<TitleBarStyleCustomization>(TitleBarConsts.WorkbenchSection);
  }

  /**
   * 全局设定，必须是`custom`才行
   */
  get [TitleBarConsts.Section]() {
    return Config.global.get<string>(TitleBarConsts.Section);
  }

  readonly inspectGlobal = {
    get [TitleBarConsts.WorkbenchSection]() {
      return Config.global.inspect<TitleBarStyleCustomization>(TitleBarConsts.WorkbenchSection);
    },
  };

  readonly setWorkspace = {
    async [TitleBarConsts.WorkbenchSection](value: Partial<TitleBarStyleCustomization>) {
      vscode.window.showInformationMessage(
        `开始保存${JSON.stringify(value)}，到${TitleBarConsts.WorkbenchSection}  ${
          vscode.ConfigurationTarget.Global
        }`
      );

      await Config.global.update(
        TitleBarConsts.WorkbenchSection,
        value,
        vscode.ConfigurationTarget.Workspace
      );
      Config.global = vscode.workspace.getConfiguration();
    },
  };

  readonly setGlobal = {
    async [TitleBarConsts.Section](value: string) {
      await Config.global.update(TitleBarConsts.Section, value, vscode.ConfigurationTarget.Global);
      Config.global = vscode.workspace.getConfiguration();
    },
  };

  // # 本插件的设定

  get [Prop.CurrentVersion]() {
    return Config.self.get<string>(Prop.CurrentVersion, 'outdated');
  }

  get [Prop.ShowSuggest]() {
    return Config.self.get<boolean>(Prop.ShowSuggest, true);
  }

  get [Prop.ProjectIndicators]() {
    const indicators = Defaults.ProjectIndicators.split(';');
    // * 此处配置和package.json保持一致
    return Config.self.get<string[]>(Prop.ProjectIndicators, indicators);
  }

  get [Prop.HashSource]() {
    return Config.self.get<number>(Prop.HashSource, HashSource.ProjectName);
  }

  get [Prop.WorkbenchCssPath]() {
    return Config.self.get<string>(Prop.WorkbenchCssPath, '');
  }

  get [Prop.GradientBrightness]() {
    return Config.self.get<number>(Prop.GradientBrightness, Defaults.GradientBrightness);
  }

  get [Prop.GradientDarkness]() {
    return Config.self.get<number>(Prop.GradientDarkness, Defaults.GradientDarkness);
  }

  private static refresh() {
    Config.self = vscode.workspace.getConfiguration(Consts.Name);
  }

  readonly set = {
    async [Prop.CurrentVersion](value: string) {
      await Config.self.update(Prop.CurrentVersion, value, vscode.ConfigurationTarget.Global);
      Config.refresh();
    },

    async [Prop.ShowSuggest](value: boolean) {
      await Config.self.update(Prop.ShowSuggest, value, vscode.ConfigurationTarget.Global);
      Config.refresh();
    },

    async [Prop.HashSource](value: HashSource) {
      await Config.self.update(Prop.HashSource, value, vscode.ConfigurationTarget.Global);
      Config.refresh();
    },

    async [Prop.WorkbenchCssPath](value: string) {
      await Config.self.update(Prop.WorkbenchCssPath, value, vscode.ConfigurationTarget.Global);
      Config.refresh();
    },

    async [Prop.GradientBrightness](value: number) {
      await Config.self.update(Prop.GradientBrightness, value, vscode.ConfigurationTarget.Global);
      Config.refresh();
    },

    async [Prop.GradientDarkness](value: number) {
      await Config.self.update(Prop.GradientDarkness, value, vscode.ConfigurationTarget.Global);
      Config.refresh();
    },
  };
}

export default new Config();
