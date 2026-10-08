'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const { ROOT, existsExactCase } = require('./helpers.js');
const Scad = require('../workshop/js/scad.js');
const tracery = require('../workshop/vendor/tracery.js');
const { build, parseTwee } = require('../workshop/tools/build-files.js');

const W = 'workshop';
const read = (rel) => fs.readFileSync(path.join(ROOT, rel), 'utf8');
const json = (rel) => JSON.parse(read(rel));
function walk(rel) {
  const abs = path.join(ROOT, rel);
  if (fs.statSync(abs).isFile()) return [rel];
  return fs.readdirSync(abs).flatMap((f) => walk(`${rel}/${f}`));
}
const pages = walk(W).filter((f) => f.endsWith('.html') && !f.endsWith('-archive.html'));

test('every local src/href in workshop pages exists with exact case', () => {
  const missing = [];
  pages.forEach((f) => {
    const html = read(f).replace(/<code>[\s\S]*?<\/code>/g, '');  // code samples aren't links
    for (const m of html.matchAll(/(?:src|href)="([^"#?]+)"/g)) {
      if (/^[a-z]+:/i.test(m[1])) continue;
      const rel = path.posix.normalize(path.posix.join(path.posix.dirname(f), m[1]));
      if (!existsExactCase(rel)) missing.push(`${f} -> ${m[1]}`);
    }
  });
  assert.deepEqual(missing, []);
});

test('workshop pages load no remote scripts, styles, or images (links out are fine)', () => {
  const hits = [];
  pages.forEach((f) => {
    const src = read(f);
    if (/<(?:script|img|link|iframe|video|audio|source)\b[^>]*\b(?:src|href)\s*=\s*["']https?:/i.test(src)) hits.push(f);
    if (/url\(\s*["']?https?:|@import|type\s*=\s*["']module["']/i.test(src)) hits.push(f);
  });
  assert.deepEqual(hits, []);
});

test('generated .scad files and the Twine archive match their sources', () => {
  Object.entries(build()).forEach(([f, src]) => assert.equal(read(`${W}/files/${f}`), src, `${f} is stale: run node workshop/tools/build-files.js`));
});

test('copies of the grammars embedded in pages match the JSON files', () => {
  const embedded = (file, re) => JSON.parse(read(`${W}/${file}`).match(re)[1]);
  const act2 = (name) => embedded('act2-tracery.html', new RegExp(`data-example="${name}">([\\s\\S]*?)</script>`));
  assert.deepEqual(act2('starter'), json(`${W}/files/tracery/starter.json`));
  assert.deepEqual(act2('quilt'), json(`${W}/files/tracery/quilt-blocks.json`));
  assert.deepEqual(act2('cryptex'), json(`${W}/files/tracery/cryptex-grammar.json`));
  assert.deepEqual(embedded('files/tracery/generator.html', /const GRAMMAR = (\{[\s\S]*?\n\});/), json(`${W}/files/tracery/starter.json`));
  assert.deepEqual(embedded('files/p5/cryptex-3d.html', /const START = (\{[\s\S]*?\n\});/), json(`${W}/files/tracery/cryptex-grammar.json`));
  assert.deepEqual(embedded('files/p5/flower-spinner.html', /const grammar = (\{[\s\S]*?\n\});/), json(`${W}/files/tracery/spinner-grammar.json`));
});

test('every workshop grammar expands without missing symbols', () => {
  walk(`${W}/files/tracery`).filter((f) => f.endsWith('.json')).forEach((f) => {
    const g = tracery.createGrammar(json(f));
    g.addModifiers(tracery.baseEngModifiers);
    for (let i = 0; i < 50; i++) {
      const out = g.flatten('#origin#');
      assert.ok(out && !out.includes('(('), `${f}: ${out}`);
    }
  });
});

test('the flat grammars are ready to print', () => {
  const crypt = Scad.slotsFromGrammar(json(`${W}/files/tracery/cryptex-grammar.json`));
  assert.deepEqual(crypt.map((s) => s.name), ['who', 'when', 'does', 'how']);
  assert.deepEqual(Scad.checkSlots(crypt), []);
  const spin = Scad.slotsFromGrammar(json(`${W}/files/tracery/spinner-grammar.json`));
  assert.deepEqual(spin.map((s) => s.name), ['outer', 'inner']);
});

test('checkSlots catches grammars a printed ring cannot hold', () => {
  const bad = Scad.slotsFromGrammar({ origin: ['#a# #b#'], a: ['x', 'y', 'z'], b: ['#a#', 'q'] });
  const errors = Scad.checkSlots(bad).join(' | ');
  assert.match(errors, /plain text/);
  assert.match(errors, /same number of words/);
  assert.match(Scad.checkSlots(Scad.slotsFromGrammar({ origin: ['#a#'], a: ['x'] })).join(' '), /at least two/);
});

test('scad output quotes words safely and sizes rings to the longest word', () => {
  const src = Scad.cryptex([{ name: 'a', words: ['say "hi"', 'back\\slash', 'ok'] }, { name: 'b', words: ['1', '2', '3'] }]);
  assert.match(src, /\["say \\"hi\\"", "back\\\\slash", "ok"\]/);
  assert.match(src, /ring_len\s+= 40;/);
  assert.equal(Scad.ringLength([{ name: 'a', words: ['x'] }]), 24);
});

test('every Twine link in The Longarm leads to a passage', () => {
  const passages = parseTwee(read(`${W}/files/twine/the-longarm.twee`)).filter((p) => !['StoryTitle', 'StoryData'].includes(p.name));
  const names = new Set(passages.map((p) => p.name));
  const broken = [];
  passages.forEach((p) => {
    for (const m of p.text.matchAll(/\[\[(.+?)\]\]/g)) {
      const target = m[1].includes('->') ? m[1].split('->').pop() : m[1].includes('<-') ? m[1].split('<-')[0] : m[1];
      if (!names.has(target)) broken.push(`${p.name} -> ${target}`);
    }
  });
  assert.deepEqual(broken, []);
  assert.ok(names.has('Start'));
  assert.match(read(`${W}/files/twine/the-longarm-archive.html`), /startnode="1"[^>]*format="Harlowe"/);
});
