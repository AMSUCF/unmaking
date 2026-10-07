# Places and Depth: backgrounds, spaces, and references for the four-act deck

**Date:** 2026-10-06 · **Status:** approved in conversation, awaiting spec review
**Request (Anastasia):** a detail-oriented pass on backgrounds and spaces, with the depth of `../HumanitiesAI/TeachingAI` and the pop-culture character of the AuthorFunction/CAPE adventure deck, aligned with the sequences and keeping the shifting craft aesthetic.

## Decisions already made

- All four acts get the treatment. Emily reviews the references in Acts I and III before they are presented.
- Tone: **named places plus easter eggs.** Each place shows its name in the act's idiom and has one recognizable set piece at the edges, plus small details for close watchers.
- Approach **A**: places are defined per craft and built from layered DOM/CSS planes in that craft's materials. Act IV adds a small dithered canvas sky. No generated or illustrated background images.
- Unchanged: slide text, layouts, timings, handoffs between acts, and the content card styling. The talk must not mention the CAPE lab.

## Current state (what this replaces)

Each of Acts I–III builds one backdrop when the craft starts (`Crafts.backdrop`) and keeps it for the whole act. Act IV switches among three flat rooms (`workshop`, `office`, `commons`) through a `room` field and `GAME_ROOMS`. There is no per-sequence change, almost no layering, and no avatar grounding.

## 1. Place map

A place covers a run of slides. The first slide of each run sets `place`, and later slides inherit it.

| Act | Place id | Label | Slides (first → last) | Set piece | Easter eggs |
|---|---|---|---|---|---|
| I | `storybook` | The Storybook | a1-title → a1-act | open pop-up book on a table; four tabs read paper, thread, zine, cartridge | a paper crane |
| I | `hamlet` | Handmade Hamlet | a1-personal | cut-paper cottages (personal homepages), guestbook mailbox, webring footbridge | tiny under-construction sawhorses |
| I | `platform-city` | Platform City | a1-enshittification | three paper towers, bright to gray (one per stage), billboards peeling | a peeling "M" sign |
| I | `mid-world` | Mid-World | a1-dark-tower → a1-ghost-agents | the Dark Tower on a paper desert horizon, a single rose, a tiny gunslinger far off | stalled paper monorail (Blaine); tissue-paper ghosts (one Pac-Man shaped); the Moltbook lobster |
| I | `gallery-row` | Gallery Row | a1-creative-class → a1-artists-sue | artist storefronts with FOR LEASE signs, courthouse columns at the end of the street | a beret on a lamppost |
| I | `companion-shop` | The Companion Shop | a1-muse → a1-muse-strengthen | gift-shop window: plushies, Tamagotchi egg, yeti in a suit, tags reading "FREE*" | plushie eyes follow the avatar on a1-muse-memory and a1-muse-strengthen; a Furby on the top shelf |
| I | `worktable` | The Worktable | a1-lens → a1-handoff | cutting mat, scissors, sewing-pattern pieces | a paper Mouse Trap contraption looping |
| II | `sewing-room` | The Sewing Room | a2-act → a2-unflatten | sewing machine, dress form, window with yarn rain | tomato pincushion |
| II | `code-camp` | Code Camp | a2-learn-to-code → a2-posner | felt classroom; cross-stitched C64 sampler "10 PRINT HELLO / 20 GOTO 10"; Hour of Code banner | one spotlit chair |
| II | `sampler-wall` | The Sampler Wall | a2-losh → a2-manovich | framed samplers incl. "I'd rather be a cyborg than a goddess" | Jacquard punch-card loom |
| II | `craft-fair` | The Craft Fair | a2-casual-creators → a2-klimas | bunting and stalls: Kid Pix stamps, Twine yarn balls, Tracery | Able Sisters stall (Animal Crossing) |
| II | `quilting-bee` | The Quilting Bee | a2-bridge → a2-handoff | quilting frame with a half-finished quilt, ring of chairs, tea set | a robot arm trying to thread a needle |
| III | `flash-graveyard` | The Flash Graveyard | a3-flash-dead → a3-walled | xeroxed tombstones, a chain-link walled garden | a "Get Flash Player" tombstone |
| III | `wayback-stacks` | The Wayback Stacks | a3-lawhead → a3-preservation | photocopied archive shelves, a floppy-disk mountain | a Flashpoint cartridge |
| III | `babel` | The Library of Babel | a3-libgen → a3-perlow | hexagonal stacks fading to dark; a giant vacuum hose reading everything | "PLEASE DO NOT FEED THE CRAWLERS" |
| III | `geocities` | GeoCities | a3-gardens → a3-nudification | signposts for Area51, Hollywood, Heartland, SoHo; an under-construction worker | a webring arrow |
| III | `bot-garden` | The Bot Garden | a3-tracery → a3-handoff | pixel birds out of their cage, garden tools reading "Maintenance is resistance", an arcade cabinet at the edge | — |
| IV | `workshop` | THE WORKSHOP | a4-act, a4-triad → a4-pun | pegboard, workbench, lamp | rubber chicken with a pulley in the middle |
| IV | `museum` | MUSEUM OF TALKING MACHINES | a4-eliza → a4-racter | VT100 terminal and a book on plinths | HAL's red eye in the dark |
| IV | `office` | THE AGENT'S OFFICE | a4-undertale → a4-stanford | CRT with a paperclip on it: "It looks like you're writing a talk" | Undertale save star |
| IV | `commons` | THE COMMONS | a4-political → a4-unmake-politics | capitol silhouette, Florida palms | Bratty & Catty's trash cans |
| IV | `frontier` | THE FRONTIER | a4-frontier | dark corridor toward a glowing data center | "the cake is a lie" scrawled on the wall |
| IV | `allotment` | THE ALLOTMENT | a4-local-models → a4-why-local | small server rack under a desk; seedlings in garden beds | a Stardew-style scarecrow |
| IV | `quad` | THE COMMONS, AT SUNRISE | a4-dh-hub → a4-responsibility | campus quad, library, small figures of students | — |
| IV | `road` | THE ROAD AT THE END OF THE WORLD | a4-end-of-world → a4-credits | Kentucky Route Zero amber lamp, Carol's motorcycle silhouette, a large planet in the night sky | — |

