import vscode from 'vscode';
import { readdir } from 'node:fs/promises';

import { configs } from './configs';

export const indicateProject = async (cwd: vscode.WorkspaceFolder): Promise<boolean> => {
  const list = await readdir(cwd.uri.fsPath);
  const indicators = configs.projectIndicators;

  for (let i = 0; i < list.length; i++) {
    if (indicators.includes(list[i])) {
      return true;
    }
  }
  return false;
};
