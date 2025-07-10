class RGBColor {
  r: number;
  g: number;
  b: number;

  constructor(s?: string) {
    if (!s) {
      this.r = 0;
      this.g = 0;
      this.b = 0;
      return;
    }

    const matched = s.match(/\d+/g);
    if (!matched || matched.length !== 3) {
      this.r = 0;
      this.g = 0;
      this.b = 0;
      console.error(
        'Invalid RGB color string:',
        s,
        'expected format "rgb(r, g, b)". Now return black'
      );
      return;
    }

    this.r = parseInt(matched[0], 10);
    this.g = parseInt(matched[1], 10);
    this.b = parseInt(matched[2], 10);
  }

  toHexColor() {
    const r = Math.round(this.r).toString(16);
    const g = Math.round(this.g).toString(16);
    const b = Math.round(this.b).toString(16);
    return `#${r}${g}${b}`;
  }
}

const colorTableLight = [
  'rgb(147, 197, 253)',
  'rgb(128, 203, 196)',
  'rgb(172, 243, 157)',
  'rgb(250, 204, 21)',
  'rgb(253, 151, 31)',
  'rgb(251, 113, 133)',
  'rgb(167, 139, 250)',
  'rgb(147, 197, 253)', // Same as the first color
];

const colorTableDark = [
  'rgb(10, 78, 135)',
  'rgb(0, 100, 100)',
  'rgb(12, 118, 51)',
  'rgb(135, 107, 0)',
  'rgb(135, 87, 36)',
  'rgb(135, 0, 0)',
  'rgb(75, 0, 130)',
  'rgb(10, 78, 135)', // Same as the first color
];

export const getColor = (k: number, isDark: boolean): string => {
  const table = isDark ? colorTableDark : colorTableLight;
  const n = table.length;
  const nto1 = 1 / n;
  const a = Math.floor(k * n);
  const b = a + 1;
  const factor = (k - a * nto1) / nto1;

  const c1 = new RGBColor(table[a]);
  const c2 = new RGBColor(table[b]);
  return interpolate(c1, c2, factor);
};

function interpolate(c1: RGBColor, c2: RGBColor, factor: number): string {
  const c = new RGBColor();
  c.r = Math.floor(c1.r + (c2.r - c1.r) * factor);
  c.g = Math.floor(c1.g + (c2.g - c1.g) * factor);
  c.b = Math.floor(c1.b + (c2.b - c1.b) * factor);

  return c.toHexColor();
}
