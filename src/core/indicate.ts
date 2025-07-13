import { readdir } from 'node:fs/promises';

import { configs } from './configs';

export const indicateProject = async (): Promise<boolean> => {
  const list = await readdir(configs.cwd);
  const indicators = configs.projectIndicators;

  for (let i = 0; i < list.length; i++) {
    if (indicators.includes(list[i])) {
      return true;
    }
  }
  return false;
};
