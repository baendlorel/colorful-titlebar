import { existsSync } from 'node:fs';

export class FileCreationWatcher {
  private readonly exists: boolean = false;
  private readonly filePath: string;

  constructor(path: string) {
    this.filePath = path;
    this.exists = existsSync(path);
  }

  /**
   * 如果创建实例时路径不存在，访问此值是存在了，则此值为`true`
   */
  get isNew() {
    const existsNow = existsSync(this.filePath);
    return !this.exists && existsNow;
  }
}
