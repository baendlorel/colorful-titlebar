export const enum Consts {
  Name = 'colorful-titlebar',
  MainCssFileName = 'workbench.desktop.main.css',
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

export const enum HashSource {
  ProjectName = 'projectName',
  FullPath = 'fullPath',
  ProjectNameDate = 'projectNameDate',
}
