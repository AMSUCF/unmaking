'use strict';
const test = require('node:test');
const assert = require('node:assert/strict');
const AP = require('../js/render/avatar-pixels.js');

const WHO = ['emily', 'anastasia'];
const POSES = ['idle', 'walk1', 'walk2', 'walk3', 'walk4', 'talk', 'wave', 'scissors', 'ruler', 'marker', 'needle', 'controller', 'point'];

test('exposes the grid size and every pose', () => {
  assert.equal(AP.W, 30);
  assert.equal(AP.H, 45);
  assert.deepEqual(Object.keys(AP.POSES).sort(), [...POSES].sort());
});

test('every presenter composes every pose to a W x H grid', () => {
  WHO.forEach((who) => POSES.forEach((pose) => {
    const g = AP.compose(who, pose);
    assert.equal(g.length, AP.H, `${who}/${pose} rows`);
    g.forEach((row, y) => assert.equal(row.length, AP.W, `${who}/${pose} row ${y}`));
  }));
});

test('grids use only letters defined in the presenter palette (plus "." and outline K)', () => {
  WHO.forEach((who) => POSES.forEach((pose) => {
    const pal = AP.PALETTES[who];
    AP.compose(who, pose).forEach((row) => [...row].forEach((ch) => {
      assert.ok(ch === '.' || pal[ch], `${who}/${pose}: unknown letter ${ch}`);
    }));
  }));
});

test('the two presenters look different', () => {
  assert.notEqual(AP.compose('emily', 'idle').join('\n'), AP.compose('anastasia', 'idle').join('\n'));
});

test('poses differ from each other', () => {
  WHO.forEach((who) => {
    const seen = new Set(POSES.map((p) => AP.compose(who, p).join('\n')));
    assert.ok(seen.size >= 6, `${who}: only ${seen.size} distinct frames`);
  });
});

test('both wear the silver human-in-the-loop loop on the tee', () => {
  WHO.forEach((who) => {
    const flat = AP.compose(who, 'idle').join('');
    assert.ok((flat.match(/L/g) || []).length >= 15, `${who} loop pixels`);
  });
});

test('art never touches the frame border (only outline may)', () => {
  WHO.forEach((who) => POSES.forEach((pose) => {
    const g = AP.compose(who, pose);
    const border = (y, x) => y === 0 || x === 0 || y === AP.H - 1 || x === AP.W - 1;
    g.forEach((row, y) => [...row].forEach((ch, x) => {
      if (border(y, x)) assert.ok(ch === '.' || ch === 'K', who + '/' + pose + ' art at border ' + x + ',' + y);
    }));
  }));
});

test('anastasia wears a short cropped cut: no hair below the glasses row, ears visible', () => {
  const g = AP.compose('anastasia', 'idle');
  // head is stamped at y=1; row 7 of the head (grid y=8) is the ear/eye row.
  for (let y = 8; y < 20; y++) assert.ok(!/[Hhd]/.test(g[y]), 'hair below ear row at y=' + y);
  assert.equal(g[8][7 + 1], 's', 'left ear visible');
  assert.equal(g[8][7 + 14], 's', 'right ear visible');
});
