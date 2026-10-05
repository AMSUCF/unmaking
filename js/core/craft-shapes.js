/* Seeded shapes for the paper and zine crafts. */
(function (root) {
  'use strict';
  const Random = (typeof module === 'object' && module.exports) ? require('./random.js') : root.Random;

  const RANSOM_FONTS = ['r-mono', 'r-type', 'r-hand', 'r-pixel', 'r-serif', 'r-courier'];
  const RANSOM_SKINS = ['paper', 'ink', 'yellow', 'pink', 'lime'];
  const pt = (x, y) => `${x.toFixed(2)}% ${y.toFixed(2)}%`;

  function tornEdgePolygon(seed, teeth = 24, depth = 1.6) {
    const rnd = Random.mulberry32(seed);
    const p = [];
    for (let i = 0; i < teeth; i++) p.push(pt((i / teeth) * 100, rnd() * depth));
    for (let i = 0; i < teeth; i++) p.push(pt(100 - rnd() * depth, (i / teeth) * 100));
    for (let i = 0; i < teeth; i++) p.push(pt(100 - (i / teeth) * 100, 100 - rnd() * depth));
    for (let i = 0; i < teeth; i++) p.push(pt(rnd() * depth, 100 - (i / teeth) * 100));
    return `polygon(${p.join(', ')})`;
  }

  function tornSplit(seed, teeth = 18, amp = 3) {
    const rnd = Random.mulberry32(seed);
    const tear = [];
    for (let i = 0; i <= teeth; i++) tear.push(pt(50 + (rnd() - 0.5) * 2 * amp, (i / teeth) * 100));
    return {
      left: `polygon(${[pt(0, 0), ...tear, pt(0, 100)].join(', ')})`,
      right: `polygon(${[pt(100, 0), ...tear, pt(100, 100)].join(', ')})`,
    };
  }

  function ransomLetters(text, seed) {
    const rnd = Random.mulberry32(seed);
    const pick = (list) => list[Math.floor(rnd() * list.length)];
    return [...String(text)].map((ch) => {
      if (/\s/.test(ch)) return { ch: ' ', space: true };
      return {
        ch,
        font: pick(RANSOM_FONTS),
        skin: pick(RANSOM_SKINS),
        rotate: Math.round((rnd() * 16 - 8) * 10) / 10,
        scale: Math.round((0.9 + rnd() * 0.25) * 100) / 100,
      };
    });
  }

  const api = { RANSOM_FONTS, RANSOM_SKINS, tornEdgePolygon, tornSplit, ransomLetters };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CraftShapes = api;
})(globalThis);
