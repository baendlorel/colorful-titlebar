import vscode from 'vscode';

import { DefaultColorSet, HashSource } from './consts';

const enum Prop {
  ShowInfoPop = 'showInfoPop',
  ShowSuggest = 'showSuggest',
  LightThemeColors = 'lightThemeColors',
  DarkThemeColors = 'darkThemeColors',
  ProjectIndicators = 'projectIndicators',
  HashSource = 'hashSource',
  WorkbenchCssPath = 'workbenchCssPath',
}

const enum Consts {
  Name = 'colorful-titlebar',
}

class Config {
  /**
   * 本插件的配置数据
   */
  static readonly self = vscode.workspace.getConfiguration(Consts.Name);

  /**
   * 全局配置数据
   */
  readonly global = vscode.workspace.getConfiguration();

  readonly cwd: string;

  constructor() {
    const cwd = vscode.workspace.workspaceFolders?.[0];
    this.cwd = cwd?.uri.fsPath ?? '';
  }

  /**
   * 按照 VS Code 设置优先级确定配置级别并返回配置数据
   * 优先级: WorkspaceFolder > Workspace > Global > Default
   */
  inspect<T = unknown>(
    config: vscode.WorkspaceConfiguration,
    section: string
  ): { value: T | undefined; target: vscode.ConfigurationTarget } {
    const value = config.get<T>(section);
    const inspection = config.inspect(section);

    if (value === undefined) {
      // 如果没有设置，返回默认值和全局配置目标
      return { value, target: vscode.ConfigurationTarget.Global };
    }

    if (typeof inspection !== 'object' || inspection === null) {
      return { value, target: vscode.ConfigurationTarget.Global };
    }

    // 按优先级从高到低检查，谁有设置就修改谁
    if (inspection.workspaceFolderValue === value) {
      return { value, target: vscode.ConfigurationTarget.WorkspaceFolder };
    }

    if (inspection.workspaceValue === value) {
      return { value, target: vscode.ConfigurationTarget.Workspace };
    }

    // 如果没有工作区级别的设置，修改全局设置
    return { value, target: vscode.ConfigurationTarget.Global };
  }

  get [Prop.ShowInfoPop]() {
    return Config.self.get<boolean>(Prop.ShowInfoPop, true);
  }

  get [Prop.ShowSuggest]() {
    return Config.self.get<boolean>(Prop.ShowSuggest, true);
  }

  get colorSet() {
    switch (vscode.window.activeColorTheme.kind) {
      case vscode.ColorThemeKind.Dark:
      case vscode.ColorThemeKind.HighContrast:
        return Config.self.get<string[]>(Prop.DarkThemeColors, DefaultColorSet.Dark.split(';'));
      case vscode.ColorThemeKind.Light:
      case vscode.ColorThemeKind.HighContrastLight:
        return Config.self.get<string[]>(Prop.LightThemeColors, DefaultColorSet.Light.split(';'));
    }
  }

  get [Prop.ProjectIndicators]() {
    // 此处配置和package.json保持一致
    return Config.self.get<string[]>(Prop.ProjectIndicators, [
      '.git',
      'package.json',
      'pom.xml',
      'Cargo.toml',
      'go.mod',
      'README.md',
      'LICENSE',
      'tsconfig.json',
      'yarn.lock',
      'pnpm-lock.yaml',
      'package-lock.json',
      'webpack.config.js',
      'vite.config.js',
      'vite.config.ts',
      'next.config.js',
      'pyproject.toml',
      'setup.py',
      'CMakeLists.txt',
      'Makefile',
      'build.gradle',
      'composer.json',
      'Gemfile',
      '.nvmrc',
      '.node-version',
      'Deno.json',
      'deno.jsonc',
    ]);
  }

  get [Prop.HashSource]() {
    return Config.self.get<string>(Prop.HashSource, HashSource.ProjectName);
  }

  get [Prop.WorkbenchCssPath]() {
    return Config.self.get<string>(Prop.WorkbenchCssPath, '');
  }

  readonly set = {
    [Prop.ShowInfoPop](value: boolean) {
      return Config.self.update(Prop.ShowInfoPop, value, vscode.ConfigurationTarget.Global);
    },
    [Prop.ShowSuggest](value: boolean) {
      return Config.self.update(Prop.ShowSuggest, value, vscode.ConfigurationTarget.Global);
    },
    [Prop.HashSource](value: HashSource) {
      return Config.self.update(Prop.HashSource, value, vscode.ConfigurationTarget.Global);
    },
    [Prop.WorkbenchCssPath](value: string) {
      return Config.self.update(Prop.WorkbenchCssPath, value, vscode.ConfigurationTarget.Global);
    },
  };
}

export const configs = new Config();
