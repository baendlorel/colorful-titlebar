import { Consts } from '@/common/consts';
import { Controls } from './consts';

export interface HandelResult {
  from: Consts.Name;
  name: Controls;
  succ: boolean;
  msg: string;
  other: Record<string, any>;
}

export type PostedValue = string | number | boolean | Record<string, any>;
