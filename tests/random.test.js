'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Random = require('../js/core/random.js');

test('mulberry32 is deterministic and in [0,1)', () => {
  const a = Random.mulberry32(42), b = Random.mulberry32(42);
  for (let i = 0; i < 50; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
});

test('hashString is stable and distinguishes strings', () => {
  assert.equal(Random.hashString('a1-title'), Random.hashString('a1-title'));
  assert.notEqual(Random.hashString('a1-title'), Random.hashString('a1-titlf'));
});

test('shuffledOrder is a deterministic permutation', () => {
  const o = Random.shuffledOrder(100, 7);
  assert.deepEqual([...o].sort((x, y) => x - y), Array.from({ length: 100 }, (_, i) => i));
  assert.deepEqual(o, Random.shuffledOrder(100, 7));
  assert.notDeepEqual(o, Random.shuffledOrder(100, 8));
});
