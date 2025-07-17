const [r, g, b] = color
  .replace('#', '')
  .match(/.{2}/g)
  .map((hex) => parseInt(hex, 16));
const brightness = Math.floor((r * 299 + g * 587 + b * 114) / 1000);
picker.style.color = brightness > 128 ? '#000' : '#fff';
