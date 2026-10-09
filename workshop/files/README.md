# Workshop reference files

Everything here runs offline from this folder: open an `.html` file in a
browser, open a `.json`, `.twee` or `.scad` file in any text editor. The p5.js
and Tracery libraries are in `../vendor/`.

## Act I · Twine (`twine/`)
- `the-longarm.html`: a short Harlowe story, published. Open it in a browser
  to play; import it into Twine (*Library → Import*) to edit. Shows links,
  `(set:)`, `(if:)`/`(else:)` and `(either:)`.
- `the-longarm.twee`: the same story as Twee 3 text. This is the source; the
  published file is built from it with Harlowe 3.3.9 (`../vendor/`).

## Act II · Tracery (`tracery/`)
- `generator.html`: a one-file Tracery generator. Paste in a grammar.
- `starter.json`: the playground's starter grammar.
- `quilt-blocks.json`: actions (`[maker:#name#]`), nested rules, several sentence shapes.
- `cryptex-grammar.json`: a flat four-slot grammar (eight words per slot) for the cryptex.
- `spinner-grammar.json`: a flat two-slot grammar for the flower spinner.

## Act III · p5.js (`p5/`)
- `first-sketch.html`: shapes, colour, mouse and keyboard, with `TRY` comments.
- `tracery-particles.html`: Tracery in p5; each click releases a drifting line.
  Adapted from the ENG 6819 demo, after Allison Parrish.
- `flower-spinner.html`: two rings of words that spin and pair at a pointer.
- `openprocessing/`: the first three sketches as single `.js` files to paste into
  a new OpenProcessing sketch (Act III works in OpenProcessing). Generated from
  the `.html` files; `tracery-particles.js` has Tracery pasted in at the bottom.
- `cryptex-3d.html`: a 3D (WEBGL) cryptex built from any flat grammar, with a
  download button for the matching OpenSCAD file.

## Act IV · Agents (`agents/`)
- `CLAUDE.md`: house rules to copy into your own repository and edit.
- `prompts.md`: seven prompts for unflattening a grammar with an agent.
- `process-log.md`: who asked, who did, who decided, and your label.
- `cryptex.scad`, `spinner.scad`: parametric OpenSCAD models generated from the
  two grammars above. Teaching models: the rings spin freely, with no lock.

## Rebuilding
The `.scad` files, the OpenProcessing `.js` files and the published Twine story are generated. After editing
`cryptex-grammar.json`, `spinner-grammar.json`, `the-longarm.twee` or the p5 sketches, run
`node workshop/tools/build-files.js` from the repository root. `npm test` checks
that they are in sync.
