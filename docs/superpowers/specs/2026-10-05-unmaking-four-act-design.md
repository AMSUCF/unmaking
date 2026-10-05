# Critical (Un)Making — Four-Act Crafted Deck: Design

**Source request (2026-10-05):** Reference but don't change `../AuthorFunctionSlides`. Build a four-act, highly animated, crafting-inspired version of the talk in `critical-unmaking-slide-outline.md`. Act I is presented by Dr. Emily K. Johnson, Act II by Anastasia Salter, alternating to the end. Each act runs 15 minutes. Pull images and material from AuthorFunctionSlides and other relevant repos. Use images of Dr. Johnson as reference for an avatar similar to Anastasia's AuthorFunction sprite, and use the avatars to navigate the talk. Each act is a separate craft: paper → textiles → e-zine → indie video game.

## The arc

| Act | Outline section | Craft | Presenter | Handoff out |
|---|---|---|---|---|
| I | Death of the Web (As We Know It), including the Meta Muse screen recording as stage one of enshittification | Paper: pop-up book, cut paper, paper-puppet avatar | Emily | *pattern-to-cloth*: the book cover's sewing-pattern pieces get sewn, and paper becomes linen |
| II | Why Keep Making? | Textile: linen, quilt blocks, running stitches, cross-stitch avatar & headings | Anastasia | *scan-to-zine*: the cloth is laid on a photocopier, and the scan bar turns everything to toner |
| III | Who Owns What We Make? | E-zine: photocopy collage on a Web-1.0 tiled background, ransom-note headings, marquee ticker, hit counter, sticker avatar | Emily | *zine-to-pixels*: the page breaks into pixel tiles that resolve into a game room |
| IV | Is There Human Agency in Agentic AI? | Indie game: pixel rooms, dialogue box, choice menus, agency meter, credits roll | Anastasia | — (credits) |

Each act's craft is "unmade" into the next, so the talk's form performs its title. Both avatars appear on the title, handoff, and credits scenes. Otherwise the act's presenter's avatar walks the stage and points at the content.

## Avatars

- One pixel sprite set per presenter (idle, walk1–4, talk, point) at 120×180. Anastasia's is regenerated from her AuthorFunctionSlides sprite. Emily's is generated from two supplied reference photos, using Anastasia's sprite as the style reference. Each presenter approves her own avatar.
- Both avatars wear the "human in the loop" t-shirt (slate-navy tee with a silver glitter oval loop; reference photo supplied).
- Per-craft skins: paper puppet on a stick (CSS outline and sway), cross-stitch (pre-rendered `.stitch.png`), photocopy sticker (CSS), and native pixels.

## Constraints

- Runs from `file://` and offline at the venue. No CDN, no ES modules, fonts vendored.
- Stage is 1280×720, letterboxed.
- Each act is 14–16 planned minutes, and every scene carries speaker notes.
- Presenter tooling: notes overlay with act clock and pace, act-jump keys, blackout, and a presenter window over BroadcastChannel (served via `npm start`).
- `../AuthorFunctionSlides` is read-only: copy from it, never write to it.
