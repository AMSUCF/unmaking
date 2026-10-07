'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { install } = require('./dom-stub.js');

const dom = install();
global.PlaceDecls = require('../js/places/index.js');
global.Random = require('../js/core/random.js');
let transitions = 0;
global.Crafts = { placeTransition: async () => { transitions++; } };
const Places = require('../js/render/places.js');

const decl = (label) => ({
  label, credit: 'c', floor: 640,
  pieces: [
    { layer: 'far', cls: 'f', box: [300, 100, 600, 400] },
    { layer: 'mid', cls: 'm', box: [1212, 200, 60, 200], text: 'SIGN' },
    { layer: 'label', cls: 'l', box: [236, 0, 210, 46], text: label },
    { layer: 'occluder', cls: 'o', box: [0, 600, 220, 120] },
  ],
});
PlaceDecls.register('paper', { 'r-a': decl('A'), 'r-b': decl('B'), 'r-c': decl('C') });
PlaceDecls.register('textile', { 'r-t': Object.assign(decl('T'), { floor: 660 }) });

const roots = () => dom.backdrop.children.filter((c) => c.classList.contains('place'));
const fresh = () => { Places.reset('paper'); dom.backdrop.replaceChildren(); dom.foreground.replaceChildren(); transitions = 0; };

test('build makes one plane per layer and one element per non-occluder piece', () => {
  const b = Places.build('paper', 'r-a', decl('A'));
  assert.deepEqual(Object.keys(b.planes), ['sky', 'far', 'light', 'mid', 'egg', 'near', 'label']);
  assert.equal(b.root.querySelectorAll('.piece').length, 3);
  assert.equal(b.occluders.length, 1);
  const sign = b.root.querySelector('.m');
  assert.equal(sign.textContent, 'SIGN');
  assert.equal(sign.style.left, '1212px');
});

test('go without animation mounts the place, its floor, and its occluders', async () => {
  fresh();
  assert.equal(await Places.go('paper', 'r-a'), true);
  assert.equal(roots().length, 1);
  assert.equal(roots()[0].dataset.place, 'r-a');
  assert.equal(dom.stage.style['--floor'], '640px');
  assert.equal(dom.foreground.children.length, 1);
  assert.equal(Places.current().label, 'A');
  assert.equal(await Places.go('paper', 'r-a'), false); // same place: nothing to do
});

test('an animated change runs the craft transition and leaves only the new place', async () => {
  fresh();
  await Places.go('paper', 'r-a');
  await Places.go('paper', 'r-b', { animate: true });
  assert.equal(transitions, 1);
  assert.deepEqual(roots().map((r) => r.dataset.place), ['r-b']);
});

test('going back across a boundary restores the earlier place', async () => {
  fresh();
  await Places.go('paper', 'r-a');
  await Places.go('paper', 'r-b', { animate: true });
  await Places.go('paper', 'r-a', { animate: true });
  assert.deepEqual(roots().map((r) => r.dataset.place), ['r-a']);
});

test('HUD room label changes after an animated transition, immediately otherwise', async () => {
  fresh();
  const hud = document.createElement('div');
  hud.className = 'room-name';
  dom.backdrop.append(hud);
  await Places.go('paper', 'r-a');
  assert.equal(hud.textContent, 'A'); // non-animated mount: immediate
  let during = null;
  const saved = global.Crafts.placeTransition;
  global.Crafts.placeTransition = async () => { during = hud.textContent; };
  await Places.go('paper', 'r-b', { animate: true });
  global.Crafts.placeTransition = saved;
  assert.equal(during, 'A');          // still the old room while the avatar walks out
  assert.equal(hud.textContent, 'B'); // new label once the transition completes
});

test('a second go during a transition wins and leaves exactly one root', async () => {
  fresh();
  await Places.go('paper', 'r-a');
  let release;
  global.Crafts.placeTransition = () => new Promise((r) => { release = r; });
  const slow = Places.go('paper', 'r-b', { animate: true });
  await Places.go('paper', 'r-c');              // instant "cut" lands mid-transition
  release();
  await slow;
  global.Crafts.placeTransition = async () => { transitions++; };
  assert.deepEqual(roots().map((r) => r.dataset.place), ['r-c']);
  assert.equal(Places.current().id, 'r-c');
});

