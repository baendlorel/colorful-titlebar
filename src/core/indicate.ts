import { readdir } from 'node:fs/promises';

import { configs } from './configs';
import { CTError } from './ct-error';

export const beProject = async () => {
  const list = await readdir(configs.cwd);
  const indicators = configs.projectIndicators;
  for (let i = 0; i < list.length; i++) {
    if (indicators.includes(list[i])) {
      return;
    }
  }
  throw CTError.cancel;
};
