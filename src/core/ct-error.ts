/* eslint-disable @typescript-eslint/no-explicit-any */
import vscode from 'vscode';

export class CTError extends Error {
  static create(message: string, cause?: unknown): CTError {
    const c = cause instanceof Error ? cause.message : String(cause ?? '');
    return new CTError(message, c);
  }

  static readonly cancel = new CTError('', '', true);

  readonly cause: string;
  readonly userCancel: boolean;

  constructor(message: string, cause?: string, userCancel = false) {
    super(message.trim());
    this.name = 'CTError';
    this.cause = cause?.trim() ?? '';
    this.userCancel = userCancel;
  }

  get situation() {
    if (this.cause) {
      return this.message ? `${this.message} - ${this.cause}` : '';
    } else {
      return this.message;
    }
  }
}

/**
 * ! **只允许用在最后的包裹中！不要用在模块里面**
 *
 * 捕捉器，专门捕捉CTError类型的信息并显示提示
 * @param func
 * @returns
 */
export const catcher =
  <T extends (...args: any[]) => void>(func: T) =>
  async (...args: Parameters<T>): Promise<void> => {
    try {
      await func(...args);
      return;
    } catch (error) {
      if (error instanceof CTError) {
        // 用户取消的情形，不报错直接返回
        if (error.userCancel) {
          return;
        }

        const m = error.situation;
        if (m) {
          vscode.window.showErrorMessage(m);
        }
      } else {
        vscode.window.showErrorMessage(String(error));
      }
    }
  };

export const poper =
  <T extends (...args: any[]) => any>(func: T, msg?: string) =>
  async (...args: Parameters<T>): Promise<any> => {
    try {
      const result = func(...args);
      if (result instanceof Promise) {
        return (await result) as ReturnType<T>;
      } else {
        return result;
      }
    } catch (error) {
      if (error instanceof CTError) {
        throw error; // 向顶层弹出
      }
      throw CTError.create(msg ?? '', error);
    }
  };
