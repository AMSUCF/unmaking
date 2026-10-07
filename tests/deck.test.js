'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Acts = require('../js/core/acts.js');
const Deck = require('../js/core/deck.js');

const [A1, A2, A3, A4] = Acts.ACTS;
const ok = (over = {}) => Object.assign(
  { id: 'a1-x', act: 1, minutes: 1, layout: 'statement', text: 'Hello', notes: 'say hello' }, over);
const errs = (scene, act = A1) => Deck.validateScene(scene, act);
const has = (list, fragment) => list.some((e) => e.includes(fragment));

test('acts are paper/emily, textile/anastasia, zine/emily, game/anastasia', () => {
  assert.deepEqual(Acts.ACTS.map((a) => [a.craft, a.presenter]),
    [['paper', 'emily'], ['textile', 'anastasia'], ['zine', 'emily'], ['game', 'anastasia']]);
  assert.equal(Acts.actByNumber(3).craft, 'zine');
  assert.equal(Acts.actByNumber(9), null);
});

test('a valid statement has no errors', () => {
  assert.deepEqual(errs(ok()), []);
});

test('id, act, minutes, layout and notes are enforced', () => {
  assert.ok(has(errs(ok({ id: 'Act1 X' })), 'id must match'));
  assert.ok(has(errs(ok({ id: 'a2-x' })), 'id prefix'));
  assert.ok(has(errs(ok({ act: 2 })), 'does not match act 1'));
  assert.ok(has(errs(ok({ minutes: 0 })), 'minutes'));
  assert.ok(has(errs(ok({ minutes: 5 })), 'minutes'));
  assert.ok(has(errs(ok({ layout: 'slide' })), 'unknown layout'));
  assert.ok(has(errs(ok({ notes: '  ' })), 'notes are required'));
});

test('text limits protect the stage from overflow', () => {
  assert.ok(has(errs(ok({ text: 'x'.repeat(241) })), 'max 240'));
  assert.deepEqual(errs(ok({ layout: 'quote', source: 's', text: 'x'.repeat(650) })), []);
  assert.ok(has(errs(ok({ layout: 'quote', source: 's', text: 'x'.repeat(651) })), 'max 650'));
  assert.ok(has(errs(ok({ say: 'x'.repeat(121) })), 'say'));
  assert.ok(has(errs(ok({ heading: 'x'.repeat(71) })), 'heading'));
});

test('layout-specific requirements', () => {
  assert.ok(has(errs(ok({ layout: 'quote', source: undefined })), 'quote needs source'));
  assert.ok(has(errs(ok({ layout: 'image', media: [] })), 'exactly one media'));
  const img = { src: 'assets/a.png', alt: 'a' };
  assert.ok(has(errs(ok({ layout: 'gallery', media: [img] })), '2-4 media'));
  assert.deepEqual(errs(ok({ layout: 'gallery', media: [img, img] })), []);
  assert.ok(has(errs(ok({ layout: 'video', media: [img] })), '.mp4'));
  assert.ok(has(errs(ok({ layout: 'choice', choices: ['one'] })), '2-6 choices'));
  assert.ok(has(errs(ok({ layout: 'credits' })), 'credits needs lines'));
  assert.ok(has(errs(ok({ layout: 'title', heading: undefined })), 'title needs heading'));
});

test('media needs src and alt', () => {
  const e = errs(ok({ layout: 'image', media: [{ src: 'assets/a.png', alt: '' }] }));
  assert.ok(has(e, 'missing alt'));
});

test('handoff must target the next act craft', () => {
  const h = (to, act) => errs(ok({ id: `a${act.n}-h`, act: act.n, layout: 'handoff', to, fx: [] }), act);
  assert.deepEqual(h('textile', A1), []);
  assert.ok(has(h('zine', A1), 'next act craft'));
  assert.ok(has(h('textile', A4), 'handoff'));
});

test('fx must belong to the act craft, or the handoff set on handoffs', () => {
  assert.deepEqual(errs(ok({ fx: ['fold-in'] })), []);
  assert.ok(has(errs(ok({ fx: ['stitch-in'] })), 'not available for paper'));
  const handoff = ok({ layout: 'handoff', to: 'textile', fx: ['pattern-to-cloth'] });
  assert.deepEqual(errs(handoff), []);
});

test('avatar pose and position are checked', () => {
  assert.deepEqual(errs(ok({ avatar: false })), []);
  assert.deepEqual(errs(ok({ avatar: { pose: 'point', x: 60 } })), []);
  assert.ok(has(errs(ok({ avatar: { pose: 'dance', x: 60 } })), 'avatar.pose'));
  assert.ok(has(errs(ok({ avatar: { pose: 'idle', x: 1200 } })), 'avatar.x'));
});

test('game-only fields are checked in act 4', () => {
  const g = (over) => errs(ok(Object.assign({ id: 'a4-g', act: 4 }, over)), A4);
  assert.deepEqual(g({ place: 'office', agency: 3 }), []);
  assert.ok(has(g({ place: 'kitchen' }), 'is not a game place'));
  assert.ok(has(g({ agency: 7 }), 'agency'));
});

test('buildDeck flags duplicates and act endings, and sums minutes', () => {
  const s = (id, act, layout = 'statement', extra = {}) =>
    ok(Object.assign({ id, act, layout }, extra));
  const lists = [
    [s('a1-a', 1), s('a1-b', 1, 'handoff', { to: 'textile' })],
    [s('a2-a', 2), s('a2-a', 2)],
    [s('a3-a', 3, 'handoff', { to: 'game' })],
    [s('a4-a', 4)],
  ];
  const { scenes, errors } = Deck.buildDeck(lists);
  assert.equal(scenes.length, 6);
  assert.ok(has(errors, 'a2-a: duplicate id'));
  assert.ok(has(errors, 'act 2: last scene must be a handoff'));
  assert.ok(has(errors, 'act 4: last scene must be credits'));
  assert.deepEqual(Deck.actMinutes(scenes), { 1: 2, 2: 2, 3: 1, 4: 1 });
  assert.ok(has(Deck.buildDeck(lists.slice(0, 2)).errors, 'expected 4 acts'));
});

test('mediaPaths lists unique sources', () => {
  const m = { src: 'assets/a.png', alt: 'a' };
  const scenes = [ok({ layout: 'image', media: [m] }), ok({ id: 'a1-y', layout: 'image', media: [m] })];
  assert.deepEqual(Deck.mediaPaths(scenes), ['assets/a.png']);
});
