import i18n from '@/common/i18n';
import { HandelResult, PostedValue, PostedValueType, PostedValueTypeMap } from './types';

export const expect: <T extends keyof PostedValueTypeMap>(
  result: HandelResult,
  value: PostedValue,
  tp: T
) => asserts value is PostedValueTypeMap[T] = (
  result: HandelResult,
  value: PostedValue,
  tp: keyof PostedValueTypeMap
) => {
  switch (tp) {
    case PostedValueType.String:
      if (typeof value !== 'string') {
        result.succ = false;
        result.msg = i18n.ControlPanel.typeError(value, 'string');
        throw null;
      }
      break;
    case PostedValueType.Number:
      if (typeof value !== 'number') {
        result.succ = false;
        result.msg = i18n.ControlPanel.typeError(value, 'number');
        throw null;
      }
      break;
    case PostedValueType.Boolean:
      if (typeof value !== 'boolean') {
        result.succ = false;
        result.msg = i18n.ControlPanel.typeError(value, 'boolean');
        throw null;
      }
      break;
    case PostedValueType.Object:
      if (typeof value !== 'object' || value === null) {
        result.succ = false;
        result.msg = i18n.ControlPanel.typeError(value, 'object');
        throw null;
      }
      break;
    case PostedValueType.StringArray:
      if (!Array.isArray(value) || value.some((v) => typeof v !== 'string')) {
        result.succ = false;
        result.msg = i18n.ControlPanel.typeError(value, 'string[]');
        throw null;
      }
      break;
  }
};
