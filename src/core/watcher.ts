import { existsSync } from 'node:fs';
import { join } from 'node:path';

export class SettingsCreationWatcher {
  private readonly exists: boolean = false;
  private readonly filePath: string;

  constructor(cwd: string) {
    this.filePath = join(cwd, '.vscode', 'settings.json');
    this.exists = existsSync(this.filePath);
  }

  get isNew() {
    const existsNow = existsSync(this.filePath);
    return !this.exists && existsNow;
  }
}
