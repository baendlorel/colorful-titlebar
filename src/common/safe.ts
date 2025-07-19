import RGBA from './rgba';

class Safe {
  colors(rawColors: RGBA[] | undefined): RGBA[] | null {
    if (Array.isArray(rawColors)) {
      const colors = rawColors.map((color) => new RGBA(String(color)));
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
}
const safe = new Safe();
export default safe;
