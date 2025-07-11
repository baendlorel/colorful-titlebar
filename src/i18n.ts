import vscode from 'vscode';

export const Msg = (() => {
  const Zh = {
    NotOpenWorkspace: '没有打开工作区文件夹，不改变标题栏颜色',
    NotProject: '当前不是项目目录，不改变标题栏颜色',

    // 设置全局标题栏样式
    NotCustomTitleBarStyleHint: '⚠️ 需要将标题栏样式设置为"custom"，本插件才能生效',
    SetTitleBarStyleToCustom: '帮我设置好',
    Cancel: '还是算了',
    SetTitleBarStyleToCustomSuccess: '标题栏样式已设置为custom，重启VS Code后生效',
  };

  const En = {
    NotOpenWorkspace: 'No workspace folder opened, titlebar color remains unchanged',
    NotProject: 'Current folder is not a project directory, titlebar color remains unchanged',

    // 设置全局标题栏样式
    NotCustomTitleBarStyleHint:
      '⚠️ Only when `titleBarStyle` is set to "custom" will this extension takes effect',
    SetTitleBarStyleToCustom: 'Set it for me',
    Cancel: 'Not now',
    SetTitleBarStyleToCustomSuccess:
      '`titleBarStyle` has been set to custom, it will take effect after restarting VS Code',
  };

  const locale = vscode.env.language.toLowerCase();
  const isChinese = locale.startsWith('zh');
  return isChinese ? Zh : En;
})();
