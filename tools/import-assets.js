#!/usr/bin/env node
'use strict';
// Copies files listed in asset-manifest.json into this repo.
// Sources (e.g. ../AuthorFunctionSlides) are only ever read, never written.
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const GITHUB = path.resolve(ROOT, '..');
const manifest = require('./asset-manifest.json');

function importAssets() {
  const missing = [];
  for (const [dest, src] of Object.entries(manifest)) {
    const from = path.resolve(GITHUB, src);
    const to = path.resolve(ROOT, dest);
    if (!fs.existsSync(from)) { missing.push(src); continue; }
    fs.mkdirSync(path.dirname(to), { recursive: true });
    fs.copyFileSync(from, to);
  }
  return missing;
}

if (require.main === module) {
  const missing = importAssets();
  if (missing.length) {
    console.error('Missing sources:\n  ' + missing.join('\n  '));
    process.exit(1);
  }
  console.log(`Imported ${Object.keys(manifest).length} assets.`);
}

module.exports = { importAssets };
