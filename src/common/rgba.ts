const hslaToRgba = (h: number, s: number, l: number): [number, number, number] => {
  const C = (1 - Math.abs(2 * l - 1)) * s;
  const X = C * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - C / 2;

  let r1 = 0,
    g1 = 0,
    b1 = 0;

  if (h < 60) {
    [r1, g1, b1] = [C, X, 0];
  } else if (h < 120) {
    [r1, g1, b1] = [X, C, 0];
  } else if (h < 180) {
    [r1, g1, b1] = [0, C, X];
  } else if (h < 240) {
    [r1, g1, b1] = [0, X, C];
  } else if (h < 300) {
    [r1, g1, b1] = [X, 0, C];
  } else {
    [r1, g1, b1] = [C, 0, X];
  }

  // 转换到 [0, 255] 并取整
  return [Math.round((r1 + m) * 255), Math.round((g1 + m) * 255), Math.round((b1 + m) * 255)];
};

const parseRgba = (s: string | undefined) => {
  s = s?.replace(/\s/g, '') || '';

  const hexMatch = s.match(/^#([0-9a-fA-F]{6})([0-9a-fA-F]{2})?$/);
  if (hexMatch) {
    const hex = hexMatch[1];
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);
    const a = hexMatch[2] ? parseInt(hexMatch[2], 16) / 255 : 1;
    return [r, g, b, a];
  }

  const rgbaMatch = s.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (rgbaMatch) {
    const r = parseInt(rgbaMatch[1], 10);
    const g = parseInt(rgbaMatch[2], 10);
    const b = parseInt(rgbaMatch[3], 10);
    const a = rgbaMatch[4] ? parseFloat(rgbaMatch[4]) : 1;
    return [r, g, b, a];
  }

  const hslaMatch = s.match(/hsla?\((\d+),\s*(\d+)%?,\s*(\d+)%?(?:,\s*([\d.]+))?\)/);
  if (hslaMatch) {
    const h = parseInt(hslaMatch[1], 10);
    const s = parseInt(hslaMatch[2], 10) / 100;
    const l = parseInt(hslaMatch[3], 10) / 100;
    const a = hslaMatch[4] ? parseFloat(hslaMatch[4]) : 1;
    const [r, g, b] = hslaToRgba(h, s, l);
    return [r, g, b, a];
  }

  return [0, 0, 0, 1];
};

const toHex = (n: number) => Math.round(n).toString(16).padStart(2, '0');

/**
 * RGBColor 类用于处理 RGB 颜色。
 * 支持从字符串解析颜色，混合颜色，转换为 hex 字符串等功能。
 */
export default class RGBA {
  private r = 0;
  private g = 0;
  private b = 0;
  private a = 1;

  constructor(s?: string) {
    const parsed = parseRgba(s);
    this.r = parsed[0];
    this.g = parsed[1];
    this.b = parsed[2];
    this.a = parsed[3];
  }

  get brightness() {
    return Math.floor((this.r * 299 + this.g * 587 + this.b * 114) / 1000);
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
  mix(other: RGBA, factor: number) {
    const c = new RGBA();
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
