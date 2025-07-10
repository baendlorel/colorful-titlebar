import * as crypto from 'crypto';
import { getColorSet, RGBColor } from './colors';

export function generateColor(fileName: string, isDark: boolean): RGBColor {
  const hash = Array.from(crypto.createHash('md5').update(fileName).digest());
  // 将0-255映射到指定的亮度范围
  const k = (hash[0] + hash[1] * 0xff) / 0xffff;

  return getColorSet(k, isDark);
}
