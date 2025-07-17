/**
 * 模板字符串替换器 - 用于浏览器调试
 * Template String Replacer for Browser Debugging
 */

(function () {
  ('use strict');

  // 中英文文本数据
  const textData = {
    zh: {
      // 面板文本 (中文)
      Panel: {
        title: '设置',
        description: '在这里可以控制标题栏颜色和样式',
        loading: '更新中...',

        showSuggest: {
          label: '显示建议',
          description: '显示偶尔会弹出的建议',
        },

        workbenchCssPath: {
          label: 'workbench.desktop.main.css路径',
          description: '用于注入渐变样式。提示VS Code损坏是意料之内的，选"不再显示"即可',
        },

        gradient: {
          label: '渐变样式',
          description: '选择后立即注入css，选项不会保存在配置中。选择后需要重启生效',
          empty: '-- 请选择 --',
          1: '中间较亮', // BrightCenter
          0: '左侧较亮', // BrightLeft
          2: '左侧弧光', // ArcLeft
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
          description: '将会以设定的内容作为计算Hash的依据',
          0: '项目名', // ProjectName
          1: '完整路径', // FullPath
          2: '项目名 + Date.getDate()', // ProjectNameDate
        },

        refresh: {
          label: '重新计算颜色',
          description: '再次让本插件自动计算颜色',
          button: '开始计算',
        },

        randomColor: {
          label: '随机/指定颜色',
          description: '可以选择用当前配置的颜色来随机、纯随机或者直接用调色盘🎨指定颜色',
          colorSet: '当前套组',
          pure: '纯随机',
          specify: '直接指定一个颜色',
        },
      },
    },

    en: {
      // Panel text (English)
      Panel: {
        title: 'Settings',
        description: 'Control titlebar color and style here',
        loading: 'Updating...',

        showSuggest: {
          label: 'Show Suggestions',
          description: 'Show occasional popup suggestions',
        },

        workbenchCssPath: {
          label: 'workbench.desktop.main.css Path',
          description:
            'Used for injecting gradient styles. VS Code corruption warnings are expected, just select "Don\'t Show Again"',
        },

        gradient: {
          label: 'Gradient Style',
          description:
            "CSS will be injected immediately after selection, option won't be saved in config. Restart required to take effect",
          empty: '-- Please Select --',
          1: 'Bright Center', // BrightCenter
          0: 'Bright Left', // BrightLeft
          2: 'Arc Left', // ArcLeft
        },

        gradientBrightness: {
          label: 'Gradient Brightness',
          description: 'How bright the bright areas of the gradient are',
        },

        gradientDarkness: {
          label: 'Gradient Darkness',
          description: 'How dark the dark areas of the gradient are',
        },

        hashSource: {
          label: 'Hash Source',
          description: 'The content used as the basis for hash calculation',
          0: 'Project Name', // ProjectName
          1: 'Full Path', // FullPath
          2: 'Project Name + Date.getDate()', // ProjectNameDate
        },

        refresh: {
          label: 'Recalculate Color',
          description: 'Let the plugin automatically calculate color again',
          button: 'Start Calculation',
        },

        randomColor: {
          label: 'Random/Specify Color',
          description:
            'You can choose to randomize with current configured colors, pure random, or directly specify a color with the color picker🎨',
          colorSet: 'Current Set',
          pure: 'Pure Random',
          specify: 'Specify a Color',
        },
      },
    },
  };

  // 当前语言设置
  const currentLang = ((match) => {
    if (match) {
      console.log(`🌐 Language switched to: ${match[0].split('=')[1]}`);
      return match[0].split('=')[1];
    } else {
      console.log(`🌐 Language switched to: zh`);
      return 'zh';
    }
  })(location.href.match(/\?lang=([a-z]+)/g));

  const langToggler = document.createElement('button');
  langToggler.textContent = '切换语言 / Toggle Language';
  langToggler.style.position = 'fixed';
  langToggler.style.top = '10px';
  langToggler.style.right = '10px';
  langToggler.style.zIndex = '1000';
  langToggler.onclick = () => {
    const newLang = currentLang === 'zh' ? 'en' : 'zh';
    window.location.href = window.location.href.split('?')[0] + '?lang=' + newLang;
  };
  document.body.appendChild(langToggler);

  // 测试数据定义
  const mockData = {
    // 常量
    Consts: {
      DisplayName: 'Colorful Titlebar',
    },

    // 枚举
    GradientStyle: {
      BrightCenter: 1,
      BrightLeft: 0,
      ArcLeft: 2,
    },

    HashSource: {
      ProjectName: 0,
      FullPath: 1,
      ProjectNameDate: 2,
    },

    // 面板文本 (动态切换)
    get Panel() {
      return textData[currentLang].Panel;
    },

    // 配置数据
    configs: {
      theme: 'light',
      showSuggest: 'true',
      workbenchCssPath:
        '/d/software/Microsoft VS Code/resources/app/out/vs/workbench/workbench.desktop.main.css',
      hashSource: '0',
      get lang() {
        return currentLang;
      },
    },

    // 版本信息
    version: {
      get: function () {
        return '1.2.2';
      },
    },

    // 其他数据
    gradientBrightness: '85',
    gradientDarkness: '15',
    currentColor: '#007ACC',
    env: 'dev',
  };

  /**
   * @param {string} text
   * @returns {string}
   */
  const replace = (text) => {
    return text
      .replace(
        '${Panel.hashSource[HashSource.ProjectName]}',
        mockData.Panel.hashSource[mockData.HashSource.ProjectName]
      )
      .replace(
        '${Panel.hashSource[HashSource.FullPath]}',
        mockData.Panel.hashSource[mockData.HashSource.FullPath]
      )
      .replace(
        '${Panel.hashSource[HashSource.ProjectNameDate]}',
        mockData.Panel.hashSource[mockData.HashSource.ProjectNameDate]
      )
      .replace('${version.get(this)}', '13.34.2')
      .replace(/\$\{([\w\.]+\w+)\}/g, ($0, $1) => {
        const props = $1.split('.');
        let v = mockData.Panel;
        for (const p of props) {
          v = v[p];
          if (v === undefined) {
            break;
          }
        }
        if (v !== undefined) {
          return v;
        }

        v = mockData;
        for (const p of props) {
          v = v[p];
          if (v === undefined) {
            break;
          }
        }
        return v;
      });
  };

  // 模板替换函数
  function replaceTemplates() {
    /**
     *
     * @param {HTMLElement} el
     */
    const visit = (el) => {
      const attrs = el.getAttributeNames();
      for (let i = 0; i < attrs.length; i++) {
        const attr = el.getAttribute(attrs[i]);
        if (attr.includes('$')) {
          el.setAttribute(attrs[i], replace(attr));
        }
      }

      for (let i = 0; i < el.childNodes.length; i++) {
        const node = el.childNodes[i];
        if (node instanceof Text) {
          if (node.textContent.includes('$')) {
            node.textContent = replace(node.textContent);
          }
        }
        if (node instanceof HTMLElement) {
          visit(el.childNodes[i]);
        }
      }
    };

    visit(document.body);

    // const html = document.documentElement.outerHTML;

    // let replacedHtml = html
    //   // 基础替换
    //   .replace(/\$\{Panel\.title\}/g, mockData.Panel.title)
    //   .replace(/\$\{Panel\.loading\}/g, mockData.Panel.loading)
    //   .replace(/\$\{Panel\.description\}/g, mockData.Panel.description)
    //   .replace(/\$\{Consts\.DisplayName\}/g, mockData.Consts.DisplayName)
    //   .replace(/\$\{version\.get\(this\)\}/g, mockData.version.get())
    //   .replace(/\$\{configs\.theme\}/g, mockData.configs.theme)
    //   .replace(/\$\{configs\.showSuggest\}/g, mockData.configs.showSuggest)
    //   .replace(/\$\{configs\.workbenchCssPath\}/g, mockData.configs.workbenchCssPath)
    //   .replace(/\$\{configs\.hashSource\}/g, mockData.configs.hashSource)
    //   .replace(/\$\{configs\.lang\}/g, mockData.configs.lang)
    //   .replace(/\$\{gradientBrightness\}/g, mockData.gradientBrightness)
    //   .replace(/\$\{gradientDarkness\}/g, mockData.gradientDarkness)
    //   .replace(/\$\{currentColor\}/g, mockData.currentColor)
    //   .replace(/\$\{env\}/g, mockData.env)

    //   // Panel 字段
    //   .replace(/\$\{Panel\.showSuggest\.label\}/g, mockData.Panel.showSuggest.label)
    //   .replace(/\$\{Panel\.showSuggest\.description\}/g, mockData.Panel.showSuggest.description)
    //   .replace(/\$\{Panel\.workbenchCssPath\.label\}/g, mockData.Panel.workbenchCssPath.label)
    //   .replace(
    //     /\$\{Panel\.workbenchCssPath\.description\}/g,
    //     mockData.Panel.workbenchCssPath.description
    //   )
    //   .replace(/\$\{Panel\.gradient\.label\}/g, mockData.Panel.gradient.label)
    //   .replace(/\$\{Panel\.gradient\.description\}/g, mockData.Panel.gradient.description)
    //   .replace(/\$\{Panel\.gradient\.empty\}/g, mockData.Panel.gradient.empty)
    //   .replace(/\$\{Panel\.gradientBrightness\.label\}/g, mockData.Panel.gradientBrightness.label)
    //   .replace(
    //     /\$\{Panel\.gradientBrightness\.description\}/g,
    //     mockData.Panel.gradientBrightness.description
    //   )
    //   .replace(/\$\{Panel\.gradientDarkness\.label\}/g, mockData.Panel.gradientDarkness.label)
    //   .replace(
    //     /\$\{Panel\.gradientDarkness\.description\}/g,
    //     mockData.Panel.gradientDarkness.description
    //   )
    //   .replace(/\$\{Panel\.hashSource\.label\}/g, mockData.Panel.hashSource.label)
    //   .replace(/\$\{Panel\.hashSource\.description\}/g, mockData.Panel.hashSource.description)
    //   .replace(/\$\{Panel\.refresh\.label\}/g, mockData.Panel.refresh.label)
    //   .replace(/\$\{Panel\.refresh\.description\}/g, mockData.Panel.refresh.description)
    //   .replace(/\$\{Panel\.refresh\.button\}/g, mockData.Panel.refresh.button)
    //   .replace(/\$\{Panel\.randomColor\.label\}/g, mockData.Panel.randomColor.label)
    //   .replace(/\$\{Panel\.randomColor\.description\}/g, mockData.Panel.randomColor.description)
    //   .replace(/\$\{Panel\.randomColor\.colorSet\}/g, mockData.Panel.randomColor.colorSet)
    //   .replace(/\$\{Panel\.randomColor\.pure\}/g, mockData.Panel.randomColor.pure)
    //   .replace(/\$\{Panel\.randomColor\.specify\}/g, mockData.Panel.randomColor.specify)

    //   // 枚举值
    //   .replace(/\$\{GradientStyle\.BrightCenter\}/g, mockData.GradientStyle.BrightCenter)
    //   .replace(/\$\{GradientStyle\.BrightLeft\}/g, mockData.GradientStyle.BrightLeft)
    //   .replace(/\$\{GradientStyle\.ArcLeft\}/g, mockData.GradientStyle.ArcLeft)
    //   .replace(/\$\{HashSource\.ProjectName\}/g, mockData.HashSource.ProjectName)
    //   .replace(/\$\{HashSource\.FullPath\}/g, mockData.HashSource.FullPath)
    //   .replace(/\$\{HashSource\.ProjectNameDate\}/g, mockData.HashSource.ProjectNameDate)

    //   // 复杂的嵌套引用
    //   .replace(
    //     /\$\{Panel\.gradient\[GradientStyle\.BrightCenter\]\}/g,
    //     mockData.Panel.gradient[mockData.GradientStyle.BrightCenter]
    //   )
    //   .replace(
    //     /\$\{Panel\.gradient\[GradientStyle\.BrightLeft\]\}/g,
    //     mockData.Panel.gradient[mockData.GradientStyle.BrightLeft]
    //   )
    //   .replace(
    //     /\$\{Panel\.gradient\[GradientStyle\.ArcLeft\]\}/g,
    //     mockData.Panel.gradient[mockData.GradientStyle.ArcLeft]
    //   )
    //   .replace(
    //     /\$\{Panel\.hashSource\[HashSource\.ProjectName\]\}/g,
    //     mockData.Panel.hashSource[mockData.HashSource.ProjectName]
    //   )
    //   .replace(
    //     /\$\{Panel\.hashSource\[HashSource\.FullPath\]\}/g,
    //     mockData.Panel.hashSource[mockData.HashSource.FullPath]
    //   )
    //   .replace(
    //     /\$\{Panel\.hashSource\[HashSource\.ProjectNameDate\]\}/g,
    //     mockData.Panel.hashSource[mockData.HashSource.ProjectNameDate]
    //   );

    // // 重写整个文档
    // document.open();
    // document.write(replacedHtml);
    // document.close();
  }

  // 导出调试数据到全局作用域
  window.DebugData = mockData;
  window.TextData = textData;

  // 开始替换
  replaceTemplates();

  console.log('🎨 Template Replacer loaded! Available commands:');
  console.log('  - DebugData: 查看所有测试数据 / View all test data');
  console.log('  - TextData: 查看语言文本数据 / View language text data');
})();
