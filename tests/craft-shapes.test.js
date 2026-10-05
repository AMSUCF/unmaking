'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const CS = require('../js/core/craft-shapes.js');

const points = (poly) => poly.slice('polygon('.length, -1).split(',').map((p) => p.trim().split(' ').map(parseFloat));

test('tornEdgePolygon is deterministic, bounded, and has 4*teeth points', () => {
  const p = CS.tornEdgePolygon(11, 10, 2);
  assert.ok(p.startsWith('polygon('));
  assert.equal(p, CS.tornEdgePolygon(11, 10, 2));
  assert.notEqual(p, CS.tornEdgePolygon(12, 10, 2));
  const pts = points(p);
  assert.equal(pts.length, 40);
  pts.forEach(([x, y]) => { assert.ok(x >= 0 && x <= 100); assert.ok(y >= 0 && y <= 100); });
});

test('tornSplit halves share the same tear line', () => {
  const { left, right } = CS.tornSplit(5, 6, 3);
  const l = points(left), r = points(right);
  assert.deepEqual(l[0], [0, 0]);
  assert.deepEqual(r[0], [100, 0]);
  assert.deepEqual(l.slice(1, -1), r.slice(1, -1));
  l.slice(1, -1).forEach(([x]) => assert.ok(x >= 47 && x <= 53));
});

test('ransomLetters keeps every character, flags spaces, and is deterministic', () => {
  const out = CS.ransomLetters('Who owns?', 3);
  assert.equal(out.length, 9);
  assert.equal(out.map((l) => l.ch).join(''), 'Who owns?');
  assert.deepEqual(out[3], { ch: ' ', space: true });
  out.filter((l) => !l.space).forEach((l) => {
    assert.ok(CS.RANSOM_FONTS.includes(l.font));
    assert.ok(CS.RANSOM_SKINS.includes(l.skin));
    assert.ok(Math.abs(l.rotate) <= 8);
    assert.ok(l.scale >= 0.9 && l.scale <= 1.15);
  });
  assert.deepEqual(out, CS.ransomLetters('Who owns?', 3));
});
