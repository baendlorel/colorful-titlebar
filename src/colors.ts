import { createHash } from 'node:crypto';

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');
class RGBColor {
  private r: number = 0;
  private g: number = 0;
  private b: number = 0;
  private a: number = 1;

  constructor(s?: string) {
    if (!s) {
      return;
    }
    s = s.replace(/\s/g, '');
    const matched = s.match(/\d+/g);
    if (!matched || (matched.length !== 3 && matched.length !== 4)) {
      console.error(
        'Invalid RGB color string:',
        s,
        'expected format "#000000, #00000000, rgb(r, g, b), rgba(r, g, b, a), hsl, hsla". Now return black'
      );
      return;
    }

    this.r = parseInt(matched[0], 10);
    this.g = parseInt(matched[1], 10);
    this.b = parseInt(matched[2], 10);
  }

  plain() {
    return {
      r: this.r,
      g: this.g,
      b: this.b,
      a: this.a,
    };
  }

  /**
   * 混合两个颜色，系数代表原本颜色占比
   * - 系数为0代表自己，1代表other，0.5代表各一半
   * @param other 另一个颜色
   * @param factor 系数
   * @returns 新的颜色
   */
  mix(other: RGBColor, factor: number) {
    const c = new RGBColor();
    c.r = Math.floor(this.r + (other.r - this.r) * factor);
    c.g = Math.floor(this.g + (other.g - this.g) * factor);
    c.b = Math.floor(this.b + (other.b - this.b) * factor);
    c.a = Math.floor(this.a + (other.a - this.a) * factor);
    return c;
  }

  /**
   * 将本颜色输出为hex字符串
   */
  toString() {
    const r = toHex(this.r);
    const g = toHex(this.g);
    const b = toHex(this.b);
    const a = toHex(this.a * 255);
    return `#${r}${g}${b}${a}`;
  }

  /**
   * 将本颜色变灰变暗后输出为hex字符串
   * @param intensity 烈度，数值越大越灰越暗
   */
  toGreyDarkenString(intensity?: number) {
    // 这个默认值是测试的结果，灰度比较满意
    intensity = intensity ?? 0.56;

    // intensity 越大，越灰且越暗，建议 0.1 ~ 0.5
    const gray = (this.r + this.g + this.b) / 3;

    const mix = (channel: number) => {
      const darker = channel * (1 - intensity);
      const grayer = gray * intensity;
      return Math.round(darker + grayer);
    };

    const r = toHex(mix(this.r));
    const g = toHex(mix(this.g));
    const b = toHex(mix(this.b));
    const a = toHex(this.a * 255);
    return `#${r}${g}${b}${a}`;
  }
}

interface ColorSet {
  dark: string[];
  light: string[];
}

const defaultColorSet: ColorSet = {
  light: [
    'rgb(147, 197, 253)',
    'rgb(128, 203, 196)',
    'rgb(172, 243, 157)',
    'rgb(250, 204, 21)',
    'rgb(253, 151, 31)',
    'rgb(251, 113, 133)',
    'rgb(167, 139, 250)',
  ],
  dark: [
    'rgb(10, 78, 135)',
    'rgb(0, 100, 100)',
    'rgb(12, 118, 51)',
    'rgb(135, 107, 0)',
    'rgb(135, 87, 36)',
    'rgb(135, 0, 0)',
    'rgb(75, 0, 130)',
  ],
};

/**
 * 根据项目名称获取颜色套组
 * @param name 项目名称，用哈希计算出0~1之间的数字`k`
 * @param isDarkTheme 是否为暗色主题
 * @param colorSet 颜色套组可能从`config`中获取，没有则使用默认套组
 * @returns
 */
export function getColor(name: string, isDarkTheme: boolean, colorSet?: ColorSet): RGBColor {
  const hash = Array.from(createHash('md5').update(name).digest());
  const k = (hash[0] + hash[1] * 0xff) / 0xffff;
  return getColorByK(k, isDarkTheme, colorSet);
}

export function getColorByK(k: number, isDarkTheme: boolean, colorSet?: ColorSet) {
  colorSet = colorSet ?? defaultColorSet;
  const table = (isDarkTheme ? colorSet.dark : colorSet.light).slice();

  // * 最后一个颜色需要再渐变回第一个颜色
  if (table[0] !== table[table.length - 1]) {
    table.push(table[0]);
  }

  const n = table.length;
  const a = Math.floor(k * n);
  const b = a + 1;
  const factor = (k - a / n) * n;
  const c1 = new RGBColor(table[a]);
  const c2 = new RGBColor(table[b]);
  return c1.mix(c2, factor);
}
