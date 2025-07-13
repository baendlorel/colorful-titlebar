export const enum Consts {
  MainCssFileName = 'workbench.desktop.main.css',
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
  MinimumContent = `{"workbench.colorCustomizations":{}}`,
}

export const enum Commands {
  EnableGradient = 'colorful-titlebar.enableGradient',
  DisableGradient = 'colorful-titlebar.disableGradient',
}
