import { readdir } from 'node:fs/promises';

import { configs } from './configs';
import { PromiseResult, Result } from './consts';

export const beProject = async (): PromiseResult => {
  const list = await readdir(configs.cwd);
  const indicators = configs.projectIndicators;

  for (let i = 0; i < list.length; i++) {
    if (indicators.includes(list[i])) {
      return Result.succ();
    }
  }
  return Result.fail();
};
