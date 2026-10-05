/* Turns a bitmap into a cross-stitch grid: one stitch per opaque cell. */
(function (root) {
  'use strict';

  function pixelsToStitches(data, width, height, cell, alphaMin = 128) {
    const cols = Math.floor(width / cell);
    const rows = Math.floor(height / cell);
    const half = Math.floor(cell / 2);
    const stitches = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cell + half;
        const y = row * cell + half;
        const i = (y * width + x) * 4;
        if (data[i + 3] < alphaMin) continue;
        stitches.push({ col, row, r: data[i], g: data[i + 1], b: data[i + 2] });
      }
    }
    return { cols, rows, stitches };
  }

  const api = { pixelsToStitches };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Stitch = api;
})(globalThis);
