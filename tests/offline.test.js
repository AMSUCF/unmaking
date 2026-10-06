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
