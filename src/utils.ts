import * as crypto from 'crypto';

export function generateColor(fileName: string, brightness: { max: number; min: number }): string {
  const hash = Array.from(crypto.createHash('md5').update(fileName).digest());
  const raw = hash.slice(3);

  // 将0-255映射到指定的亮度范围
  const ratio = brightness.max - brightness.min;
  const colors = raw.map((v) => Math.floor(brightness.min + (v * ratio) / 0xff));

  if (isUniform(1.18, colors)) {
    const i = hash[3] % 3;
    const mainColor = colors[i];
    if (mainColor > 150) {
      colors[i] = Math.floor(mainColor * 1.7);
    } else {
      colors[i] = Math.floor(mainColor * 0.7);
    }
  }

  return `#${colors.map((c) => c.toString(16)).join('')}`;
}

export function isUniform(x: number[]) {
  if (x.length === 0) return true;
  // 计算平均值
  const max = Math.max(...x);
  const min = Math.min(...x);
  const k = max / min;

  let threshold: number;
  if (min >= 120) {
    threshold = 1.35;
  } else if (min >= 60) {
    threshold = 1.5;
  } else if (min >= 30) {
    threshold = 1.8;
  } else {
    threshold = 2.1;
  }

  console.log({ x: x.join(), k, threshold, isUniform: k < threshold });
  return k < threshold;
}
