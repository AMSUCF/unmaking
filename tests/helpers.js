'use strict';
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');

// fs.existsSync is case-insensitive on Windows; this walks each segment
// and compares names exactly, the way GitHub Pages and Linux will.
function existsExactCase(relPath, root = ROOT) {
  let dir = root;
  for (const part of relPath.split('/')) {
    if (!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) return false;
    if (!fs.readdirSync(dir).includes(part)) return false;
    dir = path.join(dir, part);
  }
  return true;
}

module.exports = { ROOT, existsExactCase };
