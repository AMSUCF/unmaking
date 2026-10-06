# Critical (Un)Making Four-Act Crafted Deck Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a 60-minute, four-act, highly animated presentation of "Critical (Un)Making and the Agentic Humanities". Each act is made in a different craft (paper → textile → e-zine → indie game), alternates between presenters Emily K. Johnson and Anastasia Salter, and is navigated by pixel avatars of the two presenters.

**Architecture:** A static, dependency-free web deck in the style of `../AuthorFunctionSlides`. It uses classic `<script>` files so it runs from `file://`. Pure logic (deck validation, navigation, timing, stitch math, seeded shapes) lives in UMD modules under `js/core/` and is unit-tested with `node --test`. Scene content lives as data in `js/data/act*.js`. Each craft is a plug-in in `js/fx/<craft>.js` that registers a backdrop builder, a scene decorator, and named entrance effects with a small runtime (`Crafts`). `Stage` renders one scene at a time into a 1280×720 stage, and `Avatar` walks the presenters' sprites around it. Sprite slicing and cross-stitch pre-rendering are done offline with a tested Python/Pillow tool.

**Tech Stack:** HTML/CSS/vanilla JS (Web Animations API, SVG masks, canvas), Node 22 `node:test`, Python 3.13 + Pillow 12, hand-authored pixel maps composed into avatar frames at runtime on canvas (the approach of `../HumanitiesAI/TeachingAI/js/avatar.js`; no image generation), Google Fonts (downloaded once and vendored).

**Spec:** `docs/superpowers/specs/2026-10-05-unmaking-four-act-design.md` (read it first). The talk content source is `critical-unmaking-slide-outline.md`.

## Global Constraints

- `../AuthorFunctionSlides` is **read-only**. Copy files out of it, never write, move, or `git` anything inside it.
- The deck must run by double-clicking `index.html` (`file://`) with no network: no CDN URLs, no `type="module"`, all fonts in `assets/fonts/`.
- Stage size is exactly 1280×720, scaled to fit the window and letterboxed.
- Act order, craft, and presenter: 1 paper/emily, 2 textile/anastasia, 3 zine/emily, 4 game/anastasia.
- Every act's scenes sum to 14–16 planned minutes (`budgetMinutes: 15`).
- Every scene has non-empty `notes` (speaker notes), and every media item has non-empty `alt`.
- On-screen text limits: statement/caption text ≤ 240 chars, quote ≤ 650, `say` ≤ 120, heading ≤ 70.
- Scene ids match `/^a[1-4]-[a-z0-9-]+$/` and are unique.
- Asset file names are lowercase kebab-case with no spaces, and referenced paths must match on-disk case exactly (GitHub Pages is case-sensitive, Windows is not).
- Use `textContent`, never `innerHTML`, for scene text.
- Avatar frames are 120×180 RGBA PNGs named `idle, walk1, walk2, walk3, walk4, talk, point` (+ `.stitch.png` variants at 240×360) in `assets/avatars/<emily|anastasia>/`.
- Photos of Dr. Johnson (`assets/avatars/emily/reference/emily-1.jpg`, `emily-2.jpg`) and the shirt photo (`assets/avatars/reference/human-in-the-loop-shirt.jpg`) are reference-only and never committed (both folders are gitignored). Dr. Johnson approves her avatar, and Anastasia approves hers, before the frames are committed.
- **Both avatars wear the "human in the loop" t-shirt:** a heathered slate-navy crew-neck tee with silver glitter lowercase text "human / in the / loop" stacked inside a loose, swooping hand-drawn oval loop. At sprite scale the loop and a few silver pixels suggest the text, and the letters do not need to be legible.
- Commit after every task, ending each commit message with `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`.

## Review Focus

1. **Clicker double-press during an animation or 3-second handoff.** The press must not be lost or play two transitions on top of each other: the latest request wins and is applied instantly once the current one finishes. Pinned by the `createNavQueue` tests in Task 3.
2. **Jumping backward, or with act keys 1–4, across an act boundary.** The target scene must render in *its own* act's craft, with no handoff or entrance animation played in reverse. Pinned by the `transitionFor` tests in Task 3 and the cross-act jump check in Task 8.
3. **Asset paths that differ only by case, or contain spaces.** These work on Windows and then break on the projector laptop or Pages. Pinned by `existsExactCase` in `tests/assets.test.js` (Task 1) and `tests/deck-content.test.js` (Tasks 7, 9–11).
4. **Long quotes overflowing the stage.** Character limits are pinned by `validateScene` tests (Task 2). `fitText` shrinks type to fit, and Task 8 has an explicit visual check on the longest quote (Perlow, `a3-perlow`).
5. **Venue with no Wi-Fi, opened from `file://`.** Nothing may fetch remotely, no ES modules, and no canvas reads of image files (Chrome taints `file://` images, so cross-stitch avatars are pre-rendered). Pinned by `tests/offline.test.js` (Task 8) and the `stitchify` tests (Task 5).

---

## File Structure

```
UnMaking/
  index.html                 deck shell (stage layers + HUD + script tags)
  presenter.html             presenter window (notes, next scene, clocks)
  package.json               npm scripts only — no dependencies
  .gitignore
  README.md                  how to run and present
  assets/
    act1/ act2/ act3/ act4/  per-act images/video (imported + moved)
    shared/                  book cover, fabric photos
    fonts/                   vendored woff2
    avatars/anastasia/       7 frames + 7 .stitch frames (+ source/)
    avatars/emily/           7 frames + 7 .stitch frames (+ reference/ gitignored)
  css/
    fonts.css stage.css hud.css
    craft-paper.css craft-textile.css craft-zine.css craft-game.css
  js/
    core/random.js           seeded RNG, string hash, shuffled order
    core/acts.js             ACTS, PRESENTERS, LAYOUTS, POSES, FX_NAMES, LIMITS
    core/deck.js             validateScene, buildDeck, actMinutes, mediaPaths
    core/nav.js              advance/retreat, transitionFor, queue, start param
    core/timer.js            clock formatting, pace, act clock
    core/stitch.js           pixelsToStitches (used for stitched headings)
    core/craft-shapes.js     tornEdgePolygon, tornSplit, ransomLetters
    data/act1-paper.js … act4-game.js   scene content
    fx/crafts.js             craft registry runtime + animation helpers
    fx/paper.js textile.js zine.js game.js handoff.js
    render/avatar.js         sprite slots, skins, walking
    render/stage.js          scene → DOM, fitText, speech, craft switching
    main.js                  boot, input, notes HUD, broadcast
    presenter.js             presenter window logic
  tools/
    asset-manifest.json      dest → source (relative to ../)
    import-assets.js         copies manifest files (read-only on sources)
    fetch-fonts.js           one-time Google Fonts download
    slice_sprites.py         sheet / frame / stitchify sprite tool
  tests/
    helpers.js assets.test.js random.test.js deck.test.js nav.test.js
    timer.test.js stitch.test.js craft-shapes.test.js deck-content.test.js
    offline.test.js fx-coverage.test.js test_slice_sprites.py
```

Every JS module in `js/core` and `js/data` uses this UMD shell, so the browser gets a global and Node gets `module.exports`:

```js
(function (root) {
  'use strict';
  // ... body defining `api` ...
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.GlobalName = api;
})(globalThis);
```

Global names: `Random`, `Acts`, `Deck`, `Nav`, `Timer`, `Stitch`, `CraftShapes`, `ACT1_SCENES`…`ACT4_SCENES`, `Crafts`, `Avatar`, `Stage`.

### Scene data model (used by every task)

```js
{
  id: 'a1-enshittification',    // /^a[1-4]-[a-z0-9-]+$/, unique
  act: 1,                        // must equal its act file
  minutes: 1.5,                  // planned speaking time, (0, 4]
  layout: 'quote',               // title|statement|quote|image|gallery|video|choice|handoff|credits
  heading: '...',                // optional, ≤ 70
  text: '...',                   // statement/caption ≤ 240, quote ≤ 650
  source: '...',                 // required for quote; shown small elsewhere
  url: 'https://...',            // reference only (shown in presenter view)
  byline: '...',                 // title only
  media: [{ src: 'assets/...', alt: '...' }],
  choices: ['...'],              // choice layout, 2–6; each revealed by a Next press
  lines: ['...'],                // credits layout
  to: 'textile',                 // handoff layout: next act's craft
  fx: ['fold-in'],               // names from FX_NAMES[craft] (handoff → FX_NAMES.handoff)
  avatar: { pose: 'point', x: 60 } | false,   // default {pose:'idle', x:60}
  say: '...',                    // short line in the craft's speech bubble, ≤ 120
  room: 'workshop',              // game only: workshop|office|commons
  agency: 3,                     // game only: integer 0–5 for the HUD meter
  draft: true,                   // shows a DRAFT flag (toggle R) — content still to confirm
  notes: '...'                   // speaker notes, required
}
```

---

### Task 1: Scaffold, asset intake, vendored fonts

**Files:**
- Create: `package.json`, `.gitignore`, `README.md`, `tools/asset-manifest.json`, `tools/import-assets.js`, `tools/fetch-fonts.js`, `css/fonts.css`, `tests/helpers.js`, `tests/assets.test.js`
- Move (git mv): root media of this repo into `assets/act*/`

**Interfaces:**
- Produces: `existsExactCase(relPath, root) → boolean` in `tests/helpers.js`; `importAssets() → string[]` (missing sources) in `tools/import-assets.js`; asset paths listed below, which later tasks reference verbatim.

- [ ] **Step 1: Create `package.json` and `.gitignore`**

```json
{
  "name": "unmaking",
  "private": true,
  "description": "Critical (Un)Making and the Agentic Humanities: a four-act crafted deck",
  "scripts": {
    "test": "node --test \"tests/*.test.js\"",
    "test:py": "python -m unittest discover -s tests -p \"test_*.py\"",
    "start": "python -m http.server 8137",
    "import-assets": "node tools/import-assets.js",
    "fetch-fonts": "node tools/fetch-fonts.js"
  }
}
```

`.gitignore`:
```
node_modules/
__pycache__/
assets/avatars/emily/reference/
assets/avatars/reference/
assets/avatars/*/blobs/
.superpowers/
```

- [ ] **Step 2: Write the failing asset test and helper**

`tests/helpers.js`:
```js
'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// fs.existsSync is case-insensitive on Windows; this walks each segment
// and compares names exactly, the way GitHub Pages and Linux will.
function existsExactCase(relPath, root = ROOT) {
  let dir = root;
  for (const part of relPath.split('/')) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
    if (!fs.readdirSync(dir).includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

module.exports = { ROOT, existsExactCase };
```

`tests/assets.test.js`:
```js
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
  'assets/act3/you-are-elon-musk.mp4',
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
```

- [ ] **Step 3: Run it to verify it fails**

Run: `npm test`
Expected: FAIL with `Cannot find module '../tools/asset-manifest.json'`.

- [ ] **Step 4: Write the manifest and importer**

`tools/asset-manifest.json` (keys are destinations in this repo; values are sources relative to the parent `GitHub/` folder):
```json
{
  "assets/act1/moltbook.png": "AuthorFunctionSlides/additions/moltbook.png",
  "assets/act1/agents.jpg": "AuthorFunctionSlides/additions/agents.jpg",
  "assets/act1/claude-process.png": "AuthorFunctionSlides/additions/claude_process.png",
  "assets/act2/geek.jpg": "AuthorFunctionSlides/geek.jpg",
  "assets/act2/fanboy.jpg": "AuthorFunctionSlides/fanboy.jpg",
  "assets/act2/twining.png": "AuthorFunctionSlides/twining.png",
  "assets/act2/twine-interface.png": "AuthorFunctionSlides/twineinterface.png",
  "assets/act2/cc-twine.png": "CriticalMaking2026/img/twine.png",
  "assets/act2/cc-tracery.jpg": "CriticalMaking2026/img/tracery.jpg",
  "assets/act2/cc-bitsy.png": "CriticalMaking2026/img/bitsy.png",
  "assets/act2/cc-p5.png": "CriticalMaking2026/img/p5sample.png",
  "assets/act2/quilting.jpg": "CriticalMaking2026/img/quilting.jpg",
  "assets/act3/flash.jpg": "AuthorFunctionSlides/flash.jpg",
  "assets/act3/flash-preservation-1.jpg": "AuthorFunctionSlides/gen_slide23_img3.jpg",
  "assets/act3/flash-preservation-2.png": "AuthorFunctionSlides/gen_slide24_img1.png",
  "assets/act3/libgen.png": "AuthorFunctionSlides/libgen.png",
  "assets/shared/critmaking-cover.png": "CritMakingAgeOfAI/critmaking.png",
  "assets/shared/fabric.jpg": "CriticalMaking2026/img/fabric.jpg",
  "assets/shared/cutting.jpg": "CriticalMaking2026/img/cutting.jpg",
  "assets/fonts/press-start-2p.woff2": "AuthorFunctionSlides/fonts/PressStart2P.woff2",
  "assets/avatars/anastasia/source/walk1.png": "AuthorFunctionSlides/sprites/walk1.png",
  "assets/avatars/anastasia/source/walk2.png": "AuthorFunctionSlides/sprites/walk2.png",
  "assets/avatars/anastasia/source/walk3.png": "AuthorFunctionSlides/sprites/walk3.png",
  "assets/avatars/anastasia/source/walk4.png": "AuthorFunctionSlides/sprites/walk4.png",
  "assets/avatars/anastasia/source/walk5.png": "AuthorFunctionSlides/sprites/walk5.png",
  "assets/avatars/anastasia/source/sheet.jpg": "AuthorFunctionSlides/additions/sprites.jpg"
}
```

`tools/import-assets.js`:
```js
#!/usr/bin/env node
'use strict';
// Copies files listed in asset-manifest.json into this repo.
// Sources (e.g. ../AuthorFunctionSlides) are only ever read, never written.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GITHUB = path.resolve(ROOT, '..');
const manifest = require('./asset-manifest.json');

function importAssets() {
  const missing = [];
  for (const [dest, src] of Object.entries(manifest)) {
    const from = path.resolve(GITHUB, src);
    const to = path.resolve(ROOT, dest);
    if (!fs.existsSync(from)) { missing.push(src); continue; }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
  return missing;
}

if (require.main === module) {
  const missing = importAssets();
  if (missing.length) {
    console.error('Missing sources:\n  ' + missing.join('\n  '));
    process.exit(1);
  }
  console.log(`Imported ${Object.keys(manifest).length} assets.`);
}

module.exports = { importAssets };
```

- [ ] **Step 5: Move this repo's root media into `assets/` and import the rest**

The reference photos are already in the gitignored `assets/avatars/emily/reference/` and `assets/avatars/reference/`. Before committing, confirm `git status` does not list them.

```bash
mkdir -p assets/act1 assets/act3 assets/act4
git mv "Screenshot 2026-09-30 172559.png" assets/act1/muse-keroppi.png
git mv "yeti smith walking.mp4" assets/act1/meta-muse-yeti-smith.mp4
git mv Screenshot_20261004_142745_Chrome.jpg assets/act3/cbdq.jpg
git mv Screenshot_20261004_142754_Chrome.jpg assets/act3/cbts.jpg
git mv Screenshot_20261004_142802_Chrome.jpg assets/act3/bbdq.jpg
git mv Screenshot_20261004_143414_Chrome.jpg assets/act3/flores-workshop.jpg
git mv YouAreElonMusk.mp4 assets/act3/you-are-elon-musk.mp4
git mv lawheadflash.png assets/act3/lawhead-flash.png
git mv tracery.png assets/act3/tracery.png
git mv Chamberlain.png assets/act4/racter-chamberlain.png
git mv beautymidjourney.png assets/act4/mj-beautiful-woman.png
git mv professormidjourney.png assets/act4/mj-professor.png
git mv eliza.png assets/act4/eliza.png
git mv stanford.png assets/act4/stanford-race-swap.png
git mv superintelligence.png assets/act4/superintelligence.png
npm run import-assets
```
Expected: `Imported 26 assets.` Confirm `git -C ../AuthorFunctionSlides status --short` prints nothing, and `git status --short assets/avatars` lists no `reference/` files.

- [ ] **Step 6: Fetch and vendor fonts**

`tools/fetch-fonts.js`:
```js
#!/usr/bin/env node
'use strict';
// One-time download of Google Fonts (latin subset, 400 weight) into assets/fonts.
// Run with network; the deck itself never fetches fonts.
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'assets', 'fonts');
const FAMILIES = [
  ['VT323', 'vt323'],
  ['Special Elite', 'special-elite'],
  ['Patrick Hand', 'patrick-hand'],
  ['Rubik Mono One', 'rubik-mono-one'],
  ['Courier Prime', 'courier-prime'],
];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [family, slug] of FAMILIES) {
    const url = 'https://fonts.googleapis.com/css2?family=' + family.replace(/ /g, '+') + '&display=swap';
    const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
    const block = css.includes('/* latin */') ? css.split('/* latin */').pop() : css;
    const match = block.match(/url\((https:[^)]+\.woff2)\)/);
    if (!match) throw new Error('No woff2 found for ' + family);
    const buf = Buffer.from(await (await fetch(match[1])).arrayBuffer());
    fs.writeFileSync(path.join(OUT, slug + '.woff2'), buf);
    console.log('saved', slug, buf.length, 'bytes');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
```

Run: `npm run fetch-fonts`
Expected: five `saved …` lines.

`css/fonts.css`:
```css
@font-face { font-family: 'Press Start 2P'; src: url('../assets/fonts/press-start-2p.woff2') format('woff2'); font-display: block; }
@font-face { font-family: 'VT323'; src: url('../assets/fonts/vt323.woff2') format('woff2'); font-display: block; }
@font-face { font-family: 'Special Elite'; src: url('../assets/fonts/special-elite.woff2') format('woff2'); font-display: block; }
@font-face { font-family: 'Patrick Hand'; src: url('../assets/fonts/patrick-hand.woff2') format('woff2'); font-display: block; }
@font-face { font-family: 'Rubik Mono One'; src: url('../assets/fonts/rubik-mono-one.woff2') format('woff2'); font-display: block; }
@font-face { font-family: 'Courier Prime'; src: url('../assets/fonts/courier-prime.woff2') format('woff2'); font-display: block; }
```

- [ ] **Step 7: Write `README.md`**

```markdown
# Critical (Un)Making and the Agentic Humanities

A four-act talk by Emily K. Johnson and Anastasia Salter. Act I is paper, Act II is textile, Act III is an e-zine, and Act IV is an indie game.

## Present
- Double-click `index.html`. It works offline from `file://`.
- For the presenter window (notes, next scene, clocks), run `npm start`, open http://localhost:8137, and press **P**.

| Key | Action |
|---|---|
| → / Space / PageDown / click | next (reveals choices one at a time) |
| ← / PageUp | previous |
| 1–4 | jump to start of act; 0 / Home = title; End = credits |
| N | notes overlay with act clock and pace |
| B or . | blackout |
| T | restart the current act's clock |
| F | fullscreen |
| R | show/hide DRAFT flags |
| E | show deck validation errors |
| P | open presenter window (needs `npm start`) |

Start at a specific scene with `index.html?scene=a3-perlow`.

## Develop
- `npm test` runs the JS unit and content tests. `npm run test:py` runs the sprite tool tests.
- `npm run import-assets` re-copies images from sibling repos (read-only on sources).
```

- [ ] **Step 8: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS, 4 tests. Run `git status --short` and confirm no `reference/` files are staged.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "chore: scaffold deck, import assets, vendor fonts

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Core data rules — `random`, `acts`, `deck`

**Files:**
- Create: `js/core/random.js`, `js/core/acts.js`, `js/core/deck.js`
- Test: `tests/random.test.js`, `tests/deck.test.js`

**Interfaces:**
- Produces:
  - `Random.mulberry32(seed:number) → () => number in [0,1)`, `Random.hashString(s:string) → uint32`, `Random.shuffledOrder(n, seed) → number[]` (a permutation of 0..n-1)
  - `Acts.{PRESENTERS, ACTS, LAYOUTS, POSES, FX_NAMES, LIMITS, STAGE, GAME_ROOMS, actByNumber(n)}`
  - `Deck.validateScene(scene, act) → string[]`, `Deck.buildDeck(sceneLists) → {scenes, errors}`, `Deck.actMinutes(scenes) → {[n]: number}`, `Deck.mediaPaths(scenes) → string[]`

- [ ] **Step 1: Write the failing tests**

`tests/random.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Random = require('../js/core/random.js');

test('mulberry32 is deterministic and in [0,1)', () => {
  const a = Random.mulberry32(42), b = Random.mulberry32(42);
  for (let i = 0; i < 50; i++) {
    const x = a();
    assert.equal(x, b());
    assert.ok(x >= 0 && x < 1);
  }
});

test('hashString is stable and distinguishes strings', () => {
  assert.equal(Random.hashString('a1-title'), Random.hashString('a1-title'));
  assert.notEqual(Random.hashString('a1-title'), Random.hashString('a1-titlf'));
});

test('shuffledOrder is a deterministic permutation', () => {
  const o = Random.shuffledOrder(100, 7);
  assert.deepEqual([...o].sort((x, y) => x - y), Array.from({ length: 100 }, (_, i) => i));
  assert.deepEqual(o, Random.shuffledOrder(100, 7));
  assert.notDeepEqual(o, Random.shuffledOrder(100, 8));
});
```

`tests/deck.test.js`:
```js
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
  assert.deepEqual(g({ room: 'office', agency: 3 }), []);
  assert.ok(has(g({ room: 'kitchen' }), 'room'));
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
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/core/random.js'`.

- [ ] **Step 3: Implement `js/core/random.js`**

```js
/* Seeded randomness so every craft effect looks the same on every run. */
(function (root) {
  'use strict';

  function mulberry32(seed) {
    let a = seed >>> 0;
    return function () {
      a = (a + 0x6D2B79F5) >>> 0;
      let t = a;
      t = Math.imul(t ^ (t >>> 15), t | 1);
      t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function hashString(str) {
    let h = 2166136261;
    for (const ch of String(str)) {
      h ^= ch.codePointAt(0);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }

  function shuffledOrder(n, seed) {
    const rnd = mulberry32(seed);
    const arr = Array.from({ length: n }, (_, i) => i);
    for (let i = n - 1; i > 0; i--) {
      const j = Math.floor(rnd() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  }

  const api = { mulberry32, hashString, shuffledOrder };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Random = api;
})(globalThis);
```

- [ ] **Step 4: Implement `js/core/acts.js`**

```js
/* The talk's fixed structure: who presents which act, in which craft. */
(function (root) {
  'use strict';

  const PRESENTERS = {
    emily: { id: 'emily', name: 'Emily K. Johnson' },
    anastasia: { id: 'anastasia', name: 'Anastasia Salter' },
  };

  const ACTS = [
    { n: 1, craft: 'paper', presenter: 'emily', title: 'Act I', subtitle: 'The Death of the Web (As We Know It)', budgetMinutes: 15 },
    { n: 2, craft: 'textile', presenter: 'anastasia', title: 'Act II', subtitle: 'Why Keep Making?', budgetMinutes: 15 },
    { n: 3, craft: 'zine', presenter: 'emily', title: 'Act III', subtitle: 'Who Owns What We Make?', budgetMinutes: 15 },
    { n: 4, craft: 'game', presenter: 'anastasia', title: 'Act IV', subtitle: 'Is There Human Agency in Agentic AI?', budgetMinutes: 15 },
  ];

  const LAYOUTS = ['title', 'statement', 'quote', 'image', 'gallery', 'video', 'choice', 'handoff', 'credits'];
  const POSES = ['idle', 'walk1', 'walk2', 'walk3', 'walk4', 'talk', 'point'];
  const GAME_ROOMS = ['workshop', 'office', 'commons'];

  const FX_NAMES = {
    paper: ['popup-rise', 'fold-in', 'paper-tear', 'cut-out', 'page-turn'],
    textile: ['stitch-in', 'needle-pass', 'quilt-assemble'],
    zine: ['xerox-scan', 'ransom-shuffle', 'sticker-slap', 'misregister'],
    game: ['iris-in', 'pixel-dissolve', 'choice-menu'],
    handoff: ['pattern-to-cloth', 'scan-to-zine', 'zine-to-pixels'],
  };

  const LIMITS = { statement: 240, quote: 650, say: 120, heading: 70 };
  const STAGE = { width: 1280, height: 720, avatarWidth: 120 };

  function actByNumber(n) {
    return ACTS.find((a) => a.n === n) || null;
  }

  const api = { PRESENTERS, ACTS, LAYOUTS, POSES, GAME_ROOMS, FX_NAMES, LIMITS, STAGE, actByNumber };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Acts = api;
})(globalThis);
```

