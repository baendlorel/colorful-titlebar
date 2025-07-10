# Idea Gradient Titlebar

一个为 VS Code 添加渐变标题栏效果的扩展插件。

## 功能特性

- ✨ 为 VS Code 标题栏添加美丽的渐变效果
- 🎨 支持自定义渐变颜色
- 📐 支持多种渐变方向（水平、垂直、对角线）
- 🔧 可调节透明度
- ⚡ 简单易用的配置界面

## 安装

1. 克隆或下载此项目
2. 在项目目录中运行 `npm install`
3. 运行 `npm run compile` 编译 TypeScript 代码
4. 按 `F5` 在新的 VS Code 窗口中测试扩展

## 使用方法

### 启用渐变标题栏

- 打开命令面板 (`Ctrl+Shift+P`)
- 输入 "Enable Gradient Titlebar" 并选择

### 禁用渐变标题栏

- 打开命令面板 (`Ctrl+Shift+P`)
- 输入 "Disable Gradient Titlebar" 并选择

### 配置渐变效果

- 打开命令面板 (`Ctrl+Shift+P`)
- 输入 "Configure Gradient Titlebar" 并选择
- 按照提示配置渐变方向和透明度

## 配置选项

在 VS Code 设置中，您可以配置以下选项：

- `idea-gradient-titlebar.enabled`: 启用或禁用渐变标题栏效果
- `idea-gradient-titlebar.gradientColors`: 渐变颜色数组
- `idea-gradient-titlebar.direction`: 渐变方向（horizontal、vertical、diagonal）
- `idea-gradient-titlebar.opacity`: 透明度（0-1）

## 开发

### 构建项目

```bash
npm run compile
```

### 监听模式

```bash
npm run watch
```

### 运行 ESLint

```bash
npm run lint
```

## 注意事项

- 此扩展需要修改 VS Code 的 CSS 文件，因此需要重启 VS Code 才能看到效果
- 在某些情况下，VS Code 可能会显示"不受支持"的警告，这是正常的
- 如果遇到问题，可以使用禁用命令来恢复原始状态

## 许可证

MIT License - 查看 [LICENSE](LICENSE) 文件了解详情。

## 贡献

欢迎提交 Issue 和 Pull Request！

## 更新日志

### 0.0.1

- 初始版本
- 基本渐变标题栏功能
- 配置选项
- 启用/禁用命令