test('onChange fires only when an animated change happens', async () => {
  fresh();
  let n = 0;
  await Places.go('paper', 'r-a', { animate: true, onChange: () => n++ }); // first place: no transition
  await Places.go('paper', 'r-b', { animate: true, onChange: () => n++ });
  assert.equal(n, 1);
});

test('reset clears occluders and restores the craft default floor', async () => {
  fresh();
  await Places.go('paper', 'r-a');
  dom.backdrop.replaceChildren();               // Crafts.backdrop clears it on a craft change
  Places.reset('game');
  assert.equal(Places.current(), null);
  assert.equal(dom.foreground.children.length, 0);
  assert.equal(dom.stage.style['--floor'], '570px');
  await Places.go('textile', 'r-t');
  assert.equal(dom.stage.style['--floor'], '660px');
});

test('nudge moves planes by their drift, deterministically', async () => {
  fresh();
  await Places.go('paper', 'r-a');
  Places.nudge('a1-x');
  const first = roots()[0].children.map((p) => p.style.transform);
  Places.nudge('a1-x');
  assert.deepEqual(roots()[0].children.map((p) => p.style.transform), first);
  assert.equal(roots()[0].children[0].style.transform, ''); // sky never moves
});

test('reduced motion turns parallax off', async () => {
  fresh();
  await Places.go('paper', 'r-a');
  global.matchMedia = () => ({ matches: true });
  Places.nudge('a1-y');
  delete global.matchMedia;
  assert.ok(roots()[0].children.every((p) => p.style.transform === ''));
});

test('unknown places are ignored', async () => {
  fresh();
  assert.equal(await Places.go('paper', 'nope'), false);
  assert.equal(roots().length, 0);
});

test('edge-hugging pieces are widened by their plane drift; interior ones are not', () => {
  const b = Places.build('paper', 'r-a', {
    label: 'E', credit: '', floor: 640,
    pieces: [
      { layer: 'near', cls: 'n', box: [0, 660, 1280, 60] },
      { layer: 'mid', cls: 'm', box: [1212, 200, 60, 200] },
    ],
  });
  const n = b.root.querySelector('.n');
  assert.equal(n.style.left, '-9px');
  assert.equal(n.style.width, '1298px');
  const m = b.root.querySelector('.m');
  assert.equal(m.style.left, '1212px');
  assert.equal(m.style.width, '60px');
});

test('each place owns its sky: the old one is stopped once after the transition, reset stops the rest', async () => {
  const handles = [];
  global.PixelSky = { mount: () => { const h = { stops: 0, stop() { this.stops++; } }; handles.push(h); return h; }, stop() {} };
  const sky = { top: '#000000', bottom: '#111111' };
  PlaceDecls.register('paper', { 'r-s1': Object.assign(decl('S1'), { sky }), 'r-s2': Object.assign(decl('S2'), { sky }) });
  fresh();
  await Places.go('paper', 'r-s1');
  let duringStops = -1;
  global.Crafts.placeTransition = async () => { duringStops = handles[0].stops; };
  await Places.go('paper', 'r-s2', { animate: true });
  global.Crafts.placeTransition = async () => { transitions++; };
  assert.equal(duringStops, 0);   // outgoing sky still alive mid-transition
  assert.equal(handles[0].stops, 1);
  assert.equal(handles[1].stops, 0);
  Places.reset('paper');
  assert.equal(handles[1].stops, 1);
  assert.equal(handles[0].stops, 1);
  delete global.PixelSky;
});

test('works when Crafts is only a global lexical binding, as in the browser', async () => {
  const vm = require('node:vm');
  const saved = global.Crafts;
  delete global.Crafts;
  delete global.__pt;
  vm.runInThisContext("const Crafts = { placeTransition: async () => { globalThis.__pt = (globalThis.__pt || 0) + 1; } };");
  assert.equal(globalThis.Crafts, undefined);
  fresh();
  await Places.go('paper', 'r-a');
  await Places.go('paper', 'r-b', { animate: true });
  assert.equal(global.__pt, 1);
  assert.deepEqual(roots().map((r) => r.dataset.place), ['r-b']);
  global.Crafts = saved;
});
