import { existsSync } from 'node:fs';
import { join } from 'node:path';

export class FileCreationWatcher {
  private readonly exists: boolean = false;
  private readonly filePath: string;

  constructor(cwd: string) {
    this.filePath = join(cwd, '.vscode', 'settings.json');
    this.exists = existsSync(this.filePath);
  }

  /**
   * 如果创建实例时路径不存在，访问此值是存在了，则此值为`true`
   */
  get isNew() {
    const existsNow = existsSync(this.filePath);
    return !this.exists && existsNow;
  }
}
