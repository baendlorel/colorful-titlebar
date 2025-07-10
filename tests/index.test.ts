import fs from 'node:fs';

let o = fs.writeFileSync;
fs.writeFileSync = () => {};
