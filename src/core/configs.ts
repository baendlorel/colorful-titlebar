import vscode from 'vscode';

import { defaultColorSet } from '@/core/colors';

const enum Prop {
  Enabled = 'enabled',
  ShowInformationMessages = 'showInformationMessages',
  LightThemeColors = 'lightThemeColors',
  DarkThemeColors = 'darkThemeColors',
  ProjectIndicators = 'projectIndicators',
}

const enum Setter {
  Enabled = 'set' + Prop.Enabled,
  ShowInformationMessages = 'set' + Prop.ShowInformationMessages,
}

const enum Consts {
  Name = 'colorful-titlebar',
}

interface PartialInspect<T> {
  globalValue?: T | undefined;
  workspaceValue?: T | undefined;
  workspaceFolderValue?: T | undefined;
}

class Config {
  /**
   * 按照 VS Code 设置优先级确定要修改的配置级别
   * 优先级: WorkspaceFolder > Workspace > Global > Default
   * @param inspection 配置检查结果
   * @returns 应该修改的配置级别
   */
  getConfigTarget<T extends any>(value?: T, ins?: PartialInspect<T>): vscode.ConfigurationTarget {
    if (value === undefined) {
      return vscode.ConfigurationTarget.Global;
    }

    if (typeof ins !== 'object' || ins === null) {
      return vscode.ConfigurationTarget.Global;
    }

    // 按优先级从高到低检查，谁有设置就修改谁
    if (ins.workspaceFolderValue === value) {
      return vscode.ConfigurationTarget.WorkspaceFolder;
    }

    if (ins.workspaceValue === value) {
      return vscode.ConfigurationTarget.Workspace;
    }

    // 如果没有工作区级别的设置，修改全局设置
    return vscode.ConfigurationTarget.Global;
  }

  private configs = vscode.workspace.getConfiguration(Consts.Name);

  get [Prop.Enabled]() {
    return this.configs.get<boolean>(Prop.Enabled, true);
  }

  get [Prop.ShowInformationMessages]() {
    return this.configs.get<boolean>(Prop.ShowInformationMessages, true);
  }

  get colorSet() {
    switch (vscode.window.activeColorTheme.kind) {
      case vscode.ColorThemeKind.Dark:
      case vscode.ColorThemeKind.HighContrast:
        return this.configs.get<string[]>(Prop.DarkThemeColors, defaultColorSet.dark);
      case vscode.ColorThemeKind.Light:
      case vscode.ColorThemeKind.HighContrastLight:
        return this.configs.get<string[]>(Prop.LightThemeColors, defaultColorSet.light);
    }
  }

  get [Prop.ProjectIndicators]() {
    // 此处配置和package.json保持一致
    return this.configs.get<string[]>(Prop.ProjectIndicators, [
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

  async [Setter.Enabled](value: boolean) {
    return this.configs.update(Prop.Enabled, value, vscode.ConfigurationTarget.Global);
  }

  async [Setter.ShowInformationMessages](value: boolean) {
    const origin = this.configs.get<boolean>(Prop.ShowInformationMessages);
    const ins = this.configs.inspect<boolean>(Prop.ShowInformationMessages);
    const target = this.getConfigTarget(origin, ins);
    return this.configs.update(Prop.ShowInformationMessages, value, target);
  }
}

export const configs = new Config();