Notes:
- a4-act opens in `workshop`, and a4-eliza and a4-racter sit between it and a4-triad, so a4-triad sets `place: 'workshop'` again.
- The Act IV labels are upper-case to match the existing HUD.
- The references depend on their sources being recognized, so each place keeps a one-line `credit` in data (for example "The Dark Tower, Stephen King"). Credits appear in the presenter window only.

## 2. Data model and validation

- New optional scene field `place` (string). The effective place of a slide is its own `place`, or else that of the nearest earlier slide in the same act.
- `Acts.PLACES` maps each craft to its list of place ids (the source of truth for validation). It replaces `GAME_ROOMS`.
- `Deck.validateScene` fails on a `place` not listed for the act's craft. Deck-level validation fails if the first slide of an act has no `place`.
- Act IV migrates from `room` to `place`. `room` is removed from the data and from validation.
- `Deck.placeOf(scenes, index)` returns the effective place, and is unit-tested.

## 3. Rendering and depth

### Place definitions

Each craft file (`js/fx/paper.js`, `textile.js`, `zine.js`, `game.js`) exports a `PLACES` table. Places are declarative, so the safe-zone rule can be tested without a browser:

```js
'mid-world': {
  label: 'Mid-World',
  credit: 'The Dark Tower, Stephen King',
  floor: 600,                                  // y of the avatar's feet, stage px
  pieces: [
    { layer: 'far',  cls: 'pw-dunes',     box: [0, 380, 1280, 340] },
    { layer: 'far',  cls: 'pw-tower',     box: [1040, 120, 90, 300] },
    { layer: 'mid',  cls: 'pw-monorail',  box: [0, 470, 200, 60] },
    { layer: 'near', cls: 'pw-rose',      box: [1150, 560, 70, 110] },
    { layer: 'egg',  cls: 'pw-gunslinger', box: [1180, 395, 14, 26] },
  ],
  ambient: ['pw-ghosts'],                      // optional named ambient effects
},
```

- `box` is `[x, y, w, h]` in 1280×720 stage pixels. The builder positions each piece absolutely from its box. The craft's CSS draws it with gradients, `clip-path`, borders, box-shadow and small inline SVG, which is the method the deck already uses.
- Pieces are grouped into plane elements, back to front: `sky`, `far`, `mid`, `near`, `light`, `egg`. The sky is the craft's existing ground (paper noise, linen, zine star tile, pixel sky).
- The place label is a piece with `layer: 'label'`, drawn in the act's idiom: a paper tab at the top edge (I), a woven clothing label (II), a browser title bar (III), and the existing HUD room-name (IV).
- Ambient effects are named and implemented once per craft. Examples: drifting tissue ghosts, yarn rain, a marquee or blinking under-construction worker, pixel particles.

### Legibility guard

- The **content frame** is the area where cards and media are laid out: x 220–1208, y 56–648 (game act: x 220–1200, y 64–530).
- Pieces on `mid`, `near` and `egg` must not intersect the content frame, except where a piece is marked `quiet: true`. A quiet piece must be at most 35% opacity or low-contrast. This is enforced by a unit test on the `box` values.
- `far` and `sky` may sit behind the content frame but are drawn at reduced contrast. A CSS variable `--plane-dim` per craft caps them.
- The avatar gutter (x < 220) can hold `near` pieces only below the avatar's knees, so the avatar stays readable. No scene currently puts the avatar on the right. If one ever does, the content frame mirrors to x 72–1060.

