(function () {
  /** @type {boolean} */
  const isProd = window.__kskb_consts.isProd;
  /** @type {string} */
  const lang = window.__kskb_consts.lang;
  /** @type {string} */
  const SEP = window.__kskb_consts.separator;
  const configs = window.__kskb_consts.configs;
  const names = window.__kskb_consts.names;

  /**
   * @typedef {Object} HTMLElement
   * @property {function(HTMLElement): HTMLElement} mount - 将当前元素挂载到目标元素上
   * @property {function(string, function(Event): void): HTMLElement} on - 为当前元素添加事件
   */

  HTMLElement.prototype.mount = function (el) {
    el.appendChild(this);
    return this;
  };

  HTMLElement.prototype.on = function (eventName, handler) {
    this.addEventListener(eventName, handler);
    return this;
  };

  function q(...strings) {
    return document.querySelector(strings.join(''));
  }

  /**
   * @param {string} strings
   * @returns {HTMLElement[]}
   */
  function $(...strings) {
    return Array.from(document.querySelectorAll(strings.join('')));
  }

  /**
   * @param  {...any} args
   * @returns {HTMLElement}
   */
  function h(...args) {
    let el = null;
    if (typeof args[0] === 'string') {
      el = document.createElement(args[0]);
    }
    if (typeof args[1] === 'string') {
      el.className = args[1];
    } else if (typeof args[1] === 'object' && args[1] !== null) {
      for (const [key, value] of Object.entries(args[1])) {
        switch (key) {
          case 'class':
          case 'className':
            el.className = value;
            break;
          case 'draggable':
            el.draggable = value;
            break;
          case 'value':
            el.value = value;
            break;
          case 'checked':
            el.checked = value;
            break;
          case 'style':
            if (typeof value === 'object' && value !== null) {
              for (const [styleKey, styleValue] of Object.entries(value)) {
                el.style[styleKey] = styleValue;
              }
            } else if (typeof value === 'string') {
              el.setAttribute(key, value);
            }
            break;
          default:
            el.setAttribute(key, value);
            break;
        }
      }
    }
    if (typeof args[2] === 'string') {
      el.innerHTML = args[2];
    }
    if (el === null) {
      throw new Error('Element creation failed, tag name is required');
    }
    return el;
  }

  /**
   * 用name属性查找元素，可以指定查找类型
   * @param {string} name
   * @param {'input' | 'button' | 'error' | 'succ'} tp
   * @returns {HTMLElement} Found element
   */
  function find(name, tp = 'input') {
    return (find.handler[tp] ?? find.handler.input)(name);
  }
  find.handler = {
    succ: (name) => q('.control-succ[name="', name, '"]'),
    error: (name) => q('.control-error[name="', name, '"]'),
    button: (name) => q('button[name="', name, '"]'),
    input: (name) => q('.control-input[name="', name, '"]'),
  };

  /**
   * @param {{ name: string, value: any }} data
   */
  function vspost(data) {
    const vscode = isProd
      ? acquireVsCodeApi()
      : {
          postMessage(data) {
            console.log('vspost', data);
            unfreeze();
          },
        };
    vspost = function (data) {
      freeze();
      vscode.postMessage({
        from: 'colorful-titlebar',
        ...data,
      });
    };
    vspost(data);
  }

  const i18n =
    lang === 'en'
      ? {
          NumberLimit: function (min, max, isInt = true) {
            const numType = isInt ? 'an integer' : 'a number';
            return ''.concat('Please input', numType, 'between', min, 'and', max);
          },
        }
      : {
          NumberLimit: function (min, max, isInt = true) {
            const numType = isInt ? '整数' : '数';
            return ''.concat('请输入', min, '到', max, '之间的', numType);
          },
        };

  function freeze() {
    $('.control-error,.control-succ').forEach((el) => (el.textContent = ''));
    $('.control-input').forEach((el) => (el.disabled = true));
    $('.palette-input').forEach((el) => (el.disabled = true));
    q('#settings').classList.add('freeze');
  }

  function unfreeze() {
    setTimeout(() => {
      q('#settings').classList.remove('freeze');
      $('.control-input').forEach((el) => (el.disabled = false));
      $('.palette-input').forEach((el) => (el.disabled = false));
    }, 200);
  }

  // #region 初始化函数系列

  /**
   * 初始化设置表单的值
   */
  function initSettingsValue() {
    if (isProd) {
      document.getElementById('theme').checked = configs.theme;
      find(names.showSuggest).checked = configs.showSuggest;
      find(names.workbenchCssPath).value = configs.workbenchCssPath;
      find(names.hashSource).value = configs.hashSource;
      find(names.gradientBrightness).value = configs.gradientBrightness;
      find(names.gradientDarkness).value = configs.gradientDarkness;
      find(names['randomColor.specify'], 'button').style.backgroundColor = configs.currentColor;
      find(names['randomColor.specify']).value = configs.currentColor;
      // 换成换行符是为了编辑textarea更方便
      find(names.projectIndicators).value = configs.projectIndicators.replaceAll(SEP, '\n');
    } else {
      document.getElementById('theme').checked = true;
      find(names.showSuggest).checked = false;
      find(names.workbenchCssPath).value = '/d/work/ddddddddddd/fffffffff/aaa.css';
      find(names.hashSource).value = '';
      find(names.gradientBrightness).value = '99';
      find(names.gradientDarkness).value = '12';
      find(names['randomColor.specify'], 'button').style.backgroundColor = '#EE7ACC';
      find(names['randomColor.specify']).value = '#EE7ACC';
      // 换成换行符是为了编辑textarea更方便
      find(names.projectIndicators).value =
        '.git\nCargo.toml\nREADME.md\npackage.json\npom.xml\nbuild.gradle\nMakefile';
    }
  }

  function initGeneralInputChange() {
    // 要推送到插件的输入变更事件
    q('#settings').addEventListener('change', (event) => {
      /**
       * @type {HTMLInputElement}
       */
      const input = event.target;
      const data = {
        name: input.name,
        value: input.value,
      };

      if (data.name === 'theme') {
        return; // 主题切换事件不需要被post
      }

      // 如果数字类不符合要求，则返回并提示
      if (input.type === 'number') {
        const value = parseInt(input.value, 10);
        let max = parseInt(input.max, 10);
        let min = parseInt(input.min, 10);
        max = Number.isNaN(max) ? Infinity : max;
        min = Number.isNaN(min) ? Infinity : min;

        if (Number.isNaN(value) || value < min || value > max) {
          find(input.name, 'error').innerText = i18n.NumberLimit(min, max, true);
          input.value = min;
          return;
        }
        data.value = value;
      } else if (input.type === 'checkbox') {
        data.value = input.checked;
      } else if (input.classList.contains('palette-input')) {
        // 已经在初始化调色盘的地方处理过了
        return;
      }

      if (input.name === names.projectIndicators) {
        // 特殊处理项目指示器，将换行符转换为分号
        data.value = input.value.replace(/\n/g, SEP).replace(/\s/g, '');
      }

      vspost(data);
    });

    // 要推送到插件的按钮点击事件
    $('button.control-input[name]').forEach((button) => {
      const name = button.getAttribute('name');
      find(name, 'button').onclick = () => vspost({ name, value: null });
    });

    // 插件回馈的结果
    window.addEventListener('message', (event) => {
      const resp = event.data;
      if (resp.from !== 'colorful-titlebar') {
        return;
      }
      unfreeze();

      if (!resp.succ) {
        if (names.isRandomColor(resp.name)) {
          find(names.randomColor, 'error').textContent = resp.msg;
        } else {
          find(resp.name, 'error').textContent = resp.msg;
        }
        return;
      }

      if (resp.msg) {
        if (names.isRandomColor(resp.name)) {
          find(names.randomColor, 'succ').textContent = resp.msg;
        } else {
          find(resp.name, 'succ').textContent = resp.msg;
        }

        // 如果调整了渐变配置，那么置空渐变选项以备重新选择
        if (resp.name === names.gradientBrightness || resp.name === names.gradientDarkness) {
          find(names.gradient).value = '';
        }

        // 如果是几个特定的改颜色的指令，那么更新按钮的背景色
        if (names.refresh === resp.name || names.isRandomColor(resp.name)) {
          if (resp.other?.color) {
            const button = find(names['randomColor.specify'], 'button');
            const colorInput = button.querySelector('input[type="color"]');
            colorInput.updateColor && colorInput.updateColor(resp.other.color);
          }
        }
      }
    });
  }

  function initThemeSwitch() {
    document.getElementById('theme').addEventListener('change', function () {
      const body = document.querySelector('.body');
      const currentTheme = body.getAttribute('theme');
      body.setAttribute('theme', currentTheme === 'dark' ? 'light' : 'dark');
    });
  }

  function initTextarea() {
    const WHEEL_RATIO = 0.1; // 这个值是测试得到的，无标准

    // 初始化所有带有滚动条的textarea
    const drag = {
      scroller: null,
      textarea: null,
      y: 0,
      scrollerY: 0,
      verticalPad: 0,
    };

    /**
     * 移动滚动条的关键函数
     * @param {HTMLTextAreaElement} textarea 文本框
     * @param {HTMLDivElement} scroller 滚动条
     * @param {number} rawY 现在的y坐标，必须算好了给它，它会自己clamp到合适的范围
     * @param {number} pad 滚动条的垂直内边距，通常是3
     */
    const moveScroller = function (textarea, scroller, rawY, pad) {
      const minTop = pad;
      const maxTop = textarea.offsetHeight - scroller.offsetHeight - minTop;
      const y = Math.max(minTop, Math.min(rawY, maxTop));
      scroller.style.top = y + 'px';
      const k = y / maxTop;
      textarea.scrollTop = (textarea.scrollHeight - textarea.offsetHeight) * k;
    };

    $('.textarea-wrapper').forEach((wrapper) => {
      const textarea = wrapper.querySelector('.textarea');
      const scroller = h('div', { class: 'textarea-scoller' }).mount(wrapper);

      textarea.addEventListener('wheel', (event) => {
        event.preventDefault();
        const rawY = scroller.offsetTop + event.deltaY * WHEEL_RATIO;
        moveScroller(textarea, scroller, rawY, drag.verticalPad);
      });

      scroller.addEventListener('mousedown', (event) => {
        event.preventDefault();
        drag.scroller = scroller;
        drag.textarea = textarea;
        drag.y = event.clientY;
        drag.scrollerY = scroller.offsetTop;
      });

      // 根据 scrollHeight 和容器高度动态计算滚动条高度
      // 将 updateScrollerHeight 绑定到 textarea 上，供外部调用
      textarea.updateScrollerHeight = () => {
        if (textarea.scrollHeight > textarea.offsetHeight) {
          // 滚动条高度 = 容器高度 * (容器高度 / 内容高度)
          // 这样当内容越多时，滚动条越小；内容接近容器高度时，滚动条接近容器高度
          const ratio = textarea.offsetHeight / textarea.scrollHeight;
          const minScrollerHeight = 20; // 最小滚动条高度，确保用户能够拖拽
          const maxScrollerHeight = textarea.offsetHeight - drag.verticalPad * 2;
          const calculatedHeight = maxScrollerHeight * ratio;
          const scrollerHeight = Math.max(minScrollerHeight, calculatedHeight);

          scroller.style.height = scrollerHeight + 'px';
        }
      };
    });

    // 探测verticalPad的数值，无法在未绘制的时候敲定
    requestAnimationFrame(() => {
      if (drag.verticalPad === 0) {
        const scoller = q('.textarea-scoller');
        if (scoller) {
          const style = getComputedStyle(scoller);
          drag.verticalPad = parseInt(style.top.replace(/[^\d]/g, ''), 10);
        }
      }
    });

    document.addEventListener('mouseup', () => {
      drag.scroller = null;
      drag.textarea = null;
      drag.y = 0;
      drag.scrollerY = 0;
    });

    document.addEventListener('mousemove', (event) => {
      if (drag.scroller) {
        moveScroller(
          drag.textarea,
          drag.scroller,
          drag.scrollerY + (event.clientY - drag.y),
          drag.verticalPad
        );
      }
    });

    // 初始化所有设定了textarea类的textarea
    $('.textarea').forEach((textarea) => {
      const wrapper = textarea.parentElement;
      const scroller = wrapper.querySelector('.textarea-scoller');
      /**
       * @type {function(): void}
       */
      let autoHeight;
      if (scroller) {
        const maxHeight = parseInt(wrapper.getAttribute('max-height'), 10) || 80;
        autoHeight = function () {
          textarea.style.height = 'auto';
          if (maxHeight > textarea.scrollHeight) {
            scroller.style.display = 'none';
            textarea.style.height = textarea.scrollHeight + 'px';
          } else {
            scroller.style.display = '';
            textarea.style.height = maxHeight + 'px';

            // 更新滚动条高度
            textarea.updateScrollerHeight && textarea.updateScrollerHeight();

            // 文本高度超过最大高度时，需要重新计算滚动条位置
            // 保持当前的滚动比例，但基于新的 scrollHeight

            // heightForScroll代表可以用在滚动的高度，因为textarea自己有高度
            const heightForScroll = textarea.scrollHeight - textarea.offsetHeight;
            const k = textarea.scrollTop / heightForScroll;
            const newScrollTop = heightForScroll * k;

            // 根据新的 scrollTop 计算滚动条应该在的位置
            const maxTop = textarea.offsetHeight - scroller.offsetHeight - drag.verticalPad;
            const rawY = drag.verticalPad + (newScrollTop / heightForScroll) * maxTop;

            // 应用新的滚动条位置
            moveScroller(textarea, scroller, rawY, drag.verticalPad);
          }
        };
      } else {
        autoHeight = function () {
          textarea.style.height = 'auto';
          textarea.style.height = textarea.scrollHeight + 'px';
        };
      }
      textarea.addEventListener('input', autoHeight);
      autoHeight();
    });
  }

  /**
   * 单独的颜色选择器
   */
  function initColorPickers() {
    $('button.color-picker').forEach((picker) => {
      const colorInput = picker.querySelector('input[type="color"]');
      colorInput.updateColor = function (color) {
        const [r, g, b] = color
          .replace('#', '')
          .match(/.{2}/g)
          .map((hex) => parseInt(hex, 16));
        const brightness = Math.floor((r * 299 + g * 587 + b * 114) / 1000);
        picker.style.color = brightness > 128 ? '#000' : '#fff';
        picker.style.backgroundColor = color;
        picker.title = color;
      };
      colorInput.addEventListener('input', function () {
        colorInput.updateColor(colorInput.value);
      });
      picker.addEventListener('click', colorInput.click.bind(colorInput));
      picker.title = colorInput.value;
    });
  }

  // #region 颜色套组编辑器
  function initPalette() {
    /**
     * 创建一个调色板色块
     * @param {string} name 调色板颜色，将会作为belong属性设置在input元素上
     * @param {string} color 颜色值
     * @returns
     */
    const createPaletteItem = function (name, color) {
      const item = h('div', {
        class: 'palette-item',
        style: { backgroundColor: color },
        title: color.toLowerCase(),
        draggable: true,
        belong: name,
      });

      const remover = h(
        'button',
        { type: 'button', class: 'control-input palette-remove-color' },
        '&times;'
      );

      const intput = h('input', {
        type: 'color',
        class: 'palette-input',
        value: color,
        belong: name,
      }).on('input', function () {
        item.style.backgroundColor = this.value;
        item.title = this.value;
      });

      item.append(remover, intput);
      return item;
    };

    /**
     * 支持从一个调色盘拖动颜色到另一个调色盘
     * @param  {...any} paletteNames 调色盘名字
     */
    const onPalettesChange = function (...paletteNames) {
      const value = {};
      for (const name of paletteNames) {
        value[name] = $('.palette-input[belong="' + name + '"]').map((input) => input.value);
      }
      vspost({ name: names.themeColors, value });
    };

    const renderColorList = function (name, colors) {
      const palette = q('.palette[name="', name, '"]');
      const colorList = palette.querySelector('.color-list');
      const addBtn = palette.querySelector('.palette-add-color');

      // 清空现有颜色项（保留添加按钮）
      palette.querySelectorAll('.palette-item').forEach((item) => item.remove());

      // 添加颜色项
      colors.forEach((color) => {
        const colorItem = createPaletteItem(name, color);
        colorList.insertBefore(colorItem, addBtn);
      });
    };

    $('.palette').forEach((palette) => {
      const name = palette.getAttribute('name');
      // 因为color-list的元素是不断变化的，因此事件只能注册在div上
      const colorList = palette.querySelector('.color-list');

      // * 这里捕获的其实是palette-input的change事件
      palette.addEventListener('change', () => onPalettesChange(name));

      // * 新增/删除色块也要手动调用onPalettesChange事件
      colorList.addEventListener('click', (e) => {
        // 如果点击了添加按钮，则添加新颜色
        if (e.target.classList.contains('palette-add-color')) {
          const addButton = e.target;

          // & 特意和另一个位置的算法不同，理论上都是均匀的
          // const set = Array.from({ length: 3 }, () => toHex(Math.random() * 256));
          // return `#${set.join('')}`;
          const color =
            '#' +
            Math.floor(Math.random() * 16777216)
              .toString(16)
              .padStart(6, '0');
          const paletteItem = createPaletteItem(name, color);
          colorList.insertBefore(paletteItem, addButton);
          onPalettesChange(name);
        }
        // 如果点击的是删除按钮，那么删除这个色块
        else if (e.target.classList.contains('palette-remove-color')) {
          const removeButton = e.target;
          const paletteItem = removeButton.closest('.palette-item');
          paletteItem.remove();
          onPalettesChange(name);
        }
        // 如果点击的是色块，那么开始编辑它
        else if (e.target.classList.contains('palette-item')) {
          const paletteInput = e.target.querySelector('.palette-input');
          if (paletteInput.disabled) {
            return; // 如果输入框被禁用，则不处理
          }
          paletteInput.click();
        }
      });
    });

    const lightColors = isProd
      ? configs.lightThemeColors.split(SEP)
      : ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const darkColors = isProd
      ? configs.darkThemeColors.split(SEP)
      : ['#E74C3C', '#1ABC9C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#34495E'];

    renderColorList(names.lightThemeColors, lightColors);
    renderColorList(names.darkThemeColors, darkColors);

    /**
     * @type {HTMLDivElement | null}
     */
    let draggedPaletteItem = null;
    // 添加事件监听器
    $('.color-list').forEach((list) => {
      list.addEventListener('dragstart', function (e) {
        if (e.target.classList.contains('palette-item')) {
          draggedPaletteItem = e.target;
          e.target.classList.add('dragging');
          e.dataTransfer.effectAllowed = 'move';
        }
      });

      list.addEventListener('dragover', function (e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
      });

      list.addEventListener('dragenter', function (e) {
        if (e.target.classList.contains('color-list')) {
          e.target.classList.add('drag-over');
        }
      });

      list.addEventListener('dragleave', function (e) {
        if (e.target.classList.contains('color-list') && !e.target.contains(e.relatedTarget)) {
          e.target.classList.remove('drag-over');
        }
      });

      list.addEventListener('drop', function (e) {
        e.preventDefault();
        const colorList = e.target.closest('.color-list');

        // 只有在拖进color-list里面的时候再处理
        if (!colorList || !draggedPaletteItem) {
          return;
        }

        colorList.classList.remove('drag-over');
        const targetItem = e.target.closest('.palette-item');
        const addButton = colorList.querySelector('.palette-add-color');

        if (targetItem && targetItem !== draggedPaletteItem) {
          // 插入到目标位置
          const rect = targetItem.getBoundingClientRect();
          const isAfter = e.clientX > rect.left + rect.width / 2;

          if (isAfter) {
            colorList.insertBefore(draggedPaletteItem, targetItem.nextSibling);
          } else {
            colorList.insertBefore(draggedPaletteItem, targetItem);
          }
        } else if (!targetItem) {
          // 插入到最后（添加按钮前）
          colorList.insertBefore(draggedPaletteItem, addButton);
        }

        draggedPaletteItem.classList.remove('dragging');

        const palette = colorList.closest('.palette');
        const newBelong = palette.getAttribute('name');
        const belong = draggedPaletteItem.getAttribute('belong');
        if (belong === newBelong) {
          onPalettesChange(belong);
        } else {
          // 顺序不能错，必须先设定新belong再触发change，否则change里面获取input的时结果还是旧的
          draggedPaletteItem.setAttribute('belong', newBelong);
          const colorInput = draggedPaletteItem.querySelector('.palette-input');
          colorInput.setAttribute('belong', newBelong);
          onPalettesChange(belong, newBelong);
        }

        draggedPaletteItem = null;
      });
    });
  }
  // #endregion

  // #endregion

  // 开始初始化
  initThemeSwitch();
  initPalette();
  initColorPickers();
  initSettingsValue();
  initGeneralInputChange();
  q('.body').style.display = '';
  // 这样可以让textarea自动计算高度生效，在display:none的情况下无法正确计算高度，渲染出来的高度是初始高度
  q('.body').addEventListener('transitionstart', initTextarea, { once: true });

  setTimeout(() => (q('.body').style.opacity = '1'), 100);
  window.freeze = freeze;
  window.unfreeze = unfreeze;
})();
