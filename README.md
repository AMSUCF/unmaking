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
| R | show/hide DRAFT flags (hidden by default; open with `?drafts=1` to start with them shown) |
| E | show deck validation errors |
| P | open presenter window (needs `npm start`) |

Start at a specific scene with `index.html?scene=a3-perlow`.

## Workshop
`workshop/` is the companion workshop site, in the same four crafts: Twine (paper), Tracery (textile), p5.js (zine), and agentic code with 3D-printable grammars (game). Open `workshop/index.html`; it also runs offline. See `workshop/README.md`.

## Develop
- `npm test` runs the JS unit and content tests, including the workshop's (`node workshop/tools/build-files.js` regenerates its `.scad` files and Twine archive). `npm run test:py` runs the sprite tool tests.
- `npm run import-assets` re-copies images from sibling repos (read-only on sources).

## Rehearsal checklist
- Each presenter runs their act with **N** on and checks that the pace chip stays green. Adjust `minutes` in `js/data/act*.js` to match how long you actually speak.
- Resolve every DRAFT scene (press **R** or open `index.html?drafts=1` to see them): add the missing citations and screenshots noted in each scene's `notes`.
- Handoffs happen on the last scene of Acts I–III. The incoming presenter starts speaking on the next click.
- Venue: bring the deck on a USB stick too. It runs from `file://` without Wi-Fi.
