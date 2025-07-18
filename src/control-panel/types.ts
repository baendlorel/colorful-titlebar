import { Consts } from '@/common/consts';
import { ControlName } from './consts';

export interface HandelResult {
  from: Consts.Name;
  name: ControlName;
  succ: boolean;
  msg: string;
}

export type PostedValue = string | number | boolean;
