'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Nav = require('../js/core/nav.js');

const scenes = [
  { id: 'a1-a', act: 1 },
  { id: 'a1-b', act: 1, choices: ['x', 'y'] },
  { id: 'a2-a', act: 2 },
  { id: 'a2-b', act: 2 },
];

test('advance reveals choices before moving on, and stops at the end', () => {
  let p = { index: 0, step: 0 };
  p = Nav.advance(p, scenes); assert.deepEqual(p, { index: 1, step: 0 });
  p = Nav.advance(p, scenes); assert.deepEqual(p, { index: 1, step: 1 });
  p = Nav.advance(p, scenes); assert.deepEqual(p, { index: 1, step: 2 });
  p = Nav.advance(p, scenes); assert.deepEqual(p, { index: 2, step: 0 });
  assert.deepEqual(Nav.advance({ index: 3, step: 0 }, scenes), { index: 3, step: 0 });
});

test('retreat un-reveals, and entering a choice scene backwards shows all choices', () => {
  assert.deepEqual(Nav.retreat({ index: 1, step: 2 }, scenes), { index: 1, step: 1 });
  assert.deepEqual(Nav.retreat({ index: 2, step: 0 }, scenes), { index: 1, step: 2 });
  assert.deepEqual(Nav.retreat({ index: 0, step: 0 }, scenes), { index: 0, step: 0 });
});

test('transitionFor: forward one step animates; everything else cuts', () => {
  assert.equal(Nav.transitionFor(-1, 0, scenes), 'cut');
  assert.equal(Nav.transitionFor(0, 1, scenes), 'within');
  assert.equal(Nav.transitionFor(1, 2, scenes), 'act-enter');
  assert.equal(Nav.transitionFor(2, 1, scenes), 'cut');   // backward across acts
  assert.equal(Nav.transitionFor(3, 2, scenes), 'cut');   // backward within act
  assert.equal(Nav.transitionFor(0, 3, scenes), 'cut');   // act-key jump
});

test('actStartIndex finds the first scene of an act', () => {
  assert.equal(Nav.actStartIndex(scenes, 2), 2);
  assert.equal(Nav.actStartIndex(scenes, 4), -1);
});

test('parseStartParam accepts ids or numbers and clamps', () => {
  assert.equal(Nav.parseStartParam('?scene=a2-b', scenes), 3);
  assert.equal(Nav.parseStartParam('?scene=2', scenes), 2);
  assert.equal(Nav.parseStartParam('?scene=99', scenes), 3);
  assert.equal(Nav.parseStartParam('?scene=nope', scenes), 0);
  assert.equal(Nav.parseStartParam('', scenes), 0);
});

test('nav queue: latest request wins while busy', () => {
  const q = Nav.createNavQueue();
  assert.deepEqual(q.request({ index: 1, step: 0 }), { index: 1, step: 0 });
  assert.equal(q.isBusy(), true);
  assert.equal(q.request({ index: 2, step: 0 }), null);
  assert.equal(q.request({ index: 3, step: 0 }), null);
  assert.deepEqual(q.finish(), { index: 3, step: 0 });
  assert.equal(q.isBusy(), true);
  assert.equal(q.finish(), null);
  assert.equal(q.isBusy(), false);
});

test('swipeDirection: sideways swipes navigate; taps and vertical scrolls do not', () => {
  assert.equal(Nav.swipeDirection(-120, 10), 'next');
  assert.equal(Nav.swipeDirection(120, -10), 'prev');
  assert.equal(Nav.swipeDirection(-40, 0), null); // too short: a tap or a wobble
  assert.equal(Nav.swipeDirection(-100, 90), null); // mostly vertical: scrolling the notes
  assert.equal(Nav.swipeDirection(0, 0), null);
});