- [ ] **Step 5: Implement `js/core/deck.js`**

```js
/* Validates scene data and assembles the four acts into one deck. */
(function (root) {
  'use strict';
  const Acts = (typeof module === 'object' && module.exports) ? require('./acts.js') : root.Acts;
  const { ACTS, LAYOUTS, POSES, GAME_ROOMS, FX_NAMES, LIMITS, STAGE } = Acts;

  function validateScene(scene, act) {
    if (!scene || typeof scene !== 'object') return ['(scene): not an object'];
    const errs = [];
    const fail = (msg) => errs.push(`${scene.id || '(no id)'}: ${msg}`);
    const len = (s) => (typeof s === 'string' ? s.length : 0);

    if (!/^a[1-4]-[a-z0-9-]+$/.test(scene.id || '')) fail('id must match a<act>-slug');
    else if (!scene.id.startsWith(`a${act.n}-`)) fail('id prefix does not match its act');
    if (scene.act !== act.n) fail(`act ${scene.act} does not match act ${act.n}`);
    if (!(typeof scene.minutes === 'number' && scene.minutes > 0 && scene.minutes <= 4)) fail('minutes must be a number in (0, 4]');
    if (!LAYOUTS.includes(scene.layout)) fail(`unknown layout "${scene.layout}"`);
    if (typeof scene.notes !== 'string' || !scene.notes.trim()) fail('notes are required');
    if (len(scene.heading) > LIMITS.heading) fail(`heading is ${len(scene.heading)} chars (max ${LIMITS.heading})`);
    if (len(scene.say) > LIMITS.say) fail(`say is ${len(scene.say)} chars (max ${LIMITS.say})`);

    const media = scene.media || [];
    media.forEach((m, i) => {
      if (!m || !m.src) fail(`media[${i}] missing src`);
      if (!m || typeof m.alt !== 'string' || !m.alt.trim()) fail(`media[${i}] missing alt`);
    });

    const textMax = scene.layout === 'quote' ? LIMITS.quote : LIMITS.statement;
    if (len(scene.text) > textMax) fail(`text is ${len(scene.text)} chars (max ${textMax})`);

    switch (scene.layout) {
      case 'title':
        if (!scene.heading) fail('title needs heading');
        break;
      case 'statement':
        if (!scene.text && !scene.heading) fail('statement needs text or heading');
        break;
      case 'quote':
        if (!scene.text) fail('quote needs text');
        if (!scene.source) fail('quote needs source');
        if (media.length > 1) fail('quote takes at most one media item');
        break;
      case 'image':
        if (media.length !== 1) fail('image layout needs exactly one media item');
        break;
      case 'gallery':
        if (media.length < 2 || media.length > 4) fail('gallery needs 2-4 media items');
        break;
      case 'video':
        if (media.length !== 1 || !/\.mp4$/i.test(media[0].src || '')) fail('video needs exactly one .mp4');
        break;
      case 'choice':
        if (!Array.isArray(scene.choices) || scene.choices.length < 2 || scene.choices.length > 6) fail('choice needs 2-6 choices');
        break;
      case 'credits':
        if (!Array.isArray(scene.lines) || !scene.lines.length) fail('credits needs lines');
        break;
      case 'handoff': {
        const next = ACTS[act.n]; // ACTS is 0-indexed, so this is act n+1
        if (!next) fail('the last act cannot have a handoff');
        else if (scene.to !== next.craft) fail(`handoff "to" must be the next act craft (${next.craft})`);
        break;
      }
    }

    const allowed = scene.layout === 'handoff' ? FX_NAMES.handoff : FX_NAMES[act.craft];
    (scene.fx || []).forEach((name) => {
      if (!allowed.includes(name)) fail(`fx "${name}" not available for ${scene.layout === 'handoff' ? 'handoff' : act.craft}`);
    });

    if (scene.avatar !== undefined && scene.avatar !== false) {
      const a = scene.avatar;
      if (!a || !POSES.includes(a.pose)) fail('avatar.pose invalid');
      if (!a || typeof a.x !== 'number' || a.x < 0 || a.x > STAGE.width - STAGE.avatarWidth) fail('avatar.x out of stage');
    }

    if (act.craft === 'game') {
      if (scene.room !== undefined && !GAME_ROOMS.includes(scene.room)) fail(`room must be one of ${GAME_ROOMS.join(', ')}`);
      if (scene.agency !== undefined && !(Number.isInteger(scene.agency) && scene.agency >= 0 && scene.agency <= 5)) fail('agency must be an integer 0-5');
    }
    return errs;
  }

  function buildDeck(sceneLists) {
    const scenes = [];
    const errors = [];
    const seen = new Set();
    if (sceneLists.length !== ACTS.length) errors.push(`expected ${ACTS.length} acts, got ${sceneLists.length}`);
    sceneLists.forEach((list, i) => {
      const act = ACTS[i];
      if (!act) return;
      if (!Array.isArray(list) || !list.length) { errors.push(`act ${act.n}: no scenes`); return; }
      list.forEach((scene) => {
        errors.push(...validateScene(scene, act));
        if (scene && scene.id) {
          if (seen.has(scene.id)) errors.push(`${scene.id}: duplicate id`);
          seen.add(scene.id);
        }
        scenes.push(scene);
      });
      const last = list[list.length - 1];
      const wanted = act.n < ACTS.length ? 'handoff' : 'credits';
      if (!last || last.layout !== wanted) errors.push(`act ${act.n}: last scene must be ${wanted === 'handoff' ? 'a handoff' : 'credits'}`);
    });
    return { scenes, errors };
  }

  function actMinutes(scenes) {
    const out = {};
    scenes.forEach((s) => { out[s.act] = (out[s.act] || 0) + s.minutes; });
    return out;
  }

  function mediaPaths(scenes) {
    const set = new Set();
    scenes.forEach((s) => (s.media || []).forEach((m) => set.add(m.src)));
    return [...set];
  }

  const api = { validateScene, buildDeck, actMinutes, mediaPaths };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Deck = api;
})(globalThis);
```

- [ ] **Step 6: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS (all random, deck, and assets tests).

- [ ] **Step 7: Commit**

```bash
git add js/core tests
git commit -m "feat: deck data model, act structure, and scene validation

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Navigation and timing — `nav`, `timer`

**Files:**
- Create: `js/core/nav.js`, `js/core/timer.js`
- Test: `tests/nav.test.js`, `tests/timer.test.js`

**Interfaces:**
- Consumes: scenes shaped as in the data model (`act`, `choices`, `id`, `minutes`).
- Produces:
  - `Nav.stepsOf(scene) → number`, `Nav.advance(pos, scenes) → pos`, `Nav.retreat(pos, scenes) → pos` where `pos = {index, step}`
  - `Nav.transitionFor(fromIndex, toIndex, scenes) → 'cut'|'within'|'act-enter'`
  - `Nav.actStartIndex(scenes, n) → number` (-1 if none), `Nav.parseStartParam(search, scenes) → number`
  - `Nav.createNavQueue() → {request(target) → target|null, finish() → target|null, isBusy() → boolean}`
  - `Timer.formatClock(ms) → 'm:ss'`, `Timer.plannedMsBefore(scenes, index) → ms`, `Timer.paceStatus(elapsedMs, plannedMs, toleranceMs=60000) → 'ahead'|'on'|'behind'`, `Timer.createActClock(now?) → {mark(act), elapsed(act), reset(act), total()}`

- [ ] **Step 1: Write the failing tests**

`tests/nav.test.js`:
```js
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
```

`tests/timer.test.js`:
```js
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
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/core/nav.js'`.

- [ ] **Step 3: Implement `js/core/nav.js`**

```js
/* Pure navigation rules: positions, reveal steps, transition kinds, request queue. */
(function (root) {
  'use strict';

  function stepsOf(scene) {
    return scene && Array.isArray(scene.choices) ? scene.choices.length : 0;
  }

  function advance(pos, scenes) {
    if (pos.step < stepsOf(scenes[pos.index])) return { index: pos.index, step: pos.step + 1 };
    if (pos.index < scenes.length - 1) return { index: pos.index + 1, step: 0 };
    return pos;
  }

  function retreat(pos, scenes) {
    if (pos.step > 0) return { index: pos.index, step: pos.step - 1 };
    if (pos.index > 0) return { index: pos.index - 1, step: stepsOf(scenes[pos.index - 1]) };
    return pos;
  }

  // Only a single step forward animates. Backward moves and jumps cut straight
  // to the target in its own craft, so handoffs never play in reverse.
  function transitionFor(fromIndex, toIndex, scenes) {
    if (fromIndex == null || fromIndex < 0) return 'cut';
    if (toIndex !== fromIndex + 1) return 'cut';
    return scenes[toIndex].act === scenes[fromIndex].act ? 'within' : 'act-enter';
  }

  function actStartIndex(scenes, n) {
    return scenes.findIndex((s) => s.act === n);
  }

  function parseStartParam(search, scenes) {
    const value = new URLSearchParams(search || '').get('scene');
    if (!value) return 0;
    const byId = scenes.findIndex((s) => s.id === value);
    if (byId >= 0) return byId;
    if (/^\d+$/.test(value)) return Math.min(Number(value), scenes.length - 1);
    return 0;
  }

  function createNavQueue() {
    let busy = false;
    let pending = null;
    return {
      request(target) {
        if (busy) { pending = target; return null; }
        busy = true;
        return target;
      },
      finish() {
        if (pending) { const next = pending; pending = null; return next; }
        busy = false;
        return null;
      },
      isBusy() { return busy; },
    };
  }

  const api = { stepsOf, advance, retreat, transitionFor, actStartIndex, parseStartParam, createNavQueue };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Nav = api;
})(globalThis);
```

- [ ] **Step 4: Implement `js/core/timer.js`**

```js
/* Clocks for two presenters sharing a 60-minute slot. */
(function (root) {
  'use strict';

  function formatClock(ms) {
    const neg = ms < 0;
    const total = Math.floor(Math.abs(ms) / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${neg ? '-' : ''}${m}:${String(s).padStart(2, '0')}`;
  }

  function plannedMsBefore(scenes, index) {
    const act = scenes[index].act;
    let minutes = 0;
    for (let i = 0; i < index; i++) if (scenes[i].act === act) minutes += scenes[i].minutes;
    return Math.round(minutes * 60000);
  }

  function paceStatus(elapsedMs, plannedMs, toleranceMs = 60000) {
    const diff = elapsedMs - plannedMs;
    if (diff > toleranceMs) return 'behind';
    if (diff < -toleranceMs) return 'ahead';
    return 'on';
  }

  function createActClock(now = () => Date.now()) {
    const started = {};
    return {
      mark(act) { if (!(act in started)) started[act] = now(); },
      elapsed(act) { return act in started ? now() - started[act] : 0; },
      reset(act) { started[act] = now(); },
      total() {
        const times = Object.values(started);
        return times.length ? now() - Math.min(...times) : 0;
      },
    };
  }

  const api = { formatClock, plannedMsBefore, paceStatus, createActClock };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Timer = api;
})(globalThis);
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/core/nav.js js/core/timer.js tests/nav.test.js tests/timer.test.js
git commit -m "feat: navigation rules, request queue, and presenter clocks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Craft math — `stitch`, `craft-shapes`

**Files:**
- Create: `js/core/stitch.js`, `js/core/craft-shapes.js`
- Test: `tests/stitch.test.js`, `tests/craft-shapes.test.js`

**Interfaces:**
- Consumes: `Random.mulberry32`.
- Produces:
  - `Stitch.pixelsToStitches(data:Uint8ClampedArray, width, height, cell, alphaMin=128) → {cols, rows, stitches:[{col,row,r,g,b}]}`
  - `CraftShapes.tornEdgePolygon(seed, teeth=24, depth=1.6) → 'polygon(...)'` with `4*teeth` points
  - `CraftShapes.tornSplit(seed, teeth=18, amp=3) → {left:'polygon(...)', right:'polygon(...)'}`
  - `CraftShapes.ransomLetters(text, seed) → [{ch, space:true} | {ch, font, skin, rotate, scale}]`; `font ∈ RANSOM_FONTS`, `skin ∈ RANSOM_SKINS`

- [ ] **Step 1: Write the failing tests**

`tests/stitch.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const Stitch = require('../js/core/stitch.js');

function image(w, h) { return new Uint8ClampedArray(w * h * 4); }
function setPx(data, w, x, y, rgba) { data.set(rgba, (y * w + x) * 4); }

test('samples the centre of each cell and skips transparent cells', () => {
  const d = image(4, 4);
  setPx(d, 4, 1, 1, [255, 0, 0, 255]);   // centre of cell (0,0)
  setPx(d, 4, 3, 3, [0, 0, 255, 50]);    // centre of cell (1,1), too transparent
  const out = Stitch.pixelsToStitches(d, 4, 4, 2);
  assert.equal(out.cols, 2);
  assert.equal(out.rows, 2);
  assert.deepEqual(out.stitches, [{ col: 0, row: 0, r: 255, g: 0, b: 0 }]);
});

test('ignores partial cells at the right and bottom edges', () => {
  const out = Stitch.pixelsToStitches(image(5, 5), 5, 5, 2);
  assert.equal(out.cols, 2);
  assert.equal(out.rows, 2);
});

test('alphaMin is configurable', () => {
  const d = image(2, 2);
  setPx(d, 2, 1, 1, [0, 0, 0, 100]);
  assert.equal(Stitch.pixelsToStitches(d, 2, 2, 2).stitches.length, 0);
  assert.equal(Stitch.pixelsToStitches(d, 2, 2, 2, 90).stitches.length, 1);
});
```

`tests/craft-shapes.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const CS = require('../js/core/craft-shapes.js');

const points = (poly) => poly.slice('polygon('.length, -1).split(',').map((p) => p.trim().split(' ').map(parseFloat));

test('tornEdgePolygon is deterministic, bounded, and has 4*teeth points', () => {
  const p = CS.tornEdgePolygon(11, 10, 2);
  assert.ok(p.startsWith('polygon('));
  assert.equal(p, CS.tornEdgePolygon(11, 10, 2));
  assert.notEqual(p, CS.tornEdgePolygon(12, 10, 2));
  const pts = points(p);
  assert.equal(pts.length, 40);
  pts.forEach(([x, y]) => { assert.ok(x >= 0 && x <= 100); assert.ok(y >= 0 && y <= 100); });
});

test('tornSplit halves share the same tear line', () => {
  const { left, right } = CS.tornSplit(5, 6, 3);
  const l = points(left), r = points(right);
  assert.deepEqual(l[0], [0, 0]);
  assert.deepEqual(r[0], [100, 0]);
  assert.deepEqual(l.slice(1, -1), r.slice(1, -1));
  l.slice(1, -1).forEach(([x]) => assert.ok(x >= 47 && x <= 53));
});

test('ransomLetters keeps every character, flags spaces, and is deterministic', () => {
  const out = CS.ransomLetters('Who owns?', 3);
  assert.equal(out.length, 9);
  assert.equal(out.map((l) => l.ch).join(''), 'Who owns?');
  assert.deepEqual(out[3], { ch: ' ', space: true });
  out.filter((l) => !l.space).forEach((l) => {
    assert.ok(CS.RANSOM_FONTS.includes(l.font));
    assert.ok(CS.RANSOM_SKINS.includes(l.skin));
    assert.ok(Math.abs(l.rotate) <= 8);
    assert.ok(l.scale >= 0.9 && l.scale <= 1.15);
  });
  assert.deepEqual(out, CS.ransomLetters('Who owns?', 3));
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/core/stitch.js'`.

- [ ] **Step 3: Implement `js/core/stitch.js`**

```js
/* Turns a bitmap into a cross-stitch grid: one stitch per opaque cell. */
(function (root) {
  'use strict';

  function pixelsToStitches(data, width, height, cell, alphaMin = 128) {
    const cols = Math.floor(width / cell);
    const rows = Math.floor(height / cell);
    const half = Math.floor(cell / 2);
    const stitches = [];
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * cell + half;
        const y = row * cell + half;
        const i = (y * width + x) * 4;
        if (data[i + 3] < alphaMin) continue;
        stitches.push({ col, row, r: data[i], g: data[i + 1], b: data[i + 2] });
      }
    }
    return { cols, rows, stitches };
  }

  const api = { pixelsToStitches };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Stitch = api;
})(globalThis);
```

- [ ] **Step 4: Implement `js/core/craft-shapes.js`**

```js
/* Seeded shapes for the paper and zine crafts. */
(function (root) {
  'use strict';
  const Random = (typeof module === 'object' && module.exports) ? require('./random.js') : root.Random;

  const RANSOM_FONTS = ['r-mono', 'r-type', 'r-hand', 'r-pixel', 'r-serif', 'r-courier'];
  const RANSOM_SKINS = ['paper', 'ink', 'yellow', 'pink', 'lime'];
  const pt = (x, y) => `${x.toFixed(2)}% ${y.toFixed(2)}%`;

  function tornEdgePolygon(seed, teeth = 24, depth = 1.6) {
    const rnd = Random.mulberry32(seed);
    const p = [];
    for (let i = 0; i < teeth; i++) p.push(pt((i / teeth) * 100, rnd() * depth));
    for (let i = 0; i < teeth; i++) p.push(pt(100 - rnd() * depth, (i / teeth) * 100));
    for (let i = 0; i < teeth; i++) p.push(pt(100 - (i / teeth) * 100, 100 - rnd() * depth));
    for (let i = 0; i < teeth; i++) p.push(pt(rnd() * depth, 100 - (i / teeth) * 100));
    return `polygon(${p.join(', ')})`;
  }

  function tornSplit(seed, teeth = 18, amp = 3) {
    const rnd = Random.mulberry32(seed);
    const tear = [];
    for (let i = 0; i <= teeth; i++) tear.push(pt(50 + (rnd() - 0.5) * 2 * amp, (i / teeth) * 100));
    return {
      left: `polygon(${[pt(0, 0), ...tear, pt(0, 100)].join(', ')})`,
      right: `polygon(${[pt(100, 0), ...tear, pt(100, 100)].join(', ')})`,
    };
  }

  function ransomLetters(text, seed) {
    const rnd = Random.mulberry32(seed);
    const pick = (list) => list[Math.floor(rnd() * list.length)];
    return [...String(text)].map((ch) => {
      if (/\s/.test(ch)) return { ch: ' ', space: true };
      return {
        ch,
        font: pick(RANSOM_FONTS),
        skin: pick(RANSOM_SKINS),
        rotate: Math.round((rnd() * 16 - 8) * 10) / 10,
        scale: Math.round((0.9 + rnd() * 0.25) * 100) / 100,
      };
    });
  }

  const api = { RANSOM_FONTS, RANSOM_SKINS, tornEdgePolygon, tornSplit, ransomLetters };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.CraftShapes = api;
})(globalThis);
```

- [ ] **Step 5: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git add js/core/stitch.js js/core/craft-shapes.js tests/stitch.test.js tests/craft-shapes.test.js
git commit -m "feat: cross-stitch sampling, torn paper and ransom-note shapes

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Sprite tool and Anastasia's avatar frames

**Files:**
- Create: `tools/slice_sprites.py`, `tests/test_slice_sprites.py`
- Create (generated): `assets/avatars/anastasia/{idle,walk1,walk2,walk3,walk4,talk,point}.png` and the matching `*.stitch.png` files

**Interfaces:**
- Produces (Python): `key_background(img, key=None, tolerance=60) → RGBA Image`, `find_sprites(keyed, min_gap=12, min_height=120, min_pixels=3) → [(x0,y0,x1,y1)]` in row-major order, `normalize(sprite) → 120×180 RGBA`, `stitchify(frame, cell=4) → 240×360 RGBA`.
- CLI: `python tools/slice_sprites.py sheet SHEET OUTDIR [--tolerance N] [--min-height N]` writes `blob_NN.png` files and prints their boxes. `python tools/slice_sprites.py frame SRC NAME OUTDIR` writes `OUTDIR/NAME.png` and `OUTDIR/NAME.stitch.png`.
- Later tasks rely on the frame names and sizes in Global Constraints.

- [ ] **Step 1: Write the failing Python tests**

`tests/test_slice_sprites.py`:
```python
import sys
import unittest
from pathlib import Path

from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parents[1] / "tools"))
import slice_sprites as ss  # noqa: E402

CYAN = (140, 227, 227)


def sheet():
    img = Image.new("RGB", (400, 400), CYAN)
    d = ImageDraw.Draw(img)
    d.rectangle((20, 20, 60, 170), fill=(255, 0, 0))     # row 1, left
    d.rectangle((120, 20, 160, 170), fill=(0, 0, 255))   # row 1, right
    d.rectangle((20, 220, 60, 380), fill=(0, 160, 0))    # row 2
    d.rectangle((300, 250, 303, 253), fill=(0, 0, 0))    # speck: dropped
    return img


class SliceTests(unittest.TestCase):
    def test_key_background_makes_corner_transparent(self):
        keyed = ss.key_background(sheet())
        self.assertEqual(keyed.getpixel((0, 0))[3], 0)
        self.assertEqual(keyed.getpixel((40, 100)), (255, 0, 0, 255))

    def test_find_sprites_row_major_and_drops_small_blobs(self):
        keyed = ss.key_background(sheet())
        boxes = ss.find_sprites(keyed, min_height=100)
        self.assertEqual(len(boxes), 3)
        colours = [keyed.getpixel(((b[0] + b[2]) // 2, (b[1] + b[3]) // 2))[:3] for b in boxes]
        self.assertEqual(colours, [(255, 0, 0), (0, 0, 255), (0, 160, 0)])

    def test_normalize_bottom_centres_into_frame(self):
        keyed = ss.key_background(sheet())
        box = ss.find_sprites(keyed, min_height=100)[0]
        frame = ss.normalize(keyed.crop(box))
        self.assertEqual(frame.size, (ss.FRAME_W, ss.FRAME_H))
        self.assertEqual(frame.getpixel((ss.FRAME_W // 2, ss.FRAME_H - 1))[3], 255)
        self.assertEqual(frame.getpixel((0, 0))[3], 0)

    def test_stitchify_doubles_size_and_keeps_transparency(self):
        frame = Image.new("RGBA", (ss.FRAME_W, ss.FRAME_H), (0, 0, 0, 0))
        ImageDraw.Draw(frame).rectangle((40, 100, 80, 179), fill=(123, 79, 179, 255))
        out = ss.stitchify(frame)
        self.assertEqual(out.size, (ss.FRAME_W * 2, ss.FRAME_H * 2))
        self.assertEqual(out.getpixel((2, 2))[3], 0)
        self.assertIsNotNone(out.getchannel("A").getbbox())


if __name__ == "__main__":
    unittest.main()
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm run test:py`
Expected: FAIL with `ModuleNotFoundError: No module named 'slice_sprites'`.

