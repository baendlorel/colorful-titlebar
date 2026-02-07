import { basename, isAbsolute, join, resolve } from 'node:path';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';

import { HashSource } from '@/common/consts';
import configs from '@/common/configs';
import RGBA from '@/common/rgba';

/**
 * 根据项目名称获取颜色套组
 * @param fullPath 项目目录，用哈希计算出0~1之间的数字`k`
 * @param colorSet 颜色套组从`config`中获取，没有则使用默认套组
 * @returns
 */
export const getColor = (fullPath: string): RGBA => {
  const hashSource = getHashSource(fullPath);
  const hash = Array.from(createHash('md5').update(hashSource).digest());
  // const k = (hash[0] + hash[1] * 0xff) / 0xffff;
  const k = ((hash[0] << 8) | hash[hash.length - 1]) / 0xffff;
  return getColorByK(k);
};

export const getHashSource = (fullPath: string) => {
  switch (configs.hashSource) {
    case HashSource.ProjectName:
      return basename(fullPath);
    case HashSource.FullPath:
      return fullPath;
    case HashSource.ProjectNameDate:
      return new Date().getDate().toString() + basename(fullPath);
    case HashSource.ProjectNameBranch:
      return buildHashSourceWithBranch(basename(fullPath), fullPath);
    case HashSource.FullPathBranch:
      return buildHashSourceWithBranch(fullPath, fullPath);
    default:
      return basename(fullPath);
  }
};

export const getColorByK = (k: number) => {
  const colorSet = configs.theme === 'dark' ? configs.darkThemeColors : configs.lightThemeColors;
  const n = colorSet.length;
  const a = Math.floor(k * n);
  const b = (a + 1) % n; // 如果不取余数，会在a=length-1时，b=length而提取到undefined，最终解析出黑色
  const factor = (k - a / n) * n;
  const c1 = new RGBA(colorSet[a]);
  const c2 = new RGBA(colorSet[b]);
  return c1.mix(c2, factor);
};

const buildHashSourceWithBranch = (base: string, workspacePath: string) => {
  const branch = getGitBranchName(workspacePath);
  return branch ? `${base}@${branch}` : base;
};

const getGitBranchName = (workspacePath: string): string | null => {
  try {
    const gitEntryPath = join(workspacePath, '.git');
    if (!existsSync(gitEntryPath)) {
      return null;
    }

    let gitDir = gitEntryPath;
    const gitEntryStat = statSync(gitEntryPath);
    if (gitEntryStat.isFile()) {
      const content = readFileSync(gitEntryPath, 'utf8');
      const match = content.match(/gitdir:\s*(.+)\s*/i);
      if (!match) {
        return null;
      }
      const dir = match[1].trim();
      gitDir = isAbsolute(dir) ? dir : resolve(workspacePath, dir);
    }

    const headPath = join(gitDir, 'HEAD');
    if (!existsSync(headPath)) {
      return null;
    }
    const head = readFileSync(headPath, 'utf8').trim();
    if (head.toLowerCase().startsWith('ref:')) {
      const ref = head.replace(/^ref:\s*/i, '').trim();
      return basename(ref);
    }

    if (head.length >= 7) {
      return `detached@${head.slice(0, 8)}`;
    }
  } catch {
    return null;
  }
  return null;
};
