#!/usr/bin/env node
'use strict';
// Screenshots the first slide of every place, plus one mid-run slide per act, with headless Chrome.
// Usage: npm run sweep -- <outDir>   (serves the repo on :8137 while it runs; set CHROME to override the browser path)
const fs = require('fs');
const path = require('path');
const { spawn, execFileSync } = require('child_process');
const Deck = require('../js/core/deck.js');

const ROOT = path.resolve(__dirname, '..');
const CHROME = process.env.CHROME || 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const MID_RUN = ['a1-muse-memory', 'a2-posner', 'a3-perlow', 'a4-ask'];

function slides() {
  const lists = ['act1-paper', 'act2-textile', 'act3-zine', 'act4-game'].map((f) => require(`../js/data/${f}.js`));
  const { scenes } = Deck.buildDeck(lists);
  const firsts = scenes.filter((s) => s.place); // only the first slide of each run sets a place
  return [...new Set([...firsts.map((s) => s.id), ...MID_RUN])];
}

async function main() {
  const out = path.resolve(process.argv[2] || 'place-sweep');
  fs.mkdirSync(out, { recursive: true });
  const server = spawn('python', ['-m', 'http.server', '8137'], { cwd: ROOT, stdio: 'ignore' });
  await new Promise((r) => setTimeout(r, 1000));
  try {
    for (const id of slides()) {
      execFileSync(CHROME, ['--headless=new', '--hide-scrollbars', '--window-size=1280,720', '--virtual-time-budget=6000',
        `--screenshot=${path.join(out, id + '.png')}`, `http://localhost:8137/index.html?scene=${id}`], { stdio: 'ignore' });
      console.log(id);
    }
  } finally {
    server.kill();
  }
}

main().catch((e) => { console.error(e); process.exit(1); });