- [ ] **Step 3: Implement `tools/slice_sprites.py`**

```python
#!/usr/bin/env python3
"""Sprite tools for the UnMaking deck.

sheet   find sprites on a flat-colour sheet, key out the background, save blob_NN.png
frame   normalise one sprite into a 120x180 frame and write its cross-stitch twin
"""
import argparse
from pathlib import Path

from PIL import Image, ImageDraw

FRAME_W, FRAME_H = 120, 180
STITCH_SCALE = 2

# Thread palette for the textile act (keep in sync with css/craft-textile.css accents).
THREADS = [
    "#1b1b1b", "#f4f1ea", "#e9b48f", "#d98a7a", "#e2b33c", "#d6c25a", "#7b4fb3",
    "#a98bd6", "#2c3e6b", "#3f8f8a", "#b8332f", "#6b4a2e", "#8a8a8a", "#5a8a3c",
]


def _rgb(hexstr):
    return tuple(int(hexstr[i:i + 2], 16) for i in (1, 3, 5))


THREAD_RGB = [_rgb(h) for h in THREADS]


def key_background(img, key=None, tolerance=60):
    """Return RGBA with every pixel near `key` (default: top-left colour) made transparent."""
    src = img.convert("RGBA")
    if key is None:
        key = src.getpixel((0, 0))[:3]
    tol2 = tolerance * tolerance
    out = Image.new("RGBA", src.size, (0, 0, 0, 0))
    data = [
        (r, g, b, 255) if a and (r - key[0]) ** 2 + (g - key[1]) ** 2 + (b - key[2]) ** 2 > tol2 else (0, 0, 0, 0)
        for (r, g, b, a) in src.getdata()
    ]
    out.putdata(data)
    return out


def _runs(flags, min_gap):
    runs, start, end, gap = [], None, None, 0
    for i, f in enumerate(flags):
        if f:
            if start is None:
                start = i
            end, gap = i, 0
        elif start is not None:
            gap += 1
            if gap > min_gap:
                runs.append((start, end))
                start, gap = None, 0
    if start is not None:
        runs.append((start, end))
    return runs


def find_sprites(keyed, min_gap=12, min_height=120, min_pixels=3):
    """Boxes of sprites in row-major order, found by row then column projections."""
    alpha = keyed.getchannel("A")
    w, h = keyed.size
    rows = [alpha.crop((0, y, w, y + 1)).histogram()[255] >= min_pixels for y in range(h)]
    boxes = []
    for y0, y1 in _runs(rows, min_gap):
        band = alpha.crop((0, y0, w, y1 + 1))
        bh = y1 - y0 + 1
        cols = [band.crop((x, 0, x + 1, bh)).histogram()[255] >= min_pixels for x in range(w)]
        for x0, x1 in _runs(cols, min_gap):
            bb = alpha.crop((x0, y0, x1 + 1, y1 + 1)).getbbox()
            if bb is None:
                continue
            box = (x0 + bb[0], y0 + bb[1], x0 + bb[2], y0 + bb[3])
            if box[3] - box[1] >= min_height:
                boxes.append(box)
    return boxes


def normalize(sprite):
    """Scale (nearest-neighbour) to fit 120x180 and anchor bottom-centre."""
    sprite = sprite.convert("RGBA")
    bb = sprite.getchannel("A").getbbox()
    if bb:
        sprite = sprite.crop(bb)
    w, h = sprite.size
    scale = min((FRAME_W - 4) / w, (FRAME_H - 2) / h)
    nw, nh = max(1, round(w * scale)), max(1, round(h * scale))
    sprite = sprite.resize((nw, nh), Image.NEAREST)
    frame = Image.new("RGBA", (FRAME_W, FRAME_H), (0, 0, 0, 0))
    frame.paste(sprite, ((FRAME_W - nw) // 2, FRAME_H - nh), sprite)
    return frame


def _nearest_thread(rgb):
    return min(THREAD_RGB, key=lambda t: (t[0] - rgb[0]) ** 2 + (t[1] - rgb[1]) ** 2 + (t[2] - rgb[2]) ** 2)


def stitchify(frame, cell=4):
    """Render a 120x180 frame as cross-stitch at 2x: one X per opaque cell."""
    frame = frame.convert("RGBA")
    size = cell * STITCH_SCALE
    out = Image.new("RGBA", (FRAME_W * STITCH_SCALE, FRAME_H * STITCH_SCALE), (0, 0, 0, 0))
    draw = ImageDraw.Draw(out)
    half = cell // 2
    for row in range(FRAME_H // cell):
        for col in range(FRAME_W // cell):
            r, g, b, a = frame.getpixel((col * cell + half, row * cell + half))
            if a < 128:
                continue
            thread = _nearest_thread((r, g, b))
            shade = tuple(max(0, c - 60) for c in thread)
            x, y, p = col * size, row * size, 1
            for colour, off in ((shade, 1), (thread, 0)):
                draw.line((x + p + off, y + p + off, x + size - p + off, y + size - p + off), fill=colour + (255,), width=2)
                draw.line((x + size - p + off, y + p + off, x + p + off, y + size - p + off), fill=colour + (255,), width=2)
    return out


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)
    s = sub.add_parser("sheet")
    s.add_argument("sheet")
    s.add_argument("outdir")
    s.add_argument("--tolerance", type=int, default=60)
    s.add_argument("--min-height", type=int, default=120)
    s.add_argument("--min-gap", type=int, default=12)
    f = sub.add_parser("frame")
    f.add_argument("src")
    f.add_argument("name")
    f.add_argument("outdir")
    args = ap.parse_args()

    if args.cmd == "sheet":
        keyed = key_background(Image.open(args.sheet), tolerance=args.tolerance)
        out = Path(args.outdir)
        out.mkdir(parents=True, exist_ok=True)
        for i, box in enumerate(find_sprites(keyed, min_gap=args.min_gap, min_height=args.min_height)):
            keyed.crop(box).save(out / f"blob_{i:02d}.png")
            print(f"blob_{i:02d}.png  box={box}  size={box[2] - box[0]}x{box[3] - box[1]}")
    else:
        src = Image.open(args.src).convert("RGBA")
        if src.getpixel((0, 0))[3] == 255:
            src = key_background(src)
        frame = normalize(src)
        out = Path(args.outdir)
        out.mkdir(parents=True, exist_ok=True)
        frame.save(out / f"{args.name}.png")
        stitchify(frame).save(out / f"{args.name}.stitch.png")
        print(f"wrote {args.name}.png and {args.name}.stitch.png")


if __name__ == "__main__":
    main()
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm run test:py`
Expected: `Ran 4 tests … OK`.

- [ ] **Step 5: Generate Anastasia's sprite sheet in the "human in the loop" tee**

The AuthorFunction sprite is the identity and style reference, but both presenters now wear the same shirt. The AuthorFunction sheet also only has half-body talk poses, so the whole set is regenerated as one sheet. Invoke the `image-generator:image-generator` skill with these reference images: `assets/avatars/anastasia/source/sheet.jpg`, `assets/avatars/anastasia/source/walk1.png` (identity and style), and `assets/avatars/reference/human-in-the-loop-shirt.jpg` (shirt). Use this prompt:

> Pixel-art sprite sheet of the SAME character as the reference sprites, in exactly the same style, pixel scale, black outline weight and proportions (a 1990s point-and-click adventure game character: short blond swept hair, round glasses, navy trousers, white shoes). Change only the top: she now wears the t-shirt from the photo reference, a heathered slate-navy crew-neck tee with a silver-glitter swooping oval loop on the chest around stacked lowercase text "human in the loop". At this pixel scale, render the loop as a silver oval of light-grey and white pixels with a few sparkle pixels inside; the letters do not need to be legible. Solid flat cyan background #8CE3E3, no shadows, no text outside the shirt, no ground line. Row 1, five full-body frames: profile walk stride A facing right, profile walk stride B facing right, front-facing standing idle, profile walk stride C facing right, profile walk stride D facing right. Row 2, two full-body front-facing frames: talking with one hand raised palm up; pointing to the viewer's right with the arm fully extended. Every frame the same height. Leave a wide empty gap between every frame and between the rows.

Save as `assets/avatars/anastasia/source/hitl-sheet.png`, then:
```bash
D=assets/avatars/anastasia
python tools/slice_sprites.py sheet $D/source/hitl-sheet.png $D/blobs
```
Expected: seven `blob_NN.png` lines, row-major. If the count differs, adjust `--min-height` or `--min-gap`, or regenerate. Then map them:
```bash
python tools/slice_sprites.py frame $D/blobs/blob_00.png walk1 $D
python tools/slice_sprites.py frame $D/blobs/blob_01.png walk2 $D
python tools/slice_sprites.py frame $D/blobs/blob_02.png idle  $D
python tools/slice_sprites.py frame $D/blobs/blob_03.png walk3 $D
python tools/slice_sprites.py frame $D/blobs/blob_04.png walk4 $D
python tools/slice_sprites.py frame $D/blobs/blob_05.png talk  $D
python tools/slice_sprites.py frame $D/blobs/blob_06.png point $D
```

- [ ] **Step 6: Visually check the frames**

Open `idle.png`, `walk1.png`, `talk.png`, `point.png`, and `idle.stitch.png` in `assets/avatars/anastasia/` with the Read tool. Expected:
- Every frame is recognizably the AuthorFunction character, wearing the slate tee with the silver loop.
- All frames are the same height, with feet touching the bottom edge.
- There is no cyan fringe, and the stitch versions read as cross-stitch.

If not, revise the prompt and regenerate.

- [ ] **Step 7: Get Anastasia's approval (human gate)**

Stop and show Anastasia `idle.png`, `walk1.png`, `talk.png`, and `point.png`. Do not commit until she approves in the conversation.


- [ ] **Step 8: Commit**

```bash
git add tools/slice_sprites.py tests/test_slice_sprites.py assets/avatars/anastasia/*.png assets/avatars/anastasia/source
git status --short assets/avatars   # must not list any reference/ files
git commit -m "feat: sprite slicer with cross-stitch rendering; Anastasia avatar in HITL tee

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Emily's avatar (SUPERSEDED by Task 6A)

> Superseded: avatars are no longer generated with Gemini. Do not run the image-generator steps (Task 5 Steps 5-7 and all of this task). Both presenters' final avatars come from Task 6A (runtime pixel-map canvases). The photo-reference rules in Global Constraints still apply, and Dr. Johnson and Anastasia still approve the look before Task 6A is committed.

---

### Task 6A: Runtime pixel-map avatars for both presenters (replaces Gemini generation)

**Reference (read-only):** `C:/Users/anast/Documents/GitHub/HumanitiesAI/TeachingAI/js/avatar.js` and `js/pixel.js`. There, the avatar is built from hand-written ASCII pixel maps (one letter per palette colour), a `POSES` table for legs and arm, `compose()` to stamp parts together, and `paint()` to auto-outline onto a canvas. Copy the technique; never write inside that repo.

**Files:**
- Create: `js/render/avatar-pixels.js` (UMD so the pure part runs in node), `tests/avatar-pixels.test.js`
- Modify: `js/render/avatar.js` (use generated canvases when present, else the PNGs, else the labeled silhouette), `index.html` (script tag before `avatar.js`)

**Interfaces:**
- Produces: `AvatarPixels.frame(who, pose, skin) -> HTMLCanvasElement` for `who` in `emily|anastasia`, `pose` in `idle, walk1, walk2, walk3, walk4, talk, point`, `skin` in `plain|stitch`. Frame size is 120x180 (stitch 240x360), RGBA, transparent background, facing right.
- Pure part (node-testable): `AvatarPixels.compose(who, pose) -> string[][]` palette-letter grid, `AvatarPixels.POSES`, `AvatarPixels.PALETTES`. Canvas painting is the only DOM-dependent part.
- Consumes: `Stitch.pixelsToStitches` for the stitch skin. Existing `Avatar.setSkin/walkTo/hide/show/place/positionOf` keep their signatures.

**Requirements:**
- Hand-authored pixel maps per presenter: distinct hair, glasses and skin tone, informed by the reference photos (which stay gitignored and uncommitted), both wearing the slate-navy "human in the loop" tee (silver loop, a few glitter pixels).
- Seven poses each, including `talk` (raised hand) and `point` (arm extended). Walk frames face right.
- Auto-outline like the TeachingAI `paint()`; integer upscale with `imageSmoothingEnabled = false`.
- Works from `file://` with no network and no generated assets; canvases are built once and cached.
- Tests (node:test, no DOM): every pose composes to a grid of the expected size; both presenters have all 7 poses; grids differ between presenters; no unknown palette letters.

