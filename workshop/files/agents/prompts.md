# Prompts for Act IV: unflattening a grammar

A sequence to work through with Claude Code (or any coding agent) after you
have a grammar from Act II and a sketch from Act III in a GitHub repository.
Copy a prompt, then **edit it into your own words** before you send it: the
prompt is the source, so it should say what you mean.

Work in plan mode for prompts 1 and 2. Read every plan before you approve it.

---

## 1. Read the grammar back to me (plan mode)

> Read `grammar.json`. Don't change anything yet. Explain in plain language
> what each symbol does, which rules are nested, and which choices are saved
> with actions. Then tell me which parts of it could become physical parts of
> an object that someone turns by hand, and which parts could not.

*Why:* a cryptex face can't expand `#nested#` rules. Before anything else, you
and the agent need the same picture of your grammar.

## 2. Flatten it into slots (plan mode)

> I want a word cryptex: one ring per slot, one word per face, read across the
> rings. Propose a flat version of my grammar with 4 slots and the same number
> of words in each slot. Use my words wherever you can. Show me the proposal as
> JSON in the format of `workshop/files/tracery/cryptex-grammar.json`, and list
> every word you had to change or invent so I can decide on each one.

## 3. Check every combination

> Write a small script that prints every sentence the flat grammar can make
> (every combination of one word per ring). Run it, then show me only the
> sentences that are ungrammatical or don't make sense, grouped by the word
> that causes the problem. Don't fix them. I'll choose which words to change.

*Why:* 8 words on 4 rings is 4,096 sentences, and 10 words is 10,000. Nobody
reads them all, but every one gets printed. In the talk, Claude helped rewrite
the cryptex grammar so every combination works. Keep the choice of what
"works" means for yourself.

## 4. Preview it in p5.js

> Add a p5.js sketch, `cryptex.html`, that shows the cryptex in 3D (WEBGL), with
> buttons to turn each ring and a line of text showing the sentence on the
> reading row. Use the grammar file directly. Comment the code for a beginner.

Compare with `workshop/files/p5/cryptex-3d.html`. What did your agent do
differently? Which version do you understand better?

## 5. Make it printable

> Write a parametric OpenSCAD file for the cryptex: rings with an n-sided
> outside (one face per word), words recessed 0.8 mm into each face, a core rod
> and two end caps. Put every measurement I might need to change at the top
> with a comment. Explain how much clearance you left between rings and core,
> and why.

Open the file in [OpenSCAD](https://openscad.org/) (free), press F5 to
preview and F6 to render, then export an STL and slice it for your printer.
Compare with `workshop/files/agents/cryptex.scad`.

## 6. After the test print

> I printed one ring and the core. The ring [binds / wobbles / the letters are
> filled in / the text runs off the face]. Here is a photo. What would you
> change, and which variable controls it? Change only that.

*Why:* the agent can't feel a ring bind. You can. This is the thread break
from the longarm: noticing it and deciding where to restart is your work.

## 7. Credit and label

> Write `CREDITS.md` for this project: my grammar, any designs or code we
> remixed (with links and licenses), the tools we used, and a short paragraph,
> in my voice, saying what I did and what the agent did. Leave a gap where I
> should write the last sentence myself.

---

**The flower spinner variation:** same steps, two slots instead of four, and
petals instead of faces. Start from `workshop/files/tracery/spinner-grammar.json`,
`workshop/files/p5/flower-spinner.html` and `workshop/files/agents/spinner.scad`.
