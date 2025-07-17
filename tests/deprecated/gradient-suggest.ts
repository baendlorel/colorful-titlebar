  async suggest() {
    // 如果已经记载了主css路径并嵌入了样式，则无需弹出建议
    const cssPath = configs.workbenchCssPath;
    if (configs.workbenchCssPath) {
      const content = await readFile(cssPath, 'utf8');
      if (content.includes(Css.Token)) {
        return;
      }
    }

    // 不建议的话只会阻止suggestInfo弹窗，要手动返回
    if (!configs.showSuggest) {
      return;
    }

    const now = await popSuggest(this.Enable.suggest.msg, this.Enable.suggest.yes);
    if (now !== this.Enable.suggest.yes) {
      return;
    }
    await this.enable();
  }