**Steps:** tests first (RED), then pure maps and compose (GREEN), then canvas painting and `avatar.js` integration, then a browser check of both avatars (idle, walk, talk, point) in paper and textile skins. Show both avatars to Anastasia (she forwards Emily's to Dr. Johnson) and commit only after approval, with a commit message ending `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`. The interim Anastasia PNGs and the slicer tool stay as fallback.

---

### Task 7: Act I content — "The Death of the Web (As We Know It)" (paper, Emily)

**Files:**
- Create: `js/data/act1-paper.js`, `tests/deck-content.test.js`

**Interfaces:**
- Consumes: `Deck.validateScene`, `Deck.buildDeck`, `Acts.ACTS`, `existsExactCase`.
- Produces: global `ACT1_SCENES` (16 scenes, 15.75 min). Ends with `a1-handoff` (`to: 'textile'`, `fx: ['pattern-to-cloth']`). `tests/deck-content.test.js` has an `ACT_FILES` array that Tasks 9–11 append to.

- [ ] **Step 1: Write the failing content test**

`tests/deck-content.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const { ACTS } = require('../js/core/acts.js');
const Deck = require('../js/core/deck.js');
const { existsExactCase } = require('./helpers.js');

// Append each act's file as it is written (Tasks 9-11).
const ACT_FILES = ['act1-paper.js'];
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
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/data/act1-paper.js'`.

- [ ] **Step 3: Write `js/data/act1-paper.js`**

Scenes flagged `draft: true` contain author notes from the outline that still need a source or a decision. They render with a DRAFT flag.

```js
/* Act I — Paper — presented by Emily K. Johnson. Outline: "Death of the Web as we know it". */
(function (root) {
  'use strict';
  const ACT1_SCENES = [
    {
      id: 'a1-title', act: 1, minutes: 0.75, layout: 'title',
      heading: 'Critical (Un)Making and the Agentic Humanities',
      text: 'A talk in four crafts',
      byline: 'Emily K. Johnson & Anastasia Salter',
      media: [{ src: 'assets/shared/critmaking-cover.png', alt: 'Cover of Critical Making in the Age of AI by Emily K. Johnson and Anastasia Salter: sewing-pattern pieces arranged into a profile of a head, with stitched lettering.' }],
      fx: ['popup-rise'],
      say: 'Welcome! Pull up a chair.',
      notes: 'Emily opens. Introduce both of us and our book, Critical Making in the Age of AI. Point at the cover: it is a sewing pattern, a paper promise of cloth. Hold that thought; it becomes Act II.',
    },
    {
      id: 'a1-crafts', act: 1, minutes: 0.75, layout: 'statement',
      heading: 'Four acts, four crafts',
      text: 'Paper. Thread. Zine. Game. Each act is made in a different craft, and each one gets unmade on the way to the next.',
      fx: ['fold-in'], avatar: { pose: 'talk', x: 60 },
      say: "I'm your guide for Act I.",
      notes: 'Explain the structure. We alternate: I take paper and the zine; Anastasia takes textiles and the game. Critical making as method: the form of each act is part of the argument, and these avatars were made, not prompted.',
    },
    {
      id: 'a1-act', act: 1, minutes: 0.5, layout: 'statement',
      heading: 'Act I: The Death of the Web (As We Know It)',
      text: 'Coding · enshittification · politics',
      fx: ['paper-tear'],
      notes: 'Section title. Three threads: what coding is now, what platforms have become, and the politics underneath both.',
    },
    {
      id: 'a1-personal', act: 1, minutes: 1, layout: 'statement',
      text: 'All these tools are for building something personal and expressive against a tide of regimented and boring web platforms.',
      fx: ['cut-out'], avatar: { pose: 'point', x: 60 },
      notes: 'The thesis we keep returning to: the web we loved was handmade. The tools we study exist to make personal, expressive things.',
    },
    {
      id: 'a1-enshittification', act: 1, minutes: 1.5, layout: 'quote',
      text: 'Enshittification is a “three stage process: First, platforms are good to their users; then they abuse their users to make things better for their business customers; finally, they abuse those business customers to claw back all the value for themselves. Then, they die.”',
      source: 'Cory Doctorow, “My McLuhan Lecture on Enshittification”',
      url: 'https://doctorow.medium.com/my-mcluhan-lecture-on-enshittification-ea343342b9bc',
      fx: ['fold-in'], avatar: { pose: 'point', x: 60 },
      notes: 'Read the quote. Note the irony that it is hosted on Medium, itself a platform mid-cycle.',
    },
    {
      id: 'a1-dark-tower', act: 1, minutes: 1, layout: 'statement',
      heading: 'The world has moved on',
      text: 'Doctorow on platforms and politics, and Stephen King’s Dark Tower as metaphor: the machinery still runs, but no one remembers why.',
      fx: ['page-turn'], draft: true,
      notes: 'Outline note: "Politics Doctorow article, apt The Dark Tower series as metaphor." Confirm which Doctorow politics piece and add its citation and URL. Use King’s refrain, "the world has moved on," as the hook.',
    },
    {
      id: 'a1-ghost-agents', act: 1, minutes: 1, layout: 'image',
      text: 'Now even those platforms (Medium, Facebook, X) are haunted by ghost agents dropping in for data and not staying.',
      media: [{ src: 'assets/act1/moltbook.png', alt: 'Screenshot of Moltbook, a social network where AI agents post to one another.' }],
      fx: ['cut-out'], draft: true,
      notes: 'Agents crawl and post but do not read the way people do. Moltbook as the extreme case: a network performed by agents for human onlookers. TODO before presenting: add the statistic and source on collapsing search referral traffic.',
    },
    {
      id: 'a1-creative-class', act: 1, minutes: 1, layout: 'statement',
      heading: 'The fall of the creative class',
      text: 'Who still gets to make a living by making?',
      source: 'Apricitas Economics, “AI and the Fall of the Creative Class”',
      url: 'https://www.apricitas.io/p/ai-and-the-fall-of-the-creative-class',
      fx: ['fold-in'], draft: true,
      notes: 'Summarize the Apricitas data on creative employment. Pull one chart or number to say aloud.',
    },
    {
      id: 'a1-muse', act: 1, minutes: 1.25, layout: 'image',
      text: 'Meta Muse and OpenAI Dots: cute companions marketed as the cure for enshittification, sold by the companies selling enshittification.',
      media: [{ src: 'assets/act1/muse-keroppi.png', alt: 'Chat companion profile with a green Keroppi-style frog avatar wearing a bow tie, labeled “Keroppi, Active.”' }],
      fx: ['popup-rise'], avatar: { pose: 'point', x: 60 },
      notes: 'The lure of AI as interface, and the next death of search and even of the feed. They are obvious Sanrio and Labubu riffs with OpenClaw wrappers, but they are marketed as the solution to the very problem their makers created.',
    },
    {
      id: 'a1-muse-video', act: 1, minutes: 1, layout: 'video',
      heading: 'Meta Muse, right now',
      text: 'Today it makes Facebook easier to use. Give it time.',
      media: [{ src: 'assets/act1/meta-muse-yeti-smith.mp4', alt: 'Screen recording of Meta Muse, Meta’s companion agent, helping a user get around Facebook.' }],
      fx: ['cut-out'],
      notes: 'Click the video to play (clicking does not advance). Muse is genuinely useful right now: it makes using Facebook easier. That is stage one of enshittification. Remember Doctorow: good to users first, then the squeeze.',
    },
    {
      id: 'a1-muse-memory', act: 1, minutes: 1, layout: 'quote',
      text: '“Where they live, what they do, the threads that recur (the apartment move, the shared savings goal)” … the “dates that matter,” such as birthdays or anniversaries … “the trip in March, the argument that got resolved, the milestone last week.”',
      source: 'Wired, “Muse Creates Detailed Profiles of All Your Friends and Family”',
      url: 'https://www.wired.com/story/muse-creates-detailed-profiles-of-all-your-friends-and-family/',
      fx: ['fold-in'],
      notes: 'From Muse’s own system instructions, as reported by Wired. It remembers your friends for you.',
    },
    {
      id: 'a1-muse-strengthen', act: 1, minutes: 1, layout: 'quote',
      text: '“How close they are, what it is built on, how they act with each other, and what it seems to need right now.” … “A reason to call, a date worth remembering, something they said to circle back on, a way to be there for them that matters.”',
      source: 'Wired, on Muse’s “Strengthening” instructions',
      url: 'https://www.wired.com/story/muse-creates-detailed-profiles-of-all-your-friends-and-family/',
      fx: ['fold-in'],
      notes: 'The "Strengthening" section: relationship maintenance outsourced to a platform that profits from the data.',
    },
    {
      id: 'a1-lens', act: 1, minutes: 1, layout: 'statement',
      text: 'So agentic tools risk becoming another proprietary platform we overtrust, one that becomes our lens for the world.',
      fx: ['paper-tear'], avatar: { pose: 'talk', x: 60 },
      notes: 'The risk, plainly stated.',
    },
    {
      id: 'a1-agents-def', act: 1, minutes: 1, layout: 'image',
      text: 'Agents are generative AI put to a purpose: “An LLM agent runs tools in a loop to achieve a goal.” (Simon Willison)',
      media: [{ src: 'assets/act1/agents.jpg', alt: 'Illustration accompanying Simon Willison’s definition of an LLM agent.' }],
      fx: ['cut-out'],
      notes: 'Define terms for the room: AI with tools that lets it serve as a low- or no-code interface for many tasks.',
    },
    {
      id: 'a1-metatools', act: 1, minutes: 1, layout: 'image',
      text: 'But agentic coding tools are also metatools for building alternatives to those same platforms.',
      media: [{ src: 'assets/act1/claude-process.png', alt: 'An agentic coding tool working through a multi-step task in a terminal.' }],
      fx: ['popup-rise'], avatar: { pose: 'point', x: 60 },
      notes: 'The turn: the same tools can make the alternatives. That is where Anastasia picks up.',
    },
    {
      id: 'a1-handoff', act: 1, minutes: 1, layout: 'handoff', to: 'textile',
      heading: 'A pattern is a promise of cloth',
      text: 'Over to Anastasia.',
      media: [{ src: 'assets/shared/critmaking-cover.png', alt: 'The sewing-pattern pieces from our book cover.' }],
      fx: ['pattern-to-cloth'],
      say: 'Your turn: bring a needle.',
      notes: 'Emily hands off. The sewing pattern gets stitched and the paper world turns to cloth. Anastasia steps forward while the animation plays.',
    },
  ];
  if (typeof module === 'object' && module.exports) module.exports = ACT1_SCENES;
  else root.ACT1_SCENES = ACT1_SCENES;
})(globalThis);
```

- [ ] **Step 4: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS, including `act 1 plans 14-16 minutes` (15.75).

- [ ] **Step 5: Commit**

```bash
git add js/data/act1-paper.js tests/deck-content.test.js
git commit -m "content: Act I (paper) scenes and deck content tests

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Stage shell, avatars, input and notes HUD, and the paper craft

**Files:**
- Create: `index.html`, `css/stage.css`, `css/hud.css`, `css/craft-paper.css`, `js/fx/crafts.js`, `js/fx/paper.js`, `js/render/avatar.js`, `js/render/stage.js`, `js/main.js`
- Create (placeholder, filled in by Tasks 9–11): `css/craft-textile.css`, `css/craft-zine.css`, `css/craft-game.css`, each containing only a header comment
- Test: `tests/offline.test.js`, `tests/fx-coverage.test.js`

**Interfaces:**
- Consumes: everything in `js/core/*`, `ACT1_SCENES`.
- Produces:
  - `Crafts.register(craft, {backdrop(el), decorate(el, scene), fx:{'name': async (el, ctx) => {}}})`, `Crafts.decorate(craft, el, scene)`, `Crafts.backdrop(craft, el)`, `Crafts.runFx(craft, name, el, ctx)`, helpers `Crafts.anim(el, keyframes, opts) → Promise`, `Crafts.wait(ms)`, `Crafts.fxLayer()`, `Crafts.el(tag, cls, text?)`, `Crafts.svgEl(tag, attrs)`
  - fx `ctx = {scene, act, lead, other, setCraft(craft), Avatar, stage:{stage, backdrop, content, say, fx}}`
  - `Avatar.{init(layer), preload() → Promise, setSkin(who, skin), setSkinAll(skin), pose(who, frame), show(who), hide(who), isVisible(who), place(who, x), walkTo(who, x) → Promise, positionOf(who)}`
  - `Stage.{init(), show(scene, act, {kind, step}) → Promise, setStep(step), setCraft(craft), say(text, x)}`
  - DOM ids: `#stage #backdrop #content #avatars #say #fx-layer #notes #blackout #errors`
  - Every rendered scene is `section.scene.layout-<layout>`, containing `.card-wrap > .card` (with `.heading`, `.text`, `.source`, `.byline`, `ol.choices > li.choice`, `ul.credits`) plus `figure.media` or `.gallery > figure.media`.

- [ ] **Step 1: Write the failing offline and fx-coverage tests**

`tests/offline.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ROOT, existsExactCase } = require('./helpers.js');

function walk(rel) {
  const abs = path.join(ROOT, rel);
  if (!fs.existsSync(abs)) return [];
  if (fs.statSync(abs).isFile()) return [rel];
  return fs.readdirSync(abs).flatMap((f) => walk(`${rel}/${f}`));
}
const files = ['index.html', 'presenter.html', ...walk('css'), ...walk('js')]
  .filter((f) => /\.(html|css|js)$/.test(f) && fs.existsSync(path.join(ROOT, f)));

const REMOTE = [
  /(?:src|href)\s*=\s*["']https?:/i,
  /url\(\s*["']?https?:/i,
  /@import/i,
  /fetch\(\s*["']https?:/i,
  /type\s*=\s*["']module["']/i,
];

test('no remote fetches or ES modules in deck files', () => {
  const hits = [];
  files.forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    REMOTE.forEach((re) => { if (re.test(src)) hits.push(`${f}: ${re}`); });
  });
  assert.deepEqual(hits, []);
});

test('every local src/href in html files exists with exact case', () => {
  const missing = [];
  files.filter((f) => f.endsWith('.html')).forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
      if (!/^[a-z]+:/i.test(m[1]) && !existsExactCase(m[1])) missing.push(`${f} -> ${m[1]}`);
    }
  });
  assert.deepEqual(missing, []);
});

test('every url() in css points at an existing local file', () => {
  const missing = [];
  files.filter((f) => f.endsWith('.css')).forEach((f) => {
    const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
    for (const m of src.matchAll(/url\(\s*['"]?(\.\.\/[^'")]+)['"]?\s*\)/g)) {
      const rel = path.posix.normalize(path.posix.join(path.posix.dirname(f), m[1]));
      if (!existsExactCase(rel)) missing.push(`${f} -> ${m[1]}`);
    }
  });
  assert.deepEqual(missing, []);
});
```

`tests/fx-coverage.test.js`:
```js
'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { FX_NAMES } = require('../js/core/acts.js');
const { ROOT } = require('./helpers.js');

// Grow these as Tasks 9-11 implement crafts and handoffs.
const CRAFTS_IMPLEMENTED = ['paper'];
const HANDOFFS_IMPLEMENTED = [];

const source = (craft) => fs.readFileSync(path.join(ROOT, 'js', 'fx', `${craft}.js`), 'utf8');

CRAFTS_IMPLEMENTED.forEach((craft) => {
  test(`${craft} implements every fx in FX_NAMES.${craft}`, () => {
    const src = source(craft);
    assert.deepEqual(FX_NAMES[craft].filter((n) => !src.includes(`'${n}':`)), []);
  });
});

test('implemented handoffs exist', () => {
  if (!HANDOFFS_IMPLEMENTED.length) return;
  const src = source('handoff');
  assert.deepEqual(HANDOFFS_IMPLEMENTED.filter((n) => !src.includes(`'${n}':`)), []);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npm test`
Expected: FAIL. The fx-coverage test fails with `ENOENT … js/fx/paper.js`, and the offline "local src" test passes vacuously because no html exists yet.

- [ ] **Step 3: Write `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Critical (Un)Making</title>
  <link rel="stylesheet" href="css/fonts.css">
  <link rel="stylesheet" href="css/stage.css">
  <link rel="stylesheet" href="css/craft-paper.css">
  <link rel="stylesheet" href="css/craft-textile.css">
  <link rel="stylesheet" href="css/craft-zine.css">
  <link rel="stylesheet" href="css/craft-game.css">
  <link rel="stylesheet" href="css/hud.css">
</head>
<body data-craft="paper" class="show-drafts">
  <div id="stage">
    <div id="backdrop"></div>
    <div id="content"></div>
    <div id="avatars"></div>
    <div id="say" class="hidden" aria-live="polite"></div>
    <div id="fx-layer"></div>
  </div>
  <div id="hud">
    <div id="notes" class="hidden">
      <div class="notes-meta"></div>
      <div class="notes-body"></div>
      <div class="notes-clock"></div>
    </div>
    <div id="blackout" class="hidden"></div>
    <pre id="errors" class="hidden"></pre>
  </div>

  <script src="js/core/random.js"></script>
  <script src="js/core/acts.js"></script>
  <script src="js/core/deck.js"></script>
  <script src="js/core/nav.js"></script>
  <script src="js/core/timer.js"></script>
  <script src="js/core/stitch.js"></script>
  <script src="js/core/craft-shapes.js"></script>
  <script src="js/data/act1-paper.js"></script>
  <script src="js/fx/crafts.js"></script>
  <script src="js/render/avatar.js"></script>
  <script src="js/render/stage.js"></script>
  <script src="js/fx/paper.js"></script>
  <script src="js/main.js"></script>
</body>
</html>
```
Tasks 9–11 each insert their `js/data/act*.js` after the previous data script and their `js/fx/<craft>.js` after `paper.js`. Task 9 also adds `js/fx/handoff.js` after the craft scripts.

- [ ] **Step 4: Write `css/stage.css` and `css/hud.css`**

`css/stage.css`:
```css
/* Stage: fixed 1280x720, scaled by main.js. Layers stack bottom to top. */
* { box-sizing: border-box; }
html, body { margin: 0; height: 100%; background: #111; overflow: hidden; }
#stage { position: absolute; left: 0; top: 0; width: 1280px; height: 720px; transform-origin: 0 0; overflow: hidden; background: #222; }
#backdrop, #content, #avatars, #fx-layer { position: absolute; inset: 0; }
#backdrop { z-index: 0; overflow: hidden; transition: opacity .4s; }
#content { z-index: 2; }
#avatars { z-index: 3; pointer-events: none; }
#say { position: absolute; z-index: 4; bottom: 236px; max-width: 360px; padding: 12px 16px; font-size: 22px; line-height: 1.25; pointer-events: none; }
#fx-layer { z-index: 6; pointer-events: none; overflow: hidden; }
.hidden { display: none !important; }
.sr-only { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

/* Scene layouts. Avatar lives in the 220px left gutter (or right with .avatar-right). */
.scene { position: absolute; inset: 0; display: grid; gap: 28px; align-items: center; justify-items: center; padding: 56px 72px 72px 220px; }
.scene.avatar-right { padding: 56px 220px 72px 72px; }
.card-wrap { position: relative; max-width: 100%; max-height: 100%; min-height: 0; }
.card-wrap:has(.card:empty) { display: none; }
.card { position: relative; display: flex; flex-direction: column; gap: 14px; max-height: 560px; padding: 36px 44px; overflow: hidden; }
.heading { margin: 0; font-size: 46px; line-height: 1.1; }
.text { margin: 0; flex: 1 1 auto; min-height: 0; overflow: hidden; line-height: 1.3; }
blockquote.text { quotes: none; }
.source, .byline { margin: 0; font-size: 18px; opacity: .8; }
.media { margin: 0; display: grid; place-items: center; min-height: 0; }
.media img, .media video { display: block; max-width: 100%; max-height: 100%; object-fit: contain; }

.layout-title, .layout-handoff, .layout-credits { padding: 56px 200px; }
.layout-title { grid-template-columns: minmax(0, 1fr) 300px; }
.layout-title .heading { font-size: 62px; }
.layout-title .media img { max-height: 500px; }
.layout-statement .card { max-width: 860px; }
.layout-quote:has(> .media) { grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); }
.layout-quote .media img { max-height: 500px; }
.layout-image, .layout-video, .layout-handoff, .layout-gallery { grid-template-rows: minmax(0, 1fr) auto; }
.layout-image .media img, .layout-video .media video, .layout-handoff .media img { max-height: 460px; }
.layout-image .card, .layout-video .card, .layout-handoff .card, .layout-gallery .card { max-height: 180px; padding: 16px 28px; }
.layout-image .text, .layout-video .text, .layout-handoff .text, .layout-gallery .text { font-size: 26px; }
.gallery { display: grid; grid-auto-flow: column; grid-auto-columns: minmax(0, 1fr); gap: 20px; width: 100%; height: 100%; min-height: 0; align-items: center; }
.gallery .media img { max-height: 420px; }
.choices { margin: 0; padding: 0; list-style: none; display: grid; gap: 10px; }
.choice { opacity: 0; transform: translateX(-12px); transition: opacity .25s, transform .25s; font-size: 28px; }
.choice.revealed { opacity: 1; transform: none; }
.credits { list-style: none; margin: 0; padding: 0; text-align: center; font-size: 26px; line-height: 2; }
.draft-flag { display: none; position: absolute; top: 12px; right: 12px; z-index: 5; padding: 4px 10px; background: #ff3b6b; color: #fff; font: 700 14px/1 system-ui, sans-serif; letter-spacing: .1em; transform: rotate(4deg); }
body.show-drafts .draft-flag { display: block; }

/* Avatars: .avatar > .frame > img. Flip lives on .frame so skins can animate img. */
.avatar { position: absolute; bottom: 36px; left: -200px; width: 120px; height: 180px; }
.avatar .frame { position: absolute; inset: 0; }
.avatar.flip .frame { transform: scaleX(-1); }
.avatar img { width: 100%; height: 100%; object-fit: contain; object-position: bottom; image-rendering: pixelated; }
.avatar.missing img { visibility: hidden; }
.avatar.missing .frame::before { content: ''; position: absolute; inset: 16px 28px 0; border-radius: 30px 30px 6px 6px; background: radial-gradient(circle at 50% 16%, #4a4a4a 0 16%, transparent 17%), linear-gradient(#4a4a4a, #4a4a4a) 50% 100% / 70% 66% no-repeat; }
.avatar.missing .frame::after { content: attr(data-label); position: absolute; left: 50%; bottom: -26px; transform: translateX(-50%); padding: 3px 6px; background: #000; color: #fff; font: 700 13px/1 system-ui, sans-serif; white-space: nowrap; }
```

`css/hud.css`:
```css
#notes { position: fixed; left: 12px; right: 12px; bottom: 12px; z-index: 50; max-height: 40vh; overflow: auto; padding: 14px 18px; background: rgba(0, 0, 0, .86); color: #f4f4f4; font: 18px/1.4 system-ui, sans-serif; border-radius: 10px; }
.notes-meta { font-size: 13px; opacity: .7; margin-bottom: 6px; }
.notes-clock { margin-top: 8px; font: 700 16px/1 ui-monospace, monospace; }
.notes-clock[data-pace="behind"], #p-pace[data-pace="behind"] { color: #ff6b6b; }
.notes-clock[data-pace="ahead"], #p-pace[data-pace="ahead"] { color: #8fd3ff; }
.notes-clock[data-pace="on"], #p-pace[data-pace="on"] { color: #9dff7a; }
#blackout { position: fixed; inset: 0; z-index: 60; background: #000; }
#errors { position: fixed; top: 12px; left: 12px; right: 12px; z-index: 70; max-height: 50vh; overflow: auto; margin: 0; padding: 12px; background: #3a0010; color: #ffd6de; font: 13px/1.4 ui-monospace, monospace; white-space: pre-wrap; }
```

- [ ] **Step 5: Write `js/fx/crafts.js`**

```js
/* Craft registry: each craft supplies a backdrop, a scene decorator, and named effects. */
const Crafts = (() => {
  const registry = {};
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function register(craft, impl) {
    registry[craft] = Object.assign({ backdrop() {}, decorate() {}, fx: {} }, impl);
  }
  function decorate(craft, el, scene) {
    if (registry[craft]) registry[craft].decorate(el, scene);
  }
  function backdrop(craft, el) {
    el.replaceChildren();
    el.className = 'backdrop backdrop-' + craft;
    if (registry[craft]) registry[craft].backdrop(el);
  }
  async function runFx(craft, name, el, ctx) {
    const impl = registry[craft] && registry[craft].fx[name];
    if (!impl) { console.warn(`fx ${craft}/${name} is not implemented yet`); return; }
    await impl(el, ctx);
  }

  function anim(el, keyframes, opts = {}) {
    const a = el.animate(keyframes, Object.assign({ fill: 'both', easing: 'cubic-bezier(.2,.8,.2,1)' }, opts));
    return a.finished.catch(() => {});
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fxLayer = () => document.getElementById('fx-layer');
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs = {}) {
    const n = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  }

  return { register, decorate, backdrop, runFx, anim, wait, fxLayer, el, svgEl };
})();
```

- [ ] **Step 6: Write `js/render/avatar.js`**

```js
/* Presenter avatars: two sprite slots, per-craft skins, walking between scenes. */
const Avatar = (() => {
  const WHO = ['emily', 'anastasia'];
  const FRAMES = ['idle', 'walk1', 'walk2', 'walk3', 'walk4', 'talk', 'point'];
  const WALK = ['walk1', 'walk2', 'walk3', 'walk4'];
  const LABELS = { emily: 'Emily', anastasia: 'Anastasia' };
  const slots = {};

  const src = (who, frame, skin) => `assets/avatars/${who}/${frame}${skin === 'textile' ? '.stitch' : ''}.png`;

  function init(layer) {
    WHO.forEach((who) => {
      const el = document.createElement('div');
      el.className = 'avatar hidden';
      el.dataset.who = who;
      const frame = document.createElement('div');
      frame.className = 'frame';
      frame.dataset.label = LABELS[who];
      const img = new Image();
      img.alt = '';
      img.draggable = false;
      // Missing pose → fall back to idle; missing idle → labeled silhouette.
      img.addEventListener('error', () => {
        const s = slots[who];
        if (s.frame !== 'idle') { s.frame = 'idle'; render(who); } else el.classList.add('missing');
      });
      img.addEventListener('load', () => el.classList.remove('missing'));
      frame.append(img);
      el.append(frame);
      layer.append(el);
      slots[who] = { el, img, x: -200, frame: 'idle', skin: 'paper', timer: null, walk: null };
      render(who);
    });
  }

  function preload() {
    const urls = [];
    WHO.forEach((w) => FRAMES.forEach((f) => ['paper', 'textile'].forEach((skin) => urls.push(src(w, f, skin)))));
    return Promise.all(urls.map((u) => new Promise((resolve) => {
      const i = new Image();
      i.onload = i.onerror = resolve;
      i.src = u;
    })));
  }

  function render(who) {
    const s = slots[who];
    s.img.src = src(who, s.frame, s.skin);
    s.el.dataset.skin = s.skin;
  }
  function setSkin(who, skin) { slots[who].skin = skin; render(who); }
  function setSkinAll(skin) { WHO.forEach((w) => setSkin(w, skin)); }
  function pose(who, frame) {
    const s = slots[who];
    if (s.frame === frame) return;
    s.frame = frame;
    render(who);
  }
  function show(who) { slots[who].el.classList.remove('hidden'); }
  function hide(who) { slots[who].el.classList.add('hidden'); }
  function isVisible(who) { return !slots[who].el.classList.contains('hidden'); }
  function positionOf(who) { return slots[who].x; }

  function stop(who) {
    const s = slots[who];
    clearInterval(s.timer);
    if (s.walk) s.walk.cancel();
    s.walk = null;
    s.el.classList.remove('walking', 'flip');
  }

  function place(who, x) {
    stop(who);
    const s = slots[who];
    s.el.style.left = x + 'px';
    s.x = x;
  }

  function walkTo(who, x) {
    const s = slots[who];
    stop(who);
    const dist = Math.abs(x - s.x);
    if (dist < 4) { pose(who, 'idle'); return Promise.resolve(); }
    const duration = Math.max(600, Math.min(1600, dist * 1.6));
    s.el.classList.add('walking');
    s.el.classList.toggle('flip', x < s.x);
    let i = 0;
    s.timer = setInterval(() => pose(who, WALK[i++ % WALK.length]), 125);
    const easing = s.skin === 'zine' ? 'steps(8)' : 'linear';
    s.walk = s.el.animate([{ left: s.x + 'px' }, { left: x + 'px' }], { duration, easing, fill: 'forwards' });
    s.x = x;
    const walk = s.walk;
    return walk.finished.catch(() => {}).then(() => {
      if (s.walk !== walk) return; // superseded by a newer walk or place
      clearInterval(s.timer);
      s.el.style.left = x + 'px';
      walk.cancel();
      s.walk = null;
      s.el.classList.remove('walking', 'flip');
      pose(who, 'idle');
    });
  }

  return { init, preload, setSkin, setSkinAll, pose, show, hide, isVisible, place, walkTo, positionOf };
})();
```

- [ ] **Step 7: Write `js/render/stage.js`**

```js
/* Renders one scene into the stage: layout DOM, craft decoration, avatars, speech, fx. */
const Stage = (() => {
  let els = null;
  let currentCraft = null;
  let typing = null;
  const BOTH = ['title', 'handoff', 'credits'];
  const FIT = { statement: [48, 22], quote: [36, 18], image: [28, 16], video: [28, 16], gallery: [26, 16], handoff: [28, 16], choice: [32, 18], title: [30, 18] };

  function init() {
    const $ = (id) => document.getElementById(id);
    els = { stage: $('stage'), backdrop: $('backdrop'), content: $('content'), say: $('say'), fx: $('fx-layer') };
  }

  function setCraft(craft) {
    if (craft === currentCraft) return;
    currentCraft = craft;
    document.body.dataset.craft = craft;
    Crafts.backdrop(craft, els.backdrop);
    Avatar.setSkinAll(craft);
  }

  const make = (tag, cls, text) => Crafts.el(tag, cls, text);

  function figure(m) {
    const f = make('figure', 'media');
    if (/\.mp4$/i.test(m.src)) {
      const v = document.createElement('video');
      v.src = m.src;
      v.controls = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.setAttribute('aria-label', m.alt);
      f.append(v);
    } else {
      const img = new Image();
      img.src = m.src;
      img.alt = m.alt;
      img.decoding = 'async';
      f.append(img);
    }
    return f;
  }

  function renderScene(scene) {
    const root = make('section', `scene layout-${scene.layout}`);
    root.dataset.id = scene.id;
    const wrap = make('div', 'card-wrap');
    const card = make('div', 'card');
    wrap.append(card);
    root.append(wrap);
    const media = scene.media || [];

    if (scene.heading) card.append(make(scene.layout === 'title' ? 'h1' : 'h2', 'heading', scene.heading));
    if (scene.layout === 'quote') {
      card.append(make('blockquote', 'text', scene.text));
      card.append(make('cite', 'source', scene.source));
      if (media[0]) root.append(figure(media[0]));
    } else if (scene.layout === 'gallery') {
      const g = make('div', 'gallery');
      media.forEach((m) => g.append(figure(m)));
      root.insertBefore(g, wrap);
      if (scene.text) card.append(make('p', 'text', scene.text));
    } else if (scene.layout === 'choice') {
      if (scene.text) card.append(make('p', 'text', scene.text));
      const ol = make('ol', 'choices');
      scene.choices.forEach((c) => ol.append(make('li', 'choice', c)));
      card.append(ol);
    } else if (scene.layout === 'credits') {
      const ul = make('ul', 'credits');
      scene.lines.forEach((l) => ul.append(make('li', '', l)));
      card.append(ul);
    } else {
      if (scene.text) card.append(make('p', 'text', scene.text));
      if (scene.byline) card.append(make('p', 'byline', scene.byline));
      if (media[0]) {
        const f = figure(media[0]);
        if (scene.layout === 'title') root.append(f); else root.insertBefore(f, wrap);
      }
    }
    if (scene.source && scene.layout !== 'quote') card.append(make('p', 'source', scene.source));
    if (scene.draft) root.append(make('div', 'draft-flag', 'DRAFT'));
    return root;
  }

  function fitText(el, max, min) {
    let size = max;
    el.style.fontSize = size + 'px';
    while (size > min && el.scrollHeight > el.clientHeight + 1) {
      size -= 1;
      el.style.fontSize = size + 'px';
    }
  }

  function fitAll(root, layout) {
    const [max, min] = FIT[layout] || [32, 16];
    root.querySelectorAll('.text').forEach((t) => fitText(t, max, min));
  }

  function setStep(step) {
    const items = els.content.querySelectorAll('.choice');
    items.forEach((li, i) => {
      li.classList.toggle('revealed', i < step);
      li.classList.toggle('current', i === step - 1);
    });
  }

  function say(text, x) {
    clearInterval(typing);
    const box = els.say;
    if (!text) { box.classList.add('hidden'); box.textContent = ''; return; }
    box.classList.remove('hidden');
    box.style.left = Math.min(x + 140, 1280 - 380) + 'px';
    if (currentCraft === 'game') {
      box.textContent = '';
      let i = 0;
      typing = setInterval(() => {
        box.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(typing);
      }, 22);
    } else {
      box.textContent = text;
    }
  }

  const poseOf = (scene) => (scene.avatar && scene.avatar.pose) || 'idle';
  const xOf = (scene) => (scene.avatar && typeof scene.avatar.x === 'number' ? scene.avatar.x : 60);

  async function show(scene, act, { kind, step }) {
    els.fx.replaceChildren();
    setCraft(act.craft);

    const el = renderScene(scene);
    const x = xOf(scene);
    el.classList.toggle('avatar-right', x > 640);
    Crafts.decorate(act.craft, el, scene);
    els.content.replaceChildren(el);
    fitAll(el, scene.layout);
    setStep(step);

    const lead = act.presenter;
    const other = lead === 'emily' ? 'anastasia' : 'emily';
    // Re-skin both every scene: an avatar that sat out an act (or left during a
    // handoff in the old skin) must reappear in the current craft.
    Avatar.setSkin(lead, act.craft);
    Avatar.setSkin(other, act.craft);
    if (scene.avatar === false) Avatar.hide(lead); else Avatar.show(lead);
    if (BOTH.includes(scene.layout)) {
      if (!Avatar.isVisible(other)) { Avatar.place(other, kind === 'cut' ? 1100 : 1400); Avatar.show(other); }
      if (kind === 'cut') Avatar.place(other, 1100); else Avatar.walkTo(other, 1100);
    } else {
      Avatar.hide(other);
    }
    say(scene.say || '', x);

    if (kind === 'cut') {
      Avatar.place(lead, x);
      Avatar.pose(lead, poseOf(scene));
      return;
    }
    const walking = Avatar.walkTo(lead, x);
    const ctx = { scene, act, lead, other, setCraft, Avatar, stage: els };
    const fxCraft = scene.layout === 'handoff' ? 'handoff' : act.craft;
    for (const name of scene.fx || []) await Crafts.runFx(fxCraft, name, el, ctx);
    await walking;
    if (Avatar.positionOf(lead) === x) Avatar.pose(lead, poseOf(scene));
  }

  return { init, show, setStep, setCraft, say, renderScene };
})();
```

- [ ] **Step 8: Write `js/main.js`**

```js
/* Boot, input, notes HUD, and presenter-window broadcast. */
(function () {
  'use strict';
  const lists = [globalThis.ACT1_SCENES, globalThis.ACT2_SCENES, globalThis.ACT3_SCENES, globalThis.ACT4_SCENES].filter(Array.isArray);
  const { scenes, errors } = Deck.buildDeck(lists);
  const $ = (id) => document.getElementById(id);
  const stageEl = $('stage');
  const notesEl = $('notes');
  const blackout = $('blackout');
  const errorsEl = $('errors');
  const queue = Nav.createNavQueue();
  const clock = Timer.createActClock();
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('unmaking-deck') : null;
  let pos = { index: -1, step: 0 };

  function fit() {
    const s = Math.min(innerWidth / 1280, innerHeight / 720);
    stageEl.style.transform = `scale(${s})`;
    stageEl.style.left = (innerWidth - 1280 * s) / 2 + 'px';
    stageEl.style.top = (innerHeight - 720 * s) / 2 + 'px';
  }

  function request(target) {
    if (!target || target.index < 0 || target.index >= scenes.length) return;
    const t = queue.request(target);
    if (t) run(t, false);
  }

  async function run(target, instant) {
    try {
      if (target.index === pos.index) {
        Stage.setStep(target.step);
      } else {
        const scene = scenes[target.index];
        const act = Acts.actByNumber(scene.act);
        const kind = instant ? 'cut' : Nav.transitionFor(pos.index, target.index, scenes);
        pos = { index: target.index, step: target.step };
        clock.mark(scene.act);
        try { history.replaceState(null, '', '?scene=' + scene.id); } catch (e) { /* file:// in some browsers */ }
        await Stage.show(scene, act, { kind, step: target.step });
      }
      pos = { index: target.index, step: target.step };
      renderNotes();
      broadcast();
    } catch (err) {
      console.error(err);
    }
    const next = queue.finish();
    if (next) run(next, true); // presses made during an animation land instantly
  }

  function status() {
    const scene = scenes[pos.index];
    const act = Acts.actByNumber(scene.act);
    const elapsed = clock.elapsed(act.n);
    const planned = Timer.plannedMsBefore(scenes, pos.index);
    return { scene, act, elapsed, planned, pace: Timer.paceStatus(elapsed, planned) };
  }

  function renderNotes() {
    if (pos.index < 0) return;
    const { scene, act, elapsed, planned, pace } = status();
    const who = Acts.PRESENTERS[act.presenter].name;
    notesEl.querySelector('.notes-meta').textContent =
      `${pos.index + 1}/${scenes.length} · ${scene.id} · ${act.title}: ${act.subtitle} · ${who}${scene.draft ? ' · DRAFT' : ''}`;
    notesEl.querySelector('.notes-body').textContent = scene.notes;
    const c = notesEl.querySelector('.notes-clock');
    c.textContent = `Act ${Timer.formatClock(elapsed)} / ${act.budgetMinutes}:00 · planned ${Timer.formatClock(planned)} · ${pace.toUpperCase()} · total ${Timer.formatClock(clock.total())}`;
    c.dataset.pace = pace;
  }

  function broadcast() {
    if (!channel || pos.index < 0) return;
    const { elapsed, planned } = status();
    channel.postMessage({ type: 'state', index: pos.index, step: pos.step, actElapsed: elapsed, planned, total: clock.total() });
  }

  function onMessage({ data }) {
    if (!data) return;
    if (data.type === 'hello') broadcast();
    if (data.type === 'nav') {
      if (data.action === 'next') request(Nav.advance(pos, scenes));
      if (data.action === 'prev') request(Nav.retreat(pos, scenes));
      if (data.action === 'goto') request({ index: data.index, step: 0 });
    }
  }

  function onKey(e) {
    const k = e.key;
    if (e.target && e.target.tagName === 'VIDEO' && k === ' ') return;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); request(Nav.advance(pos, scenes)); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); request(Nav.retreat(pos, scenes)); }
    else if (k === 'Home' || k === '0') request({ index: 0, step: 0 });
    else if (k === 'End') request({ index: scenes.length - 1, step: 0 });
    else if (/^[1-4]$/.test(k)) { const i = Nav.actStartIndex(scenes, Number(k)); if (i >= 0) request({ index: i, step: 0 }); }
    else if (k === 'n' || k === 'N') { notesEl.classList.toggle('hidden'); renderNotes(); }
    else if (k === 'b' || k === 'B' || k === '.') blackout.classList.toggle('hidden');
    else if (k === 't' || k === 'T') { if (pos.index >= 0) clock.reset(scenes[pos.index].act); renderNotes(); }
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }
    else if (k === 'p' || k === 'P') window.open('presenter.html', 'unmaking-presenter', 'width=1100,height=760');
    else if (k === 'r' || k === 'R') document.body.classList.toggle('show-drafts');
    else if (k === 'e' || k === 'E') errorsEl.classList.toggle('hidden');
  }

  async function boot() {
    fit();
    addEventListener('resize', fit);
    Stage.init();
    Avatar.init($('avatars'));
    if (errors.length) {
      errorsEl.textContent = 'Deck errors (press E to hide):\n' + errors.join('\n');
      errorsEl.classList.remove('hidden');
      console.warn(errors);
    }
    if (!scenes.length) return;
    try { await document.fonts.ready; } catch (e) { /* fonts optional */ }
    await Avatar.preload();
    document.addEventListener('keydown', onKey);
    stageEl.addEventListener('click', (e) => {
      if (e.target.closest('a, button, video')) return;
      request(Nav.advance(pos, scenes));
    });
    if (channel) channel.onmessage = onMessage;
    setInterval(() => { renderNotes(); broadcast(); }, 1000);
    request({ index: Nav.parseStartParam(location.search, scenes), step: 0 });
  }

  boot();
})();
```

- [ ] **Step 9: Write `css/craft-paper.css`**

```css
/* ACT I — PAPER: pop-up book, cut paper, washi tape, paper-puppet avatar */
body[data-craft="paper"] #stage { background: #efe4cf; color: #2b2118; font-family: 'Special Elite', 'Courier New', monospace; }
.backdrop-paper {
  background-color: #efe4cf;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='240' height='240'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 .35 0 0 0 0 .25 0 0 0 0 .15 0 0 0 .22 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>");
}
.backdrop-paper .paper-sun { position: absolute; right: 140px; top: 70px; width: 120px; height: 120px; border-radius: 50%; background: #f2b04a; filter: drop-shadow(0 4px 2px rgba(80, 50, 20, .3)); animation: sun-turn 40s linear infinite; }
.backdrop-paper .hill { position: absolute; left: -10%; width: 120%; border-radius: 50% 50% 0 0 / 100% 100% 0 0; filter: drop-shadow(0 -3px 2px rgba(60, 40, 20, .25)); }
.backdrop-paper .hill.h3 { bottom: 0; height: 330px; background: #c7b48b; animation: drift 18s ease-in-out infinite alternate; }
.backdrop-paper .hill.h2 { bottom: 0; height: 230px; background: #a9c09b; left: -30%; animation: drift 14s ease-in-out infinite alternate-reverse; }
.backdrop-paper .hill.h1 { bottom: 0; height: 120px; background: #8aa57e; animation: drift 11s ease-in-out infinite alternate; }
.backdrop-paper .scrap { position: absolute; width: 22px; height: 22px; clip-path: polygon(50% 0, 100% 100%, 0 80%); background: hsl(calc(var(--hue) * 40 + 10), 55%, 62%); animation: spin var(--spin) linear infinite; opacity: .8; }
@keyframes drift { from { transform: translateX(-20px); } to { transform: translateX(20px); } }
@keyframes spin { to { transform: rotate(360deg); } }
@keyframes sun-turn { to { transform: rotate(360deg); } }

[data-craft="paper"] .scene { filter: drop-shadow(0 10px 8px rgba(60, 40, 20, .28)) drop-shadow(0 2px 1px rgba(60, 40, 20, .25)); }
[data-craft="paper"] .card-wrap { transform: rotate(var(--tilt, 0deg)); }
[data-craft="paper"] .card { background: #fffaf0; padding: 46px 56px; }
[data-craft="paper"] .heading { font-family: 'Patrick Hand', cursive; font-size: 56px; color: #b6452c; font-weight: 400; }
[data-craft="paper"] .layout-title .heading { font-size: 66px; }
[data-craft="paper"] .source, [data-craft="paper"] .byline { font-family: 'Patrick Hand', cursive; font-size: 22px; }
[data-craft="paper"] .media img { background: #fff; padding: 10px; transform: rotate(var(--tilt, 0deg)); }
.tape { position: absolute; top: -14px; z-index: 3; width: 120px; height: 34px; background: repeating-linear-gradient(45deg, rgba(240, 170, 170, .78) 0 8px, rgba(250, 214, 200, .78) 8px 16px); }
.tape.left { left: -24px; transform: rotate(-28deg); }
.tape.right { right: -24px; transform: rotate(24deg); }
.cut-line { position: absolute; left: -12px; top: -12px; overflow: visible; fill: none; stroke: #6b5a45; stroke-width: 2; stroke-dasharray: 10 8; }
.scissors { position: absolute; top: -30px; left: -20px; font-size: 34px; color: #6b5a45; }
.tear-half, .turn-page { position: absolute; inset: 0; background: #efe4cf; }
.turn-page { transform-origin: 0 50%; backface-visibility: hidden; box-shadow: 10px 0 30px rgba(0, 0, 0, .25); }

/* Paper puppet on a stick */
.avatar[data-skin="paper"] img {
  image-rendering: auto;
  transform-origin: 50% 100%;
  filter: drop-shadow(3px 0 0 #fff) drop-shadow(-3px 0 0 #fff) drop-shadow(0 3px 0 #fff) drop-shadow(0 -3px 0 #fff) drop-shadow(4px 8px 4px rgba(60, 40, 20, .35));
  animation: puppet-sway 2.4s ease-in-out infinite alternate;
}
.avatar[data-skin="paper"].walking img { animation: puppet-hop .25s ease-in-out infinite alternate; }
.avatar[data-skin="paper"]::after { content: ''; position: absolute; left: 50%; bottom: -60px; z-index: -1; width: 8px; height: 90px; margin-left: -4px; border-radius: 3px; background: linear-gradient(90deg, #b88b55, #d9b07a); box-shadow: 2px 3px 3px rgba(0, 0, 0, .25); }
@keyframes puppet-sway { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
@keyframes puppet-hop { from { transform: translateY(0) rotate(-3deg); } to { transform: translateY(-14px) rotate(3deg); } }

[data-craft="paper"] #say { background: #fffaf0; border-radius: 18px; font-family: 'Patrick Hand', cursive; font-size: 26px; filter: drop-shadow(0 4px 3px rgba(60, 40, 20, .3)); }
[data-craft="paper"] #say::after { content: ''; position: absolute; left: -16px; bottom: 14px; border: 10px solid transparent; border-right: 16px solid #fffaf0; }
```

Also create the three placeholder craft stylesheets so `index.html` links resolve:
```css
/* ACT II — TEXTILE (implemented in Task 9) */
```
```css
/* ACT III — E-ZINE (implemented in Task 10) */
```
```css
/* ACT IV — INDIE GAME (implemented in Task 11) */
```

- [ ] **Step 10: Write `js/fx/paper.js`**

```js
/* ACT I — PAPER craft: backdrop, torn cards with washi tape, pop-up effects. */
(function () {
  'use strict';
  const { anim, wait, fxLayer, el, svgEl } = Crafts;
  const seedOf = (scene) => Random.hashString(scene.id);
  const wrapOf = (root) => root.querySelector('.card-wrap');

  Crafts.register('paper', {
    backdrop(bg) {
      const rnd = Random.mulberry32(7);
      bg.append(el('div', 'paper-sun'));
      ['h3', 'h2', 'h1'].forEach((h) => bg.append(el('div', 'hill ' + h)));
      for (let i = 0; i < 9; i++) {
        const s = el('div', 'scrap');
        s.style.left = (rnd() * 100).toFixed(1) + '%';
        s.style.top = (rnd() * 55).toFixed(1) + '%';
        s.style.setProperty('--spin', (20 + rnd() * 40).toFixed(0) + 's');
        s.style.setProperty('--hue', Math.floor(rnd() * 5));
        bg.append(s);
      }
    },

    decorate(root, scene) {
      const rnd = Random.mulberry32(seedOf(scene));
      const wrap = wrapOf(root);
      if (wrap) {
        wrap.querySelector('.card').style.clipPath = CraftShapes.tornEdgePolygon(seedOf(scene));
        wrap.style.setProperty('--tilt', ((rnd() - 0.5) * 3).toFixed(2) + 'deg');
        wrap.append(el('div', 'tape left'));
        if (rnd() > 0.5) wrap.append(el('div', 'tape right'));
      }
      root.querySelectorAll('.media').forEach((m) => m.style.setProperty('--tilt', ((rnd() - 0.5) * 4).toFixed(2) + 'deg'));
    },

    fx: {
      'popup-rise': async (root) => {
        root.style.perspective = '1100px';
        const parts = [...root.children].filter((c) => !c.classList.contains('draft-flag'));
        await Promise.all(parts.map((p, i) => anim(p, [
          { transform: 'rotateX(-92deg)', transformOrigin: '50% 100%', opacity: 0 },
          { transform: 'rotateX(10deg)', transformOrigin: '50% 100%', opacity: 1, offset: 0.7 },
          { transform: 'rotateX(0deg)', transformOrigin: '50% 100%', opacity: 1 },
        ], { duration: 900, delay: i * 160 })));
      },

      'fold-in': async (root) => {
        const parts = [...root.children].filter((c) => !c.classList.contains('draft-flag'));
        await Promise.all(parts.map((p, i) => anim(p, [
          { transform: 'perspective(900px) rotateY(88deg)', transformOrigin: '0 50%', opacity: 0 },
          { transform: 'perspective(900px) rotateY(-10deg)', transformOrigin: '0 50%', opacity: 1, offset: 0.75 },
          { transform: 'perspective(900px) rotateY(0deg)', transformOrigin: '0 50%', opacity: 1 },
        ], { duration: 800, delay: i * 140 })));
      },

      'paper-tear': async (root, { scene }) => {
        const { left, right } = CraftShapes.tornSplit(seedOf(scene));
        const l = el('div', 'tear-half');
        const r = el('div', 'tear-half');
        l.style.clipPath = left;
        r.style.clipPath = right;
        fxLayer().append(l, r);
        await wait(120);
        const ease = { duration: 950, easing: 'cubic-bezier(.6,0,.4,1)' };
        await Promise.all([
          anim(l, [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(-72%) rotate(-8deg)' }], ease),
          anim(r, [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(72%) rotate(8deg)' }], ease),
        ]);
        l.remove();
        r.remove();
      },

      'cut-out': async (root) => {
        const wrap = wrapOf(root);
        if (!wrap) return;
        const w = wrap.offsetWidth;
        const h = wrap.offsetHeight;
        const svg = svgEl('svg', { class: 'cut-line', width: w + 24, height: h + 24, viewBox: `0 0 ${w + 24} ${h + 24}` });
        svg.append(svgEl('rect', { x: 4, y: 4, width: w + 16, height: h + 16, rx: 6 }));
        const sc = el('div', 'scissors', '✂');
        wrap.append(svg, sc);
        await anim(sc, [{ transform: 'translateX(0)' }, { transform: `translateX(${w + 20}px)` }], { duration: 900, easing: 'linear' });
        sc.remove();
        await Promise.all([
          anim(wrap, [{ translate: '0 0' }, { translate: '0 -10px' }], { duration: 350 }),
          anim(svg, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 }),
        ]);
        svg.remove();
      },

      'page-turn': async () => {
        const page = el('div', 'turn-page');
        fxLayer().append(page);
        await anim(page, [{ transform: 'perspective(1600px) rotateY(0deg)' }, { transform: 'perspective(1600px) rotateY(-180deg)' }],
          { duration: 900, easing: 'cubic-bezier(.45,0,.3,1)' });
        page.remove();
      },
    },
  });
})();
```

`cut-out` animates the `translate` property (not `transform`) so it composes with the wrap's `rotate(var(--tilt))`.

- [ ] **Step 11: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS, including the offline and fx-coverage tests.

- [ ] **Step 12: Verify in the browser**

Open `index.html` directly from disk (`file://`) in Chrome and step through Act I. Expected:
- The title shows a pop-up rise with both avatar slots. Anastasia's sprite is on the right as a paper puppet on a stick, and Emily appears as a labeled silhouette until Task 6 lands.
- Each forward step plays its fx. The lead avatar hops to its x and holds its pose.
- `a1-handoff` logs `fx handoff/pattern-to-cloth is not implemented yet` (expected until Task 9) and still advances.
- DRAFT flags show on the four draft scenes, and **R** hides them.
- **N** shows notes with the act clock ticking.
- Mash → five times during `a1-act` (paper-tear). The deck lands on the last requested scene with no overlapping tears.
- Press **End**, then **1**. The deck cuts back to the Act I title in paper.
- Resize the window. The stage letterboxes and stays at 16:9.
- Open DevTools console: no errors other than the expected handoff warning.

- [ ] **Step 13: Commit**

```bash
git add index.html css js tests
git commit -m "feat: stage shell, avatars, input/notes HUD, and paper craft for Act I

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Act II content, textile craft, and the pattern-to-cloth handoff

**Files:**
- Create: `js/data/act2-textile.js`, `js/fx/textile.js`, `js/fx/handoff.js`
- Modify: `css/craft-textile.css` (replace placeholder), `index.html` (add 3 script tags), `tests/deck-content.test.js` (`ACT_FILES`), `tests/fx-coverage.test.js` (`CRAFTS_IMPLEMENTED`, `HANDOFFS_IMPLEMENTED`)

**Interfaces:**
- Consumes: `Crafts.*`, `Stitch.pixelsToStitches`, `Random.*`, fx `ctx` from Task 8.
- Produces: global `ACT2_SCENES` (17 scenes, 15.5 min) ending with `a2-handoff` (`to: 'zine'`, `fx: ['scan-to-zine']`). A `Crafts.register('handoff', …)` with `'pattern-to-cloth'` implemented, which Tasks 10–11 extend in the same file.

- [ ] **Step 1: Extend the tests so they fail**

In `tests/deck-content.test.js` set `const ACT_FILES = ['act1-paper.js', 'act2-textile.js'];`.
In `tests/fx-coverage.test.js` set `const CRAFTS_IMPLEMENTED = ['paper', 'textile'];` and `const HANDOFFS_IMPLEMENTED = ['pattern-to-cloth'];`.

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/data/act2-textile.js'`.

- [ ] **Step 2: Write `js/data/act2-textile.js`**

Before committing, check each `alt` below against the actual image (open it with Read), because some were written from file names.

```js
/* Act II — Textile — presented by Anastasia Salter. Outline: "Why keep making?" */
(function (root) {
  'use strict';
  const ACT2_SCENES = [
    {
      id: 'a2-act', act: 2, minutes: 0.5, layout: 'statement',
      heading: 'Act II: Why Keep Making?',
      text: 'Thread · community · the learn-to-code wars',
      fx: ['stitch-in'], say: "Thanks, Emily. Let's pick up the needle.",
      notes: 'Anastasia takes over. The paper pattern is now cloth: making as slow, social, embodied work.',
    },
    {
      id: 'a2-unflatten', act: 2, minutes: 0.75, layout: 'statement',
      text: 'These tools are for building something personal and expressive. Is the point to unflatten, or is the point to create?',
      fx: ['needle-pass'], avatar: { pose: 'talk', x: 60 },
      notes: 'Pose the question we keep asking ourselves: are we critiquing (unflattening) or making? Critical making says both, at once.',
    },
    {
      id: 'a2-learn-to-code', act: 2, minutes: 1, layout: 'gallery',
      text: 'The learn-to-code movement (Hour of Code, “more hack, less yack,” credential-checking in DH) drew pushback for misogyny and for ignoring histories of exclusion.',
      media: [
        { src: 'assets/act2/geek.jpg', alt: 'Cover of Toxic Geek Masculinity in Media by Anastasia Salter and Bridget Blodgett.' },
        { src: 'assets/act2/fanboy.jpg', alt: 'Image on fanboy culture and gatekeeping, from Anastasia Salter’s earlier talk.' },
      ],
      fx: ['quilt-assemble'],
      notes: 'It is toxic geek masculinity all the way down. Name the history before celebrating access.',
    },
    {
      id: 'a2-widner', act: 2, minutes: 1.25, layout: 'quote',
      text: '“Yes, make 2012 your year of code. Learn to code. Not only is it a critical skill for DH folks, but coding should also be considered a basic literacy. I have been coding since I was 10 years old, when I learned BASIC (and its GOTOs) on my Commodore 64, one of the first popular home computers. I learned to code not because I had specific problems I wanted to solve; instead, coding was (and is) fun, a way of thinking, a way of making the computer do neat things, and an entry into a fascinating and rich culture.”',
      source: 'Michael Widner, “Learn to Code; Learn Code Culture,” HASTAC (2012)',
      fx: ['stitch-in'], avatar: { pose: 'point', x: 60 },
      notes: 'The optimistic case, sincerely meant. We would be remiss not to mention the death of HASTAC here.',
    },
    {
      id: 'a2-posner', act: 2, minutes: 1.25, layout: 'quote',
      text: '“Should you choose to learn in a group setting, you will immediately be conspicuous. It might be hard to see why this is a problem; after all, everyone wants more women in programming. Surely people are glad you’re there. Well, that’s true, as far as it goes. But it also makes you extremely conscious of your mistakes, confusion, and skill level. You are there as a representative of every woman. If you mess up or need extra clarification, it’s because you really shouldn’t — you suspected this anyway — you shouldn’t be there in the first place.”',
      source: 'Miriam Posner, “Some Things to Think About Before You Exhort Everyone to Code” (2012)',
      fx: ['stitch-in'], avatar: { pose: 'point', x: 60 },
      notes: 'The same year, the response. Who gets to be a beginner in public?',
    },
    {
      id: 'a2-losh', act: 2, minutes: 1, layout: 'quote',
      text: '“Articulating a need for a feminist corrective in the digital humanities has come at a much slower pace, perhaps because the instrumentalism of a ‘tool’ seems much less blatantly anti-feminist than the instrumentalism of a gun.”',
      source: 'Elizabeth Losh, “What Can the Digital Humanities Learn from Feminist Game Studies?” DHQ 9.2 (2015)',
      fx: ['needle-pass'],
      notes: 'Tools are not neutral, just less obviously loaded.',
    },
    {
      id: 'a2-manovich', act: 2, minutes: 0.75, layout: 'statement',
      heading: 'Cultural software',
      text: 'Lev Manovich and critical code studies: understanding code is part of understanding what produces culture, and black-box platforms hide exactly that.',
      fx: ['stitch-in'],
      notes: 'The counter-argument for learning code: not credentialing, but legibility of the systems that make culture.',
    },
    {
      id: 'a2-casual-creators', act: 2, minutes: 1.25, layout: 'gallery',
      text: 'Casual creators (Compton & Mateas) and low-code tools such as Twine, Tracery, Bitsy, and p5 are remixable because they share the common languages of the web.',
      media: [
        { src: 'assets/act2/cc-twine.png', alt: 'Twine’s story editor.' },
        { src: 'assets/act2/cc-tracery.jpg', alt: 'A Tracery grammar and its generated output.' },
        { src: 'assets/act2/cc-bitsy.png', alt: 'A Bitsy game being edited.' },
        { src: 'assets/act2/cc-p5.png', alt: 'A p5.js sketch in the web editor.' },
      ],
      fx: ['quilt-assemble'], avatar: { pose: 'point', x: 60 },
      notes: 'In DH we have Omeka and Voyant. For creative work: Twine, Tracery, Bitsy, p5. Each is specialized, but they share HTML, CSS, and JS, so they can be remixed.',
    },
    {
      id: 'a2-kidpix', act: 2, minutes: 0.75, layout: 'statement',
      heading: 'Kid Pix',
      text: 'Playful tools teach that software can have a personality, and that making can be joyful.',
      url: 'http://red-green-blue.com/kid-pix-the-early-years',
      fx: ['needle-pass'], draft: true,
      notes: 'Kid Pix, the early years (red-green-blue.com). TODO: add a Kid Pix screenshot and make this an image scene.',
    },
    {
      id: 'a2-lawhead-ui', act: 2, minutes: 0.75, layout: 'statement',
      heading: 'UI as story',
      text: 'Nathalie Lawhead: interface design as a means to tell a story, convey emotion, and create personality.',
      url: 'https://www.nathalielawhead.com/candybox/on-ui-design-using-ui-as-a-means-to-tell-a-story-convey-emotion-create-personality-an-in-depth-look',
      fx: ['stitch-in'],
      notes: 'Lawhead’s in-depth essay on UI design. The interface itself is expressive material.',
    },
    {
      id: 'a2-communities', act: 2, minutes: 0.75, layout: 'image',
      text: 'These tools were built by communities.',
      media: [{ src: 'assets/act2/twining.png', alt: 'Cover of Twining: Critical and Creative Approaches to Hypertext Narratives by Anastasia Salter and Stuart Moulthrop.' }],
      fx: ['stitch-in'],
      notes: 'Twining, with Stuart Moulthrop: a book about a tool and the community that grew it.',
    },
    {
      id: 'a2-klimas', act: 2, minutes: 1.25, layout: 'quote',
      text: '“[Twine] might have been my graduate thesis, originally, if I had the patience to complete one … at the time, I had been experimenting with ways to create hypertext that were strongly code-oriented. I was studying interaction design, so Twine was my attempt to make something that would be friendly to people who were writers more than coders.”',
      source: 'Chris Klimas, interview with Anastasia Salter and Stuart Moulthrop for Twining',
      media: [{ src: 'assets/act2/twine-interface.png', alt: 'The Twine story map: passages as boxes connected by arrows.' }],
      fx: ['needle-pass'], avatar: { pose: 'point', x: 60 },
      notes: 'A tool made for writers, not coders, by a designer thinking about who gets left out.',
    },
    {
      id: 'a2-bridge', act: 2, minutes: 0.5, layout: 'statement',
      text: 'From casual creators to agents: what happens when the tool can make the tool?',
      fx: ['stitch-in'], draft: true,
      notes: 'Outline: "more things need to be fleshed out here." Bridge from community-built tools to agents. Decide whether one or two more scenes belong here.',
    },
    {
      id: 'a2-metatools', act: 2, minutes: 1, layout: 'statement',
      text: 'Agentic AI coding tools are metatools. They work best making multipurpose things that replace proprietary platforms: our Canvas alternatives, my local recording, transcript, and video tools.',
      fx: ['needle-pass'], avatar: { pose: 'talk', x: 60 }, draft: true,
      notes: 'Concrete examples from our own practice. TODO: add screenshots of the Canvas alternative and the local recording/transcript tools (gallery).',
    },
    {
      id: 'a2-accessibility', act: 2, minutes: 0.75, layout: 'statement',
      text: 'Agentic AI also has significant implications for accessibility, as an interface and not just a generator.',
      fx: ['stitch-in'], draft: true,
      notes: 'Outline flags this; expand with an example (voice-driven building, alt-text workflows, adapting interfaces).',
    },
    {
      id: 'a2-process', act: 2, minutes: 1, layout: 'image',
      heading: 'Process was the point… isn’t it still?',
      text: 'Process over product (p. 14); making restores agency (p. xiii). Agents automate the intermediate steps.',
      media: [{ src: 'assets/act2/quilting.jpg', alt: 'Hands piecing a quilt from student critical-making work.' }],
      fx: ['quilt-assemble'], avatar: { pose: 'talk', x: 60 },
      notes: 'From our book. If the intermediate steps are where learning and agency live, what do we lose when agents take them?',
    },
    {
      id: 'a2-handoff', act: 2, minutes: 1, layout: 'handoff', to: 'zine',
      heading: 'Lay the cloth on the copier',
      text: 'Back to Emily.',
      media: [{ src: 'assets/shared/fabric.jpg', alt: 'Fabric laid out for a critical-making project.' }],
      fx: ['scan-to-zine'], say: 'Make copies. Lots of copies.',
      notes: 'The cloth is scanned and becomes a photocopied zine. Emily takes Act III.',
    },
  ];
  if (typeof module === 'object' && module.exports) module.exports = ACT2_SCENES;
  else root.ACT2_SCENES = ACT2_SCENES;
})(globalThis);
```

Note that `quilt-assemble` is used on an `image` layout (`a2-process`). The effect handles both: it animates `.gallery .media`, or the single `.media` when there is no gallery.

- [ ] **Step 3: Run the content tests**

Run: `npm test`
Expected: the act 2 content tests PASS (15.5 minutes). fx-coverage still FAILS (`js/fx/textile.js` missing).

- [ ] **Step 4: Write `css/craft-textile.css`** (replace the placeholder)

```css
/* ACT II — TEXTILE: linen ground, quilt border, running stitches, cross-stitch headings */
body[data-craft="textile"] #stage { color: #2d2a4a; font-family: 'Courier Prime', 'Courier New', monospace; --thread: #7b4fb3; --thread-2: #c0544a; }
.backdrop-textile {
  background-color: #e9e0cc;
  background-image:
    repeating-linear-gradient(0deg, rgba(80, 60, 30, .07) 0 1px, transparent 1px 4px),
    repeating-linear-gradient(90deg, rgba(80, 60, 30, .07) 0 1px, transparent 1px 4px);
}
.backdrop-textile .quilt-border { position: absolute; left: 0; right: 0; height: 40px; display: flex; }
.backdrop-textile .quilt-border.top { top: 0; }
.backdrop-textile .quilt-border.bottom { bottom: 0; }
.backdrop-textile .patch { flex: 1; outline: 2px dashed rgba(255, 255, 255, .75); outline-offset: -6px; }
.backdrop-textile .patch:nth-child(4n+1) { background: repeating-linear-gradient(0deg, #c0544a 0 6px, #e98e7f 6px 12px), repeating-linear-gradient(90deg, rgba(255,255,255,.35) 0 6px, transparent 6px 12px); background-blend-mode: screen; }
.backdrop-textile .patch:nth-child(4n+2) { background: radial-gradient(#fff 2px, transparent 2.5px) 0 0 / 12px 12px, #7b4fb3; }
.backdrop-textile .patch:nth-child(4n+3) { background: repeating-linear-gradient(45deg, #3f8f8a 0 5px, #6fbab3 5px 10px); }
.backdrop-textile .patch:nth-child(4n) { background: #e2b33c; }
.backdrop-textile .spool { position: absolute; right: 36px; bottom: 60px; width: 54px; height: 78px; background: linear-gradient(#b88b55 0 12px, #7b4fb3 12px 66px, #b88b55 66px); border-radius: 6px; animation: spool-wobble 3s ease-in-out infinite alternate; }
.backdrop-textile .loose-thread { position: absolute; right: 60px; bottom: 100px; width: 420px; height: 160px; fill: none; stroke: #7b4fb3; stroke-width: 2.5; opacity: .6; }
@keyframes spool-wobble { from { transform: rotate(-4deg); } to { transform: rotate(4deg); } }

[data-craft="textile"] .card { background: #fbf6ea; border-radius: 10px; padding: 50px 58px; box-shadow: inset 0 0 18px rgba(120, 90, 50, .18), 0 6px 0 #cfc3a6, 0 14px 22px rgba(0, 0, 0, .18); }
[data-craft="textile"] .card::before { content: ''; position: absolute; inset: 14px; border: 3px dashed var(--thread); border-radius: 8px; pointer-events: none; }
[data-craft="textile"] .card.stitching::before { opacity: 0; }
[data-craft="textile"] .card.stitching > :not(.stitch-svg) { opacity: 0; }
.stitch-svg { position: absolute; inset: 0; pointer-events: none; overflow: visible; }
[data-craft="textile"] .heading-canvas { display: block; max-width: 100%; height: auto; image-rendering: pixelated; }
[data-craft="textile"] .text { font-size: 34px; }
[data-craft="textile"] .source { font-style: italic; }
[data-craft="textile"] .media img { border: 10px solid #fbf6ea; outline: 3px dashed var(--thread-2); outline-offset: -6px; box-shadow: 0 8px 14px rgba(0, 0, 0, .2); }
[data-craft="textile"] .gallery .media:nth-child(odd) img { transform: rotate(-1.5deg); }
[data-craft="textile"] .gallery .media:nth-child(even) img { transform: rotate(1.5deg); }
.needle { position: absolute; top: -20px; left: -40px; width: 120px; height: 6px; border-radius: 3px; background: linear-gradient(90deg, #888, #f4f4f4 40%, #aaa); box-shadow: 0 2px 2px rgba(0, 0, 0, .3); }
.needle::after { content: ''; position: absolute; left: 6px; top: 1px; width: 10px; height: 4px; border-radius: 2px; background: #e9e0cc; }

.avatar[data-skin="textile"] img { filter: drop-shadow(0 4px 2px rgba(0, 0, 0, .2)); }
.avatar[data-skin="textile"].walking img { animation: wobble .3s steps(2) infinite; }
@keyframes wobble { from { transform: rotate(-2deg); } to { transform: rotate(2deg); } }
[data-craft="textile"] #say { background: #fbf6ea; border: 3px dashed var(--thread-2); outline: 6px solid #fbf6ea; border-radius: 6px; font-family: 'Courier Prime', monospace; }
```

- [ ] **Step 5: Write `js/fx/textile.js`**

```js
/* ACT II — TEXTILE craft: stitched headings, running-stitch reveals, quilt assembly. */
(function () {
  'use strict';
  const { anim, el, svgEl } = Crafts;
  const THREAD = '#7b4fb3';

  function xStitch(ctx, x, y, c, p) {
    ctx.beginPath();
    ctx.moveTo(x + p, y + p); ctx.lineTo(x + c - p, y + c - p);
    ctx.moveTo(x + c - p, y + p); ctx.lineTo(x + p, y + c - p);
    ctx.stroke();
  }

  // Draws text offscreen, samples it into a stitch grid, and renders X stitches.
  // Text-only canvases are never tainted, so this works from file://.
  function stitchText(text, { size = 56, cell = 4, color = THREAD } = {}) {
    const font = `700 ${size}px "Courier Prime", "Courier New", monospace`;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = font;
    const w = Math.min(2400, Math.ceil(probe.measureText(text).width) + 8);
    const h = Math.ceil(size * 1.3);
    const src = document.createElement('canvas');
    src.width = w; src.height = h;
    const sctx = src.getContext('2d');
    sctx.font = font;
    sctx.textBaseline = 'middle';
    sctx.fillText(text, 4, h / 2);
    const { cols, rows, stitches } = Stitch.pixelsToStitches(sctx.getImageData(0, 0, w, h).data, w, h, cell, 100);
    const out = document.createElement('canvas');
    out.width = cols * cell; out.height = rows * cell;
    const ctx = out.getContext('2d');
    ctx.lineCap = 'round';
    stitches.forEach((s) => {
      const x = s.col * cell, y = s.row * cell;
      ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1.6; xStitch(ctx, x + 0.7, y + 0.7, cell, 0.6);
      ctx.strokeStyle = color; ctx.lineWidth = 1.4; xStitch(ctx, x, y, cell, 0.6);
    });
    return out;
  }

  function maskedStroke(svg, shapeAttrs, strokeAttrs, revealWidth) {
    const id = 'm' + Math.random().toString(36).slice(2);
    const mask = svgEl('mask', { id });
    const reveal = svgEl(shapeAttrs.tag, Object.assign({}, shapeAttrs.attrs, { fill: 'none', stroke: '#fff', 'stroke-width': revealWidth, pathLength: 1000, 'stroke-dasharray': 1000, 'stroke-dashoffset': 1000 }));
    mask.append(reveal);
    const thread = svgEl(shapeAttrs.tag, Object.assign({}, shapeAttrs.attrs, strokeAttrs, { fill: 'none', mask: `url(#${id})` }));
    svg.append(mask, thread);
    return reveal;
  }

  Crafts.register('textile', {
    backdrop(bg) {
      ['top', 'bottom'].forEach((pos) => {
        const row = el('div', 'quilt-border ' + pos);
        for (let i = 0; i < 16; i++) row.append(el('div', 'patch'));
        bg.append(row);
      });
      const thread = svgEl('svg', { class: 'loose-thread', viewBox: '0 0 420 160' });
      thread.append(svgEl('path', { d: 'M410 150 C 320 40, 220 170, 130 70 S 20 60, 0 10' }));
      bg.append(thread, el('div', 'spool'));
    },

    decorate(root) {
      root.querySelectorAll('.heading').forEach((h) => {
        const canvas = stitchText(h.textContent, { size: h.tagName === 'H1' ? 64 : 52 });
        canvas.className = 'heading-canvas';
        canvas.setAttribute('role', 'img');
        canvas.setAttribute('aria-label', h.textContent);
        h.classList.add('sr-only');
        h.after(canvas);
      });
    },

    fx: {
      'stitch-in': async (root) => {
        const card = root.querySelector('.card');
        if (!card || !card.children.length) return;
        card.classList.add('stitching');
        const w = card.offsetWidth, h = card.offsetHeight;
        const svg = svgEl('svg', { class: 'stitch-svg', width: w, height: h, viewBox: `0 0 ${w} ${h}` });
        const reveal = maskedStroke(svg,
          { tag: 'rect', attrs: { x: 15.5, y: 15.5, width: w - 31, height: h - 31, rx: 8 } },
          { stroke: THREAD, 'stroke-width': 3, 'stroke-dasharray': '12 8' }, 12);
        card.append(svg);
        await anim(reveal, [{ strokeDashoffset: 1000 }, { strokeDashoffset: 0 }], { duration: 1200, easing: 'ease-in-out' });
        card.classList.remove('stitching');
        const kids = [...card.children].filter((c) => c !== svg);
        await Promise.all(kids.map((k, i) => anim(k, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 120 })));
        svg.remove();
      },

      'needle-pass': async (root) => {
        const wrap = root.querySelector('.card-wrap');
        if (!wrap) return;
        const w = wrap.offsetWidth;
        const needle = el('div', 'needle');
        wrap.append(needle);
        const frames = [];
        for (let i = 0; i <= 8; i++) frames.push({ transform: `translate(${(w + 40) * i / 8}px, ${i % 2 ? 18 : -6}px) rotate(${i % 2 ? 8 : -8}deg)` });
        await anim(needle, frames, { duration: 1200, easing: 'linear' });
        needle.remove();
      },

      'quilt-assemble': async (root, { scene }) => {
        const rnd = Random.mulberry32(Random.hashString(scene.id));
        const pieces = [...root.querySelectorAll('.gallery .media')];
        const targets = pieces.length ? pieces : [...root.querySelectorAll('.media')];
        await Promise.all(targets.map((f, i) => {
          const dx = (rnd() - 0.5) * 900, dy = (rnd() - 0.5) * 500, r = (rnd() - 0.5) * 60;
          return anim(f, [
            { transform: `translate(${dx}px, ${dy}px) rotate(${r}deg)`, opacity: 0 },
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          ], { duration: 900, delay: i * 140, easing: 'cubic-bezier(.2,1.2,.3,1)' });
        }));
      },
    },
  });
})();
```

- [ ] **Step 6: Write `js/fx/handoff.js` with `pattern-to-cloth`**

```js
/* Handoffs: each act's craft is unmade into the next. Tasks 10-11 add to this file. */
(function () {
  'use strict';
  const { anim, wait, fxLayer, el, svgEl } = Crafts;

  function stitchPath(d, color, width, duration) {
    const svg = svgEl('svg', { class: 'handoff-svg', viewBox: '0 0 1280 720', width: 1280, height: 720 });
    svg.style.position = 'absolute';
    svg.style.inset = '0';
    const id = 'h' + Math.random().toString(36).slice(2);
    const mask = svgEl('mask', { id });
    const reveal = svgEl('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 28, pathLength: 1000, 'stroke-dasharray': 1000, 'stroke-dashoffset': 1000 });
    mask.append(reveal);
    svg.append(mask, svgEl('path', { d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-dasharray': '18 12', 'stroke-linecap': 'round', mask: `url(#${id})` }));
    fxLayer().append(svg);
    return anim(reveal, [{ strokeDashoffset: 1000 }, { strokeDashoffset: 0 }], { duration, easing: 'ease-in-out' });
  }

  async function swapBackdrop(ctx, craft) {
    const bg = ctx.stage.backdrop;
    await anim(bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'none' });
    bg.style.opacity = '0';
    ctx.setCraft(craft);
    ctx.Avatar.setSkin(ctx.lead, ctx.act.craft); // outgoing presenter keeps the old craft as they leave
    bg.style.opacity = '';
    await anim(bg, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'none' });
  }

  Crafts.register('handoff', {
    fx: {
      'pattern-to-cloth': async (root, ctx) => {
        const fig = root.querySelector('.media');
        if (fig) await anim(fig, [{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(1.18) rotate(-3deg)' }], { duration: 800 });
        await stitchPath('M -20 610 C 220 430, 380 700, 640 520 S 1040 300, 1300 430', '#7b4fb3', 6, 1600);
        await swapBackdrop(ctx, 'textile');
        await ctx.Avatar.walkTo(ctx.lead, -200);
        ctx.Avatar.hide(ctx.lead);
      },
    },
  });
})();
```

- [ ] **Step 7: Add the scripts to `index.html`**

After `<script src="js/data/act1-paper.js"></script>` add:
```html
  <script src="js/data/act2-textile.js"></script>
```
After `<script src="js/fx/paper.js"></script>` add:
```html
  <script src="js/fx/textile.js"></script>
  <script src="js/fx/handoff.js"></script>
```

- [ ] **Step 8: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS (the deck-content tests for acts 1–2, fx coverage for paper and textile, and the pattern-to-cloth handoff).

- [ ] **Step 9: Verify in the browser**

Open `index.html?scene=a1-metatools` and step forward. Expected:
- The handoff enlarges the cover and draws a purple running stitch across the stage.
- Paper crossfades to linen with quilt borders. Emily (paper skin) walks off left while Anastasia appears in cross-stitch on the right.
- `a2-act` shows a cross-stitched heading that stitches in.
- On `a2-casual-creators`, the four patches fly in.
- On `a2-widner`, the long quote fits inside its card without clipping words.
- Press **2** from Act I. The deck cuts to `a2-act` in textile with no paper remnants.

- [ ] **Step 10: Commit**

```bash
git add js/data/act2-textile.js js/fx/textile.js js/fx/handoff.js css/craft-textile.css index.html tests
git commit -m "feat: Act II textile craft, content, and pattern-to-cloth handoff

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Act III content, e-zine craft, and the scan-to-zine handoff

**Files:**
- Create: `js/data/act3-zine.js`, `js/fx/zine.js`
- Modify: `css/craft-zine.css` (replace placeholder), `js/fx/handoff.js` (add `'scan-to-zine'`), `index.html` (2 script tags), `tests/deck-content.test.js`, `tests/fx-coverage.test.js`

**Interfaces:**
- Consumes: `CraftShapes.ransomLetters`, `Crafts.*`, `stitchPath`/`swapBackdrop` inside `handoff.js`.
- Produces: global `ACT3_SCENES` (14 scenes, 15.25 min) ending with `a3-handoff` (`to: 'game'`, `fx: ['zine-to-pixels']`), plus the `'scan-to-zine'` handoff.

- [ ] **Step 1: Extend the tests so they fail**

Set `ACT_FILES = ['act1-paper.js', 'act2-textile.js', 'act3-zine.js']`, `CRAFTS_IMPLEMENTED = ['paper', 'textile', 'zine']`, `HANDOFFS_IMPLEMENTED = ['pattern-to-cloth', 'scan-to-zine']`.

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/data/act3-zine.js'`.

- [ ] **Step 2: Write `js/data/act3-zine.js`**

```js
/* Act III — E-zine — presented by Emily K. Johnson. Outline: "who owns what we make?" */
(function (root) {
  'use strict';
  const ACT3_SCENES = [
    {
      id: 'a3-flash-dead', act: 3, minutes: 0.75, layout: 'statement',
      heading: 'Flash is dead.',
      text: 'So is Twine pointless now? If an agent can make the thing, who owns what gets made?',
      fx: ['xerox-scan'], say: 'Fresh off the copier.',
      notes: 'Emily returns. The transition from the outline: Flash is dead; is Twine pointless now? Into ownership.',
    },
    {
      id: 'a3-act', act: 3, minutes: 0.5, layout: 'statement',
      heading: 'Act III: Who Owns What We Make?',
      text: 'Walled gardens · preservation · maintenance',
      fx: ['ransom-shuffle'],
      notes: 'Section title. Zines are the original answer to "who owns": copy it, staple it, hand it on.',
    },
    {
      id: 'a3-walled', act: 3, minutes: 1, layout: 'image',
      text: 'Previous platforms in this space suffered from walled gardens. RIP Flash, and all the dead works on the App Store.',
      media: [{ src: 'assets/act3/flash.jpg', alt: 'Cover of Flash: Building the Interactive Web by Anastasia Salter and John Murray.' }],
      fx: ['sticker-slap'], avatar: { pose: 'point', x: 60 },
      notes: 'Anastasia and John Murray’s Flash book. Corporate walled gardens and the works lost with them.',
    },
    {
      id: 'a3-lawhead', act: 3, minutes: 1.5, layout: 'quote',
      text: '“I feel like there’s a lot to learn from Flash. As an example of what technology enables for ‘the little people’, as an example of what it takes to destroy that and basically eradicate a huge portion of digital history, and as an example of how easy it is for something like that to just happen. If you look at it through the lens of digital history, it’s a good example of how easy it is for something that was really powerful and popular to be lost without much of a trace of what it once was.”',
      source: 'Nathalie Lawhead, “A Short History of Flash”',
      url: 'https://www.nathalielawhead.com/candybox/a-short-history-of-flash-the-forgotten-flash-website-movement-when-websites-were-the-new-emerging-artform',
      media: [{ src: 'assets/act3/lawhead-flash.png', alt: 'Nathalie Lawhead’s essay on the forgotten Flash website movement.' }],
      fx: ['misregister'], avatar: { pose: 'point', x: 60 },
      notes: 'Read the quote. "The little people": who technology empowers, and how fast it can be erased.',
    },
    {
      id: 'a3-preservation', act: 3, minutes: 1.25, layout: 'gallery',
      text: 'Flash preservation reminds us to support open data while communities build new walls, and warns against over-investing in proprietary systems that hide their source.',
      media: [
        { src: 'assets/act3/flash-preservation-1.jpg', alt: 'A Flash-era interactive work, preserved.' },
        { src: 'assets/act3/flash-preservation-2.png', alt: 'A Flash-era web artwork running in an emulator.' },
      ],
      fx: ['sticker-slap'],
      notes: 'Especially systems that compile and hide their source code. Agents are, in a sense, the ultimate compiled black box.',
    },
    {
      id: 'a3-libgen', act: 3, minutes: 1, layout: 'image',
      text: 'Meanwhile, something is reading everything we make.',
      media: [{ src: 'assets/act3/libgen.png', alt: 'Search results from The Atlantic’s LibGen lookup tool, showing books used to train AI models.' }],
      fx: ['xerox-scan'], draft: true,
      notes: 'From the Author Function talk: Books3, LibGen, and The Atlantic’s search tool. Decide whether this belongs here or in Act I.',
    },
    {
      id: 'a3-perlow', act: 3, minutes: 1.5, layout: 'quote',
      text: '“I close by addressing one area where responses to large AI models have been surprisingly reactionary—that of intellectual property. Objections to large AI models on copyright grounds amount to a dramatic reversal of attitudes among the American left, what Kirschenbaum and Raley call a ‘new copyright fundamentalism.’ Two decades ago, many people now urging copyright infringement claims against AI firms were deriding Metallica and the RIAA for their lawsuits against Napster and its successors. Back then, piracy was cool; we called it ‘sharing.’”',
      source: 'Seth Perlow, “Generative Theories, Pretrained Responses: Large AI Models and the Humanities”',
      fx: ['misregister'], avatar: { pose: 'talk', x: 60 },
      notes: 'A provocation we take seriously without fully endorsing. Zines were built on sharing.',
    },
    {
      id: 'a3-gardens', act: 3, minutes: 1, layout: 'statement',
      text: 'Beyond copyright and credit: the tension between making things in other people’s walled gardens and planting an entirely new garden.',
      fx: ['ransom-shuffle'],
      notes: 'Authorship versus ownership. The question is not only who gets paid, but where the thing can live.',
    },
    {
      id: 'a3-elon', act: 3, minutes: 1.25, layout: 'video',
      heading: 'You Are Elon Musk',
      source: 'direkris, itch.io',
      url: 'https://direkris.itch.io/elon',
      media: [{ src: 'assets/act3/you-are-elon-musk.mp4', alt: 'Screen recording of the interactive fiction You Are Elon Musk by direkris.' }],
      fx: ['sticker-slap'],
      notes: 'Click the video to play (it does not autoplay; click does not advance). The open web at its best: a sharp, small, self-published game.',
    },
    {
      id: 'a3-nudification', act: 3, minutes: 1, layout: 'statement',
      text: 'If Twine is the best of open source, the nudification and deepfake tools that pre-date Musk’s iterations are the worst.',
      source: 'Reuters, “US appeals court blocks Minnesota’s AI nudification law” (Oct. 2, 2026)',
      url: 'https://www.reuters.com/world/us-appeals-court-blocks-minnesotas-ai-nudification-law-now-xai-lawsuit-2026-10-02/',
      fx: ['xerox-scan'], draft: true,
      notes: 'Openness cuts both ways. TODO: add the Reuters article header screenshot and make this an image scene.',
    },
    {
      id: 'a3-tracery', act: 3, minutes: 1, layout: 'image',
      heading: 'Maintenance is resistance',
      text: 'Community: the people who keep the tools running.',
      media: [{ src: 'assets/act3/tracery.png', alt: 'Tracery, Kate Compton’s generative grammar tool, expanding rules into text.' }],
      fx: ['xerox-scan'],
      notes: 'Kate Compton’s Tracery, and the people who kept it alive.',
    },
    {
      id: 'a3-cbdq', act: 3, minutes: 1.5, layout: 'gallery',
      text: 'The community rebuilt Tracery bots after Twitter broke them (p. 244): Cheap Bots, Done Quick! → Toot Sweet! → Blue Bots, Done Quick!',
      media: [
        { src: 'assets/act3/cbdq.jpg', alt: 'Cheap Bots, Done Quick! by v buckenham, with its April 2023 closure notice after Twitter ended API access.' },
        { src: 'assets/act3/cbts.jpg', alt: 'Cheap Bots, Toot Sweet!, the Mastodon successor using the same Tracery syntax.' },
        { src: 'assets/act3/bbdq.jpg', alt: 'Blue Bots, Done Quick! by Olaf Moriarty Solstrand, for Bluesky.' },
        { src: 'assets/act3/flores-workshop.jpg', alt: 'Leonardo Flores’s Bluesky Bot Workshop document.' },
      ],
      fx: ['sticker-slap'], avatar: { pose: 'point', x: 60 },
      notes: 'v buckenham, boodooperson, Olaf Moriarty Solstrand, and Leonardo Flores’s workshop. Each time the platform broke, the community rebuilt.',
    },
    {
      id: 'a3-inspect', act: 3, minutes: 1, layout: 'statement',
      text: 'We need shared patterns for inspecting agents, not just ban policies.',
      fx: ['ransom-shuffle'], avatar: { pose: 'talk', x: 60 },
      notes: 'The constructive turn, which Act IV makes concrete.',
    },
    {
      id: 'a3-handoff', act: 3, minutes: 1, layout: 'handoff', to: 'game',
      heading: 'Insert coin',
      text: 'Over to Anastasia.',
      fx: ['zine-to-pixels'], say: 'Player two, press start.',
      notes: 'The zine page breaks into pixels and becomes a game room. Anastasia takes Act IV.',
    },
  ];
  if (typeof module === 'object' && module.exports) module.exports = ACT3_SCENES;
  else root.ACT3_SCENES = ACT3_SCENES;
})(globalThis);
```

- [ ] **Step 3: Write `css/craft-zine.css`** (replace the placeholder)

```css
/* ACT III — E-ZINE: photocopied collage on a Web 1.0 tiled ground, marquee, hit counter */
body[data-craft="zine"] #stage { color: #111; font-family: 'Special Elite', 'Courier New', monospace; }
.backdrop-zine { background: #141414 radial-gradient(#ff4fb8 1px, transparent 1.6px) 0 0 / 26px 26px; animation: stars 30s linear infinite; }
.backdrop-zine::before { content: ''; position: absolute; inset: 0; background: radial-gradient(#22e0ff 1px, transparent 1.6px) 13px 13px / 26px 26px; opacity: .7; }
@keyframes stars { to { background-position: 260px 520px; } }
.backdrop-zine .page {
  position: absolute; inset: 56px 40px 26px; transform: rotate(-.6deg);
  background-color: #f4f1e8;
  background-image: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='300' height='300'><filter id='t'><feTurbulence type='fractalNoise' baseFrequency='1.4' numOctaves='1'/><feColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 -9 4.2'/></filter><rect width='100%' height='100%' filter='url(%23t)' opacity='.35'/></svg>"), linear-gradient(90deg, transparent 49.6%, rgba(0, 0, 0, .08) 50%, transparent 50.4%);
  box-shadow: 8px 10px 0 #000;
}
.backdrop-zine .staple { position: absolute; left: 50%; width: 30px; height: 5px; margin-left: -15px; background: linear-gradient(#bbb, #777); border-radius: 2px; }
.backdrop-zine .staple.s1 { top: 110px; } .backdrop-zine .staple.s2 { bottom: 70px; }
.backdrop-zine .ticker { position: absolute; top: 0; left: 0; right: 0; height: 42px; overflow: hidden; background: #000; color: #9dff00; font: 30px/42px 'VT323', monospace; white-space: nowrap; }
.backdrop-zine .ticker span { display: inline-block; padding-left: 100%; animation: marquee 22s linear infinite; }
@keyframes marquee { to { transform: translateX(-100%); } }
.backdrop-zine .counter { position: absolute; right: 54px; bottom: 34px; padding: 2px 8px; background: #000; color: #ff4fb8; font: 24px/1 'VT323', monospace; letter-spacing: 2px; }

[data-craft="zine"] .scene { padding-top: 84px; }
[data-craft="zine"] .card-wrap { transform: rotate(var(--tilt, 0deg)); }
[data-craft="zine"] .card { background: #fff; border: 3px solid #111; box-shadow: 6px 6px 0 #111; padding: 32px 40px; }
[data-craft="zine"] .text { font-size: 32px; }
[data-craft="zine"] .source { font-family: 'VT323', monospace; font-size: 22px; }
[data-craft="zine"] .source::before { content: '>> '; color: #ff4fb8; }
[data-craft="zine"] .media { position: relative; transform: rotate(var(--tilt, 0deg)); }
[data-craft="zine"] .media img { filter: grayscale(1) contrast(1.7) brightness(1.08); border: 3px solid #111; background: #fff; }
[data-craft="zine"] .media::after { content: ''; position: absolute; inset: 0; pointer-events: none; background: radial-gradient(circle, rgba(0, 0, 0, .4) 1px, transparent 1.6px) 0 0 / 5px 5px; mix-blend-mode: multiply; }
[data-craft="zine"] .media:has(video)::after { display: none; }
[data-craft="zine"] .media video { border: 3px solid #111; box-shadow: 6px 6px 0 #ff4fb8; }

.ransom { display: flex; flex-wrap: wrap; gap: 4px 2px; align-items: center; }
.ransom span { display: inline-block; padding: 2px 6px; font-size: .9em; transform: rotate(var(--r)) scale(var(--s)); }
.ransom .space { width: 16px; padding: 0; }
.r-mono { font-family: 'Rubik Mono One', sans-serif; } .r-type { font-family: 'Special Elite', monospace; }
.r-hand { font-family: 'Patrick Hand', cursive; } .r-pixel { font-family: 'VT323', monospace; font-size: 1.2em !important; }
.r-serif { font-family: Georgia, 'Times New Roman', serif; font-weight: 700; } .r-courier { font-family: 'Courier Prime', monospace; font-weight: 700; }
.k-paper { background: #fff; color: #111; box-shadow: 1px 1px 0 #111; } .k-ink { background: #111; color: #fff; }
.k-yellow { background: #f4e04d; color: #111; } .k-pink { background: #ff4fb8; color: #fff; } .k-lime { background: #b6ff3b; color: #111; }
.scan-bar { position: absolute; left: 0; right: 0; top: 0; height: 46px; background: linear-gradient(transparent, rgba(190, 255, 200, .85), #fff, rgba(190, 255, 200, .85), transparent); box-shadow: 0 0 50px 14px rgba(180, 255, 200, .55); mix-blend-mode: screen; }

.avatar[data-skin="zine"] { animation: xerox-jitter .5s steps(2) infinite; }
.avatar[data-skin="zine"] img { image-rendering: auto; filter: grayscale(1) contrast(2) brightness(1.1) drop-shadow(4px 0 0 #fff) drop-shadow(-4px 0 0 #fff) drop-shadow(0 4px 0 #fff) drop-shadow(0 -4px 0 #fff) drop-shadow(5px 5px 0 #ff4fb8); }
@keyframes xerox-jitter { from { transform: translate(0, 0) rotate(-1deg); } to { transform: translate(1px, -1px) rotate(1deg); } }
[data-craft="zine"] #say { background: #fff; border: 3px solid #111; box-shadow: 5px 5px 0 #ff4fb8; font-family: 'Special Elite', monospace; }
```

- [ ] **Step 4: Write `js/fx/zine.js`**

```js
/* ACT III — E-ZINE craft: ransom headings, xerox scans, sticker slaps, misregistration. */
(function () {
  'use strict';
  const { anim, fxLayer, el } = Crafts;
  const TICKER = '*** WHO OWNS WHAT WE MAKE? *** VIEW SOURCE *** COPY THIS ZINE *** NO LOGIN REQUIRED *** BEST VIEWED WITH YOUR OWN EYES *** ';
  const ZINE_FILTER = 'grayscale(1) contrast(1.7) brightness(1.08)';

  Crafts.register('zine', {
    backdrop(bg) {
      bg.append(el('div', 'page'), el('div', 'staple s1'), el('div', 'staple s2'));
      const ticker = el('div', 'ticker');
      ticker.append(el('span', '', TICKER.repeat(3)));
      bg.append(ticker, el('div', 'counter', 'VISITORS: 000000'));
    },

    decorate(root, scene) {
      const seed = Random.hashString(scene.id);
      const rnd = Random.mulberry32(seed);
      root.querySelectorAll('.heading').forEach((h) => {
        const label = h.textContent;
        const box = el('span', 'ransom');
        box.setAttribute('aria-hidden', 'true');
        CraftShapes.ransomLetters(label, seed).forEach((l) => {
          const s = el('span', l.space ? 'space' : `${l.font} k-${l.skin}`, l.ch);
          if (!l.space) { s.style.setProperty('--r', l.rotate + 'deg'); s.style.setProperty('--s', l.scale); }
          box.append(s);
        });
        h.setAttribute('aria-label', label);
        h.replaceChildren(box);
      });
      const wrap = root.querySelector('.card-wrap');
      if (wrap) wrap.style.setProperty('--tilt', ((rnd() - 0.5) * 3).toFixed(2) + 'deg');
      root.querySelectorAll('.media').forEach((m) => m.style.setProperty('--tilt', ((rnd() - 0.5) * 5).toFixed(2) + 'deg'));
      const counter = document.querySelector('.backdrop-zine .counter');
      if (counter) counter.textContent = 'VISITORS: ' + String(seed % 1000000).padStart(6, '0');
    },

    fx: {
      'xerox-scan': async (root) => {
        const bar = el('div', 'scan-bar');
        fxLayer().append(bar);
        await Promise.all([
          anim(bar, [{ transform: 'translateY(-50px)' }, { transform: 'translateY(740px)' }], { duration: 1100, easing: 'linear' }),
          anim(root, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 1100, easing: 'linear' }),
        ]);
        bar.remove();
      },

      'ransom-shuffle': async (root, { scene }) => {
        const rnd = Random.mulberry32(Random.hashString(scene.id) + 1);
        const letters = [...root.querySelectorAll('.ransom span:not(.space)')];
        await Promise.all(letters.map((s, i) => anim(s, [
          { translate: `0 ${-260 - rnd() * 200}px`, rotate: `${(rnd() - 0.5) * 180}deg`, opacity: 0 },
          { translate: '0 0', rotate: '0deg', opacity: 1 },
        ], { duration: 520, delay: i * 35, easing: 'cubic-bezier(.3,1.4,.5,1)' })));
      },

      'sticker-slap': async (root) => {
        const items = [...root.querySelectorAll('.card-wrap, .media')];
        for (const [i, it] of items.entries()) {
          anim(it, [
            { scale: 1.5, rotate: '-10deg', opacity: 0 },
            { scale: 0.96, rotate: '1deg', opacity: 1, offset: 0.7 },
            { scale: 1, rotate: '0deg', opacity: 1 },
          ], { duration: 450, delay: i * 140, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
        }
        await Crafts.wait(450 + items.length * 140);
      },

      'misregister': async (root) => {
        const targets = [...root.querySelectorAll('.media img, .heading, blockquote')];
        await Promise.all(targets.map((t) => {
          const base = t.tagName === 'IMG' ? ZINE_FILTER + ' ' : '';
          return anim(t, [
            { filter: `${base}drop-shadow(7px 0 0 #ff2bd6) drop-shadow(-7px 0 0 #22e0ff)` },
            { filter: `${base}drop-shadow(-3px 2px 0 #ff2bd6) drop-shadow(3px -2px 0 #22e0ff)` },
            { filter: `${base}drop-shadow(2px -1px 0 #ff2bd6) drop-shadow(-2px 1px 0 #22e0ff)` },
            { filter: `${base}drop-shadow(0 0 0 #ff2bd6) drop-shadow(0 0 0 #22e0ff)` },
          ], { duration: 900, easing: 'steps(4)', fill: 'none' });
        }));
      },
    },
  });
})();
```

`ransom-shuffle` and `sticker-slap` animate the individual `translate`/`rotate`/`scale` properties so they compose with the CSS `transform` that sets each letter's or card's resting tilt.

- [ ] **Step 5: Add `'scan-to-zine'` to `js/fx/handoff.js`**

Inside the `fx: { … }` object, after `'pattern-to-cloth'`:
```js
      'scan-to-zine': async (root, ctx) => {
        const bar = el('div', 'scan-bar');
        bar.style.height = '70px';
        fxLayer().append(bar);
        const sweep = anim(bar, [{ transform: 'translateY(-80px)' }, { transform: 'translateY(760px)' }], { duration: 1800, easing: 'linear' });
        await wait(900);
        await swapBackdrop(ctx, 'zine');
        await sweep;
        bar.remove();
        await ctx.Avatar.walkTo(ctx.lead, -200);
        ctx.Avatar.hide(ctx.lead);
      },
```
The `.scan-bar` style lives in `craft-zine.css`, which is loaded on every page, so it renders correctly before the craft switches.

- [ ] **Step 6: Add the scripts to `index.html`**

After the act2 data script add `<script src="js/data/act3-zine.js"></script>`. After `textile.js` add `<script src="js/fx/zine.js"></script>`. Keep `handoff.js` last among the fx scripts.

- [ ] **Step 7: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS.

- [ ] **Step 8: Verify in the browser**

Open `index.html?scene=a2-process` and step forward. Expected:
- The scan bar sweeps, linen becomes the starfield, a photocopied page appears with staples, and a green marquee ticker scrolls.
- Anastasia (stitched) walks off. Emily appears in the photocopied-sticker skin.
- `a3-act` letters drop in as a ransom note.
- `a3-lawhead` misregisters pink/cyan, then settles grayscale.
- On `a3-elon`, clicking the video plays it and does **not** advance. Pressing → advances.
- `a3-perlow` (the longest quote) fits, with type no smaller than 18px.
- On `a3-cbdq`, all four screenshots are legible.

- [ ] **Step 9: Commit**

```bash
git add js/data/act3-zine.js js/fx/zine.js js/fx/handoff.js css/craft-zine.css index.html tests
git commit -m "feat: Act III e-zine craft, content, and scan-to-zine handoff

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Act IV content, indie-game craft, zine-to-pixels handoff, and credits

**Files:**
- Create: `js/data/act4-game.js`, `js/fx/game.js`
- Modify: `css/craft-game.css` (replace placeholder), `js/fx/handoff.js` (add `'zine-to-pixels'`), `index.html`, `tests/deck-content.test.js`, `tests/fx-coverage.test.js`

**Interfaces:**
- Consumes: `Random.shuffledOrder`, `Crafts.*`, `Stage.say` (types out text in the game craft), and `Nav` reveal steps for `choice` scenes.
- Produces: global `ACT4_SCENES` (16 scenes, 15.25 min) ending with `a4-credits`. After this task the full deck builds with zero errors.

- [ ] **Step 1: Extend the tests so they fail**

Set `ACT_FILES` to all four files, `CRAFTS_IMPLEMENTED = ['paper', 'textile', 'zine', 'game']`, and `HANDOFFS_IMPLEMENTED = ['pattern-to-cloth', 'scan-to-zine', 'zine-to-pixels']`.

Run: `npm test`
Expected: FAIL with `Cannot find module '../js/data/act4-game.js'`.

- [ ] **Step 2: Write `js/data/act4-game.js`**

```js
/* Act IV — Indie game — presented by Anastasia Salter. Outline: "is there human agency in agentic AI?" */
(function (root) {
  'use strict';
  const ACT4_SCENES = [
    {
      id: 'a4-act', act: 4, minutes: 0.5, layout: 'statement', room: 'workshop', agency: 1,
      heading: 'Act IV: Is There Human Agency in Agentic AI?',
      text: 'Material · tools · time · steps',
      fx: ['iris-in'], say: 'You wake up in a workshop. There is an agent here.',
      notes: 'Anastasia returns. A game act, because games are where we think about agency most directly.',
    },
    {
      id: 'a4-eliza', act: 4, minutes: 0.75, layout: 'image', room: 'office', agency: 1,
      text: 'Talking machines aren’t new: ELIZA, 1966.',
      media: [{ src: 'assets/act4/eliza.png', alt: 'E.L.I.Z.A. Talking: a browser recreation of Joseph Weizenbaum’s 1966 chatbot on a VT100-style terminal.' }],
      fx: ['pixel-dissolve'], draft: true,
      notes: 'Not in the outline yet, but the image is in the repo. The ELIZA effect: we read agency into pattern-matching.',
    },
    {
      id: 'a4-racter', act: 4, minutes: 0.75, layout: 'image', room: 'office', agency: 1,
      text: 'Neither is machine authorship: Racter and William Chamberlain, 1984.',
      media: [{ src: 'assets/act4/racter-chamberlain.png', alt: 'Spread from The Policeman’s Beard Is Half Constructed: computer-generated limericks labeled “Work of stupefying genius,” beside an engraving of a man clutching his head.' }],
      fx: ['pixel-dissolve'], draft: true,
      notes: 'Confirm the source of this spread before presenting. Human authors were always behind the "machine" author.',
    },
    {
      id: 'a4-triad', act: 4, minutes: 1.25, layout: 'statement', room: 'workshop', agency: 1,
      heading: 'Material, tools, time… and steps',
      text: 'Nowviskie’s triad (pp. 11–12), plus a fourth loss: control over the steps and decisions themselves, sold as convenience.',
      fx: ['pixel-dissolve'], avatar: { pose: 'talk', x: 60 },
      notes: 'Bethany Nowviskie’s triad as we use it in the book. Agents add a fourth thing we can lose.',
    },
    {
      id: 'a4-contribution', act: 4, minutes: 1.25, layout: 'statement', room: 'workshop', agency: 0,
      text: 'If my agent does all the work to create a website, a Tracery bot, a 3D print file, where is the human contribution? When does lowering barriers remove the point of making?',
      fx: ['iris-in'], avatar: { pose: 'point', x: 60 },
      notes: 'The honest worry. Watch the agency meter hit zero.',
    },
    {
      id: 'a4-pun', act: 4, minutes: 1, layout: 'statement', room: 'workshop', agency: 0,
      heading: 'The pun is the argument',
      text: 'Making restores human agency. Agentic AI transfers it to the system.',
      fx: ['pixel-dissolve'],
      notes: 'The title’s pun: agency, and agentic.',
    },
    {
      id: 'a4-unmake', act: 4, minutes: 1.25, layout: 'choice', room: 'office', agency: 2,
      heading: 'Can we unmake the agent?',
      text: 'A critical maker… (p. 10)',
      choices: ['Reject the tool', 'Supplement the tool', 'Extend the tool', 'Critique the tool'],
      fx: ['choice-menu'], avatar: { pose: 'point', x: 60 },
      notes: 'Each press reveals one option, like a dialogue menu. From the book: a critical maker rejects, supplements, extends, and critiques the tool. All four, not one.',
    },
    {
      id: 'a4-ask', act: 4, minutes: 1.5, layout: 'choice', room: 'office', agency: 3,
      heading: 'Ask of any agent:',
      choices: ['What did it plan?', 'Which tools did it call?', 'Which sources did it choose?', 'What did it skip?', 'Where would a human have chosen differently?'],
      fx: ['choice-menu'], avatar: { pose: 'point', x: 60 },
      notes: 'The inspection pattern from Act III, made concrete. These questions work for students, for reviewers, and for us. Reveal one per press.',
    },
    {
      id: 'a4-defaults', act: 4, minutes: 1, layout: 'gallery', room: 'commons', agency: 2,
      heading: 'Whose defaults?',
      text: 'Ask an image model for a “professor of digital culture” and see who it imagines. We built our guides by hand.',
      media: [
        { src: 'assets/act4/mj-professor.png', alt: 'Image-model results for “woman professor of digital culture” and “professor of digital culture”: rows of similar glasses-wearing faces.' },
        { src: 'assets/act4/mj-beautiful-woman.png', alt: 'Image-model results for “beautiful woman”: four near-identical faces.' },
      ],
      fx: ['pixel-dissolve'], draft: true,
      notes: 'Ties the avatars to the argument: we made these sprites deliberately, with reference and consent, instead of accepting a model’s defaults.',
    },
    {
      id: 'a4-stanford', act: 4, minutes: 0.75, layout: 'image', room: 'commons', agency: 1,
      text: 'Defaults become policy: Stanford R&DE used AI to race-swap students in its advertising.',
      media: [{ src: 'assets/act4/stanford-race-swap.png', alt: 'News article: Stanford R&DE uses AI to race swap students for advertising, with before and after photos.' }],
      fx: ['iris-in'], draft: true,
      notes: 'Stanford Daily, Sept. 21, 2026. Confirm the citation.',
    },
    {
      id: 'a4-political', act: 4, minutes: 1, layout: 'statement', room: 'commons', agency: 2,
      text: 'Our book is intentionally political, written in a state where humanities work was cast as a “public threat” (p. xiv; pp. 231–232).',
      fx: ['pixel-dissolve'], avatar: { pose: 'talk', x: 60 },
      notes: 'Florida context. Making is never neutral, and neither is teaching it.',
    },
    {
      id: 'a4-superintelligence', act: 4, minutes: 0.75, layout: 'image', room: 'commons', agency: 1,
      text: '“Super Intelligence” by executive order.',
      media: [{ src: 'assets/act4/superintelligence.png', alt: 'Bluesky posts reporting an executive order requiring federal agencies to say “Super Intelligence” instead of “Artificial Intelligence.”' }],
      fx: ['iris-in'], draft: true,
      notes: 'Language as policy. Verify the order and its date before presenting.',
    },
    {
      id: 'a4-unmake-politics', act: 4, minutes: 0.75, layout: 'statement', room: 'commons', agency: 3,
      text: 'Maybe today’s politics is what we are trying to unmake.',
      fx: ['iris-in'], avatar: { pose: 'talk', x: 60 },
      notes: 'Pause here.',
    },
    {
      id: 'a4-classroom', act: 4, minutes: 1, layout: 'statement', room: 'commons', agency: 4,
      text: 'In DH classrooms, we can empower students to use agentic AI for research, critical making, and digital communication, without an alienating approach to programming education.',
      fx: ['pixel-dissolve'], avatar: { pose: 'point', x: 60 },
      notes: 'The opportunity.',
    },
    {
      id: 'a4-responsibility', act: 4, minutes: 1, layout: 'statement', room: 'commons', agency: 5,
      text: 'We also have the responsibility to give students a critical lens on these tools, with pathways to greater control, never losing sight of community or their own expertise.',
      fx: ['pixel-dissolve'], avatar: { pose: 'talk', x: 60 },
      notes: 'The responsibility. The agency meter is full: that is the goal.',
    },
    {
      id: 'a4-credits', act: 4, minutes: 0.75, layout: 'credits', room: 'commons', agency: 5,
      lines: [
        'CRITICAL (UN)MAKING AND THE AGENTIC HUMANITIES',
        'Act I · Paper: Emily K. Johnson',
        'Act II · Thread: Anastasia Salter',
        'Act III · Zine: Emily K. Johnson',
        'Act IV · Game: Anastasia Salter',
        'From our book Critical Making in the Age of AI',
        'Deck built with an agent from our outline, then unmade by hand',
        'THANK YOU FOR PLAYING',
      ],
      fx: ['iris-in'], say: 'Thanks for playing. Questions?',
      notes: 'Both of us on stage for Q&A. Leave this up.',
    },
  ];
  if (typeof module === 'object' && module.exports) module.exports = ACT4_SCENES;
  else root.ACT4_SCENES = ACT4_SCENES;
})(globalThis);
```

- [ ] **Step 3: Write `css/craft-game.css`** (replace the placeholder)

```css
/* ACT IV — INDIE GAME: pixel rooms, HUD bar with agency meter, dialogue box, choice menus */
body[data-craft="game"] #stage { color: #f2f2f2; font-family: 'VT323', monospace; }
.backdrop-game { background: #1c1430; image-rendering: pixelated; }
.backdrop-game .hudbar { position: absolute; top: 0; left: 0; right: 0; height: 40px; display: flex; justify-content: space-between; align-items: center; padding: 0 18px; background: #000; color: #fff; font: 14px/1 'Press Start 2P', monospace; z-index: 1; }
.backdrop-game .agency { color: #9dff00; letter-spacing: 2px; }
.backdrop-game .wall { position: absolute; left: 0; right: 0; top: 40px; bottom: 150px; }
.backdrop-game .floor { position: absolute; left: 0; right: 0; bottom: 0; height: 150px; border-top: 6px solid #22160e; }
.backdrop-game .prop { position: absolute; }
.room-workshop .wall { background: linear-gradient(#6b4a2e 0 72%, #553a24 72% 76%, #6b4a2e 76%); }
.room-workshop .floor { background: repeating-conic-gradient(#3a2a1e 0 25%, #4a3626 0 50%) 0 0 / 48px 48px; }
.room-workshop .prop { right: 90px; bottom: 150px; width: 260px; height: 90px; background: #8a5a32; box-shadow: inset 0 -12px 0 #5a3a20, -40px -60px 0 -30px #c0c0c0, 20px -70px 0 -32px #e2b33c; }
.room-office .wall { background: linear-gradient(#2e3a5a 0 72%, #26304a 72%); }
.room-office .floor { background: repeating-conic-gradient(#3b3b4f 0 25%, #45455c 0 50%) 0 0 / 48px 48px; }
.room-office .prop { right: 80px; top: 90px; width: 200px; height: 140px; background: #0d2a1a; border: 10px solid #9a9a9a; box-shadow: 0 0 40px #3cff8a55, inset 0 0 30px #3cff8a66; animation: crt 2s steps(2) infinite; }
@keyframes crt { 50% { box-shadow: 0 0 46px #3cff8a77, inset 0 0 36px #3cff8a88; } }
.room-commons .wall { background: linear-gradient(#7fb0d8 0 62%, #5f8f4a 62%); }
.room-commons .floor { background: repeating-conic-gradient(#4f7d3a 0 25%, #5a8a42 0 50%) 0 0 / 48px 48px; }
.room-commons .prop { right: 70px; bottom: 150px; width: 140px; height: 220px; background: #2f5a2a; clip-path: polygon(50% 0, 70% 20%, 62% 20%, 85% 45%, 72% 45%, 100% 75%, 58% 75%, 58% 100%, 42% 100%, 42% 75%, 0 75%, 28% 45%, 15% 45%, 38% 20%, 30% 20%); }

[data-craft="game"] .scene { padding: 64px 80px 190px 220px; }
[data-craft="game"] .scene.avatar-right { padding: 64px 220px 190px 80px; }
[data-craft="game"] .layout-title, [data-craft="game"] .layout-handoff, [data-craft="game"] .layout-credits { padding: 64px 200px 190px; }
[data-craft="game"] .card { background: #0d0b1a; border: 4px solid #f2f2f2; box-shadow: 0 0 0 4px #0d0b1a, 10px 10px 0 4px rgba(0, 0, 0, .5); padding: 26px 34px; }
[data-craft="game"] .heading { font-family: 'Press Start 2P', monospace; font-size: 26px; line-height: 1.5; color: #ffd84a; }
[data-craft="game"] .text { font-size: 38px; }
[data-craft="game"] .media img { border: 6px solid #0d0b1a; outline: 4px solid #f2f2f2; }
[data-craft="game"] .choice { font-family: 'Press Start 2P', monospace; font-size: 18px; line-height: 1.6; color: #cfcfcf; }
[data-craft="game"] .choice::before { content: '  '; white-space: pre; }
[data-craft="game"] .choice.current { color: #fff; }
[data-craft="game"] .choice.current::before { content: '▶ '; color: #ffd84a; animation: blink 1s steps(1) infinite; }
@keyframes blink { 50% { opacity: 0; } }
[data-craft="game"] .credits { font-family: 'Press Start 2P', monospace; font-size: 16px; line-height: 2.4; animation: roll 24s linear forwards; }
[data-craft="game"] .layout-credits .card { height: 420px; }
@keyframes roll { from { transform: translateY(380px); } to { transform: translateY(-40px); } }
.pixel-grid { position: absolute; inset: 0; display: grid; grid-template-columns: repeat(32, 1fr); grid-template-rows: repeat(18, 1fr); }
.pixel-grid i { background: #0d0b1a; }

[data-craft="game"] .avatar { bottom: 150px; }
[data-craft="game"] #say { left: 40px !important; right: 40px; bottom: 14px; max-width: none; height: 124px; padding: 14px 20px; background: #000; border: 4px solid #fff; color: #9dff00; font: 34px/1.15 'VT323', monospace; }
```

- [ ] **Step 4: Write `js/fx/game.js`**

```js
/* ACT IV — INDIE GAME craft: rooms, HUD agency meter, iris, pixel dissolve, choice menus. */
(function () {
  'use strict';
  const { anim, wait, fxLayer, el } = Crafts;
  const ROOM_NAMES = { workshop: 'THE WORKSHOP', office: "THE AGENT'S OFFICE", commons: 'THE COMMONS' };

  function setRoom(room) {
    const bg = document.getElementById('backdrop');
    ['workshop', 'office', 'commons'].forEach((r) => bg.classList.toggle('room-' + r, r === room));
    const label = bg.querySelector('.room-name');
    if (label) label.textContent = ROOM_NAMES[room];
  }

  Crafts.register('game', {
    backdrop(bg) {
      const bar = el('div', 'hudbar');
      bar.append(el('span', 'room-name', ROOM_NAMES.workshop), el('span', 'agency', 'AGENCY ▯▯▯▯▯'));
      bg.append(bar, el('div', 'wall'), el('div', 'prop'), el('div', 'floor'));
      setRoom('workshop');
    },

    decorate(root, scene) {
      setRoom(scene.room || 'workshop');
      const meter = document.querySelector('.backdrop-game .agency');
      if (meter && typeof scene.agency === 'number') {
        meter.textContent = 'AGENCY ' + '▮'.repeat(scene.agency) + '▯'.repeat(5 - scene.agency);
      }
    },

    fx: {
      'iris-in': async () => {
        const content = document.getElementById('content');
        await anim(content, [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(80% at 50% 50%)' }],
          { duration: 900, easing: 'steps(12)', fill: 'none' });
      },

      'pixel-dissolve': async (root, { scene }) => {
        const grid = el('div', 'pixel-grid');
        const n = 32 * 18;
        const tiles = [];
        for (let i = 0; i < n; i++) { const t = el('i'); grid.append(t); tiles.push(t); }
        fxLayer().append(grid);
        const order = Random.shuffledOrder(n, Random.hashString(scene.id));
        const steps = 14;
        for (let s = 0; s < steps; s++) {
          for (let k = Math.floor(s * n / steps); k < Math.floor((s + 1) * n / steps); k++) tiles[order[k]].style.visibility = 'hidden';
          await wait(45);
        }
        grid.remove();
      },

      'choice-menu': async (root) => {
        const wrap = root.querySelector('.card-wrap');
        if (wrap) await anim(wrap, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 360, easing: 'steps(6)' });
      },
    },
  });
})();
```

- [ ] **Step 5: Add `'zine-to-pixels'` to `js/fx/handoff.js`**

Inside `fx: { … }`, after `'scan-to-zine'`:
```js
      'zine-to-pixels': async (root, ctx) => {
        const grid = el('div', 'pixel-grid');
        const n = 32 * 18;
        const colours = ['#f4f1e8', '#111', '#ff4fb8', '#b6ff3b', '#22e0ff'];
        const tiles = [];
        for (let i = 0; i < n; i++) {
          const t = el('i');
          t.style.background = colours[i % colours.length];
          t.style.visibility = 'hidden';
          grid.append(t);
          tiles.push(t);
        }
        fxLayer().append(grid);
        const seed = Random.hashString(ctx.scene.id);
        const cover = Random.shuffledOrder(n, seed);
        const uncover = Random.shuffledOrder(n, seed + 1);
        const leaving = ctx.Avatar.walkTo(ctx.lead, -200);
        for (let s = 0; s < 12; s++) {
          for (let k = Math.floor(s * n / 12); k < Math.floor((s + 1) * n / 12); k++) tiles[cover[k]].style.visibility = 'visible';
          await wait(50);
        }
        ctx.setCraft('game');
        ctx.Avatar.setSkin(ctx.lead, 'zine');
        tiles.forEach((t) => { t.style.background = '#0d0b1a'; });
        for (let s = 0; s < 12; s++) {
          for (let k = Math.floor(s * n / 12); k < Math.floor((s + 1) * n / 12); k++) tiles[uncover[k]].style.visibility = 'hidden';
          await wait(50);
        }
        grid.remove();
        await leaving;
        ctx.Avatar.hide(ctx.lead);
      },
```
The `.pixel-grid` style lives in `craft-game.css`, which is loaded on every page.

- [ ] **Step 6: Add the scripts to `index.html`**

After the act3 data script add `<script src="js/data/act4-game.js"></script>`. After `zine.js` add `<script src="js/fx/game.js"></script>`, keeping `handoff.js` last among the fx scripts.

- [ ] **Step 7: Run the tests and verify they pass**

Run: `npm test`
Expected: PASS, including `full deck builds with no errors`.

- [ ] **Step 8: Verify in the browser**

Open `index.html?scene=a3-inspect` and step forward. Expected:
- Tiles flood the zine in pink, lime, and cyan, then clear in a new order to reveal a pixel workshop with a HUD bar reading `THE WORKSHOP` and an agency meter.
- Anastasia's pixel sprite stands on the floor, and the dialogue box types out "You wake up in a workshop…".
- The agency meter changes across scenes (0 on `a4-contribution`, 5 at the end).
- On `a4-unmake`, each → reveals one option with a blinking ▶ on the newest, and ← un-reveals.
- Rooms change from workshop to office to commons.
- On `a4-credits`, both pixel avatars are on stage and the credits roll.
- From credits, press **1**: the deck cuts to the Act I title in paper.

- [ ] **Step 9: Commit**

```bash
git add js/data/act4-game.js js/fx/game.js js/fx/handoff.js css/craft-game.css index.html tests
git commit -m "feat: Act IV indie-game craft, content, zine-to-pixels handoff, credits

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Presenter window

**Files:**
- Create: `presenter.html`, `js/presenter.js`

**Interfaces:**
- Consumes: the BroadcastChannel `'unmaking-deck'` protocol from `js/main.js`. The deck sends `{type:'state', index, step, actElapsed, planned, total}`. The presenter sends `{type:'hello'}` and `{type:'nav', action:'next'|'prev'|'goto', index?}`.
- Produces: a second window for whichever presenter is not driving: current and next scene, notes, act and total clocks, pace, and buttons.

- [ ] **Step 1: Write `presenter.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Presenter · Critical (Un)Making</title>
  <link rel="stylesheet" href="css/hud.css">
  <style>
    body { margin: 0; padding: 20px; background: #15131c; color: #eee; font: 18px/1.45 system-ui, sans-serif; display: grid; gap: 14px; grid-template-columns: 2fr 1fr; grid-template-rows: auto 1fr auto; height: 100vh; box-sizing: border-box; }
    body[data-presenter="emily"] #p-who { background: #b6452c; }
    body[data-presenter="anastasia"] #p-who { background: #7b4fb3; }
    header { grid-column: 1 / -1; display: flex; gap: 16px; align-items: center; flex-wrap: wrap; }
    #p-who { padding: 4px 10px; border-radius: 6px; font-weight: 700; }
    #p-clock, #p-total { font: 700 26px/1 ui-monospace, monospace; }
    #p-notes { font-size: 24px; overflow: auto; background: #1f1c29; padding: 16px; border-radius: 10px; }
    aside { display: grid; gap: 12px; align-content: start; }
    .label { font-size: 12px; text-transform: uppercase; letter-spacing: .08em; opacity: .6; }
    #p-current, #p-next { background: #1f1c29; padding: 12px; border-radius: 10px; }
    #p-url { word-break: break-all; font-size: 13px; opacity: .7; }
    footer { grid-column: 1 / -1; display: flex; gap: 10px; }
    button { font: 700 18px system-ui; padding: 10px 22px; border-radius: 8px; border: 0; cursor: pointer; }
  </style>
</head>
<body>
  <header>
    <span id="p-who">waiting for deck…</span>
    <span id="p-meta"></span>
    <span id="p-clock"></span>
    <span id="p-pace"></span>
    <span id="p-total"></span>
  </header>
  <main id="p-notes">Open the deck with npm start, then press P in the deck window.</main>
  <aside>
    <div><div class="label">Now on screen</div><div id="p-current"></div><div id="p-url"></div></div>
    <div><div class="label">Next</div><div id="p-next"></div></div>
  </aside>
  <footer>
    <button id="p-prev">◀ Prev</button>
    <button id="p-next-btn">Next ▶</button>
  </footer>

  <script src="js/core/random.js"></script>
  <script src="js/core/acts.js"></script>
  <script src="js/core/deck.js"></script>
  <script src="js/core/timer.js"></script>
  <script src="js/data/act1-paper.js"></script>
  <script src="js/data/act2-textile.js"></script>
  <script src="js/data/act3-zine.js"></script>
  <script src="js/data/act4-game.js"></script>
  <script src="js/presenter.js"></script>
</body>
</html>
```

- [ ] **Step 2: Write `js/presenter.js`**

```js
/* Presenter window: mirrors the deck over BroadcastChannel and can drive it. */
(function () {
  'use strict';
  const lists = [globalThis.ACT1_SCENES, globalThis.ACT2_SCENES, globalThis.ACT3_SCENES, globalThis.ACT4_SCENES];
  const { scenes } = Deck.buildDeck(lists);
  const $ = (id) => document.getElementById(id);
  const channel = new BroadcastChannel('unmaking-deck');

  function summary(s, step) {
    if (!s) return '(end of deck)';
    const choices = s.choices ? s.choices.map((c, i) => (i < step ? '✔ ' : '· ') + c).join('\n') : '';
    return [s.heading, s.text, choices, s.source].filter(Boolean).join('\n');
  }

  channel.onmessage = ({ data }) => {
    if (!data || data.type !== 'state') return;
    const s = scenes[data.index];
    if (!s) return;
    const act = Acts.actByNumber(s.act);
    document.body.dataset.presenter = act.presenter;
    $('p-who').textContent = Acts.PRESENTERS[act.presenter].name;
    $('p-meta').textContent = `${act.title}: ${act.subtitle} · ${data.index + 1}/${scenes.length} · ${s.id}${s.draft ? ' · DRAFT' : ''}`;
    $('p-clock').textContent = `${Timer.formatClock(data.actElapsed)} / ${act.budgetMinutes}:00`;
    const pace = Timer.paceStatus(data.actElapsed, data.planned);
    $('p-pace').textContent = `planned ${Timer.formatClock(data.planned)} · ${pace}`;
    $('p-pace').dataset.pace = pace;
    $('p-total').textContent = 'total ' + Timer.formatClock(data.total);
    $('p-notes').textContent = s.notes;
    $('p-current').textContent = summary(s, data.step);
    $('p-current').style.whiteSpace = 'pre-line';
    $('p-url').textContent = s.url || '';
    const next = scenes[data.index + 1];
    $('p-next').textContent = next ? `${next.id}\n${summary(next, 0)}` : '(end of deck)';
    $('p-next').style.whiteSpace = 'pre-line';
  };

  const nav = (action) => channel.postMessage({ type: 'nav', action });
  $('p-prev').onclick = () => nav('prev');
  $('p-next-btn').onclick = () => nav('next');
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); nav('next'); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); nav('prev'); }
  });
  channel.postMessage({ type: 'hello' });
})();
```

- [ ] **Step 3: Run the tests**

Run: `npm test`
Expected: PASS. The offline test now also scans `presenter.html`, and every script it references exists.

- [ ] **Step 4: Verify with two windows**

Run `npm start` and open http://localhost:8137. Press **P**. Expected:
- The presenter window shows the presenter's name (colored per presenter), notes, current and next scene, and a ticking act clock.
- Next/Prev in the presenter window drive the deck.
- Choice reveals show ✔ marks.
- On a cross-act jump (press **3** in the deck), the presenter window switches to Emily.

- [ ] **Step 5: Commit**

```bash
git add presenter.html js/presenter.js
git commit -m "feat: presenter window with notes, next scene, and pace clocks

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 13: Full run-through, alt-text audit, and rehearsal handoff

**Files:**
- Modify: `js/data/act*.js` (alt text and timing fixes only), `README.md` (add rehearsal checklist)

**Interfaces:**
- Consumes: the whole deck.
- Produces: a verified, rehearsal-ready deck and a list of the remaining DRAFT scenes for the authors.

- [ ] **Step 1: Run every test**

Run: `npm test && npm run test:py`
Expected: all PASS.

- [ ] **Step 2: Audit alt text against the actual images**

Dispatch the `image-metadata-specialist` agent with this task: for every `media` entry in `js/data/act*.js`, open the image and compare it to its `alt`; return the scene id, the current alt, and a corrected alt only where the current one is wrong or vague. Apply the corrections in the data files, then rerun `npm test`.

- [ ] **Step 3: Offline cold run**

Disable networking (turn off Wi-Fi), close all browser windows, double-click `index.html`, press **F**, and run the whole deck with → only. Expected:
- Fonts render: Patrick Hand, Courier Prime, ransom fonts, and Press Start 2P.
- Every image loads and there are no console errors.
- All three handoffs play, both avatars render in all four skins, and the credits roll.

- [ ] **Step 4: Stress the controls**

From the title: hold → for 3 seconds, then press **4**, **1**, **End**, **Home**, then ←×5. Expected:
- The deck always lands on a coherent scene in its own craft.
- No avatar is stranded mid-walk and no fx overlays are left behind.
- `#errors` stays hidden.

- [ ] **Step 5: Timing table for the authors**

Run:
```bash
node -e "const D=require('./js/core/deck.js');const L=[1,2,3,4].map(n=>require('./js/data/'+['act1-paper','act2-textile','act3-zine','act4-game'][n-1]+'.js'));const s=L.flat();console.log(D.actMinutes(s));console.log('DRAFT:',s.filter(x=>x.draft).map(x=>x.id).join(', '))"
```
Expected: `{ '1': 15.75, '2': 15.5, '3': 15.25, '4': 15.25 }` and the list of draft scene ids.

- [ ] **Step 6: Add a rehearsal section to `README.md`**

Append:
```markdown
## Rehearsal checklist
- Each presenter runs their act with **N** on and checks that the pace chip stays green. Adjust `minutes` in `js/data/act*.js` to match how long you actually speak.
- Resolve every DRAFT scene (press **R** to see them): add the missing citations and screenshots noted in each scene's `notes`.
- Handoffs happen on the last scene of Acts I–III. The incoming presenter starts speaking on the next click.
- Venue: bring the deck on a USB stick too. It runs from `file://` without Wi-Fi.
```

- [ ] **Step 7: Commit**

```bash
git add js/data README.md
git commit -m "chore: alt-text audit, rehearsal checklist, full-deck verification

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

- [ ] **Step 8: Report to Anastasia**

Summarize the per-act minutes, the remaining DRAFT scenes with what each one needs (from its `notes`), and whether both avatars are approved (Tasks 5 and 6).
