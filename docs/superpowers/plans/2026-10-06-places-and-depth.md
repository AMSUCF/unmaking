# Places and Depth Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Give every act a sequence of named, layered places (backgrounds with depth, set pieces, easter eggs) that change with the talk's sequences, drawn in each act's craft.

**Architecture:** Place declarations are plain data in `js/places/<craft>.js`, registered into a node-loadable `PlaceDecls` registry that also checks geometry, so the legibility rule is unit-tested. A renderer (`js/render/places.js`) builds a declaration into layered planes inside `#backdrop`, runs the craft's place transition, applies seeded parallax, and sets the avatar floor line. `Stage.show` gets the slide's effective place from `Deck.placeOf` through `main.js`. Each craft task adds its declarations, CSS drawings and transition.

**Tech Stack:** Vanilla browser JS (IIFE/UMD globals, no modules, no build step), CSS gradients and clip-paths, one `<canvas>` for the Act IV sky, `node --test` for tests, headless Chrome for the visual sweep.

**Spec:** `docs/superpowers/specs/2026-10-06-places-and-depth-design.md`

## Global Constraints

- The stage is fixed at 1280×720 stage pixels. Every piece `box` is `[x, y, w, h]` in those units.
- Content frames are, per craft: paper and textile `[220, 56, 1208, 648]`; zine `[220, 84, 1208, 648]`; game `[220, 64, 1200, 530]`, given as `[left, top, right, bottom]`.
- Pieces on the `mid`, `egg` and `near` layers must not intersect the content frame unless marked `quiet: true` (drawn at no more than 35% opacity).
- In the avatar gutter (x < 220), loud pieces must sit entirely above y = 120 or start at or below the knee line (floor − 60). Occluders must start at or below the knee line.
- Floors must lie between 520 and 690. The default floor is paper 684, textile 684, zine 684 and game 570. The spec said 520–680; the existing deck's avatar baseline is 684, so the range is widened to 690.
- Parallax amplitudes are sky 0, far 2, light 0, mid 5, egg 5, near 9, label 0 px. Offsets are seeded from `Random.hashString(scene.id)` and animated with a 600ms ease.
- `prefers-reduced-motion: reduce` turns off parallax, CSS ambient animations, and pixel-sky particle motion.
- No remote URLs, no ES modules, and no new dependencies: `tests/offline.test.js` must keep passing.
- The talk must not mention the CAPE lab.
- Slide text, layouts, timings, avatars and act handoff effects stay unchanged.
- Every commit is made on `feature/four-act-crafted-deck`, then `main` is fast-forwarded, and both are pushed:
  `git checkout -q main && git merge -q --ff-only feature/four-act-crafted-deck && git push -q origin main feature/four-act-crafted-deck && git checkout -q feature/four-act-crafted-deck`
- Commit messages end with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.
- Run all tests with `npm test`; it must report `# fail 0` at the end of every task.

## Review Focus

1. **Jumping straight to a mid-run slide** (`?scene=`, the presenter jump, or the instant "cut" used when key presses queue) must show that slide's inherited place, not an empty backdrop. Pinned in Task 1 (`placeOf` on a mid-run index) and Task 2 (`go` with `animate: false`).
2. **Going backwards across a place boundary** (B → A) must restore A cleanly, leaving exactly one place in the backdrop. Pinned in Task 2.
3. **Pressing keys again during a place transition** starts a second `go` before the first finishes. The stage must end with exactly one place root, the newest. Pinned in Task 2 (the epoch test).
4. **Crossing an act boundary**, forward through a handoff or backward with a jump, must reset to the new craft's default floor, clear the foreground occluders, and build the right craft's place. Pinned in Task 2 (the `reset` test).
5. **With reduced motion on, nothing drifts:** no plane transforms are set. Pinned in Task 2.

---

## File Structure

| File | Responsibility |
|---|---|
| `js/places/registry.js` (new) | `PlaceDecls`: register, look up, list ids, default floors, content frames, geometry check |
| `js/places/paper.js`, `textile.js`, `zine.js`, `game.js` (new) | each craft's place declarations (data only) |
| `js/places/index.js` (new, node only) | loads the four declaration files and exports the registry |
| `js/core/deck.js` | validates `place`; adds `placeOf` and `placeErrors`; drops `room` in Task 3 |
| `js/core/acts.js` | drops `GAME_ROOMS` in Task 3 |
| `js/render/places.js` (new) | `Places`: build planes, `go` with transitions, `nudge`, `reset`, `current` |
| `js/render/pixel-sky.js` (new) | `PixelSky`: the Act IV dithered canvas sky and particles |
| `js/fx/crafts.js` | adds `placeTransition(craft, oldEl, newEl, ctx)` |
| `js/render/stage.js` | calls `Places` in `setCraft` and `show` |
| `js/main.js` | passes `place` and `nextPlace`; shows `placeErrors` |
| `js/presenter.js`, `presenter.html` | shows the place label and credit |
| `js/fx/{paper,textile,zine,game}.js` | remove the old static backdrop chrome; add each craft's place transition |
| `css/places.css` (new) | planes, pieces, foreground layer, contact shadows, reduced motion |
| `css/places-{paper,textile,zine,game}.css` (new) | piece drawings per craft |
| `css/craft-*.css` | remove the old backdrop rules that places replace |
| `index.html` | adds the new scripts, the new styles, and `<div id="foreground">` |
| `js/data/act*.js` | adds `place` fields; Act IV `room` becomes `place` |
| `tests/places.test.js` (new) | registry, geometry, `placeOf`, `placeErrors`, validation |
| `tests/dom-stub.js`, `tests/places-render.test.js` (new) | renderer behaviour against a minimal DOM stub |
| `tools/place-sweep.js` (new) | headless Chrome screenshots of every place |

---

### Task 1: Place registry, geometry check, and deck validation

**Files:**
- Create: `js/places/registry.js`, `js/places/paper.js`, `js/places/textile.js`, `js/places/zine.js`, `js/places/game.js`, `js/places/index.js`
- Modify: `js/core/deck.js`
- Test: `tests/places.test.js`, `tests/deck-content.test.js`

**Interfaces:**
- Produces:
  - `PlaceDecls.register(craft: string, places: {[id]: Decl})`
  - `PlaceDecls.get(craft, id) → Decl | null`
  - `PlaceDecls.ids(craft) → string[]`
  - `PlaceDecls.check(craft, id, decl) → string[]`
  - `PlaceDecls.validateAll() → string[]`
  - `PlaceDecls.FRAMES`, `PlaceDecls.FLOOR_DEFAULT`, `PlaceDecls.LAYERS`
- `Decl = { label: string, credit: string, floor: number, pieces: Piece[], sky?: {top, bottom, particles?} }`
- `Piece = { layer: 'sky'|'far'|'light'|'mid'|'egg'|'near'|'label'|'occluder', cls: string, box: [x,y,w,h], text?: string, quiet?: boolean }`
- `Deck.placeOf(scenes, index) → string | null` and `Deck.placeErrors(scenes) → string[]`
- `Deck.validateScene` also rejects an unknown `place`.

- [ ] **Step 1: Write the failing tests**

Create `tests/places.test.js`:

```js
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
```

At the end of `tests/deck-content.test.js`, which already has `Deck` and `lists` in scope at file level, add:

```js
test('every act that has places names one on its first slide', () => {
  assert.deepEqual(Deck.placeErrors(Deck.buildDeck(lists).scenes), []);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `npm test 2>&1 | grep -E "^not ok|Cannot find module|# (pass|fail)"`
Expected: FAIL with `Cannot find module '../js/places/index.js'`.

- [ ] **Step 3: Create the registry**

Create `js/places/registry.js`:

```js
/* Place declarations: named, layered backgrounds per craft, and the geometry rules that keep them off the slide content. */
(function (root) {
  'use strict';
  const STAGE_W = 1280;
  const STAGE_H = 720;
  const LAYERS = ['sky', 'far', 'light', 'mid', 'egg', 'near', 'label', 'occluder'];
  const LOUD = ['mid', 'egg', 'near'];
  // [left, top, right, bottom]: where cards and media are laid out, per craft.
  const FRAMES = {
    paper: [220, 56, 1208, 648],
    textile: [220, 56, 1208, 648],
    zine: [220, 84, 1208, 648],
    game: [220, 64, 1200, 530],
  };
  const FLOOR_DEFAULT = { paper: 684, textile: 684, zine: 684, game: 570 };
  const HEAD_CLEAR = 120; // gutter pieces must end above this y, or start below the knees
  const decls = {};

  function register(craft, places) { decls[craft] = Object.assign(decls[craft] || {}, places); }
  function get(craft, id) { return (decls[craft] && decls[craft][id]) || null; }
  function ids(craft) { return Object.keys(decls[craft] || {}); }

  const overlaps = ([x, y, w, h], [l, t, r, b]) => x < r && x + w > l && y < b && y + h > t;

  function check(craft, id, d) {
    const errs = [];
    const fail = (m) => errs.push(`${craft}/${id}: ${m}`);
    const frame = FRAMES[craft];
    if (!frame) return [`${craft}/${id}: unknown craft`];
    if (!d || typeof d.label !== 'string' || !d.label) fail('label required');
    if (!d || typeof d.credit !== 'string') fail('credit must be a string (may be empty)');
    if (!d || !(d.floor >= 520 && d.floor <= 690)) fail(`floor ${d && d.floor} out of range 520-690`);
    const knee = (d && d.floor ? d.floor : FLOOR_DEFAULT[craft]) - 60;
    const pieces = (d && d.pieces) || [];
    pieces.forEach((p, i) => {
      const tag = `${p.cls || '?'}#${i}`;
      if (!LAYERS.includes(p.layer)) fail(`${tag}: unknown layer ${p.layer}`);
      const b = p.box || [];
      const [x, y, w, h] = b;
      if (b.length !== 4 || !b.every(Number.isFinite) || w <= 0 || h <= 0) { fail(`${tag}: bad box`); return; }
      if (x < 0 || y < 0 || x + w > STAGE_W || y + h > STAGE_H) fail(`${tag}: box leaves the stage`);
      const loud = LOUD.includes(p.layer) && !p.quiet;
      if (loud && overlaps(b, frame)) fail(`${tag}: covers the content frame`);
      if ((loud || p.layer === 'occluder') && x < frame[0] && y < knee && y + h > HEAD_CLEAR) fail(`${tag}: in the avatar gutter between head and knees`);
      if (p.layer === 'occluder' && y < knee) fail(`${tag}: occluder above knee height`);
    });
    if (craft !== 'game' && !pieces.some((p) => p.layer === 'label')) fail('needs a label piece');
    return errs;
  }

  function validateAll() {
    return Object.keys(decls).flatMap((craft) => ids(craft).flatMap((id) => check(craft, id, get(craft, id))));
  }

  const api = { LAYERS, FRAMES, FLOOR_DEFAULT, register, get, ids, check, validateAll };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PlaceDecls = api;
})(globalThis);
```

Create the four declaration files as empty registrations. Tasks 3–6 fill them. `js/places/paper.js`:

```js
/* ACT I places: cut-paper dioramas. Declarations only; drawings live in css/places-paper.css. */
(function (root) {
  'use strict';
  const reg = (typeof module === 'object' && module.exports) ? require('./registry.js') : root.PlaceDecls;
  reg.register('paper', {});
})(globalThis);
```

Create `js/places/textile.js`, `js/places/zine.js` and `js/places/game.js` the same way. Change the comment and the craft string:
- textile: `/* ACT II places: felt appliqué inside an embroidery hoop. Declarations only; drawings live in css/places-textile.css. */` with `'textile'`
- zine: `/* ACT III places: photocopied collage in 90s browser windows. Declarations only; drawings live in css/places-zine.css. */` with `'zine'`
- game: `/* ACT IV places: pixel rooms over a dithered canvas sky. Declarations only; drawings live in css/places-game.css. */` with `'game'`

Create `js/places/index.js` (used by node only; the browser loads the files directly):

```js
/* Node entry: load every craft's place declarations and return the shared registry. */
'use strict';
const registry = require('./registry.js');
require('./paper.js');
require('./textile.js');
require('./zine.js');
require('./game.js');
module.exports = registry;
```

- [ ] **Step 4: Teach the deck about places**

In `js/core/deck.js`, replace line 4:

```js
  const Acts = (typeof module === 'object' && module.exports) ? require('./acts.js') : root.Acts;
```

with:

```js
  const isNode = typeof module === 'object' && module.exports;
  const Acts = isNode ? require('./acts.js') : root.Acts;
  const PlaceDecls = isNode ? require('../places/index.js') : root.PlaceDecls;