### Parallax

On every slide advance, each plane translates by a small offset seeded from the scene id (`Random.hashString`): `sky` 0px, `far` up to ±2px, `mid` ±5px, `near` ±9px, with a 600ms ease. A place change resets the offsets. With `prefers-reduced-motion`, parallax and ambient loops are off.

### Act IV pixel sky

Act IV gets a `<canvas>` at 320×180, scaled to 1280×720 with `image-rendering: pixelated`, behind the DOM planes. Each place can declare `sky: { top, bottom, dither: true }` and particles (`dust`, `stars`, `fireflies`, `rain`). The Bayer dither and particle loop follow TeachingAI's `ditherV` and `makeRain` patterns, re-implemented here rather than copied, and stopped when the act is not showing. The DOM props draw over it.

## 4. Transitions and avatar staging

### Changing place

When the effective place changes within an act, the craft runs a place transition before the slide's own `fx`:

| Act | Place transition |
|---|---|
| I | the pop-up spread folds flat (planes scale-Y to 0 from the floor line) and the new spread rises |
| II | a running-stitch line crosses the stage; the felt planes behind it swap |
| III | a new browser window (title bar plus a gray frame) opens on top, and the old one is left half-visible behind it for one beat, then removed |
| IV | the avatar walks off the right edge, the screen irises to the new room, and the avatar walks in from the left, as in TeachingAI's `go()` |

Same-place advances only get the parallax nudge. Handoffs between acts are unchanged; the first place of the next act is built under the handoff.

### Avatar staging

- Each place declares `floor`. The avatar's bottom aligns to it, which replaces the per-craft fixed `bottom` offsets.
- Each avatar gets a contact shadow in the craft idiom: a soft paper shadow (I), a felt oval (II), a halftone-dot ellipse (III), a 2-row pixel ellipse (IV).
- A place may declare one `occluder` piece (for example the Companion Shop counter). It is drawn above the avatar layer, and its box must stay below the avatar's knees.
- The Companion Shop's eye-tracking easter egg reads the lead avatar's x position on a1-muse-memory and a1-muse-strengthen only.

## 5. Components and files

| Unit | Responsibility |
|---|---|
| `js/core/acts.js` | `PLACES` per craft (ids only); remove `GAME_ROOMS` |
| `js/core/deck.js` | validate `place`; `placeOf()`; first-slide rule |
| `js/render/places.js` (new) | build a place from its declaration into the plane elements, apply parallax, run the place transition hook, position avatars on `floor`, add contact shadows |
| `js/fx/{paper,textile,zine,game}.js` | each craft's `PLACES` declarations, ambient effects, place transition, label piece |
| `js/render/pixel-sky.js` (new) | Act IV canvas sky and particles |
| `css/places-{paper,textile,zine,game}.css` (new) | piece drawings, so the existing craft CSS files don't grow past readability |
| `js/data/act*.js` | add `place` to the first slide of each run; Act IV `room` → `place` |
| `presenter.js` | show the place label and credit in the presenter meta line |

`Stage.show` asks `Places` for the effective place, and rebuilds only when it changes.

## 6. Testing

- **Unit (node):**
  - every scene's effective place exists for its craft;
  - each act's first slide sets a place;
  - `placeOf` handles inheritance;
  - every place declaration has a label, a floor between 520 and 680, and pieces whose boxes are within the stage;
  - **the safe-zone rule:** no non-quiet `mid`/`near`/`egg` box intersects the content frame;
  - occluders sit below avatar knee height.
- **Build smoke test (node, DOM stub as in `tests/fx-coverage.test.js`):** every place builds without throwing and produces one element per piece.
- **Visual sweep:** a script screenshots the first slide of every place, plus one mid-run slide per act, at 1280×720 with headless Chrome into the scratchpad, for review. It checks for text legibility over each place, and for Act IV HUD overlap.
- **Human review:** Anastasia approves Acts II and IV, and Emily approves the references in Acts I and III, before the test run.

## 7. Out of scope

- New slides or content changes.
- Sound.
- Changes to the act handoff effects or the avatars themselves.
- Mobile layouts. The deck is a fixed 1280×720 stage.

## 8. Risks

- **Projector legibility:** busy places behind text. Mitigated by the safe-zone test and the `--plane-dim` cap.
- **Performance:** the Act IV canvas loop and the ambient CSS animations. Mitigated by stopping loops outside their act, and capping particles at 80.
- **References that don't land:** each place has its `credit` in the presenter notes so the presenter can name it aloud, and Emily can veto references in her acts.
