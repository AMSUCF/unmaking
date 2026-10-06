'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { ACTS } = require('../js/core/acts.js');
const Deck = require('../js/core/deck.js');
const { existsExactCase } = require('./helpers.js');

// Append each act's file as it is written (Tasks 9-11).
const ACT_FILES = ['act1-paper.js', 'act2-textile.js'];
const lists = ACT_FILES.map((f) => require(`../js/data/${f}`));

lists.forEach((list, i) => {
  const act = ACTS[i];
  test(`act ${act.n} scenes validate`, () => {
    assert.deepEqual(list.flatMap((s) => Deck.validateScene(s, act)), []);
  });
  test(`act ${act.n} plans 14-16 minutes`, () => {
    const minutes = list.reduce((sum, s) => sum + s.minutes, 0);
    assert.ok(minutes >= 14 && minutes <= 16, `act ${act.n} plans ${minutes} minutes`);
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
