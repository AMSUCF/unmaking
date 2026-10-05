'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Stitch = require('../js/core/stitch.js');

function image(w, h) { return new Uint8ClampedArray(w * h * 4); }
function setPx(data, w, x, y, rgba) { data.set(rgba, (y * w + x) * 4); }

test('samples the centre of each cell and skips transparent cells', () => {
  const d = image(4, 4);
  setPx(d, 4, 1, 1, [255, 0, 0, 255]);   // centre of cell (0,0)
  setPx(d, 4, 3, 3, [0, 0, 255, 50]);    // centre of cell (1,1), too transparent
  const out = Stitch.pixelsToStitches(d, 4, 4, 2);
  assert.equal(out.cols, 2);
  assert.equal(out.rows, 2);
  assert.deepEqual(out.stitches, [{ col: 0, row: 0, r: 255, g: 0, b: 0 }]);
});

test('ignores partial cells at the right and bottom edges', () => {
  const out = Stitch.pixelsToStitches(image(5, 5), 5, 5, 2);
  assert.equal(out.cols, 2);
  assert.equal(out.rows, 2);
});

test('alphaMin is configurable', () => {
  const d = image(2, 2);
  setPx(d, 2, 1, 1, [0, 0, 0, 100]);
  assert.equal(Stitch.pixelsToStitches(d, 2, 2, 2).stitches.length, 0);
  assert.equal(Stitch.pixelsToStitches(d, 2, 2, 2, 90).stitches.length, 1);
});
