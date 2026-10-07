'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PlaceDecls = require('../js/places/index.js');
const Deck = require('../js/core/deck.js');
const { ACTS } = require('../js/core/acts.js');

const good = () => ({
  label: 'Test Place', credit: '', floor: 684,
  pieces: [
    { layer: 'far', cls: 'a', box: [300, 100, 600, 400] },          // far may sit behind content
    { layer: 'mid', cls: 'b', box: [1212, 200, 60, 200] },          // right strip
    { layer: 'egg', cls: 'c', box: [20, 40, 100, 60] },             // gutter, above y=120
    { layer: 'near', cls: 'd', box: [0, 660, 1280, 60] },           // bottom band
    { layer: 'label', cls: 'e', box: [236, 0, 210, 46], text: 'Test Place' },
  ],
});
const has = (errs, s) => errs.some((e) => e.includes(s));

test('a well-formed paper place passes the geometry check', () => {
  assert.deepEqual(PlaceDecls.check('paper', 't', good()), []);
});

test('loud pieces may not cover the content frame unless quiet', () => {
  const d = good();
  d.pieces.push({ layer: 'mid', cls: 'x', box: [600, 300, 100, 100] });
  assert.ok(has(PlaceDecls.check('paper', 't', d), 'covers the content frame'));
  d.pieces[d.pieces.length - 1].quiet = true;
  assert.deepEqual(PlaceDecls.check('paper', 't', d), []);
});

test('gutter pieces must stay above the head or below the knees', () => {
  const d = good();
  d.pieces.push({ layer: 'egg', cls: 'x', box: [40, 300, 60, 60] });
  assert.ok(has(PlaceDecls.check('paper', 't', d), 'between head and knees'));
});

test('occluders must start at or below knee height', () => {
  const d = good();
  d.pieces.push({ layer: 'occluder', cls: 'x', box: [0, 600, 220, 120] });
  assert.ok(has(PlaceDecls.check('paper', 't', d), 'occluder above knee'));
});

test('boxes must stay on the stage, floors in range, labels present', () => {
  const d = good();
  d.floor = 700;
  d.pieces.push({ layer: 'far', cls: 'x', box: [1200, 0, 200, 50] });
  const e = PlaceDecls.check('paper', 't', d);
  assert.ok(has(e, 'floor'));
  assert.ok(has(e, 'leaves the stage'));
  const nolabel = good();
  nolabel.pieces = nolabel.pieces.filter((p) => p.layer !== 'label');
  assert.ok(has(PlaceDecls.check('paper', 't', nolabel), 'label piece'));
  assert.deepEqual(PlaceDecls.check('game', 't', Object.assign(nolabel, { floor: 570 })), []); // the HUD is game's label
});

test('every registered place passes the geometry check', () => {
  assert.deepEqual(PlaceDecls.validateAll(), []);
});

test('placeOf inherits within an act and stops at act boundaries', () => {
  const s = [
    { id: 'a1-a', act: 1, place: 'p1' }, { id: 'a1-b', act: 1 }, { id: 'a1-c', act: 1, place: 'p2' }, { id: 'a1-d', act: 1 },
    { id: 'a2-a', act: 2 },
  ];
  assert.equal(Deck.placeOf(s, 0), 'p1');
  assert.equal(Deck.placeOf(s, 1), 'p1');   // jumping straight to a mid-run slide
  assert.equal(Deck.placeOf(s, 3), 'p2');
  assert.equal(Deck.placeOf(s, 4), null);   // never inherits across acts
  assert.equal(Deck.placeOf(s, 9), null);
});

test('placeErrors requires a place on the first slide of acts whose craft has places', () => {
  PlaceDecls.register('paper', { 'probe-place': good() });
  const scenes = [{ id: 'a1-a', act: 1 }, { id: 'a2-a', act: 2 }];
  const e = Deck.placeErrors(scenes);
  assert.ok(has(e, 'a1-a: first slide of act 1 must set a place'));
  assert.deepEqual(Deck.placeErrors([{ id: 'a1-a', act: 1, place: 'probe-place' }]), []);
});

test('validateScene rejects an unknown place for the act craft', () => {
  const act = ACTS[0];
  const base = { id: 'a1-x', act: 1, minutes: 1, layout: 'statement', text: 'x', notes: 'n' };
  assert.ok(has(Deck.validateScene(Object.assign({ place: 'nowhere' }, base), act), 'is not a paper place'));
  assert.deepEqual(Deck.validateScene(Object.assign({ place: 'probe-place' }, base), act), []);
});
