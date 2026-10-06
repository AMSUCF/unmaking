/* Runtime pixel-map avatars for both presenters, in the manner of
   HumanitiesAI/TeachingAI/js/avatar.js: hand-authored ASCII pixel maps (one
   letter per palette colour), a pose table for legs and arms, auto-outline,
   painted to a canvas. No generated images. Grid is 30x45; each cell is 4px
   (120x180 frame). The stitch skin turns every cell into one cross-stitch
   (240x360). compose() is pure and runs in node; canvas painting is DOM-only. */
(function (root) {
  'use strict';
  const W = 30, H = 45, CELL = 4;
  const HEAD_X = 7, HEAD_Y = 1, TORSO_Y = 16;

  const BASE = {
    T: '#4a5370', t: '#394060',            // slate-navy heathered tee
    L: '#c9ced6', l: '#ffffff',            // silver glitter loop
    S: '#f1c9a8', s: '#d9a78a',            // skin, skin shade
    E: '#2a2030', M: '#b5566a',            // eyes, mouth
    O: '#24242c', o: '#4a4a56',            // shoes
    K: '#14121c',                          // outline
  };
  const PALETTES = {
    emily: Object.assign({}, BASE, { H: '#b98a55', h: '#d6ae78', P: '#2b2b36', p: '#1e1e28' }),
    anastasia: Object.assign({}, BASE, { H: '#e0a63c', h: '#f2c869', G: '#6b4a2a', P: '#355b8c', p: '#284870' }),
  };

  // 16 wide, stamped at (HEAD_X, HEAD_Y). '.' shows what is behind (torso).
  const HEADS = {
    emily: [ // long honey hair with side-swept fringe, no glasses
      '....HHHHHHHH....',
      '..HHHHHHHHHHHH..',
      '.HHHHhhHHHHHHHH.',
      '.HHHHHHHHHHHHHH.',
      '.HHHHHHHHHHHHHH.',
      '.HHHSSSSSSSSHHH.',
      '.HHHSSSSSSSSHHH.',
      '.HHHSESSSSESHHH.',
      '.HHHSSSSSSSSHHH.',
      '.HHHSSSssSSSHHH.',
      '.HHHSSMMMMSSHHH.',
      '.HHHsSSSSSSsHHH.',
      '..HHHsSSSSsHHH..',
      '..HHHHssssHHHH..',
      '..HHHHssssHHHH..',
      '.HHHHHssssHHHHH.',
      '.HHH........HHH.',
      '.HHH........HHH.',
      '.hHH........HHh.',
      '..HH........HH..',
    ],
    anastasia: [ // short blond pixie cut, round brown glasses
      '....HHHhHHHH....',
      '..HHHhhHHHHHHH..',
      '.HHHHhHHHHHHHHH.',
      '.HHHHHHHHHHHHHH.',
      '.HHHHHHHHHHHHHH.',
      '.HHHHHSSSSSSSHH.',
      '.HHHSSSSSSSSHHH.',
      '..HHGGGSSGGGHH..',
      '...SGESSSSEGS...',
      '...SGGGSSGGGS...',
      '....SSSSSSSS....',
      '....SSMMMMSS....',
      '....sSSSSSSs....',
      '.....sSSSSs.....',
      '......ssss......',
    ],
  };

  // 16 wide, stamped at (HEAD_X, TORSO_Y): tee with the swooping silver loop.
  const TORSO = [
    '..TTTTTTTTTTTT..',
    '.TTTTTTTTTTTTTT.',
    '.TTTTTTTTTTTTTT.',
    '.TTTTLLLLLLTTTT.',
    '.TTTLLTTTTLLTTT.',
    '.TTLLTTlTTTLLTT.',
    '.TTLTTTTTTTTLTT.',
    '.TTLTTlLLTTTLTT.',
    '.TTLTTLLLLTTLTT.',
    '.TTLLTTTTTTLLTT.',
    '.TTTLLLLLLLLTTT.',
    '.TTTTTLLlLTTTTT.',
    '.TTTTTTTTTTTTTT.',
    '.tTTTTTTTTTTTTt.',
    '..tTTTTTTTTTTt..',
    '..tttttttttttt..',
  ];

  // [leftX, rightX, leftLift, rightLift, leftArmDy, rightArmDy, bob, rightArm]
  const POSES = {
    idle:  [0, 0, 0, 0, 0, 0, 0, 'down'],
    walk1: [-1, 1, 2, 0, 1, -1, 0, 'down'],
    walk2: [0, 0, 0, 0, 0, 0, 1, 'down'],
    walk3: [1, -1, 0, 2, -1, 1, 0, 'down'],
    walk4: [0, 0, 0, 0, 0, 0, 1, 'down'],
    talk:  [0, 0, 0, 0, 0, 0, 0, 'raised'],
    point: [0, 0, 0, 0, 0, 0, 0, 'point'],
  };

  function blank() { return Array.from({ length: H }, () => Array(W).fill('.')); }
  function put(g, x, y, ch) { if (x >= 0 && x < W && y >= 0 && y < H) g[y][x] = ch; }
  function rect(g, x, y, w, h, ch) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) put(g, x + i, y + j, ch); }
  function stamp(g, rows, x0, y0) {
    rows.forEach((row, r) => [...row].forEach((ch, c) => { if (ch !== '.') put(g, x0 + c, y0 + r, ch); }));
  }

  function leg(g, x0, lift, shade) {
    const bottom = 41 - lift;
    rect(g, x0, 34, 5, bottom - 33, 'P');
    rect(g, x0 + 4, 34, 1, bottom - 33, 'p');
    if (shade) rect(g, x0, 34, 1, bottom - 33, 'p');
    rect(g, x0 - 1, bottom + 1, 7, 2, 'O');
    put(g, x0, bottom + 1, 'o');
  }

  function armDown(g, x0, dy) {
    rect(g, x0, 17 + dy, 3, 4, 'T');
    rect(g, x0, 21 + dy, 3, 6, 'S');
    rect(g, x0 + (x0 < 10 ? 0 : 2), 21 + dy, 1, 6, 's');
    rect(g, x0, 27 + dy, 3, 2, 'S');
  }

  function compose(who, pose) {
    const [lx, rx, ll, rl, lad, rad, bob, right] = POSES[pose];
    const g = blank();
    rect(g, 9, 32, 12, 2, 'P');                       // hips
    leg(g, 9 + lx, ll, false);
    leg(g, 16 + rx, rl, true);
    stamp(g, TORSO, HEAD_X, TORSO_Y + bob);
    armDown(g, 5, lad);
    if (right === 'down') armDown(g, 22, rad);
    else if (right === 'raised') {                    // elbow out, forearm up, palm open
      rect(g, 22, 18, 6, 3, 'T');
      rect(g, 26, 12, 3, 6, 'S');
      rect(g, 25, 9, 4, 3, 'S');
    } else {                                          // pointing to the viewer's right
      rect(g, 22, 18, 3, 3, 'T');
      rect(g, 25, 19, 4, 2, 'S');
    }
    stamp(g, HEADS[who], HEAD_X, HEAD_Y + bob);
    // Auto-outline: empty cells touching art become outline.
    const filled = (y, x) => y >= 0 && y < H && x >= 0 && x < W && g[y][x] !== '.';
    const out = g.map((r) => r.slice());
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        if (g[y][x] === '.' && (filled(y - 1, x) || filled(y + 1, x) || filled(y, x - 1) || filled(y, x + 1))) out[y][x] = 'K';
      }
    }
    return out.map((r) => r.join(''));
  }

  // ---- DOM part ----
  const cache = {};
  function paint(who, pose, skin) {
    const pal = PALETTES[who];
    const grid = compose(who, pose);
    const scale = skin === 'stitch' ? CELL * 2 : CELL;
    const c = document.createElement('canvas');
    c.width = W * scale; c.height = H * scale;
    const ctx = c.getContext('2d');
    ctx.imageSmoothingEnabled = false;
    ctx.lineCap = 'round';
    grid.forEach((row, y) => [...row].forEach((ch, x) => {
      if (ch === '.') return;
      const px = x * scale, py = y * scale;
      if (skin !== 'stitch') { ctx.fillStyle = pal[ch]; ctx.fillRect(px, py, scale, scale); return; }
      // One cross-stitch per cell: a soft shadow X, then the thread X.
      const X = (ox, oy) => {
        ctx.beginPath();
        ctx.moveTo(px + 1 + ox, py + 1 + oy); ctx.lineTo(px + scale - 1 + ox, py + scale - 1 + oy);
        ctx.moveTo(px + scale - 1 + ox, py + 1 + oy); ctx.lineTo(px + 1 + ox, py + scale - 1 + oy);
        ctx.stroke();
      };
      ctx.strokeStyle = 'rgba(0,0,0,.3)'; ctx.lineWidth = 2.6; X(0.8, 0.8);
      ctx.strokeStyle = pal[ch]; ctx.lineWidth = 2.4; X(0, 0);
    }));
    return c;
  }

  function frame(who, pose, skin) {
    const key = who + '/' + pose + '/' + (skin || 'plain');
    return cache[key] || (cache[key] = paint(who, pose, skin || 'plain'));
  }
  function url(who, pose, skin) {
    const key = 'url/' + who + '/' + pose + '/' + (skin || 'plain');
    return cache[key] || (cache[key] = frame(who, pose, skin).toDataURL('image/png'));
  }

  const api = { W, H, CELL, POSES, PALETTES, compose, frame, url };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.AvatarPixels = api;
})(globalThis);
