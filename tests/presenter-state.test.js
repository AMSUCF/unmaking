'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const PresenterState = require('../js/core/presenter-state.js');

const scenes = [
  { id: 'a1-a', act: 1, minutes: 1 },
  { id: 'a1-b', act: 1, minutes: 2, choices: ['x', 'y'] },
  { id: 'a2-a', act: 2, minutes: 1 },
  { id: 'a2-b', act: 2, minutes: 1 },
];
const memory = () => { const m = {}; return { getItem: (k) => (k in m ? m[k] : null), setItem: (k, v) => { m[k] = String(v); } }; };

test('next and prev walk slides and reveal steps', () => {
  const r = PresenterState.createRemote(scenes);
  r.next(); assert.deepEqual([r.status().index, r.status().step], [1, 0]);
  r.next(); r.next(); assert.deepEqual([r.status().index, r.status().step], [1, 2]);
  r.next(); assert.equal(r.status().scene.id, 'a2-a');
  r.prev(); assert.deepEqual([r.status().index, r.status().step], [1, 2]);
});

test('clocks wait for start, then reset on a forward act entry only', () => {
  let t = 0;
  const r = PresenterState.createRemote(scenes, { now: () => t });
  t = 5000; r.next();
  assert.equal(r.status().started, false);
  assert.equal(r.status().elapsed, 0);
  r.start(); t = 65000;
  assert.equal(r.status().elapsed, 60000);
  r.next(); r.next(); t = 70000; r.next();   // forward into act 2
  t = 80000;
  assert.equal(r.status().act.n, 2);
  assert.equal(r.status().elapsed, 10000);
  r.prev(); t = 90000; r.next();             // back to act 1, then forward again: act 2 restarts
  assert.equal(r.status().elapsed, 0);
  assert.equal(r.status().total, 85000);
  assert.equal(r.status().planned, 0);
  r.next(); assert.equal(r.status().planned, 60000);
});

test('gotoAct jumps without resetting a running act clock', () => {
  let t = 0;
  const r = PresenterState.createRemote(scenes, { now: () => t });
  r.start(); r.gotoAct(2); t = 3000;
  assert.equal(r.status().index, 2);
  assert.equal(r.status().elapsed, 3000);   // a jump marks; it does not reset
  r.gotoAct(9); assert.equal(r.status().index, 2);
});

test('resetAct and restart', () => {
  let t = 0;
  const r = PresenterState.createRemote(scenes, { now: () => t });
  r.start(); t = 4000; r.resetAct(); t = 5000;
  assert.equal(r.status().elapsed, 1000);
  r.next(); r.restart();
  assert.deepEqual([r.status().index, r.status().step, r.status().started, r.status().total], [0, 0, false, 0]);
});

test('state survives a reload through storage', () => {
  let t = 0;
  const storage = memory();
  const a = PresenterState.createRemote(scenes, { now: () => t, storage });
  a.start(); a.next(); a.next(); t = 7000;
  const b = PresenterState.createRemote(scenes, { now: () => t, storage });
  assert.deepEqual([b.status().index, b.status().step, b.status().started], [1, 1, true]);
  assert.equal(b.status().elapsed, 7000);
});

test('corrupt, stale or blocked storage starts fresh', () => {
  const bad = memory();
  bad.setItem(PresenterState.KEY, '{not json');
  assert.equal(PresenterState.createRemote(scenes, { storage: bad }).status().index, 0);
  const stale = memory();
  stale.setItem(PresenterState.KEY, JSON.stringify({ pos: { index: 99, step: 0 }, started: true, clocks: {} }));
  assert.equal(PresenterState.createRemote(scenes, { storage: stale }).status().index, 0);
  const clamp = memory();
  clamp.setItem(PresenterState.KEY, JSON.stringify({ pos: { index: 1, step: 9 }, started: false, clocks: {} }));
  assert.equal(PresenterState.createRemote(scenes, { storage: clamp }).status().step, 2);
  const blocked = { getItem() { throw new Error('denied'); }, setItem() { throw new Error('denied'); } };
  const r = PresenterState.createRemote(scenes, { storage: blocked });
  r.next();
  assert.equal(r.status().index, 1);
});
