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
    } catch (error) {
      if (error instanceof Error) {
        vscode.window.showErrorMessage(error.message + error.stack);
      } else {
        vscode.window.showErrorMessage(String(error));
      }
    }
  };
