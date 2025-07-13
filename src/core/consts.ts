export const enum Consts {
  MainCssFileName = 'workbench.desktop.main.css',
}

export const enum TitleBarStyle {
  Expected = 'custom',
  Section = 'window.titleBarStyle',
  WorkbenchSection = 'workbench.colorCustomizations',
  ActiveBg = 'titleBar.activeBackground',
  InactiveBg = 'titleBar.inactiveBackground',
}

export const enum SettingsJson {
  FileName = 'settings.json',
  Dir = '.vscode',
  MinimumContent = `{"workbench.colorCustomizations":{}}`,
}

export const enum Commands {
  EnableGradient = 'colorful-titlebar.enableGradient',
  DisableGradient = 'colorful-titlebar.disableGradient',
}

export class Result<T = null> {
  /**
   * Creates a successful Result with a message.
   * @param msg The message for the result.
   */
  static succ(msg: string): Result<null>;
  /**
   * Creates a successful Result with data and a message.
   * @param data The data for the result.
   * @param msg The message for the result.
   */
  static succ<T = null>(data: T, msg: string): Result<T>;
  static succ<T = null>(...args: [string] | [T, string]): Result<T> {
    switch (args.length) {
      case 1:
        return new Result<T>(true, null as T, args[0] as string);
      case 2:
        return new Result<T>(true, args[0] as T, args[1] as string);
    }
  }

  static resolve<T = null>(data: T): Result<T> {
    return new Result<T>(true, data, '');
  }

  /**
   * Creates a failed Result with a message.
   */
  static fail(): Result<null>;

  /**
   * Creates a failed Result with a message.
   * @param msg The message for the result.
   */
  static fail(msg: string): Result<null>;
  /**
   * Creates a failed Result with data and a message.
   * @param data The data for the result.
   * @param msg The message for the result.
   */
  static fail<T = null>(data: T, msg: string): Result<T>;
  static fail<T = null>(...args: [] | [string] | [T, string]): Result<T> {
    switch (args.length) {
      case 0:
        return new Result<T>(false, null as T, '');
      case 1:
        return new Result<T>(false, null as T, args[0] as string);
      case 2:
        return new Result<T>(false, args[0] as T, args[1] as string);
    }
  }

  succ: boolean;
  data: T;
  msg: string;
  constructor(...args: [boolean, T, string] | [T, string] | [string]) {
    switch (args.length) {
      case 1: {
        this.succ = true;
        this.data = null as T;
        this.msg = args[0];
        break;
      }
      case 2: {
        this.succ = true;
        this.data = args[0];
        this.msg = args[1];
        break;
      }
      case 3: {
        this.succ = args[0];
        this.data = args[1];
        this.msg = args[2];
        break;
      }
    }
  }
}

export type PromiseResult<T = null> = Promise<Result<T>>;
