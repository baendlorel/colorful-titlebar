# Colorful Titlebar

[中文版本](README.zh-cn.md) | **English**

A VS Code extension that adds colorful background colors to the title bar based on your project name.

## ✨ Features

- 🎨 **Project-based Colors**: Automatically generates unique colors based on your project
- 🔄 **Multiple Hash Sources**: Choose from project name, full path, or project name + date
- 🌈 **Customizable Color Palettes**: Separate color schemes for light and dark themes
- 📁 **Smart Project Detection**: Configurable file/folder indicators to identify projects
- 🌍 **Multi-language Support**: Full Chinese and English interface
- ✨ **Gradient Overlay Effects**: Add beautiful gradient overlays to enhance the titlebar appearance (requires CSS hacking)

## 🔥 Breaking Changes

**All previous commands have been removed and replaced with a unified Control Panel!** The new control panel provides a more intuitive and user-friendly interface for managing all extension settings. [Learn more about the Control Panel](#control-panel).

![Control Panel](https://raw.githubusercontent.com/baendlorel/colorful-titlebar/refs/heads/main/draft/control-panel.png)

## ⚠️ Important Notice

**The gradient feature modifies VS Code's core CSS files**, which may trigger VS Code's integrity check and show a "corrupted" warning. This is expected behavior and doesn't affect functionality. The extension automatically creates backups before any modifications.

## Installation

1. Clone or download this project
2. Run `pnpm install` in the project directory
3. Run `pnpm build` to compile the extension
4. Press `F5` to test the extension in a new VS Code window

## Control Panel

The extension now features a comprehensive Control Panel that replaces all previous commands with a unified, user-friendly interface.

### Opening the Control Panel

- **Command**: `Ctrl+Shift+P` → "Colorful Titlebar: Open Control Panel"

### Control Panel Features

The Control Panel provides real-time configuration of all extension settings:

#### 🔧 Basic Settings

- **Show Information Messages**: Toggle information pop-ups on/off
- **Workbench CSS Path**: Specify custom path to VS Code's workbench CSS file (for gradient features)

#### 🌈 Color Configuration

- **Hash Source**: Choose how colors are generated:
  - Project Name: Based on folder name only
  - Full Path: Based on complete project path
  - Project Name + Date: Based on project name and current date
- **Color Picker**: Manually select a custom color for the current project

#### ✨ Gradient Settings

- **Gradient Style**: Choose from multiple gradient overlay effects:
  - None: Disable gradient overlays
  - Bright Center: Linear gradient with bright center
  - Bright Left: Radial gradient from left side
  - Arc Left: Alternative radial gradient from left
- **Gradient Brightness**: Control the brightness/opacity of bright areas (0-100%)
- **Gradient Darkness**: Control the darkness/opacity of dark areas (0-100%)

#### 🔄 Actions

- **Refresh Colors**: Force regenerate colors for the current project
- **Apply Settings**: All changes are applied immediately with visual feedback

#### 🎨 Project Indicators Configuration

- **Project Indicators**: Configure the list of files or folders used to identify projects
  - Support multi-line editing with one indicator per line
  - Custom scrollbar: Beautiful scrollbar component with smooth mouse wheel and drag operations
  - Dynamic scrollbar height: Scrollbar size reflects content ratio

#### 🌈 Theme Palette Management

- **Light/Dark Theme Palette**: Configure color schemes for light themes
  - Support drag-and-drop to reorder colors
  - Click color blocks to edit
  - Support multiple color formats: `#RRGGBB`, `#RRGGBBAA`, `rgb()`, `rgba()`
  - Dynamically add and remove colors
  - Support cross-palette drag-and-drop color movement

### Real-time Feedback

The Control Panel provides:

- **Live Preview**: Changes are applied immediately
- **Error Handling**: Clear error messages for invalid inputs
- **Success Notifications**: Confirmation when settings are successfully applied
- **Theme Adaptation**: Control panel automatically adapts to VS Code's current theme

## 🚀 Usage

### Quick Start

1. Open any project in VS Code
2. The extension automatically detects projects and applies colors
3. Use `Ctrl+Shift+P` → "Colorful Titlebar: Open Control Panel" to customize settings
4. Enjoy your colorful titlebar!

### Gradient Styles

- **Bright Center**: Linear gradient with a bright center effect

  ![Bright Center Effect](https://raw.githubusercontent.com/baendlorel/colorful-titlebar/refs/heads/main/draft/light-center.png)

- **Bright Left**: Radial gradient with a bright effect from the left side

  ![Bright Left Effect](https://raw.githubusercontent.com/baendlorel/colorful-titlebar/refs/heads/main/draft/light-left.png)

- **Arc Left**: Radial gradient with a bright effect from the left side 2

  ![Arc Left Effect](https://raw.githubusercontent.com/baendlorel/colorful-titlebar/refs/heads/main/draft/arc-left.png)

- **Related Configs**: Through `colorful-titlebar.gradientBrightness` and `colorful-titlebar.gradientDarkness`, we can control the brightness and darkness of the gradient overlays.

### Requirements

The extension requires VS Code's title bar style to be set to "custom". If not configured, the extension will prompt you to change it automatically.

**For gradient features**: The extension needs to modify VS Code's core CSS files. It will automatically detect your VS Code installation or allow you to specify a custom path.

## ⚙️ Configuration

Open VS Code settings and configure the following options:

### `colorful-titlebar.enabled`

- **Type**: boolean
- **Default**: `true`
- **Description**: Enable or disable the colorful titlebar effect

### `colorful-titlebar.hashSource`

- **Type**: string
- **Default**: `"projectName"`
- **Options**:
  - `"projectName"`: Generate color from project folder name only
  - `"fullPath"`: Generate color from complete project path
  - `"projectNameDate"`: Generate color from project name and current date
- **Description**: Source for generating hash-based colors

### `colorful-titlebar.lightThemeColors`

- **Type**: array of strings
- **Default**: `["rgb(167, 139, 250)", "rgb(147, 197, 253)", ...]`
- **Description**: Color palette for light themes
- **Supports**: `#RRGGBB`, `#RRGGBBAA`, `rgb()`, `rgba()`

### `colorful-titlebar.darkThemeColors`

- **Type**: array of strings
- **Default**: `["rgb(68, 0, 116)", "rgb(0, 47, 85)", ...]`
- **Description**: Color palette for dark themes
- **Supports**: `#RRGGBB`, `#RRGGBBAA`, `rgb()`, `rgba()`

### `colorful-titlebar.projectIndicators`

- **Type**: array of strings
- **Default**: `[".git", "package.json", "pom.xml", ...]`
- **Description**: If your workspace contains one item of this array, we shall consider it as a **project** and generate an unique color for the titlebar.

### `colorful-titlebar.workbenchCssPath`

- **Type**: string
- **Default**: `""`
- **Description**: Custom path to the workbench.desktop.main.css file.

### `colorful-titlebar.gradientBrightness`

- **Type**: number
- **Default**: `0.72`
- **Range**: `0.0` to `1.0`
- **Description**: Controls the brightness/opacity of the bright areas in gradient overlays. Higher values create more prominent bright effects.

### `colorful-titlebar.gradientDarkness`

- **Type**: number
- **Default**: `0.26`
- **Range**: `0.0` to `1.0`
- **Description**: Controls the darkness/opacity of the dark areas in gradient overlays. Higher values create more prominent shadow effects.

### `colorful-titlebar.showInfoPop`

- **Type**: boolean
- **Default**: `true`
- **Description**: Whether to show information messages

## 🔧 How It Works

### Basic Color Application

1. **Project Detection**: Checks for configured indicator files (like `.git`, `package.json`)
2. **Color Generation**: Creates a hash from the selected source (project name/path/date)
3. **Color Selection**: Maps the hash to a color from your configured palette
4. **Theme Awareness**: Uses different color palettes for light and dark themes
5. **Titlebar Update**: Applies the color to VS Code's titlebar background

### Gradient Enhancement (Advanced)

1. **CSS File Detection**: Locates VS Code's `workbench.desktop.main.css` file
2. **Automatic Backup**: Creates a backup before any modifications
3. **CSS Injection**: Adds gradient overlay styles with a unique token
4. **Style Selection**: Choose from different gradient effects (bright center, bright left)
5. **Easy Restoration**: Remove gradients with the disable command, which restores from backup

## 📋 Requirements

- VS Code 1.74.0 or higher
- Title bar style must be set to "custom" (extension will help you configure this)

## ⚠️ Notes

- The extension modifies VS Code's workspace settings for basic color functionality
- **Gradient features modify VS Code's core CSS files** and may trigger integrity warnings
- Different projects will have consistent colors based on your hash source choice
- Colors automatically adapt to your current theme (light/dark)
- Gradient overlays are automatically backed up and can be safely removed
- VS Code may show "corrupted" warnings when using gradient features - this is expected and safe

## 📄 License

MIT License - see [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Issues and Pull Requests are welcome!

## 📝 Changelog

### 1.4.0

- **🔐 Configuration Encryption & Security**

  - **Unified Configuration Storage**: All settings now consolidated into a single encrypted field `akasha`
    - Encryption algorithm: **ChaCha20**
    - Configuration data compressed from previous plaintext 1100+ characters to about 430 characters
  - **Data Serialization**: Efficient value-only array serialization system replacing key-value pairs
  - **Configuration Sanitization**: Enhanced data validation with comprehensive sanitizer functions

- **🎨 UI/UX Improvements**

  - **Template System Enhancement**: Migrated from `${}` to `{{}}` template syntax with comprehensive template compiler
  - **Type Safety**: Improved TypeScript integration with better type assertions using `expect` functions
  - **Theme Consistency**: Fixed color picker foreground color updates and palette synchronization issues

- **🐛 Critical Bug Fixes**

  - **HTML Enum Handling**: Fixed issue where auto-incremented enum values became strings in HTML context
  - **Gradient Style Management**: Improved CSS injection with token-based line scanning instead of regex

- **🛠️ Architecture Improvements**

  - **Build System Enhancement**: Implemented `__IS_DEV__` macro for development/production builds using Rollup replace plugin
  - **Gradient System Refactor**: Centralized gradient functionality through main index rather than direct hacker exports
  - **Pure Functions**: Introduced `purge()` function as a pure function for CSS token line removal
  - **Error Handling**: Comprehensive error handling for encryption/decryption operations

- **🧹 Code Quality & Maintenance**

  - **Template Compiler**: 120+ template variables with systematic naming conventions
  - **Documentation**: Enhanced JSDoc comments and code documentation throughout
  - **Test Environment**: Improved development testing with proper environment detection

### 1.3.0

- **🎯 UI/UX Major Improvements**

  - **Color Palette Management**: Added comprehensive palette management functionality
    - Configure color palettes for light and dark themes directly in the control panel
    - Provided default light and dark color palettes
  - **Custom Textarea with Scrollbar**: Hand-crafted custom scrollbar since VS Code doesn't support custom scrollbar styling!
    - Beautiful custom scrollbar components for editing project indicators configuration
    - Dynamic scrollbar height reflects content ratio - larger for less content, smaller for more content
    - Enhanced mouse wheel and drag interactions for better user control
  - **Visual Feedback**: Improved loading states with animated SVG spinners
  - **Theme Consistency**: Enhanced theme switching with better visual continuity
  - **Responsive Design**: Better layout adaptation for different screen sizes

- **🛠️ Code Quality Enhancements**

  - **TypeScript Integration**: Added comprehensive JSDoc type annotations throughout the codebase
  - **HTMLElement Extensions**: Properly typed custom HTMLElement prototype extensions (mount method)
  - **Modular Architecture**: Reorganized code structure with better separation of concerns
  - **Error Handling**: Improved error handling with better user feedback

- **🚀 Performance Optimizations**

  - **Memory Management**: Optimized DOM manipulation and event handling
  - **Efficient Rendering**: Reduced unnecessary re-renders in control panel
  - **Better Resource Usage**: Improved cleanup of event listeners and DOM references

- **🧪 Developer Experience**
  - **Better Debugging**: Enhanced logging and error reporting
  - **Code Documentation**: Comprehensive function and method documentation
  - **Maintainable Code**: Cleaner code structure with better naming conventions

### 1.2.2

- **🔧 Bug Fixes**

  - Automatic textarea height adjustment
  - Fixed issue where version was incorrectly detected as new every time
  - Fixed upgrade notification displaying function content instead of message

- **🎨 New Random Color Feature**

  - Random from palette: Pick random colors from configured color palette
  - Pure random colors: Generate completely random RGB colors
  - Manual color picker: Specify custom colors with visual picker

- **🎯 UI/UX Enhancements**:

  - Redesigned color picker with palette emoji button style
  - Widened control panel for better layout### 1.2.1

### 1.2.1

- **🔧 Bug Fixes**: Fixed control panel not responding to configuration changes
- **⚡ Performance**: Added version management and update event detection
- **🛡️ Safety**: Prevented multiple control panel instances from opening simultaneously
- **🎨 UI Improvements**: Enhanced control panel styling with colorful title effects
- **📝 UX Enhancement**: Improved textarea auto-resize for CSS path configuration
- **🔄 Config Management**: Fixed global configuration updates not refreshing properly
- **📊 Feedback**: Added color output information when recalculating colors

### 1.2.0

- **🔥 Breaking Change**: Replaced all commands with unified Control Panel
- **New Control Panel**: Intuitive web-based interface for all settings
- **Enhanced Color Picker**: Manual color selection with live preview
- **Improved User Experience**: Better error handling and success feedback
- Fixed issue where gradient enabling was triggered regardless of blocking pop-up information

### 1.1.0

- Added gradient brightness and darkness configuration options
- Multiple hash source selection - supports project name, full path, project name + date
- Code structure adjustments, experimented with various error handling approaches but ultimately chose simplified approach

### 1.0.0

- Beautiful gradient overlay effects. Inspired by Idea

### 0.0.1

- Initial release
- Project-based color generation
- Multi-language support
- Customizable color palettes
- Smart project detection
