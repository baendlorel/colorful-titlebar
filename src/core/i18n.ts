import vscode from 'vscode';
import { Consts, TitleBarStyle } from './consts';

export const Msg = (() => {
  const Zh = {
    NoMoreInfoPop: '不再提示',
    NoMoreInfoPopSet: '如果手动开启了提示，需重启VS Code后生效',
    NotWorkspace: '没有打开工作区文件夹，不改变标题栏颜色',
    NotProject: '当前不是项目目录，不改变标题栏颜色',

    Commands: {
      enableGradient: {
        prompt: `启用渐变色标题栏需要修改${Consts.MainCssFileName}，请提供该文件地址`,
        workbenchCssPathInvalid: `${Consts.MainCssFileName}路径无效，请检查`,
        gradientStyle: {
          brightCenter: '中间较亮',
          brightLeft: '左侧较亮',
        },
        success: '修改css文件成功！重启VS Code生效。若碰到提示VS Code损坏，可以直接点击“不再显示”',
        failed: '修改css文件失败！',
        backup: {
          notFound: (filePath?: string) => {
            filePath = filePath ? `（${filePath}）` : '';
            return `未找到备份的css文件${filePath}！如果样式出现混乱，您可能需要重新安装VS Code`;
          },
          success: '备份css文件成功',
          failed: '备份css文件失败！',
          restoredSucceeded: '恢复css文件成功',
          restoredFailed: '恢复css文件失败！',
        },
      },
      disableGradient: {
        failed: '关闭渐变色标题栏失败！',
      },
    },

    ConfigLevel: {
      [vscode.ConfigurationTarget.Workspace]: '工作区',
      [vscode.ConfigurationTarget.WorkspaceFolder]: '工作区文件夹',
      [vscode.ConfigurationTarget.Global]: '全局',
    },

    // 设置标题栏颜色
    TitleBarColorSet: (settingsCreated: boolean) =>
      `标题栏颜色已更新${settingsCreated ? '，已创建settings.json' : ''}`,

    // 设置全局标题栏样式
    NotCustomTitleBarStyle: (level: string) =>
      `检测到"${level}"级别的标题栏样式设置不是"${TitleBarStyle.Expected}"，需要设置为"${TitleBarStyle.Expected}"本插件才能生效`,
    SetTitleBarStyleToCustom: '帮我设置好',
    Cancel: '还是算了',
    SetTitleBarStyleToCustomSuccess: `标题栏样式已设置为${TitleBarStyle.Expected}，重启VS Code后生效`,
  };

  const En = {
    NoMoreInfoPop: 'Do not show this again',
    NoMoreInfoPopSet: 'If you set "showInfoPop" to "true", please restart VS Code to make it work',
    NotWorkspace: 'No workspace folder opened, titlebar color remains unchanged',
    NotProject: 'Current folder is not a project directory, titlebar color remains unchanged',

    Commands: {
      enableGradient: {
        prompt: `To enable gradient titlebar, please provide the path to "${Consts.MainCssFileName}"`,
        workbenchCssPathInvalid: `The path to "${Consts.MainCssFileName}" is invalid, please check`,
        gradientStyle: {
          brightCenter: 'Bright Center',
          brightLeft: 'Bright Left',
        },
        success:
          'CSS file modified successfully! Restart VS Code to apply changes. If you see a message like "Your Code installation appears to be corrupt. Please reinstall.", you can simply click never show again.',
        failed: 'CSS file modification failed!',
        backup: {
          notFound: (filePath?: string) => {
            filePath = filePath ? `（${filePath}）` : '';
            return `Backup CSS file not found${filePath}! If the style is messed up, you may need to reinstall VS Code`;
          },
          success: 'Backup CSS file created successfully',
          failed: 'Backup CSS file failed!',
          restoredSucceeded: 'CSS file restored successfully',
          restoredFailed: 'Backup CSS file restoration failed！',
        },
      },
      disableGradient: {
        failed: 'Disabling gradient titlebar failed!',
      },
    },

    ConfigLevel: {
      [vscode.ConfigurationTarget.Workspace]: 'Workspace',
      [vscode.ConfigurationTarget.WorkspaceFolder]: 'Workspace Folder',
      [vscode.ConfigurationTarget.Global]: 'Global',
    },

    // 设置标题栏颜色
    TitleBarColorSet: (settingsCreated: boolean) =>
      `TitleBar color has been updated${
        settingsCreated ? ', "settings.json" has been created' : ''
      }`,

    // 设置全局标题栏样式
    NotCustomTitleBarStyle: (level: string) =>
      `Detected "${level}" level "titleBarStyle" setting is not "${TitleBarStyle.Expected}", it needs to be "${TitleBarStyle.Expected}" for this extension to take effect`,
    SetTitleBarStyleToCustom: 'Set it for me',
    Cancel: 'Not now',
    SetTitleBarStyleToCustomSuccess: `"titleBarStyle" has been set to ${TitleBarStyle.Expected}, Please restart VS Code to make it work`,
  } satisfies typeof Zh;

  const isChinese = vscode.env.language.toLowerCase().startsWith('zh');
  return isChinese ? Zh : En;
})();
