/* Regenerates the workshop's derived reference files: the OpenSCAD models
   from the grammars, and the published Twine story from the Twee source.
   The story is published the way Twine does it (Harlowe's template with the
   story data dropped in), so one file both plays in a browser and imports
   into Twine (Library > Import).
   Run: node workshop/tools/build-files.js (tests check the files stay in sync). */
'use strict';
const fs = require('fs');
const path = require('path');
const Scad = require('../js/scad.js');
const dir = path.join(__dirname, '..', 'files');
const read = (f) => JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));

// Twee 3 -> Twine 2 story data. Handles what our story uses:
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

// Publish: Harlowe's page template with the story name and data filled in.
function publish(src) {
  const template = fs.readFileSync(path.join(__dirname, '..', 'vendor', 'harlowe-3.3.9.html'), 'utf8');
  const all = parseTwee(src);
  const title = all.find((p) => p.name === 'StoryTitle').text.trim();
  const data = tweeToArchive(src).trim();
  return template.split('{{STORY_NAME}}').join(esc(title)).split('{{STORY_DATA}}').join(data);
}

// OpenProcessing (Act III) takes one JavaScript file per sketch: the page's own <script>, plus Tracery
// pasted underneath when the sketch needs it (setup() runs after the whole file has loaded).
function openProcessing(name, withTracery) {
  const html = fs.readFileSync(path.join(dir, 'p5', name + '.html'), 'utf8');
  const code = html.slice(html.lastIndexOf('<script>') + 8, html.lastIndexOf('</script>')).replace(/^\n/, '');
  const head = '// ' + name + '.js: for OpenProcessing. Paste this whole file over the starter code in a new p5.js sketch.\n' +
    '// The same sketch runs offline as workshop/files/p5/' + name + '.html.\n\n';
  if (!withTracery) return head + code;
  const lib = fs.readFileSync(path.join(__dirname, '..', 'vendor', 'tracery.js'), 'utf8');
  return head + code + '\n// ===== Tracery by Kate Compton (ISC). Leave everything below this line as it is. =====\n' + lib;
}

function build() {
  const crypt = Scad.slotsFromGrammar(read('tracery/cryptex-grammar.json'));
  const spin = read('tracery/spinner-grammar.json');
  return {
    'agents/cryptex.scad': Scad.cryptex(crypt),
    'agents/spinner.scad': Scad.spinner(spin.outer, spin.inner),
    'p5/openprocessing/first-sketch.js': openProcessing('first-sketch', false),
    'p5/openprocessing/tracery-particles.js': openProcessing('tracery-particles', true),
    'p5/openprocessing/flower-spinner.js': openProcessing('flower-spinner', false),
    'twine/the-longarm.html': publish(fs.readFileSync(path.join(dir, 'twine/the-longarm.twee'), 'utf8')),
  };
}

if (require.main === module) {
  Object.entries(build()).forEach(([f, src]) => {
    fs.writeFileSync(path.join(dir, f), src);
    console.log('wrote workshop/files/' + f);
  });
}
module.exports = { build, parseTwee, tweeToArchive, publish };
