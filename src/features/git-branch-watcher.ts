import vscode from 'vscode';

import configs from '@/common/configs';
import { HashSource } from '@/common/consts';
import i18n from '@/common/i18n';
import { getColor, readGitBranchFromGitDir, resolveGitDir } from '@/core/colors';
import style from '@/core/style';

const branchHashSources = new Set<HashSource>([HashSource.ProjectNameBranch, HashSource.FullPathBranch]);

const shouldPromptForBranchChange = () => branchHashSources.has(configs.hashSource);

const promptRecalculate = async (branch: string | null) => {
  const message = i18n.GitBranch.changed(branch ?? undefined);
  const choice = await vscode.window.showInformationMessage(message, i18n.GitBranch.recalculate, i18n.GitBranch.ignore);

  if (choice === i18n.GitBranch.recalculate) {
    const color = getColor(configs.cwd);
    await style.applyColor(color);
  }
};

const bindWatcher = (watcher: vscode.FileSystemWatcher, handler: () => void) => {
  watcher.onDidChange(handler);
  watcher.onDidCreate(handler);
  watcher.onDidDelete(handler);
};

export default function startGitBranchWatcher(context: vscode.ExtensionContext) {
  if (!configs.cwd) {
    return;
  }

  const gitDir = resolveGitDir(configs.cwd);
  if (!gitDir) {
    return;
  }

  let lastBranch = readGitBranchFromGitDir(gitDir);
  const pattern = new vscode.RelativePattern(gitDir, 'HEAD');
  const watcher = vscode.workspace.createFileSystemWatcher(pattern);

  const handleChange = () => {
    const nextBranch = readGitBranchFromGitDir(gitDir);
    if (nextBranch === lastBranch) {
      return;
    }
    lastBranch = nextBranch;

    if (!shouldPromptForBranchChange()) {
      return;
    }

    void promptRecalculate(nextBranch);
  };

  bindWatcher(watcher, handleChange);
  context.subscriptions.push(watcher);
}
