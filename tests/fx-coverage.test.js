'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { FX_NAMES } = require('../js/core/acts.js');
const { ROOT } = require('./helpers.js');

// Grow these as Tasks 9-11 implement crafts and handoffs.
const CRAFTS_IMPLEMENTED = ['paper'];
const HANDOFFS_IMPLEMENTED = [];

const source = (craft) => fs.readFileSync(path.join(ROOT, 'js', 'fx', `${craft}.js`), 'utf8');

CRAFTS_IMPLEMENTED.forEach((craft) => {
  test(`${craft} implements every fx in FX_NAMES.${craft}`, () => {
    const src = source(craft);
    assert.deepEqual(FX_NAMES[craft].filter((n) => !src.includes(`'${n}':`)), []);
  });
});

test('implemented handoffs exist', () => {
  if (!HANDOFFS_IMPLEMENTED.length) return;
  const src = source('handoff');
  assert.deepEqual(HANDOFFS_IMPLEMENTED.filter((n) => !src.includes(`'${n}':`)), []);
});