```

In `validateScene`, just before `if (act.craft === 'game') {`, add:

```js
    if (scene.place !== undefined && !PlaceDecls.ids(act.craft).includes(scene.place)) fail(`place "${scene.place}" is not a ${act.craft} place`);
```

Before `const api = …` add:

```js
  // A slide's place is its own, or the nearest earlier one in the same act.
  function placeOf(scenes, index) {
    const here = scenes[index];
    if (!here) return null;
    for (let i = index; i >= 0 && scenes[i].act === here.act; i--) if (scenes[i].place) return scenes[i].place;
    return null;
  }

  function placeErrors(scenes) {
    const errs = [];
    ACTS.forEach((act) => {
      if (!PlaceDecls.ids(act.craft).length) return;
      const first = scenes.find((s) => s && s.act === act.n);
      if (first && !first.place) errs.push(`${first.id}: first slide of act ${act.n} must set a place`);
    });
    return errs;
  }
```

Change the export line to `const api = { validateScene, buildDeck, actMinutes, mediaPaths, placeOf, placeErrors };`

- [ ] **Step 5: Run the tests to verify they pass**

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`
Expected: `# fail 0`. The new `placeErrors` test in `deck-content.test.js` passes because no craft has places yet.

- [ ] **Step 6: Commit**

```bash
git add js/places js/core/deck.js tests/places.test.js tests/deck-content.test.js
git commit -m "feat: place registry with geometry checks; deck placeOf and place validation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then fast-forward `main` and push both branches (see Global Constraints).

---

### Task 2: Place renderer, stage integration, floor line, and contact shadows

**Files:**
- Create: `js/render/places.js`, `css/places.css`, `tests/dom-stub.js`, `tests/places-render.test.js`
- Modify: `js/fx/crafts.js`, `js/render/stage.js`, `js/main.js`, `index.html`, `css/stage.css:49`, `css/craft-game.css:40`

**Interfaces:**
- Consumes: `PlaceDecls.get/FLOOR_DEFAULT` (Task 1), `Deck.placeOf/placeErrors` (Task 1), `Random.hashString`.
- Produces:
  - `Places.build(craft, id, decl) → { root, planes: {sky,far,light,mid,egg,near,label}, occluders: El[] }`
  - `Places.go(craft, id, { animate?: boolean, ctx?: object, onChange?: () => void }) → Promise<boolean>`
  - `Places.nudge(sceneId)`, `Places.reset(craft)`, `Places.current() → {craft,id,label,credit}|null`
  - `Crafts.placeTransition(craft, oldEl, newEl, ctx) → Promise` calls the craft's optional `placeTransition` (otherwise does nothing)
  - The CSS variable `--floor` on `#stage`, and the element `#foreground`.
  - `Stage.show(scene, act, { kind, step, place, nextPlace })`.

- [ ] **Step 1: Write the DOM stub**

Create `tests/dom-stub.js`:

```js
'use strict';
// Just enough DOM for js/render/places.js under node: elements, classes, styles, tree edits, querySelector('.cls').
class El {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.parent = null;
    this.className = '';
    this.dataset = {};
    this.textContent = '';
    const props = {};
    this.style = new Proxy(props, {
      get: (t, k) => (k === 'setProperty' ? (n, v) => { t[n] = v; } : t[k] === undefined ? '' : t[k]),
      set: (t, k, v) => { t[k] = v; return true; },
    });
    const self = this;
    const list = () => self.className.split(/\s+/).filter(Boolean);
    this.classList = {
      contains: (c) => list().includes(c),
      add: (...cs) => { self.className = [...new Set([...list(), ...cs])].join(' '); },
      remove: (...cs) => { self.className = list().filter((c) => !cs.includes(c)).join(' '); },
      toggle: (c, force) => { const on = force === undefined ? !list().includes(c) : force; if (on) self.classList.add(c); else self.classList.remove(c); return on; },
    };
  }
  append(...ns) { ns.forEach((n) => { n.remove(); n.parent = this; this.children.push(n); }); }
  prepend(...ns) { ns.slice().reverse().forEach((n) => { n.remove(); n.parent = this; this.children.unshift(n); }); }
  remove() { if (this.parent) { this.parent.children = this.parent.children.filter((c) => c !== this); this.parent = null; } }
  replaceChildren(...ns) { this.children.forEach((c) => { c.parent = null; }); this.children = []; this.append(...ns); }
  animate() { return { finished: Promise.resolve(), cancel() {} }; }
  descendants() { return this.children.flatMap((c) => [c, ...c.descendants()]); }
  querySelector(sel) { const cls = sel.replace(/^\./, ''); return this.descendants().find((d) => d.classList.contains(cls)) || null; }
  querySelectorAll(sel) { const cls = sel.replace(/^\./, ''); return this.descendants().filter((d) => d.classList.contains(cls)); }
}

function install() {
  const byId = {};
  ['stage', 'backdrop', 'foreground', 'fx-layer'].forEach((id) => { byId[id] = new El('div'); byId[id].id = id; });
  global.document = { createElement: (t) => new El(t), getElementById: (id) => byId[id] || null };
  return byId;
}

module.exports = { El, install };
```

- [ ] **Step 2: Write the failing renderer tests**

Create `tests/places-render.test.js`:

```js
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
```

- [ ] **Step 3: Run the tests to verify they fail**

Run: `node --test tests/places-render.test.js 2>&1 | grep -E "Cannot find|^not ok|# (pass|fail)"`
Expected: FAIL with `Cannot find module '../js/render/places.js'`.

- [ ] **Step 4: Write the renderer**

Create `js/render/places.js`:

```js
/* Builds named places into #backdrop: layered planes, seeded parallax, the avatar floor line, and craft place transitions. */
(function (root) {
  'use strict';
  const PLANES = ['sky', 'far', 'light', 'mid', 'egg', 'near', 'label'];
  const DRIFT = { sky: 0, far: 2, light: 0, mid: 5, egg: 5, near: 9, label: 0 };
  const g = globalThis;
  let current = null; // { craft, id, decl, root, planes }
  let live = [];      // every place root still in the backdrop
  let epoch = 0;      // bumped by every go()/reset(), so a stale transition never cleans up a newer place

  const $ = (id) => document.getElementById(id);
  const reducedMotion = () => typeof g.matchMedia === 'function' && g.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function build(craft, id, decl) {
    const mk = (cls) => { const n = document.createElement('div'); n.className = cls; return n; };
    const rootEl = mk(`place place-${craft} place-${id}`);
    rootEl.dataset.place = id;
    const planes = {};
    PLANES.forEach((name) => { planes[name] = mk('plane plane-' + name); rootEl.append(planes[name]); });
    const occluders = [];
    decl.pieces.forEach((p) => {
      const n = mk('piece ' + p.cls);
      const [x, y, w, h] = p.box;
      n.style.left = x + 'px';
      n.style.top = y + 'px';
      n.style.width = w + 'px';
      n.style.height = h + 'px';
      if (p.text) n.textContent = p.text;
      if (p.layer === 'occluder') occluders.push(n);
      else planes[p.layer].append(n);
    });
    return { root: rootEl, planes, occluders };
  }

  function mount(craft, id) {
    const decl = g.PlaceDecls.get(craft, id);
    const host = $('backdrop');
    const built = build(craft, id, decl);
    host.prepend(built.root); // below the craft's chrome (HUD, quilt border, ticker)
    live.push(built.root);
    const fg = $('foreground');
    if (fg) fg.replaceChildren(...built.occluders);
    const stage = $('stage');
    if (stage) stage.style.setProperty('--floor', decl.floor + 'px');
    const hud = host.querySelector('.room-name');
    if (hud) hud.textContent = decl.label;
    if (decl.sky && g.PixelSky) g.PixelSky.mount(built.planes.sky, decl.sky, reducedMotion());
    current = { craft, id, decl, root: built.root, planes: built.planes };
    return current;
  }

  function sweep(keep) {
    live.filter((r) => r !== keep).forEach((r) => r.remove());
    live = keep ? [keep] : [];
  }

  async function go(craft, id, { animate = false, ctx = {}, onChange } = {}) {
    if (!g.PlaceDecls.get(craft, id)) return false;
    if (current && current.craft === craft && current.id === id) return false;
    const mine = ++epoch;
    const old = current && current.craft === craft ? current : null;
    if (!animate || !old) { sweep(null); mount(craft, id); return true; }
    if (onChange) onChange();
    const next = mount(craft, id);
    next.root.style.zIndex = '1';
    await g.Crafts.placeTransition(craft, old.root, next.root, ctx);
    if (mine !== epoch) return true; // a newer go() or reset() owns the backdrop now
    next.root.style.zIndex = '';
    sweep(next.root);
    return true;
  }

  function nudge(sceneId) {
    if (!current || reducedMotion()) return;
    const h = g.Random.hashString(sceneId);
    PLANES.forEach((name, i) => {
      const a = DRIFT[name];
      const dx = a ? ((h >>> (i * 4)) % (2 * a + 1)) - a : 0;
      current.planes[name].style.transform = dx ? `translateX(${dx}px)` : '';
    });
  }

  function reset(craft) {
    epoch++;
    current = null;
    live = [];
    const fg = $('foreground');
    if (fg) fg.replaceChildren();
    const stage = $('stage');
    if (stage) stage.style.setProperty('--floor', (g.PlaceDecls.FLOOR_DEFAULT[craft] || 684) + 'px');
    if (g.PixelSky) g.PixelSky.stop();
  }

  function currentPlace() {
    return current ? { craft: current.craft, id: current.id, label: current.decl.label, credit: current.decl.credit } : null;
  }

  const api = { PLANES, DRIFT, build, go, nudge, reset, current: currentPlace };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Places = api;
})(globalThis);
```

- [ ] **Step 5: Run the renderer tests to verify they pass**

Run: `node --test tests/places-render.test.js 2>&1 | grep -E "^not ok|# (pass|fail)"`
Expected: `# fail 0`.

- [ ] **Step 6: Add the craft transition hook**

In `js/fx/crafts.js`, after the `runFx` function, add:

```js
  // Optional per craft: animate from one place to the next. Both roots are in the backdrop; the new one is on top.
  async function placeTransition(craft, oldEl, newEl, ctx) {
    const t = registry[craft] && registry[craft].placeTransition;
    if (t) await t(oldEl, newEl, ctx || {});
  }
```

Change the return line to `return { register, decorate, backdrop, runFx, placeTransition, anim, wait, fxLayer, el, svgEl };`

- [ ] **Step 7: Wire the stage and main**

In `js/render/stage.js`, change `setCraft` to:

```js
  function setCraft(craft) {
    if (craft === currentCraft) return;
    currentCraft = craft;
    document.body.dataset.craft = craft;
    Crafts.backdrop(craft, els.backdrop);
    Places.reset(craft);
    Avatar.setSkinAll(craft);
  }
```

Change the head of `show` from

```js
  async function show(scene, act, { kind, step }) {
    els.fx.replaceChildren();
    setCraft(act.craft);
```

to

```js
  async function show(scene, act, { kind, step, place, nextPlace }) {
    els.fx.replaceChildren();
    setCraft(act.craft);
    if (place) {
      await Places.go(act.craft, place, {
        animate: kind !== 'cut',
        onChange: () => els.content.replaceChildren(), // the old slide leaves with the old place
        ctx: { Avatar, lead: act.presenter, scene },
      });
      Places.nudge(scene.id);
    }
```

In the same function, replace

```js
    const ctx = { scene, act, lead, other, setCraft, Avatar, stage: els };
```

with

```js
    // A handoff switches craft mid-fx; build the next act's first place under it.
    const handoffCraft = (c) => { setCraft(c); if (nextPlace) Places.go(c, nextPlace); };
    const ctx = { scene, act, lead, other, setCraft: handoffCraft, Avatar, stage: els };
```

In `js/main.js`, replace

```js
        await Stage.show(scene, act, { kind, step: target.step });
```

with

```js
        const place = Deck.placeOf(scenes, target.index);
        const nextPlace = target.index + 1 < scenes.length ? Deck.placeOf(scenes, target.index + 1) : null;
        await Stage.show(scene, act, { kind, step: target.step, place, nextPlace });
```

After line 5 (`const { scenes, errors } = Deck.buildDeck(lists);`) add:

```js
  errors.push(...Deck.placeErrors(scenes), ...PlaceDecls.validateAll());
```

- [ ] **Step 8: Floor line, foreground layer, contact shadows, page wiring**

Create `css/places.css`:

```css
/* Places: layered planes inside #backdrop. Pieces are absolutely placed from their declared boxes. */
.place { position: absolute; inset: 0; z-index: 0; }
.plane { position: absolute; inset: 0; transition: transform .6s cubic-bezier(.2, .8, .2, 1); }
.plane-far { opacity: var(--plane-dim, .6); }
.plane-light { mix-blend-mode: screen; pointer-events: none; }
.piece { position: absolute; overflow: hidden; white-space: pre-line; }
#foreground { position: absolute; inset: 0; z-index: 3; pointer-events: none; }

/* Contact shadows: the avatar stands on the place's floor line. */
.avatar::before { content: ''; position: absolute; left: 50%; bottom: -7px; z-index: -1; width: 88px; height: 14px; margin-left: -44px; border-radius: 50%; background: radial-gradient(closest-side, rgba(40, 30, 20, .38), transparent); }
.avatar[data-skin="textile"]::before { background: radial-gradient(closest-side, rgba(70, 50, 110, .35), transparent); outline: 2px dashed rgba(123, 79, 179, .35); outline-offset: -3px; }
.avatar[data-skin="zine"]::before { background: radial-gradient(circle, #111 1.2px, transparent 1.8px) 0 0 / 5px 5px; opacity: .55; }
.avatar[data-skin="game"]::before { bottom: -4px; height: 8px; border-radius: 0; background: rgba(0, 0, 0, .45); clip-path: polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%); }

@media (prefers-reduced-motion: reduce) {
  .place, .place * { animation: none !important; transition: none !important; }
}
```

In `css/stage.css`:
- Change line 49, `.avatar { position: absolute; bottom: 36px; left: -200px; …`, so that `bottom: 36px;` becomes `bottom: calc(720px - var(--floor, 684px));`.
- In the `#stage { … }` rule on line 4, add `--floor: 684px;` before the closing brace.

In `css/craft-game.css`, delete line 40: `[data-craft="game"] .avatar { bottom: 150px; }`. `Places.reset('game')` sets `--floor: 570px`, which gives the same baseline.

In `index.html`:
- After the `<link rel="stylesheet" href="css/hud.css">` line, add `<link rel="stylesheet" href="css/places.css">`.
- After `<div id="avatars"></div>`, add `<div id="foreground"></div>`.
- Before `<script src="js/core/deck.js"></script>`, add these lines:

```html
  <script src="js/places/registry.js"></script>
  <script src="js/places/paper.js"></script>
  <script src="js/places/textile.js"></script>
  <script src="js/places/zine.js"></script>
  <script src="js/places/game.js"></script>
```

- After `<script src="js/fx/crafts.js"></script>`, add `<script src="js/render/places.js"></script>`.

- [ ] **Step 9: Run all tests and check the deck in the browser**

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`
Expected: `# fail 0`.

Then start a server and screenshot two slides to confirm nothing regressed: the avatar baseline is unchanged, and no place is drawn yet because none are declared. Use the scratchpad directory for screenshots.

```bash
python -m http.server 8137 &   # from the repo root
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --hide-scrollbars --window-size=1280,720 --virtual-time-budget=6000 --screenshot="$SCRATCH/t2-a1.png" "http://localhost:8137/index.html?scene=a1-personal"
"/c/Program Files/Google/Chrome/Application/chrome.exe" --headless=new --hide-scrollbars --window-size=1280,720 --virtual-time-budget=6000 --screenshot="$SCRATCH/t2-a4.png" "http://localhost:8137/index.html?scene=a4-triad"
```

Expected: both look as before, with avatar feet at the same height, plus a faint contact shadow under the avatar. Stop the server afterwards.

- [ ] **Step 10: Commit**

```bash
git add js/render/places.js js/fx/crafts.js js/render/stage.js js/main.js css/places.css css/stage.css css/craft-game.css index.html tests/dom-stub.js tests/places-render.test.js
git commit -m "feat: place renderer with transitions, parallax, floor line, and contact shadows

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then fast-forward `main` and push both branches.

---

### Task 3: Act IV pixel places, pixel sky, and the walk-between-rooms transition

**Files:**
- Create: `js/render/pixel-sky.js`, `css/places-game.css`
- Modify: `js/places/game.js`, `js/fx/game.js`, `css/craft-game.css`, `js/core/acts.js`, `js/core/deck.js`, `js/data/act4-game.js`, `tests/deck.test.js:80-85`, `index.html`

**Interfaces:**
- Consumes: `PlaceDecls.register` (Task 1), `Places` and `Crafts.placeTransition` (Task 2).
- Produces:
  - `PixelSky.mount(host: El, sky: {top: '#rrggbb', bottom: '#rrggbb', particles?: 'dust'|'stars'|'fireflies'}, still: boolean)` and `PixelSky.stop()`.
  - The game place ids: `workshop`, `museum`, `office`, `commons`, `frontier`, `allotment`, `quad`, `road`.

- [ ] **Step 1: Update the game validation test first**

In `tests/deck.test.js`, replace the `game-only fields are checked in act 4` test (lines 80–85) with:

```js
test('game-only fields are checked in act 4', () => {
  const g = (over) => errs(ok(Object.assign({ id: 'a4-g', act: 4 }, over)), A4);
  assert.deepEqual(g({ place: 'office', agency: 3 }), []);
  assert.ok(has(g({ place: 'kitchen' }), 'is not a game place'));
  assert.ok(has(g({ agency: 7 }), 'agency'));
});
```

Run: `node --test tests/deck.test.js 2>&1 | grep -E "^not ok|# (pass|fail)"`
Expected: FAIL. `office` isn't a registered game place yet.

- [ ] **Step 2: Declare the game places**

Replace the `reg.register('game', {});` line in `js/places/game.js` with:

```js
  const floor = (cls) => ({ layer: 'near', cls: 'g-floor ' + cls, box: [0, 570, 1280, 150] });
  reg.register('game', {
    workshop: {
      label: 'THE WORKSHOP', credit: 'The Secret of Monkey Island: a rubber chicken with a pulley in the middle', floor: 570,
      sky: { top: '#6b4a2e', bottom: '#4a3220', particles: 'dust' },
      pieces: [
        { layer: 'far', cls: 'gw-pegboard', box: [240, 90, 520, 300] },
        { layer: 'mid', cls: 'gw-bench', box: [880, 530, 300, 40] },
        { layer: 'mid', cls: 'gw-lamp', box: [1204, 64, 66, 220] },
        { layer: 'egg', cls: 'gw-chicken', box: [120, 44, 44, 72] },
        floor('gw-floor'),
      ],
    },
    museum: {
      label: 'MUSEUM OF TALKING MACHINES', credit: '2001: A Space Odyssey (HAL 9000)', floor: 570,
      sky: { top: '#141428', bottom: '#0a0a14', particles: 'dust' },
      pieces: [
        { layer: 'far', cls: 'gm-plinth', box: [320, 300, 170, 230] },
        { layer: 'far', cls: 'gm-plinth', box: [820, 300, 170, 230] },
        { layer: 'mid', cls: 'gm-plaque', box: [300, 536, 210, 26], text: 'E.L.I.Z.A. · 1966' },
        { layer: 'mid', cls: 'gm-plaque', box: [800, 536, 210, 26], text: 'RACTER · 1984' },
        { layer: 'egg', cls: 'gm-hal', box: [1210, 170, 56, 56] },
        floor('gm-floor'),
      ],
    },
    office: {
      label: "THE AGENT'S OFFICE", credit: 'Clippy (Microsoft Office); the Undertale save star', floor: 570,
      sky: { top: '#2e3a5a', bottom: '#1e2740' },
      pieces: [
        { layer: 'far', cls: 'go-crt', box: [980, 90, 220, 180] },
        { layer: 'mid', cls: 'go-clippy', box: [1206, 250, 66, 110] },
        { layer: 'mid', cls: 'go-bubble', box: [260, 536, 560, 28], text: '“It looks like you’re writing a talk.”' },
        { layer: 'mid', cls: 'go-desk', box: [880, 530, 320, 40] },
        { layer: 'egg', cls: 'go-save', box: [150, 64, 40, 40] },
        floor('go-floor'),
      ],
    },
    commons: {
      label: 'THE COMMONS', credit: 'Undertale: Bratty & Catty’s alley', floor: 570,
      sky: { top: '#7fb0d8', bottom: '#f2c78a' },
      pieces: [
        { layer: 'far', cls: 'gk-capitol', box: [500, 250, 320, 280] },
        { layer: 'mid', cls: 'gk-palm', box: [1204, 240, 72, 330] },
        { layer: 'egg', cls: 'gk-cans', box: [1000, 532, 84, 38] },
        floor('gk-floor'),
      ],
    },
    frontier: {
      label: 'THE FRONTIER', credit: 'Portal (Valve, 2007)', floor: 570,
      sky: { top: '#05050c', bottom: '#0b1830', particles: 'stars' },
      pieces: [
        { layer: 'far', cls: 'gf-corridor', box: [220, 64, 980, 466] },
        { layer: 'light', cls: 'gf-glow', box: [540, 110, 240, 300] },
        { layer: 'egg', cls: 'gf-cake', box: [260, 540, 280, 26], text: 'the cake is a lie' },
        floor('gf-floor'),
      ],
    },
    allotment: {
      label: 'THE ALLOTMENT', credit: 'Stardew Valley', floor: 570,
      sky: { top: '#9fd1ff', bottom: '#e9f6ff' },
      pieces: [
        { layer: 'far', cls: 'ga-fence', box: [220, 420, 980, 110] },
        { layer: 'mid', cls: 'ga-beds', box: [240, 532, 600, 38] },
        { layer: 'mid', cls: 'ga-rack', box: [1204, 380, 70, 190] },
        { layer: 'egg', cls: 'ga-scarecrow', box: [120, 40, 56, 80] },
        floor('ga-floor'),
      ],
    },
    quad: {
      label: 'THE COMMONS, AT SUNRISE', credit: '', floor: 570,
      sky: { top: '#ffb46b', bottom: '#8fc1e6' },
      pieces: [
        { layer: 'far', cls: 'gq-library', box: [600, 200, 420, 330] },
        { layer: 'mid', cls: 'gq-students', box: [300, 534, 260, 36] },
        { layer: 'mid', cls: 'gq-tree', box: [1204, 260, 72, 310] },
        floor('gq-floor'),
      ],
    },
    road: {
      label: 'THE ROAD AT THE END OF THE WORLD', credit: 'Kentucky Route Zero (Cardboard Computer); Carol & the End of the World', floor: 570,
      sky: { top: '#0b0820', bottom: '#1a1238', particles: 'stars' },
      pieces: [
        { layer: 'light', cls: 'gd-planet', box: [880, 80, 240, 240] },
        { layer: 'light', cls: 'gd-cone', box: [1110, 64, 170, 470] },
        { layer: 'mid', cls: 'gd-post', box: [1220, 64, 12, 506] },
        { layer: 'mid', cls: 'gd-moto', box: [300, 532, 130, 38] },
        floor('gd-floor'),
      ],
    },
  });
```

- [ ] **Step 3: Remove `room` and `GAME_ROOMS`; tag the Act IV data**

In `js/core/acts.js`, delete the `const GAME_ROOMS = …` line and remove `GAME_ROOMS, ` from the `api` object.

In `js/core/deck.js`, remove `GAME_ROOMS, ` from the destructuring on line 5. Delete this line from `validateScene`:

```js
      if (scene.room !== undefined && !GAME_ROOMS.includes(scene.room)) fail(`room must be one of ${GAME_ROOMS.join(', ')}`);
```

Strip `room` from the Act IV data, then add `place` to the first slide of each run with this one-off node script, run from the repo root:

```bash
sed -i "s/ room: '[a-z]*',//" js/data/act4-game.js
node -e "
const fs=require('fs');const p='js/data/act4-game.js';let s=fs.readFileSync(p,'utf8');
const map={'a4-act':'workshop','a4-eliza':'museum','a4-triad':'workshop','a4-undertale':'office','a4-political':'commons','a4-frontier':'frontier','a4-local-models':'allotment','a4-dh-hub':'quad','a4-end-of-world':'road'};
for(const [id,pl] of Object.entries(map)){const re=new RegExp(\"(id: '\"+id+\"', act: 4, minutes: [0-9.]+,)\");if(!re.test(s))throw new Error(id);s=s.replace(re,\"\$1 place: '\"+pl+\"',\");}
fs.writeFileSync(p,s);"
grep -c "room:" js/data/act4-game.js; grep -c "place:" js/data/act4-game.js
```

Expected output: `0` then `9`.

- [ ] **Step 4: Run the tests**

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`
Expected: `# fail 0`. That includes `every registered place passes the geometry check` with the game places, and `placeErrors` for act 4.

- [ ] **Step 5: Write the pixel sky**

Create `js/render/pixel-sky.js`:

```js
/* Act IV sky: a 320x180 canvas with a Bayer-dithered gradient and a few particles, scaled up pixelated behind the room. */
const PixelSky = (() => {
  const W = 320;
  const H = 180;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const BANDS = 7;
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let base = null;
  let parts = [];
  let kind = null;

  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

  function paint(top, bottom) {
    const a = rgb(top);
    const b = rgb(bottom);
    const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const t = y / (H - 1);
        const th = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        const k = Math.min(1, Math.floor(t * BANDS + th) / BANDS); // stepped bands, dithered at the seams
        const i = (y * W + x) * 4;
        for (let c = 0; c < 3; c++) img.data[i + c] = Math.round(a[c] + (b[c] - a[c]) * k);
        img.data[i + 3] = 255;
      }
    }
    return img;
  }

  function seed(type) {
    const rnd = Random.mulberry32(Random.hashString(type || 'none'));
    const n = { dust: 40, stars: 80, fireflies: 24 }[type] || 0;
    parts = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * (type === 'stars' ? H * 0.6 : H), v: 0.05 + rnd() * 0.15, p: rnd() * 6.28 }));
  }

  function frame(t) {
    ctx.putImageData(base, 0, 0);
    parts.forEach((q) => {
      if (kind === 'dust') { q.y -= q.v; q.x += Math.sin(t / 900 + q.p) * 0.1; if (q.y < 0) q.y = H; ctx.fillStyle = 'rgba(255,230,180,.45)'; }
      else if (kind === 'stars') { ctx.fillStyle = Math.sin(t / 500 + q.p * 3) > 0.7 ? '#ffffff' : 'rgba(255,255,255,.55)'; }
      else if (kind === 'fireflies') { q.x += Math.cos(t / 700 + q.p) * 0.3; q.y += Math.sin(t / 800 + q.p) * 0.2; ctx.fillStyle = Math.sin(t / 300 + q.p) > 0 ? '#f6e05e' : 'rgba(246,224,94,.3)'; }
      ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 1);
    });
  }

  function loop(t) { frame(t); raf = requestAnimationFrame(loop); }

  function mount(host, sky, still) {
    stop();
    canvas = document.createElement('canvas');
    canvas.className = 'pixel-sky';
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    base = paint(sky.top, sky.bottom);
    kind = sky.particles || null;
    seed(kind);
    host.prepend(canvas);
    if (still || !kind) frame(0);
    else raf = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (canvas) canvas.remove();
    canvas = null;
  }

  return { mount, stop };
})();
```

In `index.html`, add `<script src="js/render/pixel-sky.js"></script>` immediately before `<script src="js/render/places.js"></script>`.

- [ ] **Step 6: Game craft: drop the flat rooms and add the walk-between-rooms transition**

In `js/fx/game.js`:
- Delete the `ROOM_NAMES` constant and the `setRoom` function.
- Replace `backdrop(bg) { … }` with:

```js
    backdrop(bg) {
      const bar = el('div', 'hudbar');
      bar.append(el('span', 'room-name', ''), el('span', 'agency', 'AGENCY ▯▯▯▯▯'));
      bg.append(bar);
    },
```

- In `decorate`, delete the line `setRoom(scene.room || 'workshop');`.
- Add this property after `decorate(root, scene) { … },`:

```js
    // Leave by the right edge, iris to black, swap rooms, and come back in from the left.
    async placeTransition(oldEl, newEl, ctx) {
      newEl.style.visibility = 'hidden';
      const { Avatar, lead } = ctx;
      if (Avatar && lead && Avatar.isVisible(lead)) await Avatar.walkTo(lead, 1320);
      const iris = el('div', 'iris-wipe');
      fxLayer().append(iris);
      await anim(iris, [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], { duration: 380, easing: 'steps(8)' });
      oldEl.style.visibility = 'hidden';
      newEl.style.visibility = '';
      if (Avatar && lead) Avatar.place(lead, -160);
      await anim(iris, [{ clipPath: 'circle(75% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 380, easing: 'steps(8)' });
      iris.remove();
    },
```

In `css/craft-game.css`, delete the rules that drew the flat rooms: every line beginning `.backdrop-game .wall`, `.backdrop-game .floor`, `.backdrop-game .prop`, `.room-workshop`, `.room-office` or `.room-commons`, plus the `@keyframes crt` line. Keep `.backdrop-game { … }`, `.backdrop-game .hudbar`, and `.backdrop-game .agency`.

- [ ] **Step 7: Draw the game places**

Create `css/places-game.css`:

```css
/* ACT IV places: pixel rooms. The canvas sky sits in the sky plane; props are crisp pixel shapes. */
.place-game { --plane-dim: .7; image-rendering: pixelated; }
.pixel-sky { position: absolute; inset: 0; width: 1280px; height: 720px; image-rendering: pixelated; }
.iris-wipe { position: absolute; inset: 0; background: #000; }
.place-game .g-floor { border-top: 6px solid #22160e; background: repeating-conic-gradient(var(--f1, #3a2a1e) 0 25%, var(--f2, #4a3626) 0 50%) 0 0 / 48px 48px; }

/* THE WORKSHOP */
.place-game .gw-pegboard { background: radial-gradient(circle, #3a2614 2px, transparent 2.5px) 0 0 / 20px 20px, #a07a4c; border: 8px solid #5a3a20; }
.place-game .gw-bench { background: linear-gradient(#8a5a32 0 12px, #5a3a20 12px 16px, transparent 16px), linear-gradient(90deg, #5a3a20 0 16px, transparent 16px calc(100% - 16px), #5a3a20 calc(100% - 16px)); }
.place-game .gw-lamp { background: linear-gradient(#c0c0c0, #c0c0c0) 50% 0 / 6px 150px no-repeat, linear-gradient(#e2b33c, #e2b33c) 50% 150px / 50px 22px no-repeat, radial-gradient(ellipse 34px 40px at 50% 190px, rgba(255, 220, 140, .6), transparent) no-repeat; }
.place-game .gw-chicken { background: linear-gradient(#f2f2f2, #f2f2f2) 50% 0 / 4px 18px no-repeat, linear-gradient(#9a9a9a, #9a9a9a) 50% 18px / 16px 8px no-repeat, linear-gradient(#f6e05e, #f6e05e) 50% 28px / 22px 34px no-repeat, linear-gradient(#e04a3a, #e04a3a) 60% 26px / 6px 6px no-repeat; }
.place-game .gw-floor { --f1: #3a2a1e; --f2: #4a3626; }

/* MUSEUM OF TALKING MACHINES */
.place-game .gm-plinth { background: linear-gradient(#1d1d2e, #1d1d2e) 50% 0 / 120px 90px no-repeat, linear-gradient(#9dff00, #9dff00) 50% 22px / 90px 4px no-repeat, linear-gradient(#cfcfcf, #8a8a8a) 50% 100% / 150px 140px no-repeat; }
.place-game .gm-plaque { background: #b88b55; color: #1c1430; font: 10px/26px 'Press Start 2P', monospace; text-align: center; }
.place-game .gm-hal { border-radius: 50%; background: radial-gradient(circle, #ffe08a 0 8%, #ff2a2a 10% 40%, #5a0000 42% 60%, #1a1a1a 62%); box-shadow: 0 0 18px #ff2a2a; animation: hal-pulse 3s ease-in-out infinite; }
@keyframes hal-pulse { 50% { box-shadow: 0 0 30px #ff2a2a; } }
.place-game .gm-floor { --f1: #1a1a28; --f2: #232336; }

/* THE AGENT'S OFFICE */
.place-game .go-crt { background: linear-gradient(#0d2a1a, #0d2a1a) 50% 30px / 160px 110px no-repeat, #9a9a9a; border: 6px solid #6a6a6a; box-shadow: inset 0 0 30px #3cff8a55; }
.place-game .go-clippy { background: linear-gradient(#c0c0c0, #c0c0c0) 30% 10% / 8px 80% no-repeat, linear-gradient(#c0c0c0, #c0c0c0) 70% 20% / 8px 70% no-repeat, linear-gradient(#c0c0c0, #c0c0c0) 50% 8% / 34px 8px no-repeat, radial-gradient(circle, #111 3px, #fff 4px 8px, transparent 9px) 30% 30% / 20px 20px no-repeat, radial-gradient(circle, #111 3px, #fff 4px 8px, transparent 9px) 70% 30% / 20px 20px no-repeat; }
.place-game .go-bubble { background: #ffffcc; color: #111; border: 3px solid #111; font: 18px/22px 'VT323', monospace; text-align: center; }
.place-game .go-desk { background: linear-gradient(#6b4a2e 0 12px, transparent 12px), linear-gradient(90deg, #4a3220 0 14px, transparent 14px calc(100% - 14px), #4a3220 calc(100% - 14px)); }
.place-game .go-save { background: #ffd84a; clip-path: polygon(50% 0, 62% 36%, 100% 38%, 70% 60%, 80% 100%, 50% 76%, 20% 100%, 30% 60%, 0 38%, 38% 36%); animation: save-twinkle 1.2s steps(2) infinite; }
@keyframes save-twinkle { 50% { opacity: .4; } }
.place-game .go-floor { --f1: #3b3b4f; --f2: #45455c; }

/* THE COMMONS */
.place-game .gk-capitol { background: radial-gradient(ellipse 60px 50px at 50% 70px, #e8e0d0 98%, transparent) no-repeat, linear-gradient(#e8e0d0, #e8e0d0) 50% 110px / 260px 20px no-repeat, repeating-linear-gradient(90deg, #e8e0d0 0 14px, transparent 14px 34px) 50% 130px / 240px 120px no-repeat, linear-gradient(#cfc6b2, #cfc6b2) 50% 100% / 300px 30px no-repeat; }
.place-game .gk-palm { background: linear-gradient(#7a5a32, #7a5a32) 50% 60px / 12px 270px no-repeat; }
.place-game .gk-palm::before { content: ''; position: absolute; left: 0; top: 20px; width: 72px; height: 70px; background: #2f7a3a; clip-path: polygon(50% 40%, 0 20%, 30% 50%, 0 80%, 45% 55%, 50% 100%, 55% 55%, 100% 80%, 70% 50%, 100% 20%); }
.place-game .gk-cans { background: linear-gradient(90deg, #8a8a8a 0 36px, transparent 36px 48px, #6a6a6a 48px); border-top: 4px solid #4a4a4a; }
.place-game .gk-floor { --f1: #4f7d3a; --f2: #5a8a42; }

/* THE FRONTIER */
.place-game .gf-corridor { background: linear-gradient(to right, #0b1830 0 2px, transparent 2px) 0 0 / 98px 100%, conic-gradient(from 180deg at 50% 45%, #1b2a4a, #0b1020, #1b2a4a); clip-path: polygon(0 0, 100% 0, 62% 45%, 62% 60%, 100% 100%, 0 100%, 38% 60%, 38% 45%); }
.place-game .gf-glow { background: radial-gradient(closest-side, rgba(120, 200, 255, .55), transparent); }
.place-game .gf-cake { color: #c8d6ff; font: 22px/26px 'VT323', monospace; transform: rotate(-3deg); opacity: .8; }
.place-game .gf-floor { --f1: #0b1020; --f2: #121a30; }

/* THE ALLOTMENT */
.place-game .ga-fence { background: repeating-linear-gradient(90deg, #d8c39a 0 12px, transparent 12px 40px), linear-gradient(transparent 30px, #d8c39a 30px 40px, transparent 40px 70px, #d8c39a 70px 80px, transparent 80px); }
.place-game .ga-beds { background: radial-gradient(circle 4px at 50% 30%, #4caf50 98%, transparent) 0 0 / 30px 38px, linear-gradient(transparent 22px, #6b4a2e 22px); }
.place-game .ga-rack { background: repeating-linear-gradient(#2a2a2a 0 26px, #111 26px 30px); border: 4px solid #555; }
.place-game .ga-rack::after { content: ''; position: absolute; inset: 8px 6px; background: radial-gradient(circle 2px, #9dff00 98%, transparent) 0 0 / 12px 30px; animation: save-twinkle .8s steps(2) infinite; }
.place-game .ga-scarecrow { background: linear-gradient(#8a5a32, #8a5a32) 50% 20px / 6px 60px no-repeat, linear-gradient(#8a5a32, #8a5a32) 50% 34px / 50px 6px no-repeat, radial-gradient(circle 10px at 50% 14px, #e2b33c 98%, transparent) no-repeat, linear-gradient(#c0544a, #c0544a) 50% 0 / 30px 6px no-repeat; }
.place-game .ga-floor { --f1: #5a8a42; --f2: #4f7d3a; }

/* THE COMMONS, AT SUNRISE */
.place-game .gq-library { background: linear-gradient(#cfc6b2, #cfc6b2) 50% 0 / 100% 40px no-repeat, repeating-linear-gradient(90deg, #e8e0d0 0 22px, transparent 22px 56px) 50% 50px / 90% 240px no-repeat, linear-gradient(#cfc6b2, #cfc6b2) 50% 100% / 100% 40px no-repeat; }
.place-game .gq-students { background: radial-gradient(circle 5px at 50% 7px, #f1c9a8 98%, transparent) 0 0 / 26px 36px, linear-gradient(transparent 14px, #355b8c 14px) 8px 0 / 26px 36px; }
.place-game .gq-tree { background: linear-gradient(#6b4a2e, #6b4a2e) 50% 120px / 14px 190px no-repeat, radial-gradient(circle 36px at 50% 70px, #3f8f4a 98%, transparent) no-repeat; }
.place-game .gq-floor { --f1: #6fa04f; --f2: #7aad58; }

/* THE ROAD AT THE END OF THE WORLD */
.place-game .gd-planet { border-radius: 50%; background: radial-gradient(circle at 35% 35%, #9fe3d8, #3f8f8a 55%, #12333a 80%, transparent 81%); }
.place-game .gd-cone { background: radial-gradient(ellipse 80px 460px at 70% 0, rgba(240, 180, 80, .45), transparent 70%); }
.place-game .gd-post { background: #0a0a12; overflow: visible; }
.place-game .gd-post::before { content: ''; position: absolute; left: -10px; top: 0; width: 32px; height: 10px; background: #f0b450; box-shadow: 0 0 18px #f0b450; }
.place-game .gd-moto { background: radial-gradient(circle 14px at 22px 24px, #05050a 70%, transparent 72%), radial-gradient(circle 14px at 108px 24px, #05050a 70%, transparent 72%), linear-gradient(#05050a, #05050a) 30px 8px / 70px 12px no-repeat; }
.place-game .gd-floor { --f1: #121018; --f2: #121018; background-image: linear-gradient(90deg, transparent 45%, #f0b450 45% 55%, transparent 55%); background-size: 120px 6px; background-repeat: repeat-x; background-position: 0 60px; }
```

Add `<link rel="stylesheet" href="css/places-game.css">` to `index.html` after the `css/places.css` link.

- [ ] **Step 8: Run the tests and screenshot every game place**

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`. Expected: `# fail 0`.

Serve the repo on port 8137 and screenshot these slides at 1280×720 into the scratchpad: `a4-act`, `a4-eliza`, `a4-undertale`, `a4-political`, `a4-frontier`, `a4-local-models`, `a4-dh-hub`, `a4-end-of-world`. Use the same chrome command as in Task 2, Step 9.

Check each screenshot for:
- the room name in the HUD matching the place;
- the dithered sky visible;
- no prop overlapping the dialogue card text;
- avatar feet on the floor line, with the pixel contact shadow.

Fix any piece that looks wrong by editing its CSS, and keep the box values the geometry test accepts. Then re-run the tests.

- [ ] **Step 9: Commit**

```bash
git add js/places/game.js js/render/pixel-sky.js js/fx/game.js js/core/acts.js js/core/deck.js js/data/act4-game.js css/places-game.css css/craft-game.css index.html tests/deck.test.js
git commit -m "feat: Act IV pixel places with dithered sky and walk-between-rooms transition

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then fast-forward `main` and push both branches.

---

### Task 4: Act I paper places and the pop-up fold transition

**Files:**
- Create: `css/places-paper.css`
- Modify: `js/places/paper.js`, `js/fx/paper.js`, `css/craft-paper.css`, `js/data/act1-paper.js`, `index.html`

**Interfaces:**
- Consumes: `PlaceDecls.register`, `Places`, and `Crafts.placeTransition`.
- Produces: the paper place ids `storybook`, `hamlet`, `platform-city`, `mid-world`, `gallery-row`, `companion-shop`, `worktable`, and the `data-watch` attribute on `#backdrop` that the companion-shop eyes read.

- [ ] **Step 1: Declare the paper places**

Replace the `reg.register('paper', {});` line in `js/places/paper.js` with:

```js
  const tab = (label) => ({ layer: 'label', cls: 'paper-tab', box: [236, 0, 210, 46], text: label });
  reg.register('paper', {
    storybook: {
      label: 'The Storybook', credit: '', floor: 684,
      pieces: [
        { layer: 'far', cls: 'sb-table', box: [0, 500, 1280, 220] },
        { layer: 'far', cls: 'sb-book', box: [170, 70, 940, 540] },
        { layer: 'mid', cls: 'sb-tab sb-tab-1', box: [700, 10, 92, 40], text: 'paper' },
        { layer: 'mid', cls: 'sb-tab sb-tab-2', box: [798, 10, 92, 40], text: 'thread' },
        { layer: 'mid', cls: 'sb-tab sb-tab-3', box: [896, 10, 92, 40], text: 'zine' },
        { layer: 'mid', cls: 'sb-tab sb-tab-4', box: [994, 10, 120, 40], text: 'cartridge' },
        { layer: 'egg', cls: 'sb-crane', box: [1214, 560, 58, 50] },
        { layer: 'near', cls: 'sb-edge', box: [0, 662, 1280, 58] },
        tab('The Storybook'),
      ],
    },
    hamlet: {
      label: 'Handmade Hamlet', credit: 'Personal homepages, webrings and guestbooks', floor: 684,
      pieces: [
        { layer: 'far', cls: 'hm-hill', box: [0, 420, 1280, 300] },
        { layer: 'far', cls: 'hm-cottage', box: [250, 330, 150, 150] },
        { layer: 'far', cls: 'hm-cottage hm-c2', box: [560, 300, 170, 180] },
        { layer: 'far', cls: 'hm-cottage hm-c3', box: [900, 340, 150, 140] },
        { layer: 'mid', cls: 'hm-mailbox', box: [140, 630, 56, 54], text: 'guest\nbook' },
        { layer: 'mid', cls: 'hm-bridge', box: [420, 650, 460, 46], text: '◄ webring ►' },
        { layer: 'egg', cls: 'hm-sawhorse', box: [1000, 664, 64, 40] },
        { layer: 'egg', cls: 'hm-sawhorse', box: [1212, 640, 56, 40] },
        { layer: 'near', cls: 'hm-grass', box: [0, 682, 1280, 38] },
        tab('Handmade Hamlet'),
      ],
    },
    'platform-city': {
      label: 'Platform City', credit: 'Cory Doctorow, enshittification', floor: 684,
      pieces: [
        { layer: 'far', cls: 'pc-tower pc-t1', box: [300, 130, 190, 560] },
        { layer: 'far', cls: 'pc-tower pc-t2', box: [560, 90, 190, 600] },
        { layer: 'far', cls: 'pc-tower pc-t3', box: [820, 150, 190, 540] },
        { layer: 'mid', cls: 'pc-billboard', box: [1212, 170, 60, 210], text: 'ADS\nADS\nADS' },
        { layer: 'egg', cls: 'pc-msign', box: [1110, 6, 46, 46], text: 'M' },
        { layer: 'near', cls: 'pc-street', box: [0, 660, 1280, 60] },
        tab('Platform City'),
      ],
    },
    'mid-world': {
      label: 'Mid-World', credit: 'The Dark Tower, Stephen King (Blaine the Mono, the rose); Pac-Man; Moltbook', floor: 684,
      pieces: [
        { layer: 'far', cls: 'mw-dusk', box: [0, 0, 1280, 720] },
        { layer: 'far', cls: 'mw-dunes', box: [0, 430, 1280, 290] },
        { layer: 'far', cls: 'mw-tower', box: [1030, 80, 84, 370] },
        { layer: 'egg', cls: 'mw-ghost', box: [320, 200, 64, 74], quiet: true },
        { layer: 'egg', cls: 'mw-ghost mw-pac', box: [880, 130, 64, 64], quiet: true },
        { layer: 'egg', cls: 'mw-monorail', box: [0, 72, 212, 40], text: 'BLAINE' },
        { layer: 'egg', cls: 'mw-gunslinger', box: [1228, 520, 16, 32] },
        { layer: 'egg', cls: 'mw-lobster', box: [700, 656, 64, 44] },
        { layer: 'near', cls: 'mw-rose', box: [1212, 590, 60, 120] },
        { layer: 'near', cls: 'mw-sand', box: [0, 680, 1280, 40] },
        tab('Mid-World'),
      ],
    },
    'gallery-row': {
      label: 'Gallery Row', credit: 'Apricitas Economics; Andersen v. Stability AI', floor: 684,
      pieces: [
        { layer: 'far', cls: 'gy-shops', box: [220, 240, 1000, 430], text: 'FOR LEASE          FOR LEASE          FOR LEASE' },
        { layer: 'mid', cls: 'gy-columns', box: [1210, 110, 68, 560] },
        { layer: 'egg', cls: 'gy-lamp', box: [150, 6, 40, 110] },
        { layer: 'near', cls: 'gy-sidewalk', box: [0, 664, 1280, 56] },
        tab('Gallery Row'),
      ],
    },
    'companion-shop': {
      label: 'The Companion Shop', credit: 'Sanrio, Tamagotchi, Furby; Meta’s Jolly', floor: 684,
      pieces: [
        { layer: 'far', cls: 'cs-window', box: [200, 60, 1040, 600] },
        { layer: 'mid', cls: 'cs-shelf', box: [460, 6, 720, 48] },
        { layer: 'egg', cls: 'cs-furby', box: [1190, 4, 60, 50] },
        { layer: 'mid', cls: 'cs-tamagotchi', box: [1214, 280, 52, 66] },
        { layer: 'mid', cls: 'cs-yeti', box: [1212, 400, 62, 112] },
        { layer: 'mid', cls: 'cs-tag', box: [600, 654, 120, 38], text: 'FREE*' },
        { layer: 'occluder', cls: 'cs-counter', box: [0, 632, 220, 88] },
        tab('The Companion Shop'),
      ],
    },
    worktable: {
      label: 'The Worktable', credit: 'Mouse Trap (Ideal, 1963)', floor: 684,
      pieces: [
        { layer: 'far', cls: 'wt-mat', box: [180, 70, 1060, 610] },
        { layer: 'mid', cls: 'wt-scissors', box: [1212, 420, 62, 150] },
        { layer: 'mid', cls: 'wt-pattern', box: [300, 650, 230, 56], text: 'CUT ON FOLD' },
        { layer: 'mid', cls: 'wt-pattern wt-pattern-2', box: [820, 654, 170, 52], text: 'GRAIN →' },
        { layer: 'egg', cls: 'wt-mousetrap', box: [880, 4, 300, 50] },
        tab('The Worktable'),
      ],
    },
  });
```

The shelf starts at x 460, so it stays clear of the label tab at x 236–446.

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`
Expected: `# fail 0` for the geometry checks. `placeErrors` now FAILS for `a1-title`. That's expected until Step 2.

- [ ] **Step 2: Tag the Act I data**

```bash
node -e "
const fs=require('fs');const p='js/data/act1-paper.js';let s=fs.readFileSync(p,'utf8');
const map={'a1-title':'storybook','a1-personal':'hamlet','a1-enshittification':'platform-city','a1-dark-tower':'mid-world','a1-creative-class':'gallery-row','a1-muse':'companion-shop','a1-lens':'worktable'};
for(const [id,pl] of Object.entries(map)){const re=new RegExp(\"(id: '\"+id+\"', act: 1, minutes: [0-9.]+,)\");if(!re.test(s))throw new Error(id);s=s.replace(re,\"\$1 place: '\"+pl+\"',\");}
fs.writeFileSync(p,s);"
grep -c "place:" js/data/act1-paper.js
```

Expected: `7`. Then run `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"` and expect `# fail 0`.

- [ ] **Step 3: Paper craft: remove the old static backdrop, add the fold transition and the watching eyes**

In `js/fx/paper.js`, replace `backdrop(bg) { … }` (lines 11–23) with an empty `backdrop() {},`. The paper texture stays on `.backdrop-paper` in CSS.

At the start of `decorate(root, scene) {`, add:

```js
      const bg = document.getElementById('backdrop');
      if (bg) bg.dataset.watch = WATCHING.includes(scene.id) ? '1' : '';
```

After line 8 (`const wrapOf = …`), add:

```js
  // On these slides the Companion Shop plushies' eyes turn toward the avatar.
  const WATCHING = ['a1-muse-memory', 'a1-muse-strengthen'];
```

Add this property after the `decorate` method:

```js
    // The pop-up spread folds flat to the floor, then the next spread rises.
    async placeTransition(oldEl, newEl) {
      newEl.style.visibility = 'hidden';
      await anim(oldEl, [{ transform: 'scaleY(1)' }, { transform: 'scaleY(0)' }], { duration: 320, easing: 'cubic-bezier(.5,0,.8,.4)', fill: 'forwards' });
      newEl.style.visibility = '';
      await anim(newEl, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1.04)', offset: 0.8 }, { transform: 'scaleY(1)' }], { duration: 480, fill: 'none' });
    },
```

In `css/craft-paper.css`, delete the rules for `.backdrop-paper .paper-sun`, `.backdrop-paper .hill`, `.backdrop-paper .hill.h1/.h2/.h3`, `.backdrop-paper .scrap`, and the `@keyframes drift`, `spin` and `sun-turn` lines. Keep `.backdrop-paper { … }` with its noise texture.

- [ ] **Step 4: Draw the paper places**

Create `css/places-paper.css`:

```css
/* ACT I places: cut-paper dioramas. Every piece casts a paper shadow; far planes are dimmed. */
.place-paper { --plane-dim: .5; transform-origin: 50% 100%; }
.place-paper .piece { filter: drop-shadow(0 3px 2px rgba(60, 40, 20, .3)); }
.place-paper .paper-tab { background: #b6452c; color: #fffaf0; font: 26px/46px 'Patrick Hand', cursive; text-align: center; border-radius: 0 0 10px 10px; }

/* The Storybook */
.place-paper .sb-table { background: repeating-linear-gradient(90deg, #a2754a 0 120px, #96693f 120px 124px); }
.place-paper .sb-book { background: linear-gradient(90deg, #fffaf0 0 49.6%, #d9ccb0 49.6% 50.4%, #fffaf0 50.4%); border-radius: 6px; box-shadow: 0 0 0 10px #8a4b2f; }
.place-paper .sb-tab { color: #fffaf0; font: 20px/40px 'Patrick Hand', cursive; text-align: center; border-radius: 0 0 8px 8px; }
.place-paper .sb-tab-1 { background: #c97d4f; }
.place-paper .sb-tab-2 { background: #7b4fb3; }
.place-paper .sb-tab-3 { background: #222; }
.place-paper .sb-tab-4 { background: #3f8f8a; }
.place-paper .sb-crane { background: #e98e7f; clip-path: polygon(0 60%, 45% 45%, 50% 0, 58% 45%, 100% 30%, 62% 70%, 40% 100%, 35% 70%); }
.place-paper .sb-edge { background: #7a5232; }

/* Handmade Hamlet */
.place-paper .hm-hill { background: #a9c09b; border-radius: 50% 50% 0 0 / 60% 60% 0 0; }
.place-paper .hm-cottage { background: linear-gradient(#f2b04a, #f2b04a) 30% 70% / 22% 30% no-repeat, linear-gradient(#fffaf0, #fffaf0) 0 100% / 100% 58% no-repeat; }
.place-paper .hm-cottage::before { content: ''; position: absolute; inset: 0 0 56% 0; background: #b6452c; clip-path: polygon(50% 0, 100% 100%, 0 100%); }
.place-paper .hm-c2::before { background: #7b4fb3; }
.place-paper .hm-c3::before { background: #3f8f8a; }
.place-paper .hm-mailbox { background: #b6452c; border-radius: 22px 22px 4px 4px; color: #fffaf0; font: 14px/16px 'Patrick Hand', cursive; text-align: center; padding-top: 10px; }
.place-paper .hm-bridge { background: #c7b48b; border-radius: 50% 50% 0 0 / 100% 100% 0 0; color: #2b2118; font: 22px/50px 'Patrick Hand', cursive; text-align: center; }
.place-paper .hm-sawhorse { background: repeating-linear-gradient(45deg, #f2b04a 0 8px, #2b2118 8px 16px) 0 0 / 100% 12px no-repeat, linear-gradient(#8a6a3e, #8a6a3e) 10% 12px / 6px 28px no-repeat, linear-gradient(#8a6a3e, #8a6a3e) 90% 12px / 6px 28px no-repeat; }
.place-paper .hm-grass { background: #8aa57e; clip-path: polygon(0 30%, 4% 0, 8% 30%, 12% 5%, 16% 30%, 20% 0, 24% 30%, 28% 8%, 32% 30%, 36% 0, 40% 30%, 44% 6%, 48% 30%, 52% 0, 56% 30%, 60% 5%, 64% 30%, 68% 0, 72% 30%, 76% 8%, 80% 30%, 84% 0, 88% 30%, 92% 6%, 96% 30%, 100% 0, 100% 100%, 0 100%); }

/* Platform City */
.place-paper .pc-tower { background: repeating-linear-gradient(transparent 0 26px, rgba(255, 250, 240, .7) 26px 40px) 20px 30px / 150px 100% no-repeat; }
.place-paper .pc-t1 { background-color: #f2b04a; }
.place-paper .pc-t2 { background-color: #b5a58a; }
.place-paper .pc-t3 { background-color: #8a8478; }
.place-paper .pc-billboard { background: #fffaf0; color: #b6452c; font: 24px/1.4 'Patrick Hand', cursive; text-align: center; padding-top: 30px; clip-path: polygon(0 0, 100% 0, 100% 86%, 70% 100%, 76% 86%, 0 86%); }
.place-paper .pc-msign { background: #2b2118; color: #fffaf0; font: 34px/46px Georgia, serif; text-align: center; transform: rotate(14deg); }
.place-paper .pc-street { background: linear-gradient(90deg, transparent 45%, #f2b04a 45% 55%, transparent 55%) 0 50% / 140px 6px repeat-x, #6b6258; }

/* Mid-World */
.place-paper .mw-dusk { background: linear-gradient(#e9a466, #f3d29a 60%, #efe4cf); }
.place-paper .mw-dunes { background: #d9a86a; border-radius: 40% 60% 0 0 / 30% 50% 0 0; }
.place-paper .mw-tower { background: #2b2118; clip-path: polygon(30% 0, 70% 0, 72% 8%, 64% 8%, 68% 100%, 32% 100%, 36% 8%, 28% 8%); }
.place-paper .mw-ghost { background: rgba(255, 255, 255, .9); opacity: .3; border-radius: 50% 50% 10% 10%; clip-path: polygon(0 40%, 10% 10%, 50% 0, 90% 10%, 100% 40%, 100% 100%, 80% 85%, 60% 100%, 40% 85%, 20% 100%, 0 85%); animation: mw-float 9s ease-in-out infinite alternate; }
.place-paper .mw-pac { animation-duration: 12s; }
@keyframes mw-float { to { transform: translate(60px, -24px); } }
.place-paper .mw-monorail { background: #fffaf0; border: 3px solid #2b2118; border-radius: 30px 6px 6px 30px; color: #b6452c; font: 18px/34px 'Patrick Hand', cursive; text-align: center; transform: rotate(-4deg); }
.place-paper .mw-gunslinger { background: #2b2118; clip-path: polygon(30% 0, 70% 0, 70% 20%, 100% 22%, 0 22%, 30% 20%, 30% 30%, 75% 32%, 70% 100%, 55% 100%, 50% 65%, 45% 100%, 30% 100%, 25% 32%); }
.place-paper .mw-lobster { background: #c0392b; clip-path: polygon(20% 0, 35% 25%, 50% 15%, 65% 25%, 80% 0, 75% 40%, 90% 55%, 70% 70%, 50% 100%, 30% 70%, 10% 55%, 25% 40%); }
.place-paper .mw-rose { background: radial-gradient(circle 16px at 50% 20px, #c0392b 96%, transparent) no-repeat, linear-gradient(#4f7d3a, #4f7d3a) 50% 30px / 5px 90px no-repeat, radial-gradient(ellipse 12px 6px at 38% 70px, #4f7d3a 96%, transparent) no-repeat; }
.place-paper .mw-sand { background: #c99a5e; }

/* Gallery Row */
.place-paper .gy-shops { background: repeating-linear-gradient(90deg, #fffaf0 0 300px, #d9ccb0 300px 334px), #fffaf0; color: #b6452c; font: 28px/430px 'Patrick Hand', cursive; text-align: center; white-space: pre; }
.place-paper .gy-columns { background: repeating-linear-gradient(90deg, #fffaf0 0 18px, #d9ccb0 18px 24px) 0 40px / 100% calc(100% - 60px) no-repeat, linear-gradient(#fffaf0, #fffaf0) 0 0 / 100% 36px no-repeat, linear-gradient(#d9ccb0, #d9ccb0) 0 100% / 100% 20px no-repeat; }
.place-paper .gy-lamp { background: linear-gradient(#2b2118, #2b2118) 50% 20px / 5px 90px no-repeat, radial-gradient(ellipse 20px 10px at 50% 14px, #b6452c 96%, transparent) no-repeat; }
.place-paper .gy-sidewalk { background: repeating-linear-gradient(90deg, #b5a58a 0 98px, #8a8478 98px 100px); }

/* The Companion Shop */
.place-paper .cs-window { background: linear-gradient(#f7c6d9, #fbe3ec); border: 14px solid #fffaf0; border-radius: 24px 24px 0 0; }
.place-paper .cs-shelf {
  --eye: 22px;
  background:
    radial-gradient(circle 3px at var(--eye) 18px, #2b2118 96%, transparent) 0 0 / 60px 48px,
    radial-gradient(circle 3px at calc(var(--eye) + 14px) 18px, #2b2118 96%, transparent) 0 0 / 60px 48px,
    radial-gradient(ellipse 22px 20px at 29px 22px, #fffaf0 96%, transparent) 0 0 / 60px 48px,
    linear-gradient(#b88b55, #b88b55) 0 100% / 100% 6px no-repeat;
}
.backdrop[data-watch="1"] .cs-shelf { --eye: 17px; }
.place-paper .cs-furby { background: radial-gradient(circle 7px at 35% 40%, #fff 40%, #2b2118 45% 60%, #fff 65%) no-repeat, radial-gradient(circle 7px at 65% 40%, #fff 40%, #2b2118 45% 60%, #fff 65%) no-repeat, radial-gradient(ellipse 28px 24px at 50% 50%, #7b4fb3 96%, transparent); }
.place-paper .cs-tamagotchi { background: radial-gradient(ellipse 14px 12px at 50% 46%, #cfe8c4 96%, transparent) no-repeat, radial-gradient(ellipse 26px 33px at 50% 50%, #e98e7f 96%, transparent); }
.place-paper .cs-yeti { background: linear-gradient(#2b2b36, #2b2b36) 50% 100% / 48px 54px no-repeat, radial-gradient(ellipse 26px 34px at 50% 36px, #f4ead8 96%, transparent) no-repeat, linear-gradient(#111, #111) 50% 30px / 34px 6px no-repeat; }
.place-paper .cs-tag { background: #fffaf0; color: #b6452c; font: 24px/38px 'Patrick Hand', cursive; text-align: center; clip-path: polygon(14% 0, 100% 0, 100% 100%, 14% 100%, 0 50%); }
.cs-counter { background: linear-gradient(#e98e7f 0 12px, #fffaf0 12px); border-radius: 6px 6px 0 0; filter: drop-shadow(0 -2px 2px rgba(60, 40, 20, .3)); }

/* The Worktable */
.place-paper .wt-mat { background: linear-gradient(rgba(255, 255, 255, .25) 1px, transparent 1px) 0 0 / 40px 40px, linear-gradient(90deg, rgba(255, 255, 255, .25) 1px, transparent 1px) 0 0 / 40px 40px, #4f7d6a; border-radius: 10px; }
.place-paper .wt-scissors { background: radial-gradient(circle 16px at 30% 82%, transparent 60%, #b6452c 62%) no-repeat, radial-gradient(circle 16px at 70% 82%, transparent 60%, #b6452c 62%) no-repeat, linear-gradient(160deg, transparent 45%, #c0c0c0 46% 54%, transparent 55%) 0 0 / 100% 70% no-repeat, linear-gradient(20deg, transparent 45%, #a0a0a0 46% 54%, transparent 55%) 0 0 / 100% 70% no-repeat; }
.place-paper .wt-pattern { background: #f4ead8; border: 2px dashed #6b5a45; color: #6b5a45; font: 18px/52px 'Special Elite', monospace; text-align: center; clip-path: polygon(0 0, 92% 0, 100% 40%, 100% 100%, 6% 100%); }
.place-paper .wt-pattern-2 { transform: rotate(-3deg); }
.place-paper .wt-mousetrap { background: radial-gradient(circle 7px at 10px 25px, #b6452c 96%, transparent) no-repeat, linear-gradient(90deg, #f2b04a 0 25%, #3f8f8a 25% 50%, #7b4fb3 50% 75%, #c97d4f 75%) 0 32px / 100% 6px no-repeat, linear-gradient(#2b2118, #2b2118) 85% 0 / 4px 40px no-repeat; animation: mt-roll 4s linear infinite; }
@keyframes mt-roll { from { background-position: 0 0, 0 32px, 85% 0; } to { background-position: 280px 0, 0 32px, 85% 0; } }
```

Add `<link rel="stylesheet" href="css/places-paper.css">` to `index.html` after the `css/places.css` link.

- [ ] **Step 5: Run the tests and screenshot every paper place**

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`. Expected: `# fail 0`.

Screenshot these slides into the scratchpad: `a1-title`, `a1-personal`, `a1-enshittification`, `a1-dark-tower`, `a1-creative-class`, `a1-muse`, `a1-muse-memory`, `a1-lens`.

Check each for:
- the tab label at the top left;
- the set piece readable around the card;
- no text competing with the card;
- the counter drawn in front of the avatar's legs on `a1-muse`;
- the eyes shifted left on `a1-muse-memory`.

Fix any drawing in CSS only, then re-run the tests.

- [ ] **Step 6: Commit**

```bash
git add js/places/paper.js js/fx/paper.js js/data/act1-paper.js css/places-paper.css css/craft-paper.css index.html
git commit -m "feat: Act I paper places (Storybook to Worktable) with the pop-up fold transition

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then fast-forward `main` and push both branches.

---

### Task 5: Act II textile places and the re-stitch transition

**Files:**
- Create: `css/places-textile.css`
- Modify: `js/places/textile.js`, `js/fx/textile.js`, `css/craft-textile.css`, `js/data/act2-textile.js`, `index.html`

**Interfaces:**
- Consumes: `PlaceDecls.register`, `Places`, `Crafts.placeTransition`, and `Crafts.fxLayer`.
- Produces: the textile place ids `sewing-room`, `code-camp`, `sampler-wall`, `craft-fair`, `quilting-bee`.

- [ ] **Step 1: Declare the textile places**

Replace the `reg.register('textile', {});` line in `js/places/textile.js` with:

```js
  const hoop = { layer: 'sky', cls: 'tx-hoop', box: [0, 40, 1280, 640] };
  const label = (text) => ({ layer: 'label', cls: 'tx-label', box: [990, 648, 210, 30], text });
  reg.register('textile', {
    'sewing-room': {
      label: 'The Sewing Room', credit: '', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'sr-window', box: [880, 90, 260, 220] },
        { layer: 'far', cls: 'sr-dressform', box: [270, 190, 120, 330] },
        { layer: 'mid', cls: 'sr-machine', box: [14, 44, 190, 76] },
        { layer: 'mid', cls: 'sr-spool', box: [1212, 540, 54, 80] },
        { layer: 'egg', cls: 'sr-pincushion', box: [1100, 650, 44, 28] },
        label('The Sewing Room'),
      ],
    },
    'code-camp': {
      label: 'Code Camp', credit: 'Commodore 64 BASIC; Hour of Code', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'cc-desks', box: [240, 470, 960, 180] },
        { layer: 'far', cls: 'cc-monitor', box: [760, 110, 300, 230] },
        { layer: 'mid', cls: 'cc-banner', box: [300, 648, 320, 30], text: 'HOUR OF CODE' },
        { layer: 'mid', cls: 'cc-sampler', box: [12, 40, 198, 80], text: '10 PRINT "HELLO"\n20 GOTO 10' },
        { layer: 'light', cls: 'cc-spot', box: [1170, 300, 110, 340] },
        { layer: 'egg', cls: 'cc-chair', box: [1212, 520, 60, 110] },
        label('Code Camp'),
      ],
    },
    'sampler-wall': {
      label: 'The Sampler Wall', credit: 'Donna Haraway, A Cyborg Manifesto; the Jacquard loom', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'sw-frames', box: [240, 80, 960, 520] },
        { layer: 'mid', cls: 'sw-cyborg', box: [12, 40, 200, 80], text: '“I’d rather be a cyborg\nthan a goddess.”' },
        { layer: 'mid', cls: 'sw-home', box: [560, 648, 260, 30], text: 'HOME SWEET HOME PAGE' },
        { layer: 'egg', cls: 'sw-jacquard', box: [1212, 90, 60, 440] },
        label('The Sampler Wall'),
      ],
    },
    'craft-fair': {
      label: 'The Craft Fair', credit: 'Animal Crossing (Able Sisters); Kid Pix; Twine; Tracery', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'cf-stalls', box: [240, 290, 960, 370] },
        { layer: 'mid', cls: 'cf-bunting', box: [220, 40, 980, 16] },
        { layer: 'mid', cls: 'cf-sign', box: [300, 648, 150, 30], text: 'KID PIX' },
        { layer: 'mid', cls: 'cf-sign', box: [470, 648, 130, 30], text: 'TWINE' },
        { layer: 'mid', cls: 'cf-sign', box: [620, 648, 150, 30], text: 'TRACERY' },
        { layer: 'mid', cls: 'cf-yarn', box: [120, 636, 90, 44] },
        { layer: 'egg', cls: 'cf-able', box: [1210, 150, 66, 200], text: 'ABLE\nSIS\nTERS' },
        label('The Craft Fair'),
      ],
    },
    'quilting-bee': {
      label: 'The Quilting Bee', credit: '', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'qb-frame', box: [240, 150, 960, 430] },
        { layer: 'mid', cls: 'qb-chairs', box: [240, 648, 720, 30] },
        { layer: 'mid', cls: 'qb-tea', box: [20, 60, 180, 60] },
        { layer: 'egg', cls: 'qb-robot', box: [1210, 250, 64, 190] },
        label('The Quilting Bee'),
      ],
    },
  });
