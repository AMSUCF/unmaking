# Critical (Un)Making Workshop

A hands-on companion to the talk, in the talk's four crafts, with the
presenters' pixel avatars as guides. Open `workshop/index.html`. It runs from
`file://` with no Wi-Fi, like the deck.

| Act | Craft | Tool | Make |
|---|---|---|---|
| I · Passages | Paper | Twine (Harlowe) | A paper prototype, then a branching hypertext |
| II · Patterns | Textile | Tracery | A grammar, plus a flat version for print |
| III · Sketches | Zine | p5.js | A sketch that runs the grammar |
| IV · Agents | Game | Claude Code + OpenSCAD | A 3D cryptex or flower spinner from the grammar, and a process log |

The tutorials adapt ENG 6819 Critical Making in Digital Humanities
([AMSUCF/CriticalMaking2026](https://github.com/AMSUCF/CriticalMaking2026)):
exercises five (hypertext), seven (grammar), nine (generation), ten and eleven
(code, narrative), and thirteen (tools). Act IV builds on Emily K. Johnson's
cryptex and flower-spinner prints from Act III of the talk.

- `index.html`, `act*.html`: the site. Styles in `css/workshop.css`; behaviour in `js/workshop.js`.
- `files/`: reference files for each act (see `files/README.md`).
- `js/scad.js`: turns a flat grammar into OpenSCAD source (used by the 3D preview and the build script).
- `tools/build-files.js`: regenerates the `.scad` files and the Twine archive.
- `vendor/`: local copies of p5.js 1.11.1 (LGPL 2.1, `p5-license.txt`) and Tracery 2.8.4 (ISC, Kate Compton).

Avatars are drawn at runtime by the deck's `js/render/avatar-pixels.js`; fonts come from the deck's `css/fonts.css`.
