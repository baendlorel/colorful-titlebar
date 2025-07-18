/**
 * @typedef {Object} Config
 * @property {boolean} theme
 * @property {boolean} hashSource
 * @property {string} showSuggest
 * @property {string} workbenchCssPath
 * @property {string} gradientBrightness
 * @property {string} gradientDarkness
 * @property {string} currentColor
 * @property {string} projectIndicators
 * @property {string} lightThemeColors
 * @property {string} darkThemeColors
 */
(() => {
  /** @type {boolean} */
  const isProd = consts.isProd;
  /** @type {string} */
  const lang = consts.lang;
  /** @type {Config} */
  const configs = consts.configs;

  function s(...strings) {
    return ''.concat(...strings);
  }

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
          NumberLimit: (min, max, isInt = true) =>
            s('Please input', isInt ? 'an integer' : 'a number', 'between', min, 'and', max),
        }
      : {
          NumberLimit: (min, max, isInt = true) =>
            s('请输入', min, '到', max, '之间的', isInt ? '整数' : '数'),
        };

  function freeze() {
    freeze = isProd
      ? function () {
          $('.control-error,.control-succ').forEach((el) => (el.textContent = ''));
          $('.control-input').forEach((el) => (el.disabled = true));
          q('#settings').classList.add('freeze');
        }
      : function () {
          $('.control-error,.control-succ').forEach((el) => (el.textContent = ''));
        };
    freeze();
  }

  function unfreeze() {
    setTimeout(() => {
      q('#settings').classList.remove('freeze');
      $('.control-input').forEach((el) => (el.disabled = false));
    }, 200);
  }

  /**
   * # init
   */
  function initSettingsValue() {
    if (isProd) {
      document.getElementById('theme').checked = configs.theme;
      find('showSuggest').checked = configs.showSuggest;
      find('workbenchCssPath').value = configs.workbenchCssPath;
      find('hashSource').value = configs.hashSource;
      find('gradientBrightness').value = configs.gradientBrightness;
      find('gradientDarkness').value = configs.gradientDarkness;
      find('randomColor.specify', 'button').style.backgroundColor = configs.currentColor;
      find('randomColor.specify').value = configs.currentColor;
      find('projectIndicators').value = configs.projectIndicators;
    } else {
      const testScript = document.createElement('script');
      testScript.src = '../../../tests/template-replacer.js';
      document.body.appendChild(testScript);
      document.getElementById('theme').checked = true;
      find('showSuggest').checked = false;
      find('workbenchCssPath').value =
        '/d/work/ddddddddddd/fffffffff/44444444/222222222/44444444/aaa.css';
      find('hashSource').value = '';
      find('gradientBrightness').value = '99';
      find('gradientDarkness').value = '12';
      find('randomColor.specify', 'button').style.backgroundColor = '#EE7ACC';
      find('randomColor.specify').value = '#EE7ACC';
      find('projectIndicators').value =
        '.git;Cargo.toml;README.md;package.json;pom.xml;build.gradle;Makefile';
    }
  }

  function initSettingsChangeEvents() {
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

      // 如果数字类不符合要求，则返回并提示
      if (input.type === 'number') {
        const value = parseInt(input.value, 10);
        let max = parseInt(input.max, 10);
        let min = parseInt(input.min, 10);
        max = Number.isNaN(max) ? Infinity : max;
        min = Number.isNaN(min) ? Infinity : min;

        if (Number.isNaN(value) || value < min || value > max) {
          find(input.name, 'error').innerText = i18n.NumberLimit(min, max, true);
          input.value = input.defaultValue; // 恢复默认值
          return;
        }
        data.value = value;
      } else if (input.type === 'checkbox') {
        data.value = input.checked;
      } else if (input.classList.contains('palette-input')) {
        // 已经在初始化调色盘的地方处理过了
        return;
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
        find(resp.name, 'error').textContent = resp.msg;
        return;
      }

      if (resp.msg) {
        find(resp.name, 'succ').textContent = resp.msg;

        // 如果调整了渐变配置，那么置空渐变选项以备重新选择
        if (resp.name === 'gradientBrightness' || resp.name === 'gradientDarkness') {
          find('gradient').value = '';
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

  function initSimpleInputs() {
    // 初始化所有textarea
    $('textarea').forEach((textarea) => {
      textarea.addEventListener('input', function (event) {
        textarea.style.height = 'auto';
        textarea.style.height = textarea.scrollHeight + 'px';
      });
      textarea.style.height = 'auto';
      textarea.style.height = textarea.scrollHeight + 'px';
    });

    // 初始化单独的颜色选择器
    $('button.color-picker').forEach((picker) => {
      const colorInput = picker.querySelector('input[type="color"]');
      colorInput.addEventListener('input', function () {
        const [r, g, b] = colorInput.value
          .replace('#', '')
          .match(/.{2}/g)
          .map((hex) => parseInt(hex, 16));
        const brightness = Math.floor((r * 299 + g * 587 + b * 114) / 1000);
        picker.style.color = brightness > 128 ? '#000' : '#fff';
        picker.style.backgroundColor = colorInput.value;
        picker.title = colorInput.value;
      });
      picker.addEventListener('click', colorInput.click.bind(colorInput));
      picker.title = colorInput.value;
    });
  }

  /**
   * # 颜色套组编辑器
   */
  function initColorPalette() {
    $('.palette').forEach((palette) => {
      const name = palette.getAttribute('name');
      // 因为color-list的元素是不断变化的，因此事件只能注册在div上
      const colorList = palette.querySelector('.color-list');

      function is(e, className) {
        return e.target.classList.contains(className);
      }

      palette.addEventListener('change', () => onPalettesChange(name));
      colorList.addEventListener('click', (e) => {
        // 如果点击了添加按钮，则添加新颜色
        if (is(e, 'palette-add-color')) {
          const addButton = e.target;
          const color =
            '#' +
            Math.floor(Math.random() * 16777215)
              .toString(16)
              .padStart(6, '0');
          const paletteItem = createPaletteItem(name, color);
          colorList.insertBefore(paletteItem, addButton);
          onPalettesChange(name);
        }
        // 如果点击的是删除按钮，那么删除这个色块
        else if (is(e, 'palette-remove-color')) {
          const removeButton = e.target;
          const paletteItem = removeButton.closest('.palette-item');
          paletteItem.remove();
          onPalettesChange(name);
        }
        // 如果点击的是色块，那么开始编辑它
        else if (is(e, 'palette-item')) {
          const paletteItem = e.target;
          paletteItem.querySelector('.palette-input').click();
        }
      });
    });

    const lightColors = isProd
      ? configs.lightThemeColors.split(';')
      : ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7', '#DDA0DD', '#98D8C8'];
    const darkColors = isProd
      ? configs.darkThemeColors.split(';')
      : ['#E74C3C', '#1ABC9C', '#3498DB', '#2ECC71', '#F39C12', '#9B59B6', '#34495E'];

    renderColorList('lightThemeColors', lightColors);
    renderColorList('darkThemeColors', darkColors);

    // find('themeColors', 'error').textContent = JSON.stringify({ lightColors, darkColors });

    // 添加事件监听器
    $('.color-list').forEach((list) => {
      list.addEventListener('dragstart', handleDragStart);
      list.addEventListener('dragover', handleDragOver);
      list.addEventListener('dragenter', handleDragEnter);
      list.addEventListener('dragleave', handleDragLeave);
      list.addEventListener('drop', handleDrop);
    });
  }

  function renderColorList(name, colors) {
    const palette = document.querySelector(s('.palette[name="', name, '"]'));
    const colorList = palette.querySelector('.color-list');
    const addBtn = palette.querySelector('.palette-add-color');

    // 清空现有颜色项（保留添加按钮）
    palette.querySelectorAll('.palette-item').forEach((item) => item.remove());

    // 添加颜色项
    colors.forEach((color) => {
      const colorItem = createPaletteItem(name, color);
      colorList.insertBefore(colorItem, addBtn);
    });
  }

  function createPaletteItem(name, color) {
    const item = document.createElement('div');
    item.className = 'palette-item';
    item.style.backgroundColor = color;
    item.title = color.toLowerCase();
    item.draggable = true;
    item.setAttribute('belong', name);

    const remover = document.createElement('button');
    remover.type = 'button';
    remover.classList.add('control-input', 'palette-remove-color');
    remover.innerHTML = '&times;';

    const input = document.createElement('input');
    input.type = 'color';
    input.className = 'palette-input';
    input.value = color;
    input.setAttribute('belong', name);

    input.addEventListener('input', function () {
      item.style.backgroundColor = input.value;
      item.title = input.value;
    });

    item.append(remover, input);
    return item;
  }

  function getPaletteColors(name) {
    return $('.palette-input[belong="' + name + '"]').map((input) => input.value);
  }

  // 这里要突出多个palette可能同时变化的情况
  function onPalettesChange(...names) {
    const value = {};
    for (const name of names) {
      value[name] = getPaletteColors(name);
    }
    vspost({ name: 'themeColors', value });
  }

  // 拖拽功能
  let draggedElement = null;

  function handleDragStart(e) {
    if (e.target.classList.contains('palette-item')) {
      draggedElement = e.target;
      e.target.classList.add('dragging');
      e.dataTransfer.effectAllowed = 'move';
    }
  }

  function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }

  function handleDragEnter(e) {
    if (e.target.classList.contains('color-list')) {
      e.target.classList.add('drag-over');
    }
  }

  function handleDragLeave(e) {
    if (e.target.classList.contains('color-list') && !e.target.contains(e.relatedTarget)) {
      e.target.classList.remove('drag-over');
    }
  }

  function handleDrop(e) {
    e.preventDefault();
    const colorList = e.target.closest('.color-list');

    // 只有在拖进color-list里面的时候再处理
    if (colorList && draggedElement) {
      colorList.classList.remove('drag-over');

      const targetItem = e.target.closest('.palette-item');
      const addButton = colorList.querySelector('.palette-add-color');

      if (targetItem && targetItem !== draggedElement) {
        // 插入到目标位置
        const rect = targetItem.getBoundingClientRect();
        const isAfter = e.clientX > rect.left + rect.width / 2;

        if (isAfter) {
          colorList.insertBefore(draggedElement, targetItem.nextSibling);
        } else {
          colorList.insertBefore(draggedElement, targetItem);
        }
      } else if (!targetItem) {
        // 插入到最后（添加按钮前）
        colorList.insertBefore(draggedElement, addButton);
      }

      draggedElement.classList.remove('dragging');

      const palette = colorList.closest('.palette');
      const newBelong = palette.getAttribute('name');
      const belong = draggedElement.getAttribute('belong');
      if (belong === newBelong) {
        onPalettesChange(belong);
      } else {
        // 顺序不能错，必须先设定新belong再触发change，否则change里面获取input的时结果还是旧的
        draggedElement.setAttribute('belong', newBelong);
        const colorInput = draggedElement.querySelector('.palette-input');
        colorInput.setAttribute('belong', newBelong);
        onPalettesChange(belong, newBelong);
      }
    }

    draggedElement = null;
  }

  // 开始初始化
  const body = q('.body');
  initThemeSwitch();
  initColorPalette();
  initSettingsValue();
  initSettingsChangeEvents();
  body.style.display = '';
  body.addEventListener(
    'transitionstart',
    () => {
      // 这样可以让textarea自动计算高度生效，在display:none的情况下无法正确计算高度，渲染出来的高度是初始高度
      initSimpleInputs();
    },
    { once: true }
  );

  setTimeout(() => (body.style.opacity = '1'), 100);
})();
