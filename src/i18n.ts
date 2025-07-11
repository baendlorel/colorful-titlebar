import vscode from 'vscode';

export const Msg = (() => {
  const Zh = {
    notOpenWorkspace: '没有打开工作区文件夹，不改变标题栏颜色',
    notProject: '当前不是项目目录，不改变标题栏颜色',
  };

  const En = {
    notOpenWorkspace: 'No workspace folder opened, titlebar color remains unchanged',
    notProject: 'Current folder is not a project directory, titlebar color remains unchanged',
  };

  const locale = vscode.env.language.toLowerCase();
  const isChinese = locale.startsWith('zh');
  return isChinese ? Zh : En;
})();
