export class RGBColor {
  r: number = 0;
  g: number = 0;
  b: number = 0;
  a: number = 1;

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

  toString() {
    const r = Math.round(this.r).toString(16).padStart(2, '0');
    const g = Math.round(this.g).toString(16).padStart(2, '0');
    const b = Math.round(this.b).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
  }

  toGreyDarkenString(intensity = 0.2) {
    // intensity 越大，越灰且越暗，建议 0.1 ~ 0.5
    const gray = (this.r + this.g + this.b) / 3;

    const mix = (channel: number) => {
      const darker = channel * (1 - intensity);
      const grayer = gray * intensity;
      return Math.round(darker + grayer);
    };

    const r = Math.round(mix(this.r)).toString(16).padStart(2, '0');
    const g = Math.round(mix(this.g)).toString(16).padStart(2, '0');
    const b = Math.round(mix(this.b)).toString(16).padStart(2, '0');
    return `#${r}${g}${b}`;
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
    'rgb(147, 197, 253)', // Same as the first color
  ],
  dark: [
    'rgb(10, 78, 135)',
    'rgb(0, 100, 100)',
    'rgb(12, 118, 51)',
    'rgb(135, 107, 0)',
    'rgb(135, 87, 36)',
    'rgb(135, 0, 0)',
    'rgb(75, 0, 130)',
    'rgb(10, 78, 135)', // Same as the first color
  ],
};

/**
 * 获取颜色套组
 * @param k 0~1之间的比例值
 * @param isDark 是否为暗色主题
 * @param colorSet 颜色套组可能从config中获取，没有则使用默认套组
 * @returns
 */
export const getColorSet = (k: number, isDark: boolean, colorSet?: ColorSet): RGBColor => {
  colorSet = colorSet ?? defaultColorSet;
  const table = isDark ? colorSet.dark : colorSet.light;
  const n = table.length;
  const nto1 = 1 / n;
  const a = Math.floor(k * n);
  const b = a + 1;
  const factor = (k - a * nto1) / nto1;

  const c1 = new RGBColor(table[a]);
  const c2 = new RGBColor(table[b]);
  return interpolate(c1, c2, factor);
};

function interpolate(c1: RGBColor, c2: RGBColor, factor: number): RGBColor {
  const c = new RGBColor();
  c.r = Math.floor(c1.r + (c2.r - c1.r) * factor);
  c.g = Math.floor(c1.g + (c2.g - c1.g) * factor);
  c.b = Math.floor(c1.b + (c2.b - c1.b) * factor);

  return c;
}
