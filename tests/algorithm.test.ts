import { createHash } from 'node:crypto';

const o = {} as any;
for (let i = 0; i < 1e6; i++) {
  const a = Array.from(createHash('md5').update(i.toString()).digest());
  if (i < 3) {
    console.log('a.len', a.length);
  }
  const t = a[0];
  if (typeof o[t] !== 'number') {
    o[t] = 1;
  } else {
    o[t]++;
  }
}
console.log(o);
