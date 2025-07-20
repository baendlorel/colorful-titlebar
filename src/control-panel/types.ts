import { Consts } from '@/common/consts';
import { Controls } from './consts';

export interface HandelResult {
  from: Consts.Name;
  name: Controls;
  succ: boolean;
  msg: string;
  other: Record<string, any>;
}

export type PostedValue = string | number | boolean | Record<string, any> | string[];

export const enum PostedValueType {
  String,
  Number,
  Boolean,
  Object,
  StringArray,
}

export interface PostedValueTypeMap {
  [PostedValueType.String]: string;
  [PostedValueType.Number]: number;
  [PostedValueType.Boolean]: boolean;
  [PostedValueType.Object]: Record<string, any>;
  [PostedValueType.StringArray]: string[];
}
