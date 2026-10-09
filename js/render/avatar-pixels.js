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
    X: '#c3cad6', x: '#7d8696',            // steel (scissor blades)
    R: '#c0392b',                          // red scissor handles
    Y: '#e8c34a', y: '#8a6a1a',            // wooden ruler, tick marks
    B: '#2f6fd1', b: '#1f4e9a', W: '#f4f4f4', // marker body, shade, white cap band
    V: '#9b6ad8',                          // purple thread
    C: '#3a3a48', c: '#5a5a6a',            // game controller body, highlight
  };
  const PALETTES = {
    emily: Object.assign({}, BASE, { H: '#b98a55', h: '#d6ae78', P: '#2b2b36', p: '#1e1e28', T: '#5e1f3d', t: '#47162e' }), // plum tee
    anastasia: Object.assign({}, BASE, { H: '#e0a63c', h: '#f2c869', d: '#b47a26', G: '#7a5532', P: '#355b8c', p: '#284870' }),
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
    anastasia: [ // short blond side-swept quiff with darker streaks, cropped sides, ears, round brown glasses
      '....HhhhhHHH....',
      '...HHHHdHHHdHH..',
      '..HHHHdHHHdHHH..',
      '..HHHdHHHdHHHH..',
      '..HHSSSSSSSdHH..',
      '..HSSSSSSSSSSH..',
      '..SSGGSSSSGGSS..',
      '.sSGESGGGGSEGSs.',
      '..SSGGSSSSGGSS..',
      '..SSSSSssSSSSS..',
      '..SSSSSSSSSSSS..',
      '..sSSSMMMMSSSs..',
      '...sSSSSSSSSs...',
      '....sSSSSSSs....',
      '......ssss......',
    ],
  };

  // 16 wide, stamped at (HEAD_X, TORSO_Y): each presenter's human-in-the-loop tee.
  const TORSOS = {
    anastasia: [
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
    ],
    emily: [ // silver ring around three lines of lettering, with a trailing swoosh
      '..TTTTTTTTTTTT..',
      '.TTTTTTTTTTTTTT.',
      '.TTTTLLLLLLTTTT.',
      '.TTTLTTTTTTLTTT.',
      '.TTLTlLLlLLTLTT.',
      '.TTLTTTTTTTTLTT.',
      '.TTLTLLTLLlTLTT.',
      '.TTLTTTTTTTTLTT.',
      '.TTLTTLlLLTTLTT.',
      '.TTTLTTTTTTLTTT.',
      '.TTTTLLLLLLLTTT.',
      '.TTTTTTTTTTTLTT.',
      '.TTTTTTTTTTTTTT.',
      '.tTTTTTTTTTTTTt.',
      '..tTTTTTTTTTTt..',
      '..tttttttttttt..',
    ],
  };

  // [leftX, rightX, leftLift, rightLift, leftArmDy, rightArmDy, bob, rightArm]
  const POSES = {
    idle:  [0, 0, 0, 0, 0, 0, 0, 'down'],
    walk1: [-1, 1, 2, 0, 1, -1, 0, 'down'],
    walk2: [0, 0, 0, 0, 0, 0, 1, 'down'],
    walk3: [1, -1, 0, 2, -1, 1, 0, 'down'],
    walk4: [0, 0, 0, 0, 0, 0, 1, 'down'],
    talk:  [0, 0, 0, 0, 0, 0, 0, 'raised'],
    wave:  [0, 0, 0, 0, 0, 0, 0, 'wave'],
    scissors: [0, 0, 0, 0, 0, 0, 0, 'scissors'],
    ruler:    [0, 0, 0, 0, 0, 0, 0, 'ruler'],
    marker:   [0, 0, 0, 0, 0, 0, 0, 'marker'],
    needle:   [0, 0, 0, 0, 0, 0, 0, 'needle'],
    controller: [0, 0, 0, 0, 0, 0, 0, 'controller'],
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
    stamp(g, TORSOS[who], HEAD_X, TORSO_Y + bob);
    armDown(g, 5, lad);
    if (right === 'down') armDown(g, 22, rad);
    else if (right === 'raised' || right === 'wave') { // a wave: arm up and away from the head, open hand above it
      const tilt = right === 'wave' ? 1 : 0;           // second frame: hand swings out, fingers splay
      rect(g, 22, 17, 3, 3, 'T');                      // sleeve at the shoulder
      rect(g, 24, 15, 2, 3, 'T');
      rect(g, 25, 11, 2, 4, 'S');                      // forearm angled up and out
      rect(g, 25 + tilt, 7, 3, 4, 'S');                // palm
      put(g, 24 + tilt, 9, 'S');                       // thumb
      rect(g, 25 + tilt, 4 + tilt, 1, 3 - tilt, 'S');  // three spread fingers
      rect(g, 27 + tilt, 4 + tilt, 1, 3 - tilt, 'S');
      if (!tilt) rect(g, 26, 5, 1, 2, 'S');
      else put(g, 28, 5, 'S');
    } else if (['scissors', 'ruler', 'marker', 'needle', 'controller'].includes(right)) { // holding a tool up, fist above the shoulder
      rect(g, 22, 17, 3, 3, 'T');
      rect(g, 24, 15, 2, 3, 'T');
      rect(g, 25, 12, 2, 3, 'S');                      // forearm
      if (right === 'scissors') {
        rect(g, 23, 8, 2, 2, 'R'); rect(g, 28, 8, 1, 2, 'R');   // handle loops either side of the fist
        put(g, 27, 8, 'R');
        [[25, 7], [26, 6], [27, 5], [27, 4], [28, 3], [28, 2], [28, 1]].forEach(([x, y]) => put(g, x, y, 'X')); // blades cross
        [[27, 7], [25, 5], [25, 4], [24, 3], [24, 2], [24, 1]].forEach(([x, y]) => put(g, x, y, 'X'));          // at the pivot
        put(g, 26, 6, 'x');                                     // pivot screw
      } else if (right === 'ruler') {
        rect(g, 26, 1, 2, 10, 'Y');                             // long ruler, end of it in the fist
        for (let y = 2; y <= 8; y += 2) put(g, 26, y, 'y');     // tick marks
        put(g, 27, 5, 'y');
      } else if (right === 'needle') {
        rect(g, 26, 1, 1, 8, 'X');                              // needle, point down into the fist
        put(g, 26, 2, 'x');                                     // eye
        [[25, 2], [24, 3], [24, 4], [24, 5], [23, 6], [23, 7], [24, 8]].forEach(([x, y]) => put(g, x, y, 'V')); // thread trailing from the eye
      } else if (right === 'controller') {
        rect(g, 23, 5, 6, 4, 'C');                              // game controller held up
        rect(g, 23, 5, 6, 1, 'c');
        put(g, 23, 9, 'C'); put(g, 28, 9, 'C');                 // grips
        put(g, 24, 6, 'W'); put(g, 24, 7, 'W'); put(g, 23, 7, 'W'); put(g, 25, 7, 'W'); // d-pad
        put(g, 27, 6, 'R'); put(g, 28, 7, 'Y');                 // buttons
      } else {
        rect(g, 26, 3, 2, 6, 'B');                              // marker body
        rect(g, 27, 3, 1, 6, 'b');
        rect(g, 26, 5, 2, 1, 'W');                              // cap band
        put(g, 26, 2, 'E'); put(g, 27, 2, 'E');                 // felt tip
      }
      rect(g, 25, 9, 3, 3, 'S');                               // fist closed around the tool
      put(g, 25, 11, 's'); put(g, 27, 9, 's');
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
