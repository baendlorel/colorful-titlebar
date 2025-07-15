import vscode from 'vscode';
import { Consts, GradientStyle, HashSource, TitleBarConsts } from './consts';

export default (() => {
  const zh = {
    Unknown: '未知',

    BlockAllSuggestion: { button: '屏蔽所有建议' },
    NotWorkspace: '没有打开工作区文件夹，不改变标题栏颜色',
    NotProject: '当前不是项目目录，不改变标题栏颜色',

    ControlPanel: {
      title: 'Colorful Titlebar 控制面板',
      description: '在这里可以控制标题栏颜色和样式',
      loading: '更新中...',
      typeError: (value: string | number | boolean, shouldBe?: string) =>
        `值或值类型无效，得到的是${value}(${typeof value})${shouldBe ? '，应该是' + shouldBe : ''}`,
      success: '保存成功',
      showSuggest: {
        label: '显示建议',
        description: `显示偶尔会弹出的建议`,
      },
      workbenchCssPath: {
        label: `${Consts.WorkbenchCssName}路径`,
        description: '用于注入渐变样式。提示VS Code损坏是意料之内的，选“不再显示”即可',
        notExist: '路径不存在',
      },
      gradient: {
        label: '渐变样式',
        description: '选择后需要重启生效',
        empty: '',
        [GradientStyle.BrightCenter]: '中间较亮',
        [GradientStyle.BrightLeft]: '左侧较亮',
        [GradientStyle.ArcLeft]: '左侧弧光',
        success: '注入成功，重启后生效',
      },
      gradientBrightness: {
        label: '渐变亮度',
        description: '表示渐变较亮的地方有多亮',
      },
      gradientDarkness: {
        label: '渐变暗度',
        description: '表示渐变较暗的地方有多暗',
      },
      hashSource: {
        label: 'Hash入参',
        description: `将会以设定的内容作为计算Hash的依据`,
        [HashSource.ProjectName]: '项目名',
        [HashSource.FullPath]: '完整路径',
        [HashSource.ProjectNameDate]: '项目名+日期',
        success: '保存成功，点击"重新计算颜色"可以生效',
      },
      pickColor: {
        label: '指定当前颜色',
        description: `直接指定当前打开的项目的标题栏颜色`,
        button: '选择颜色',
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
        title: `${Consts.WorkbenchCssName}文件地址`,
        prompt: `启用渐变色标题栏需要修改${Consts.WorkbenchCssName}，请提供该文件地址（WSl 需要映射到子系统内部的地址）`,
        placeHolder: `例如：../../${Consts.WorkbenchCssName}`,
        workbenchCssPathInvalid: `${Consts.WorkbenchCssName}路径无效，请检查`,
        style: {
          [GradientStyle.BrightCenter]: '中间较亮',
          [GradientStyle.BrightLeft]: '左侧较亮',
          [GradientStyle.ArcLeft]: '左侧弧光',
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
      gradientChangedButInvalidCssPath: `虽然修改了渐变配置但${Consts.WorkbenchCssName}文件路径不正确，修改将无法生效！`,
    },

    // 设置标题栏颜色
    TitleBarColorSet: (settingsCreated: boolean) =>
      `标题栏颜色已更新${settingsCreated ? '，已创建settings.json' : ''}`,

    // 设置全局标题栏样式
    NotCustomTitleBarStyle: (level: string) =>
      `检测到"${level}"级别的标题栏样式设置不是"${TitleBarConsts.Expected}"，需要设置为"${TitleBarConsts.Expected}"本插件才能生效`,
    SetTitleBarStyleToCustom: '帮我设置好',
    Cancel: '还是算了',
    SetTitleBarStyleToCustomSuccess: `标题栏样式已设置为${TitleBarConsts.Expected}，重启VS Code后生效`,
  };

  const en = {
    Unknown: 'unknown',
    BlockAllSuggestion: { button: 'Block Suggestions' },
    NotWorkspace: 'No workspace folder opened, titlebar color remains unchanged',
    NotProject: 'Current folder is not a project directory, titlebar color remains unchanged',

    ControlPanel: {
      title: 'Colorful Titlebar Control Panel',
      description: 'Control titlebar color and style here',
      loading: 'Updating...',
      success: 'Saved successfully',
      typeError: (value: string | number | boolean, shouldBe?: string) =>
        `Invalid value or value type, got ${value}(${typeof value})${
          shouldBe ? '. Should be ' + shouldBe : ''
        }`,
      showSuggest: {
        label: 'Show Suggestions',
        description: `Turning it off will block all suggestions`,
      },
      workbenchCssPath: {
        label: `${Consts.WorkbenchCssName} Path`,
        description:
          'After injection, VS Code might show "corrupted", just select "Never show again"',
        notExist: 'Path does not exist',
      },
      gradient: {
        label: 'Gradient Style',
        description: 'Needs restart to take effect',
        empty: '',
        [GradientStyle.BrightCenter]: 'Bright Center',
        [GradientStyle.BrightLeft]: 'Bright Left',
        [GradientStyle.ArcLeft]: 'Arc Left',
        success: 'Injected successfully, restart to take effect',
      },
      gradientBrightness: {
        label: 'Gradient Brightness',
        description: 'Indicates how bright the brighter part of the gradient is',
      },
      gradientDarkness: {
        label: 'Gradient Darkness',
        description: 'Indicates how dark the darker part of the gradient is',
      },
      hashSource: {
        label: 'Hash Source',
        description: `Determines the basis for calculating the hash used for color`,
        [HashSource.ProjectName]: 'Project Name',
        [HashSource.FullPath]: 'Full Path',
        [HashSource.ProjectNameDate]: 'Project Name + Date',
        success: 'Saved successfully, click "Recalculate Color" to apply changes',
      },
      pickColor: {
        label: 'Specify Current Color',
        description: `Specify the titlebar color for current project manually`,
        button: 'Pick Color',
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
        title: `${Consts.WorkbenchCssName} Path`,
        prompt: `To enable gradient titlebar, please provide the path to "${Consts.WorkbenchCssName}". WSL paths should map to the internal path of the subsystem`,
        placeHolder: `Example: ../../${Consts.WorkbenchCssName}`,
        workbenchCssPathInvalid: `The path to "${Consts.WorkbenchCssName}" is invalid, please check`,
        style: {
          [GradientStyle.BrightCenter]: 'Bright Center',
          [GradientStyle.BrightLeft]: 'Bright Left',
          [GradientStyle.ArcLeft]: 'Arc Left',
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
      gradientChangedButInvalidCssPath: `Although gradient config has changed, the path to "${Consts.WorkbenchCssName}" is incorrect, changes will not take effect!`,
    },

    // 设置标题栏颜色
    TitleBarColorSet: (settingsCreated: boolean) =>
      `TitleBar color has been updated${
        settingsCreated ? ', "settings.json" has been created' : ''
      }`,

    // 设置全局标题栏样式
    NotCustomTitleBarStyle: (level: string) =>
      `Detected "${level}" level "titleBarStyle" setting is not "${TitleBarConsts.Expected}", it needs to be "${TitleBarConsts.Expected}" for this extension to take effect`,
    SetTitleBarStyleToCustom: 'Set it for me',
    Cancel: 'Not now',
    SetTitleBarStyleToCustomSuccess: `"titleBarStyle" has been set to ${TitleBarConsts.Expected}, Please restart VS Code to make it work`,
  } satisfies typeof zh;

  const isChinese = vscode.env.language.toLowerCase().startsWith('zh');
  return isChinese ? zh : en;
})();
