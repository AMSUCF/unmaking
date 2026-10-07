'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Timer = require('../js/core/timer.js');

test('formatClock', () => {
  assert.equal(Timer.formatClock(0), '0:00');
  assert.equal(Timer.formatClock(65000), '1:05');
  assert.equal(Timer.formatClock(3599000), '59:59');
  assert.equal(Timer.formatClock(-5000), '-0:05');
});

test('plannedMsBefore sums only earlier scenes in the same act', () => {
  const scenes = [{ act: 1, minutes: 1 }, { act: 1, minutes: 2 }, { act: 2, minutes: 1.5 }, { act: 2, minutes: 1 }];
  assert.equal(Timer.plannedMsBefore(scenes, 1), 60000);
  assert.equal(Timer.plannedMsBefore(scenes, 2), 0);
  assert.equal(Timer.plannedMsBefore(scenes, 3), 90000);
});

test('paceStatus uses a one-minute tolerance', () => {
  assert.equal(Timer.paceStatus(100000, 100000), 'on');
  assert.equal(Timer.paceStatus(170000, 100000), 'behind');
  assert.equal(Timer.paceStatus(30000, 100000), 'ahead');
});

test('act clock marks once, resets, and totals from the first mark', () => {
  let t = 1000;
  const c = Timer.createActClock(() => t);
  assert.equal(c.elapsed(1), 0);
  c.mark(1); t = 5000; c.mark(1);
  assert.equal(c.elapsed(1), 4000);
  c.mark(2); t = 9000;
  assert.equal(c.elapsed(2), 4000);
  assert.equal(c.total(), 8000);
  c.reset(2);
  assert.equal(c.elapsed(2), 0);
});

test('act clock resetAll clears every act so clocks restart on next mark', () => {
  let t = 0;
  const c = Timer.createActClock(() => t);
  c.mark(1); c.mark(2); t = 5000;
  c.resetAll();
  assert.equal(c.elapsed(1), 0);
  assert.equal(c.total(), 0);
  t = 7000; c.mark(2); t = 8000;
  assert.equal(c.elapsed(2), 1000);
});

test('act clock snapshot and restore round-trip, ignoring junk', () => {
  let t = 1000;
  const c = Timer.createActClock(() => t);
  c.mark(1); t = 5000; c.mark(2);
  const snap = c.snapshot();
  const d = Timer.createActClock(() => t);
  d.restore(Object.assign({}, snap, { 3: 'nope' }));
  t = 9000;
  assert.equal(d.elapsed(1), 8000);
  assert.equal(d.elapsed(2), 4000);
  assert.equal(d.elapsed(3), 0);
});