```

- [ ] **Step 2: Tag the Act II data**

```bash
node -e "
const fs=require('fs');const p='js/data/act2-textile.js';let s=fs.readFileSync(p,'utf8');
const map={'a2-act':'sewing-room','a2-learn-to-code':'code-camp','a2-losh':'sampler-wall','a2-casual-creators':'craft-fair','a2-bridge':'quilting-bee'};
for(const [id,pl] of Object.entries(map)){const re=new RegExp(\"(id: '\"+id+\"', act: 2, minutes: [0-9.]+,)\");if(!re.test(s))throw new Error(id);s=s.replace(re,\"\$1 place: '\"+pl+\"',\");}
fs.writeFileSync(p,s);"
grep -c "place:" js/data/act2-textile.js
```

Expected: `5`. Then run `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"` and expect `# fail 0`.

- [ ] **Step 3: Textile craft: move the spool into the Sewing Room and add the re-stitch transition**

In `js/fx/textile.js`, replace the body of `backdrop(bg) { … }` so it only builds the quilt borders:

```js
    backdrop(bg) {
      ['top', 'bottom'].forEach((pos) => {
        const row = el('div', 'quilt-border ' + pos);
        for (let i = 0; i < 16; i++) row.append(el('div', 'patch'));
        bg.append(row);
      });
    },
```

After `decorate(root) { … },`, add:

```js
    // A running stitch crosses the stage; the new felt is revealed behind the needle.
    async placeTransition(oldEl, newEl) {
      const line = el('div', 'restitch-line');
      fxLayer().append(line);
      await Promise.all([
        anim(line, [{ transform: 'translateX(-40px)' }, { transform: 'translateX(1300px)' }], { duration: 800, easing: 'linear', fill: 'none' }),
        anim(newEl, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 800, easing: 'linear', fill: 'none' }),
      ]);
      line.remove();
    },
```

In `js/fx/textile.js`, change line 4 from `const { anim, el, svgEl } = Crafts;` to `const { anim, el, svgEl, fxLayer } = Crafts;`.

In `css/craft-textile.css`, delete the `.backdrop-textile .spool`, `.backdrop-textile .loose-thread` and `@keyframes spool-wobble` rules. Keep the quilt border rules.

- [ ] **Step 4: Draw the textile places**

Create `css/places-textile.css`:

```css
/* ACT II places: felt appliqué inside an embroidery hoop. Felt pieces get a soft edge and a running stitch. */
.place-textile { --plane-dim: .55; }
.place-textile .plane-mid .piece, .place-textile .plane-egg .piece { border-radius: 6px; box-shadow: 0 3px 0 rgba(0, 0, 0, .12); outline: 2px dashed rgba(255, 255, 255, .55); outline-offset: -5px; }
.place-textile .tx-hoop { background: radial-gradient(ellipse 62% 70% at 50% 50%, transparent 80%, rgba(184, 139, 85, .35) 81% 84%, rgba(120, 90, 50, .18) 85%); }
.place-textile .tx-label { background: #fbf6ea; color: #7b4fb3; font: 700 16px/30px 'Courier Prime', monospace; text-align: center; letter-spacing: 1px; border: 2px solid #7b4fb3; outline: none; }
.restitch-line { position: absolute; top: 0; bottom: 0; left: 0; width: 4px; background: repeating-linear-gradient(#7b4fb3 0 18px, transparent 18px 30px); }

/* The Sewing Room */
.place-textile .sr-window { background: repeating-linear-gradient(75deg, transparent 0 22px, rgba(123, 79, 179, .55) 22px 25px) 0 0 / 100% 200%, #cfe3ef; border: 12px solid #fbf6ea; animation: yarn-rain 3s linear infinite; }
@keyframes yarn-rain { to { background-position: 0 220px, 0 0; } }
.place-textile .sr-dressform { background: linear-gradient(#6b4a2e, #6b4a2e) 50% 100% / 8px 90px no-repeat, radial-gradient(ellipse 50px 110px at 50% 120px, #c0544a 96%, transparent) no-repeat; }
.place-textile .sr-machine { background: linear-gradient(#e9e0cc, #e9e0cc) 10px 50px / 170px 20px no-repeat, linear-gradient(#3f8f8a, #3f8f8a) 20px 10px / 140px 40px no-repeat, linear-gradient(#3f8f8a, #3f8f8a) 140px 10px / 20px 60px no-repeat; }
.place-textile .sr-spool { background: linear-gradient(#b88b55 0 12px, #7b4fb3 12px 66px, #b88b55 66px); animation: spool-wobble 3s ease-in-out infinite alternate; }
@keyframes spool-wobble { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }
.place-textile .sr-pincushion { background: radial-gradient(ellipse 22px 14px at 50% 60%, #c0544a 96%, transparent) no-repeat, linear-gradient(#4f7d3a, #4f7d3a) 50% 0 / 10px 6px no-repeat; }

/* Code Camp */
.place-textile .cc-desks { background: repeating-linear-gradient(90deg, #b88b55 0 160px, transparent 160px 200px) 0 40px / 100% 30px no-repeat, repeating-linear-gradient(90deg, #b88b55 0 160px, transparent 160px 200px) 0 120px / 100% 30px no-repeat; }
.place-textile .cc-monitor { background: linear-gradient(#3a2f8f, #3a2f8f) 50% 26px / 250px 160px no-repeat, #d9cfb0; border-radius: 10px; }
.place-textile .cc-banner { background: #e2b33c; color: #2d2a4a; font: 700 18px/30px 'Courier Prime', monospace; text-align: center; }
.place-textile .cc-sampler { background: #3a2f8f; color: #9dc3ff; font: 700 15px/26px 'Courier Prime', monospace; padding: 12px 10px; }
.place-textile .cc-spot { background: radial-gradient(ellipse 50px 170px at 50% 100%, rgba(255, 240, 180, .55), transparent 70%); }
.place-textile .cc-chair { background: linear-gradient(#c0544a, #c0544a) 10px 0 / 40px 50px no-repeat, linear-gradient(#c0544a, #c0544a) 10px 50px / 40px 12px no-repeat, linear-gradient(#6b4a2e, #6b4a2e) 12px 62px / 5px 48px no-repeat, linear-gradient(#6b4a2e, #6b4a2e) 43px 62px / 5px 48px no-repeat; }

/* The Sampler Wall */
.place-textile .sw-frames { background: linear-gradient(#fbf6ea, #fbf6ea) 0 0 / 280px 200px no-repeat, linear-gradient(#fbf6ea, #fbf6ea) 340px 40px / 240px 260px no-repeat, linear-gradient(#fbf6ea, #fbf6ea) 640px 0 / 300px 180px no-repeat, linear-gradient(#fbf6ea, #fbf6ea) 120px 300px / 260px 200px no-repeat, linear-gradient(#fbf6ea, #fbf6ea) 660px 260px / 280px 240px no-repeat; outline: none !important; }
.place-textile .sw-cyborg { background: #fbf6ea; color: #c0544a; font: italic 700 14px/22px 'Courier Prime', monospace; text-align: center; padding-top: 14px; border: 6px solid #b88b55; }
.place-textile .sw-home { background: #fbf6ea; color: #3f8f8a; font: 700 15px/30px 'Courier Prime', monospace; text-align: center; }
.place-textile .sw-jacquard { background: radial-gradient(circle 4px, #2d2a4a 96%, transparent) 0 0 / 15px 15px, #d9b07a; }

/* The Craft Fair */
.place-textile .cf-stalls { background: repeating-linear-gradient(90deg, #c0544a 0 40px, #fbf6ea 40px 80px) 0 0 / 300px 60px no-repeat, repeating-linear-gradient(90deg, #3f8f8a 0 40px, #fbf6ea 40px 80px) 330px 0 / 300px 60px no-repeat, repeating-linear-gradient(90deg, #7b4fb3 0 40px, #fbf6ea 40px 80px) 660px 0 / 300px 60px no-repeat, linear-gradient(#b88b55, #b88b55) 0 60px / 300px 200px no-repeat, linear-gradient(#b88b55, #b88b55) 330px 60px / 300px 200px no-repeat, linear-gradient(#b88b55, #b88b55) 660px 60px / 300px 200px no-repeat; }
.place-textile .cf-bunting { background: conic-gradient(from 135deg at 50% 0, #c0544a 0 90deg, transparent 90deg) 0 0 / 30px 16px, conic-gradient(from 135deg at 50% 0, #e2b33c 0 90deg, transparent 90deg) 15px 0 / 30px 16px; outline: none !important; box-shadow: none !important; }
.place-textile .cf-sign { background: #fbf6ea; color: #2d2a4a; font: 700 15px/30px 'Courier Prime', monospace; text-align: center; }
.place-textile .cf-yarn { background: radial-gradient(circle 20px at 25px 24px, #c0544a 96%, transparent) no-repeat, radial-gradient(circle 18px at 62px 26px, #7b4fb3 96%, transparent) no-repeat; outline: none !important; }
.place-textile .cf-able { background: #e98e7f; color: #fbf6ea; font: 700 14px/20px 'Courier Prime', monospace; text-align: center; padding-top: 50px; border-radius: 30px 30px 6px 6px; }

/* The Quilting Bee */
.place-textile .qb-frame { background: linear-gradient(#b88b55, #b88b55) 0 0 / 100% 16px no-repeat, linear-gradient(#b88b55, #b88b55) 0 100% / 100% 16px no-repeat, conic-gradient(#c0544a 25%, #e2b33c 0 50%, #3f8f8a 0 75%, #7b4fb3 0) 0 16px / 80px 80px; clip-path: polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 0, 62% 0, 62% 100%, 0 100%); }
.place-textile .qb-chairs { background: linear-gradient(#6b4a2e, #6b4a2e) 0 0 / 30px 30px; background-repeat: space; outline: none !important; }
.place-textile .qb-tea { background: radial-gradient(ellipse 30px 20px at 60px 36px, #fbf6ea 96%, transparent) no-repeat, linear-gradient(#fbf6ea, #fbf6ea) 90px 26px / 20px 6px no-repeat, radial-gradient(ellipse 14px 10px at 140px 44px, #fbf6ea 96%, transparent) no-repeat; outline: none !important; }
.place-textile .qb-robot { background: linear-gradient(#9a9a9a, #9a9a9a) 50% 100% / 30px 20px no-repeat, linear-gradient(20deg, transparent 46%, #9a9a9a 47% 53%, transparent 54%) 0 60px / 100% 110px no-repeat, linear-gradient(#c0c0c0, #c0c0c0) 40px 30px / 6px 40px no-repeat; animation: qb-poke 2.6s ease-in-out infinite; }
@keyframes qb-poke { 50% { transform: translateY(-6px) rotate(-3deg); } }
```

Add `<link rel="stylesheet" href="css/places-textile.css">` to `index.html` after the `css/places.css` link.

- [ ] **Step 5: Run the tests and screenshot every textile place**

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`. Expected: `# fail 0`.

Screenshot these slides: `a2-act`, `a2-learn-to-code`, `a2-widner`, `a2-losh`, `a2-haraway`, `a2-casual-creators`, `a2-bridge`, `a2-process`.

Check each for:
- the woven label at the bottom right, inside the quilt border;
- the C64 sampler and the cyborg sampler readable in the top-left gutter, not cut off;
- nothing covering the cross-stitched headings.

Fix any drawing in CSS only, then re-run the tests.

- [ ] **Step 6: Commit**

```bash
git add js/places/textile.js js/fx/textile.js js/data/act2-textile.js css/places-textile.css css/craft-textile.css index.html
git commit -m "feat: Act II textile places (Sewing Room to Quilting Bee) with the re-stitch transition

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then fast-forward `main` and push both branches.

---

### Task 6: Act III zine places and the new-browser-window transition

**Files:**
- Create: `css/places-zine.css`
- Modify: `js/places/zine.js`, `js/fx/zine.js`, `css/craft-zine.css`, `js/data/act3-zine.js`, `index.html`

**Interfaces:**
- Consumes: `PlaceDecls.register`, `Places`, `Crafts.placeTransition`.
- Produces: the zine place ids `flash-graveyard`, `wayback-stacks`, `babel`, `geocities`, `bot-garden`.

- [ ] **Step 1: Declare the zine places**

Replace the `reg.register('zine', {});` line in `js/places/zine.js` with:

```js
  const win = (label) => [
    { layer: 'sky', cls: 'zw-window', box: [36, 50, 1208, 650] },
    { layer: 'label', cls: 'zw-titlebar', box: [36, 50, 1208, 30], text: `${label} - Netscape` },
  ];
  reg.register('zine', {
    'flash-graveyard': {
      label: 'The Flash Graveyard', credit: 'Adobe Flash (1996–2020)', floor: 684,
      pieces: [
        ...win('The Flash Graveyard'),
        { layer: 'far', cls: 'fg-stones', box: [250, 380, 920, 260] },
        { layer: 'mid', cls: 'fg-flash', box: [1210, 420, 62, 130], text: 'RIP\nFLASH\n1996-\n2020' },
        { layer: 'mid', cls: 'fg-fence', box: [220, 650, 700, 46] },
        { layer: 'egg', cls: 'fg-getflash', box: [20, 86, 190, 32], text: 'Get Flash Player' },
      ],
    },
    'wayback-stacks': {
      label: 'The Wayback Stacks', credit: 'Internet Archive Wayback Machine; BlueMaxima’s Flashpoint', floor: 684,
      pieces: [
        ...win('The Wayback Stacks'),
        { layer: 'far', cls: 'ws-shelves', box: [240, 100, 960, 540] },
        { layer: 'mid', cls: 'ws-floppies', box: [10, 632, 200, 60] },
        { layer: 'mid', cls: 'ws-banner', box: [300, 650, 380, 30], text: 'WAYBACK MACHINE' },
        { layer: 'egg', cls: 'ws-cart', box: [1212, 300, 56, 80], text: 'FLASH\nPOINT' },
      ],
    },
    babel: {
      label: 'The Library of Babel', credit: 'Jorge Luis Borges, “The Library of Babel”', floor: 684,
      pieces: [
        ...win('The Library of Babel'),
        { layer: 'far', cls: 'lb-hex', box: [220, 84, 1000, 560] },
        { layer: 'mid', cls: 'lb-hose', box: [1212, 84, 60, 560] },
        { layer: 'egg', cls: 'lb-sign', box: [300, 652, 440, 30], text: 'PLEASE DO NOT FEED THE CRAWLERS' },
      ],
    },
    geocities: {
      label: 'GeoCities', credit: 'GeoCities neighborhoods (1994–2009)', floor: 684,
      pieces: [
        ...win('GeoCities'),
        { layer: 'far', cls: 'gc-tiles', box: [220, 84, 1000, 560] },
        { layer: 'mid', cls: 'gc-signs', box: [240, 650, 620, 34], text: 'Area51 · Hollywood · Heartland · SoHo' },
        { layer: 'mid', cls: 'gc-construction', box: [16, 84, 196, 36], text: 'UNDER CONSTRUCTION' },
        { layer: 'egg', cls: 'gc-webring', box: [1212, 500, 60, 40], text: '◄ ►' },
      ],
    },
    'bot-garden': {
      label: 'The Bot Garden', credit: 'Cheap Bots, Done Quick!; botsin.space', floor: 684,
      pieces: [
        ...win('The Bot Garden'),
        { layer: 'far', cls: 'bg-rows', box: [240, 420, 960, 230] },
        { layer: 'mid', cls: 'bg-cage', box: [30, 80, 90, 40] },
        { layer: 'mid', cls: 'bg-tools', box: [300, 650, 400, 32], text: 'MAINTENANCE IS RESISTANCE' },
        { layer: 'mid', cls: 'bg-arcade', box: [1212, 430, 60, 170], text: 'INSERT\nCOIN' },
        { layer: 'egg', cls: 'bg-birds', box: [1212, 110, 60, 220] },
      ],
    },
  });
```

- [ ] **Step 2: Tag the Act III data**

```bash
node -e "
const fs=require('fs');const p='js/data/act3-zine.js';let s=fs.readFileSync(p,'utf8');
const map={'a3-flash-dead':'flash-graveyard','a3-lawhead':'wayback-stacks','a3-libgen':'babel','a3-gardens':'geocities','a3-tracery':'bot-garden'};
for(const [id,pl] of Object.entries(map)){const re=new RegExp(\"(id: '\"+id+\"', act: 3, minutes: [0-9.]+,)\");if(!re.test(s))throw new Error(id);s=s.replace(re,\"\$1 place: '\"+pl+\"',\");}
fs.writeFileSync(p,s);"
grep -c "place:" js/data/act3-zine.js
```

Expected: `5`. Then run `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"` and expect `# fail 0`.

- [ ] **Step 3: Zine craft: replace the single page with windows, and add the new-window transition**

In `js/fx/zine.js`, change `backdrop(bg) { … }` to drop the page and the staples:

```js
    backdrop(bg) {
      const ticker = el('div', 'ticker');
      ticker.append(el('span', '', TICKER.repeat(3)));
      bg.append(ticker, el('div', 'counter', 'VISITORS: 000000'));
    },
```

After `decorate(root, scene) { … },`, add:

```js
    // A new browser window pops open over the last one.
    async placeTransition(oldEl, newEl) {
      await anim(newEl, [{ transform: 'translate(40px, 30px) scale(.92)', opacity: 0 }, { transform: 'translate(0, 0) scale(1)', opacity: 1 }], { duration: 420, easing: 'steps(6)', fill: 'none' });
      await wait(250);
    },
```

In `css/craft-zine.css`, delete the `.backdrop-zine .page { … }` rule (all of its lines) and the `.backdrop-zine .staple…` rules. The window noise moves to `.zw-window`. Keep the ticker and counter rules, and give the counter `z-index: 1` so it stays above the window: append `z-index: 1;` inside `.backdrop-zine .counter { … }` and inside `.backdrop-zine .ticker { … }`.

- [ ] **Step 4: Draw the zine places**

Create `css/places-zine.css`. The `zw-window` background is the photocopy-noise image that the deleted `.backdrop-zine .page` rule used.

```css
/* ACT III places: photocopied collage inside 90s browser windows. */
.place-zine { --plane-dim: .45; }
.place-zine .plane-mid .piece, .place-zine .plane-egg .piece { filter: grayscale(1) contrast(1.6); border: 3px solid #111; background-color: #fff; color: #111; }
.place-zine .zw-window {
  background-color: #f4f1e8;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='t'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='1'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -9 4.2'/></filter><rect width='100%' height='100%' filter='url(%23t)' opacity='.35'/></svg>"), linear-gradient(90deg, transparent 49.6%, rgba(0, 0, 0, .08) 50%, transparent 50.4%);
  box-shadow: 8px 10px 0 #000;
  border: 3px solid #111;
}
.place-zine .zw-titlebar { background: linear-gradient(90deg, #000080, #1084d0); color: #fff; font: 22px/30px 'VT323', monospace; padding-left: 12px; }
.place-zine .zw-titlebar::after { content: '_ ▢ ✕'; position: absolute; right: 10px; top: 0; letter-spacing: 6px; }

/* The Flash Graveyard */
.place-zine .fg-stones { background: radial-gradient(ellipse 60px 70px at 50% 70px, #bbb 96%, transparent) 0 0 / 150px 260px, linear-gradient(#bbb, #bbb) 45px 70px / 60px 190px; background-repeat: repeat-x; }
.place-zine .fg-flash { font: 16px/20px 'VT323', monospace; text-align: center; padding-top: 14px; border-radius: 30px 30px 0 0 !important; }
.place-zine .fg-fence { background: repeating-linear-gradient(45deg, transparent 0 10px, #111 10px 12px), repeating-linear-gradient(-45deg, transparent 0 10px, #111 10px 12px) !important; border-width: 0 !important; }
.place-zine .fg-getflash { background: #c00 !important; color: #fff !important; font: 18px/26px 'VT323', monospace; text-align: center; filter: none !important; }

/* The Wayback Stacks */
.place-zine .ws-shelves { background: repeating-linear-gradient(#111 0 6px, transparent 6px 130px), repeating-linear-gradient(90deg, #777 0 14px, #ccc 14px 20px, #999 20px 34px, #eee 34px 40px); }
.place-zine .ws-floppies { background: linear-gradient(#111, #111) 10px 30px / 36px 30px no-repeat, linear-gradient(#111, #111) 50px 22px / 36px 38px no-repeat, linear-gradient(#111, #111) 90px 30px / 36px 30px no-repeat, linear-gradient(#111, #111) 70px 0 / 36px 30px no-repeat !important; border-width: 0 !important; background-color: transparent !important; }
.place-zine .ws-banner { font: 20px/26px 'VT323', monospace; text-align: center; }
.place-zine .ws-cart { font: 14px/18px 'VT323', monospace; text-align: center; padding-top: 18px; }

/* The Library of Babel */
.place-zine .lb-hex { background: conic-gradient(from 30deg, #ddd 0 60deg, #aaa 0 120deg, #ccc 0 180deg, #999 0 240deg, #bbb 0 300deg, #888 0) 0 0 / 120px 104px; mask-image: linear-gradient(transparent, #000 30%, #000 60%, transparent); }
.place-zine .lb-hose { background: repeating-linear-gradient(#111 0 10px, #555 10px 20px) !important; border-radius: 20px; }
.place-zine .lb-sign { font: 20px/24px 'VT323', monospace; text-align: center; }

/* GeoCities */
.place-zine .gc-tiles { background: radial-gradient(#ff4fb8 2px, transparent 2.6px) 0 0 / 30px 30px, radial-gradient(#22e0ff 2px, transparent 2.6px) 15px 15px / 30px 30px; }
.place-zine .gc-signs { font: 22px/28px 'VT323', monospace; text-align: center; }
.place-zine .gc-construction { background: repeating-linear-gradient(45deg, #ffd800 0 12px, #111 12px 24px) !important; color: #111 !important; font: 18px/30px 'VT323', monospace; text-align: center; animation: gc-blink 1s steps(2) infinite; filter: none !important; }
@keyframes gc-blink { 50% { color: #ffd800; } }
.place-zine .gc-webring { font: 24px/34px 'VT323', monospace; text-align: center; }

/* The Bot Garden */
.place-zine .bg-rows { background: repeating-linear-gradient(#777 0 3px, transparent 3px 46px), radial-gradient(circle 6px, #333 96%, transparent) 0 20px / 60px 46px; }
.place-zine .bg-cage { background: repeating-linear-gradient(90deg, #111 0 3px, transparent 3px 12px) !important; border-radius: 40px 40px 0 0; }
.place-zine .bg-tools { font: 20px/26px 'VT323', monospace; text-align: center; }
.place-zine .bg-arcade { background: linear-gradient(#111, #111) 50% 30px / 46px 40px no-repeat !important; font: 14px/18px 'VT323', monospace; text-align: center; padding-top: 80px; }
.place-zine .bg-birds { background: conic-gradient(from 200deg at 50% 60%, #111 0 140deg, transparent 0) 0 0 / 30px 40px !important; border-width: 0 !important; background-color: transparent !important; animation: bg-fly 6s linear infinite; }
@keyframes bg-fly { to { background-position: 0 -220px; } }
```

Add `<link rel="stylesheet" href="css/places-zine.css">` to `index.html` after the `css/places.css` link.

- [ ] **Step 5: Run the tests and screenshot every zine place**

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`. Expected: `# fail 0`.

Screenshot these slides: `a3-flash-dead`, `a3-act`, `a3-lawhead`, `a3-libgen`, `a3-gardens`, `a3-elon`, `a3-tracery`, `a3-inspect`.

Check each for:
- the browser title bar reading `<Place> - Netscape`;
- the ticker and visitor counter still on top;
- ransom-note headings and xeroxed media clear of the window chrome.

Fix any drawing in CSS only, then re-run the tests.

- [ ] **Step 6: Commit**

```bash
git add js/places/zine.js js/fx/zine.js js/data/act3-zine.js css/places-zine.css css/craft-zine.css index.html
git commit -m "feat: Act III zine places (Flash Graveyard to Bot Garden) with new-window transition

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then fast-forward `main` and push both branches.

---

### Task 7: Presenter credits and the visual sweep tool

**Files:**
- Create: `tools/place-sweep.js`
- Modify: `js/presenter.js:22`, `presenter.html`, `package.json`

**Interfaces:**
- Consumes: `Deck.placeOf`, `PlaceDecls.get`.
- Produces: `npm run sweep -- <outDir>`.

- [ ] **Step 1: Show the place in the presenter window**

In `presenter.html`, before `<script src="js/core/deck.js"></script>`, add:

```html
  <script src="js/places/registry.js"></script>
  <script src="js/places/paper.js"></script>
  <script src="js/places/textile.js"></script>
  <script src="js/places/zine.js"></script>
  <script src="js/places/game.js"></script>
```

In `js/presenter.js`, replace line 22:

```js
    $('p-meta').textContent = `${act.title}: ${act.subtitle} · ${data.index + 1}/${scenes.length} · ${s.id}${s.draft ? ' · DRAFT' : ''}`;
```

with:

```js
    const placeId = Deck.placeOf(scenes, data.index);
    const place = placeId && PlaceDecls.get(act.craft, placeId);
    const where = place ? ` · ${place.label}${place.credit ? ' (' + place.credit + ')' : ''}` : '';
    $('p-meta').textContent = `${act.title}: ${act.subtitle} · ${data.index + 1}/${scenes.length} · ${s.id}${s.draft ? ' · DRAFT' : ''}${where}`;
```

- [ ] **Step 2: Write the sweep tool**

Create `tools/place-sweep.js`:

```js
#!/usr/bin/env node
'use strict';
// Screenshots the first slide of every place, plus one mid-run slide per act, with headless Chrome.
// Usage: npm run sweep -- <outDir>   (serves the repo on :8137 while it runs; set CHROME to override the browser path)
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const Deck = require('../js/core/deck.js');

const ROOT = path.resolve(__dirname, '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MID_RUN = ['a1-muse-memory', 'a2-posner', 'a3-perlow', 'a4-ask'];

function slides() {
  const lists = ['act1-paper', 'act2-textile', 'act3-zine', 'act4-game'].map((f) => require(`../js/data/${f}.js`));
  const { scenes } = Deck.buildDeck(lists);
  const firsts = scenes.filter((s) => s.place); // only the first slide of each run sets a place
  return [...new Set([...firsts.map((s) => s.id), ...MID_RUN])];
}

async function main() {
  const out = path.resolve(process.argv[2] || 'place-sweep');
  fs.mkdirSync(out, { recursive: true });
  const server = spawn('python', ['-m', 'http.server', '8137'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1000));
  try {
    for (const id of slides()) {
      execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--window-size=1280,720', '--virtual-time-budget=6000',
        `--screenshot=${path.join(out, id + '.png')}`, `http://localhost:8137/index.html?scene=${id}`], { stdio: 'ignore' });
      console.log(id);
    }
  } finally {
    server.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
```

In `package.json`, add `"sweep": "node tools/place-sweep.js"` to `scripts`.

- [ ] **Step 3: Run the tests and the sweep**

Run: `npm test 2>&1 | grep -E "^not ok|# (pass|fail)"`. Expected: `# fail 0`.

Run: `npm run sweep -- "$SCRATCH/sweep"`
Expected: it prints 30 slide ids: the 26 slides that set a place (THE WORKSHOP is set twice, on `a4-act` and `a4-triad`) plus the 4 mid-run slides.

Open every screenshot and check against the spec's legibility rule and the place map. Fix any drawing problems in CSS, re-run the sweep, and re-run the tests.

Then click through the whole deck in a real browser with `npm start`, then open `http://localhost:8137`:
- every place change animates (fold, re-stitch, new window, walk and iris);
- going backwards restores the earlier place;
- the handoffs land in the next act's first place;
- the presenter window shows the place and its credit.

- [ ] **Step 4: Commit**

```bash
git add tools/place-sweep.js js/presenter.js presenter.html package.json
git commit -m "feat: presenter shows place and credit; place-sweep screenshot tool

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Then fast-forward `main` and push both branches.

- [ ] **Step 5: Hand off for human review**

Share the sweep screenshots with Anastasia. Flag the Act I and III references for Emily's review: the Dark Tower, Pac-Man, Moltbook, Sanrio/Tamagotchi/Furby/Jolly, Mouse Trap, Flash, Wayback/Flashpoint, Borges, GeoCities, and Cheap Bots Done Quick.
