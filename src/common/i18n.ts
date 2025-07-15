import vscode from 'vscode';
import { Consts, HashSource, TitleBarStyle } from './consts';

export const Msg = (() => {
  const Zh = {
    Unknown: '未知',

    DontShowAgain: { button: '不再提示' },
    NotWorkspace: '没有打开工作区文件夹，不改变标题栏颜色',
    NotProject: '当前不是项目目录，不改变标题栏颜色',

    ControlPanel: {
      title: 'Colorful Titlebar 控制面板',
      description: '在这里可以控制标题栏颜色和样式',
      gradientSwitch: {
        label: '使用渐变',
        description: `需提供${Consts.MainCssFileName}路径，开启后将会给标题栏增加渐变特效。（会提示VS Code 损坏，这是正常的，选“不再显示即可”）`,
      },
      gradient: {
        label: '渐变样式',
        description: '选择后需要重启生效',
        brightLeft: '左侧较亮',
        brightCenter: '中间较亮',
        arcLeft: '左侧弧光',
      },
      hashSource: {
        label: 'Hash入参',
        description: `将会以设定的内容作为计算Hash的依据`,
        [HashSource.ProjectName]: '项目名',
        [HashSource.FullPath]: '完整路径',
        [HashSource.ProjectNameDate]: '项目名+日期',
      },
      pickColor: {
        label: '指定当前颜色',
        description: `直接指定当前打开的项目的标题栏颜色，若不满意可以手动选择`,
      },
      refresh: {
        label: '重新计算颜色',
        description: `再次让本插件自动计算颜色`,
        button: '开始计算',
      },
    },

    Commands: {
      enableGradient: {
        suggest: {
          msg: '已支持美丽的标题栏渐变色！需要开启吗？',
          yes: '好的！',
        },
        title: `${Consts.MainCssFileName}文件地址`,
        prompt: `启用渐变色标题栏需要修改${Consts.MainCssFileName}，请提供该文件地址（WSl 需要映射到子系统内部的地址）`,
        placeHolder: `例如：../../${Consts.MainCssFileName}`,
        workbenchCssPathInvalid: `${Consts.MainCssFileName}路径无效，请检查`,
        style: {
          brightCenter: '中间较亮',
          brightLeft: '左侧较亮',
          arcLeft: '左侧弧光',
        },
        invalidStyle: '无效的样式',
        success: '修改css文件成功！重启VS Code生效。若碰到提示VS Code损坏，可以直接点击“不再显示”',
        fail: '修改css文件失败！',
        backup: {
          notFound: (filePath?: string) => {
            filePath = filePath ? `（${filePath}）` : '';
            return `未找到备份的css文件${filePath}！如果样式出现混乱，您可能需要重新安装VS Code`;
          },
          success: '备份css文件成功',
          fail: '备份css文件失败！',
        },
        restore: {
          success: '备份css文件成功',
          fail: '备份css文件失败！',
        },
      },
      disableGradient: {
        fail: '关闭渐变色标题栏失败！',
      },
      pickColor: {
        suggest: {
          msg: '对自动计算的颜色不满意？可以手动选择！',
          yes: '我要手选！',
          no: '现在这个蛮好',
        },
        title: '选择标题栏颜色',
        html: {
          description: '选择一个颜色来设置标题栏的背景色',
          input: '选择颜色',
          preview: '预览',
          colorValue: '颜色值',
          apply: '应用',
          reset: '重置',
        },
        titleBarStyleWarning: '标题栏样式必须设置为"custom"才能应用颜色。您想现在设置吗？',
        setStyleButton: '是的',
        cancelButton: '不了',
        styleSetSuccess: '标题栏样式设置为custom成功！',
        colorApplied: (color: string) => `标题栏颜色已应用：${color}`,
        colorReset: '标题栏颜色已重置为自动生成',
        error: (error: string) => `错误：${error}`,
      },
    },

    ConfigLevel: {
      [vscode.ConfigurationTarget.Workspace]: '工作区',
      [vscode.ConfigurationTarget.WorkspaceFolder]: '工作区文件夹',
      [vscode.ConfigurationTarget.Global]: '全局',
    },
    Config: {
      changed: '检测到配置变化，重启后生效',
      gradientChangedButInvalidCssPath: `虽然修改了渐变配置但${Consts.MainCssFileName}文件路径不正确，修改将无法生效！`,
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
    Unknown: 'unknown',
    DontShowAgain: { button: 'Do not show again' },
    NotWorkspace: 'No workspace folder opened, titlebar color remains unchanged',
    NotProject: 'Current folder is not a project directory, titlebar color remains unchanged',

    ControlPanel: {
      title: 'Colorful Titlebar Control Panel',
      description: 'Control titlebar color and style here',
      gradientSwitch: {
        label: 'Use Gradient',
        description: `Requires path to ${Consts.MainCssFileName}, enables gradient effect on title bar`,
      },
      gradient: {
        label: 'Gradient Style',
        brightLeft: 'Bright Left',
        brightCenter: 'Bright Center',
        arcLeft: 'Arc Left',
      },
      hashSource: {
        label: 'Hash Source',
        description: `Determines the basis for calculating the hash used for color`,
        [HashSource.ProjectName]: 'Project Name',
        [HashSource.FullPath]: 'Full Path',
        [HashSource.ProjectNameDate]: 'Project Name + Date',
      },
      pickColor: {
        label: 'Specify Current Color',
        description: `Directly specify the titlebar color for the current project manually`,
      },
      refresh: {
        label: 'Recalculate Color',
        description: `Recalculate the titlebar color automatically`,
        button: 'Calculate',
      },
    },

    Commands: {
      enableGradient: {
        suggest: {
          msg: 'Gradient titlebar is supported! Do you want to enable it now?',
          yes: 'YES! Enable it now!',
        },
        title: `${Consts.MainCssFileName} Path`,
        prompt: `To enable gradient titlebar, please provide the path to "${Consts.MainCssFileName}". WSL paths should map to the internal path of the subsystem`,
        placeHolder: `Example: ../../${Consts.MainCssFileName}`,
        workbenchCssPathInvalid: `The path to "${Consts.MainCssFileName}" is invalid, please check`,
        style: {
          brightCenter: 'Bright Center',
          brightLeft: 'Bright Left',
          arcLeft: 'Arc Left',
        },
        invalidStyle: 'Invalid style',
        success:
          'CSS file modified successfully! Restart VS Code to apply changes. If you see a message like "Your Code installation appears to be corrupt. Please reinstall.", you can simply click never show again.',
        fail: 'CSS file modification failed!',
        backup: {
          notFound: (filePath?: string) => {
            filePath = filePath ? `(${filePath})` : '';
            return `Backup CSS file not found${filePath}! If the style is messed up, you may need to reinstall VS Code`;
          },
          success: 'Backup CSS file created successfully',
          fail: 'Backup CSS file failed!',
        },
        restore: {
          success: 'CSS file restored successfully',
          fail: 'Backup CSS file restoration failed!',
        },
      },
      disableGradient: {
        fail: 'Disabling gradient titlebar failed!',
      },
      pickColor: {
        suggest: {
          msg: 'Not satisfied with the auto-calculated color? You can choose manually!',
          yes: 'I want to pick a color',
          no: 'This one is fine',
        },
        title: 'Pick Titlebar Color',
        html: {
          description: 'Select a color to set the titlebar background',
          input: 'Pick Color',
          preview: 'Preview',
          colorValue: 'Color Value',
          apply: 'Apply',
          reset: 'Reset',
        },
        titleBarStyleWarning:
          'Title bar style must be set to "custom" to apply colors. Would you like to set it now?',
        setStyleButton: 'Yes',
        cancelButton: 'No',
        styleSetSuccess: 'Title bar style set to custom successfully!',
        colorApplied: (color: string) => `Titlebar color applied: ${color}`,
        colorReset: 'Titlebar color reset to auto-generated',
        error: (error: string) => `Error: ${error}`,
      },
    },

    ConfigLevel: {
      [vscode.ConfigurationTarget.Workspace]: 'Workspace',
      [vscode.ConfigurationTarget.WorkspaceFolder]: 'Workspace Folder',
      [vscode.ConfigurationTarget.Global]: 'Global',
    },

    Config: {
      changed: 'Detected color configuration change, restart to apply',
      gradientChangedButInvalidCssPath: `Although gradient config has changed, the path to "${Consts.MainCssFileName}" is incorrect, changes will not take effect!`,
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
