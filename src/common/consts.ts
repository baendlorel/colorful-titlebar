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

export const enum HashSource {
  ProjectName = 'projectName',
  FullPath = 'fullPath',
  ProjectNameDate = 'projectNameDate',
}

// 删去Dark中的暗黄：'rgba(80, 66, 7, 1)'
export const enum DefaultColorSet {
  Light = 'rgb(167, 139, 250);rgb(147, 197, 253);rgb(128, 203, 196);rgb(172, 243, 157);rgb(250, 204, 21);rgb(253, 151, 31);rgb(251, 113, 133)',
  Dark = 'rgb(68, 0, 116);rgb(0, 47, 85);rgb(0, 66, 66);rgb(0, 75, 28);rgb(124, 65, 1);rgb(133, 33, 33)',
}
