#!/usr/bin/env node
'use strict';
// One-time download of Google Fonts (latin subset, 400 weight) into assets/fonts.
// Run with network; the deck itself never fetches fonts.
const fs = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname, '..', 'assets', 'fonts');
const FAMILIES = [
  ['VT323', 'vt323'],
  ['Special Elite', 'special-elite'],
  ['Patrick Hand', 'patrick-hand'],
  ['Rubik Mono One', 'rubik-mono-one'],
  ['Courier Prime', 'courier-prime'],
];
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36';

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  for (const [family, slug] of FAMILIES) {
    const url = 'https://fonts.googleapis.com/css2?family=' + family.replace(/ /g, '+') + '&display=swap';
    const css = await (await fetch(url, { headers: { 'User-Agent': UA } })).text();
    const block = css.includes('/* latin */') ? css.split('/* latin */').pop() : css;
    const match = block.match(/url\((https:[^)]+\.woff2)\)/);
    if (!match) throw new Error('No woff2 found for ' + family);
    const buf = Buffer.from(await (await fetch(match[1])).arrayBuffer());
    fs.writeFileSync(path.join(OUT, slug + '.woff2'), buf);
    console.log('saved', slug, buf.length, 'bytes');
  }
}

main().catch((err) => { console.error(err); process.exit(1); });
