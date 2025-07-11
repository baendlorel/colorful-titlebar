import vscode from 'vscode';

import { defaultColorSet } from '@/core/colors';

const enum Prop {
  Enabled = 'enabled',
  ShowInformationMessages = 'showInformationMessages',
  LightThemeColors = 'lightThemeColors',
  DarkThemeColors = 'darkThemeColors',
  ProjectIndicators = 'projectIndicators',
}

const enum Consts {
  Name = 'colorful-titlebar',
}

/**
 * 本插件的配置数据
 */
const thisConfig = vscode.workspace.getConfiguration(Consts.Name);

class Config {
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

  get [Prop.Enabled]() {
    return thisConfig.get<boolean>(Prop.Enabled, true);
  }

  get [Prop.ShowInformationMessages]() {
    return thisConfig.get<boolean>(Prop.ShowInformationMessages, true);
  }

  get colorSet() {
    switch (vscode.window.activeColorTheme.kind) {
      case vscode.ColorThemeKind.Dark:
      case vscode.ColorThemeKind.HighContrast:
        return thisConfig.get<string[]>(Prop.DarkThemeColors, defaultColorSet.dark);
      case vscode.ColorThemeKind.Light:
      case vscode.ColorThemeKind.HighContrastLight:
        return thisConfig.get<string[]>(Prop.LightThemeColors, defaultColorSet.light);
    }
  }

  get [Prop.ProjectIndicators]() {
    // 此处配置和package.json保持一致
    return thisConfig.get<string[]>(Prop.ProjectIndicators, [
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

  readonly set = {
    async [Prop.Enabled](value: boolean) {
      return thisConfig.update(Prop.Enabled, value, vscode.ConfigurationTarget.Global);
    },
    async [Prop.ShowInformationMessages](value: boolean) {
      const inspection = configs.inspect(thisConfig, Prop.ShowInformationMessages);
      return thisConfig.update(Prop.ShowInformationMessages, value, inspection.target);
    },
  };
}

export const configs = new Config();
