import { HashSource } from './consts';
import RGBA from './rgba';

class Sanitizer {
  colors(rawColors: RGBA[] | string[] | undefined): RGBA[] | null {
    if (Array.isArray(rawColors)) {
      const colors = rawColors.map((color) => {
        if (color instanceof RGBA) {
          return color;
        } else {
          return new RGBA(color);
        }
      });
      if (colors.some((c) => !c.valid)) {
        return null;
      } else {
        return colors;
      }
    } else {
      return null;
    }
  }

  percent(value: number | undefined): number | null {
    if (typeof value === 'number' && value >= 0 && value <= 100 && Number.isSafeInteger(value)) {
      return value;
    } else {
      return null;
    }
  }

  hashSource(value: HashSource): HashSource | null {
    return value === HashSource.ProjectName ||
      value === HashSource.FullPath ||
      value === HashSource.ProjectNameDate
      ? value
      : null;
  }
}

/**
 * 净化器
 * - 用于净化配置数据
 */
const sanitizer = new Sanitizer();
export default sanitizer;
