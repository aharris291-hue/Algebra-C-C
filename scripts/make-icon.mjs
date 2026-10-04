// Draws the app icon (a parabola and axes on a blue rounded square) as a 512x512 PNG.
// electron-builder converts it to the Windows .ico. No external tools needed.
import fs from 'node:fs';
import zlib from 'node:zlib';

const N = 512;
const px = Buffer.alloc(N * N * 4);
const set = (x, y, r, g, b, a) => {
  const i = (y * N + x) * 4;
  const ia = a / 255;
  px[i] = Math.round(r * ia + px[i] * (1 - ia));
  px[i + 1] = Math.round(g * ia + px[i + 1] * (1 - ia));
  px[i + 2] = Math.round(b * ia + px[i + 2] * (1 - ia));
  px[i + 3] = Math.max(px[i + 3], a);
};
const R = 96;
for (let y = 0; y < N; y++)
  for (let x = 0; x < N; x++) {
    const dx = Math.max(R - x, 0, x - (N - 1 - R));
    const dy = Math.max(R - y, 0, y - (N - 1 - R));
    const d = Math.hypot(dx, dy);
    if (d > R) continue;
    const t = (x + y) / (2 * N);
    const a = Math.round(255 * Math.min(1, R - d + 0.5));
    set(x, y, Math.round(53 + (91 - 53) * t), Math.round(87 + (63 - 87) * t), Math.round(212), a);
  }
// distance to curves -> anti-aliased strokes
const stroke = (dist, w, color) => {
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      const d = dist(x, y);
      if (d < w + 1) set(x, y, ...color, Math.round(255 * Math.min(1, w + 0.5 - d) * (px[(y * N + x) * 4 + 3] / 255)));
    }
};
const cx = 256; // vertex x
const vy = 372; // vertex y; the curve opens upward: y = vy - u^2 / 112
const axisY = 372;
stroke((x, y) => (x > 70 && x < 442 ? Math.abs(y - axisY) : 1e9), 4, [190, 205, 255]);
stroke((x, y) => (y > 70 && y < 442 ? Math.abs(x - cx) : 1e9), 4, [190, 205, 255]);
const curve = [];
for (let u = -180; u <= 180; u += 0.5) curve.push([cx + u, vy - (u * u) / 112]);
stroke((x, y) => {
  if (y < 60 || y > vy + 20) return 1e9;
  let best = 1e9;
  for (const [X, Y] of curve) {
    const d = (x - X) ** 2 + (y - Y) ** 2;
    if (d < best) best = d;
  }
  return Math.sqrt(best);
}, 12, [255, 255, 255]);
stroke((x, y) => Math.max(0, Math.hypot(x - cx, y - vy) - 12), 6, [255, 196, 60]);

const raw = Buffer.alloc(N * (N * 4 + 1));
for (let y = 0; y < N; y++) {
  raw[y * (N * 4 + 1)] = 0;
  px.copy(raw, y * (N * 4 + 1) + 1, y * N * 4, (y + 1) * N * 4);
}
const crcTable = Array.from({ length: 256 }, (_, n) => {
  let c = n;
  for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
  return c >>> 0;
});
const crc = (buf) => {
  let c = 0xffffffff;
  for (const b of buf) c = crcTable[(c ^ b) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
};
const chunk = (type, data) => {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length);
  const td = Buffer.concat([Buffer.from(type), data]);
  const c = Buffer.alloc(4);
  c.writeUInt32BE(crc(td));
  return Buffer.concat([len, td, c]);
};
const ihdr = Buffer.alloc(13);
ihdr.writeUInt32BE(N, 0);
ihdr.writeUInt32BE(N, 4);
ihdr[8] = 8;
ihdr[9] = 6;
fs.writeFileSync('build/icon.png', Buffer.concat([Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]), chunk('IHDR', ihdr), chunk('IDAT', zlib.deflateSync(raw, { level: 9 })), chunk('IEND', Buffer.alloc(0))]));
console.log('build/icon.png written');
