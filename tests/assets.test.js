'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { existsExactCase } = require('./helpers.js');
const manifest = require('../tools/asset-manifest.json');

const MOVED = [
  'assets/act1/muse-keroppi.png',
  'assets/act1/meta-muse-yeti-smith.mp4',
  'assets/act3/cbdq.jpg',
  'assets/act3/cbts.jpg',
  'assets/act3/bbdq.jpg',
  'assets/act3/flores-workshop.jpg',
  'assets/act3/lawhead-flash.png',
  'assets/act3/tracery.png',
  'assets/act4/racter-chamberlain.png',
  'assets/act4/mj-beautiful-woman.png',
  'assets/act4/mj-professor.png',
  'assets/act4/eliza.png',
  'assets/act4/stanford-race-swap.png',
  'assets/act4/superintelligence.png',
];

test('every manifest destination exists with exact case', () => {
  const missing = Object.keys(manifest).filter((p) => !existsExactCase(p));
  assert.deepEqual(missing, []);
});

test('every moved repo file exists with exact case', () => {
  assert.deepEqual(MOVED.filter((p) => !existsExactCase(p)), []);
});

test('asset names are lowercase kebab-case without spaces', () => {
  const bad = [...Object.keys(manifest), ...MOVED].filter(
    (p) => !/^[a-z0-9/._-]+$/.test(p) || /\s/.test(p));
  assert.deepEqual(bad, []);
});

test('helper rejects wrong case', () => {
  assert.equal(existsExactCase('PACKAGE.JSON'), false);
  assert.equal(existsExactCase('package.json'), true);
});
