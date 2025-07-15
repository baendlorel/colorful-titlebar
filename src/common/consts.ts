export const enum Consts {
  Name = 'colorful-titlebar',
  WorkbenchCssName = 'workbench.desktop.main.css',
  InvisibleSeparator = '\u2063',
}

export const enum TitleBarStyle {
  Expected = 'custom',
  Section = 'window.titleBarStyle',
  WorkbenchSection = 'workbench.colorCustomizations',
  ActiveBg = 'titleBar.activeBackground',
  InactiveBg = 'titleBar.inactiveBackground',
}

export const enum SettingsJson {
  FileName = 'settings.json',
  Dir = '.vscode',
  MinimumContent = `{"${TitleBarStyle.WorkbenchSection}":{}}`,
}

export const enum Commands {
  EnableGradient = `${Consts.Name}.enableGradient`,
  DisableGradient = `${Consts.Name}.disableGradient`,
  PickColor = `${Consts.Name}.pickColor`,
  Refresh = `${Consts.Name}.refresh`,
}

// #region 配置项相关

export const enum GradientStyle {
  BrightLeft,
  BrightCenter,
  ArcLeft,
}

export const enum HashSource {
  ProjectName,
  FullPath,
  ProjectNameDate,
}

// #endregion
