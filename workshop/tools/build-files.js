/* Regenerates the workshop's derived reference files: the OpenSCAD models
   from the grammars, and the importable Twine archive from the Twee source.
   Run: node workshop/tools/build-files.js (tests check the files stay in sync). */
'use strict';
const fs = require('fs');
const path = require('path');
const Scad = require('../js/scad.js');
const dir = path.join(__dirname, '..', 'files');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

// Twee 3 -> Twine 2 archive (Twine: Library > Import). Handles what our story uses:
// StoryTitle, StoryData, and passages with optional [tags] and {metadata}.
function parseTwee(src) {
  const passages = [];
  src.split(/^:: /m).slice(1).forEach((chunk) => {
    const nl = chunk.indexOf('\n');
    const head = chunk.slice(0, nl).trim();
    const body = chunk.slice(nl + 1).replace(/\s+$/, '');
    const m = head.match(/^(.*?)\s*(?:\[([^\]]*)\])?\s*(\{.*\})?$/);
    passages.push({ name: m[1], tags: m[2] || '', meta: m[3] ? JSON.parse(m[3]) : {}, text: body });
  });
  return passages;
}

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

function tweeToArchive(src) {
  const all = parseTwee(src);
  const title = all.find((p) => p.name === 'StoryTitle').text.trim();
  const data = JSON.parse(all.find((p) => p.name === 'StoryData').text);
  const story = all.filter((p) => p.name !== 'StoryTitle' && p.name !== 'StoryData');
  const start = story.findIndex((p) => p.name === data.start) + 1;
  const passages = story.map((p, i) => `<tw-passagedata pid="${i + 1}" name="${esc(p.name)}" tags="${esc(p.tags)}" position="${p.meta.position || '100,100'}" size="${p.meta.size || '100,100'}">${esc(p.text)}</tw-passagedata>`);
  return `<tw-storydata name="${esc(title)}" startnode="${start}" creator="Twine" creator-version="2.10.0" format="${data.format}" format-version="${data['format-version']}" ifid="${data.ifid}" options="" tags="" zoom="${data.zoom || 1}" hidden><style role="stylesheet" id="twine-user-stylesheet" type="text/twine-css"></style><script role="script" id="twine-user-script" type="text/twine-javascript"></script>${passages.join('')}</tw-storydata>\n`;
}

function build() {
  const crypt = Scad.slotsFromGrammar(read('tracery/cryptex-grammar.json'));
  const spin = read('tracery/spinner-grammar.json');
  return {
    'agents/cryptex.scad': Scad.cryptex(crypt),
    'agents/spinner.scad': Scad.spinner(spin.outer, spin.inner),
    'twine/the-longarm-archive.html': tweeToArchive(fs.readFileSync(path.join(dir, 'twine/the-longarm.twee'), 'utf8')),
  };
}

if (require.main === module) {
  Object.entries(build()).forEach(([f, src]) => {
    fs.writeFileSync(path.join(dir, f), src);
    console.log('wrote workshop/files/' + f);
  });
}
module.exports = { build, parseTwee, tweeToArchive };
