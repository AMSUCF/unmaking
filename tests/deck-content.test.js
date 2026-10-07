'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { ACTS } = require('../js/core/acts.js');
const Deck = require('../js/core/deck.js');
const { existsExactCase } = require('./helpers.js');

// Append each act's file as it is written (Tasks 9-11).
const ACT_FILES = ['act1-paper.js', 'act2-textile.js', 'act3-zine.js', 'act4-game.js'];
const lists = ACT_FILES.map((f) => require(`../js/data/${f}`));

lists.forEach((list, i) => {
  const act = ACTS[i];
  test(`act ${act.n} scenes validate`, () => {
    assert.deepEqual(list.flatMap((s) => Deck.validateScene(s, act)), []);
  });
  // Over 16 is reported, not failed: timing gets set after the test run.
  test(`act ${act.n} plans at least 14 minutes`, (t) => {
    const minutes = list.reduce((sum, s) => sum + s.minutes, 0);
    assert.ok(minutes >= 14, `act ${act.n} plans ${minutes} minutes`);
    if (minutes > 16) t.diagnostic(`act ${act.n} plans ${minutes} minutes (budget 15)`);
  });
  test(`act ${act.n} media exist with exact case`, () => {
    assert.deepEqual(Deck.mediaPaths(list).filter((p) => !existsExactCase(p)), []);
  });
  test(`act ${act.n} ends with ${act.n < 4 ? 'a handoff' : 'credits'}`, () => {
    assert.equal(list[list.length - 1].layout, act.n < 4 ? 'handoff' : 'credits');
  });
});

if (lists.length === ACTS.length) {
  test('full deck builds with no errors', () => {
    assert.deepEqual(Deck.buildDeck(lists).errors, []);
  });
}

test('every act that has places names one on its first slide', () => {
  assert.deepEqual(Deck.placeErrors(Deck.buildDeck(lists).scenes), []);
});
