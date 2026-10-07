/* Place declarations: named, layered backgrounds per craft, and the geometry rules that keep them off the slide content. */
(function (root) {
  'use strict';
  const STAGE_W = 1280;
  const STAGE_H = 720;
  const LAYERS = ['sky', 'far', 'light', 'mid', 'egg', 'near', 'label', 'occluder'];
  const LOUD = ['mid', 'egg', 'near'];
  // [left, top, right, bottom]: where cards and media are laid out, per craft.
  const FRAMES = {
    paper: [220, 56, 1208, 648],
    textile: [220, 56, 1208, 648],
    zine: [220, 84, 1208, 648],
    game: [220, 64, 1200, 530],
  };
  const FLOOR_DEFAULT = { paper: 684, textile: 684, zine: 684, game: 570 };
  const HEAD_CLEAR = 120; // gutter pieces must end above this y, or start below the knees
  const decls = {};

  function register(craft, places) { decls[craft] = Object.assign(decls[craft] || {}, places); }
  function get(craft, id) { return (decls[craft] && decls[craft][id]) || null; }
  function ids(craft) { return Object.keys(decls[craft] || {}); }

  const overlaps = ([x, y, w, h], [l, t, r, b]) => x < r && x + w > l && y < b && y + h > t;

  function check(craft, id, d) {
    const errs = [];
    const fail = (m) => errs.push(`${craft}/${id}: ${m}`);
    const frame = FRAMES[craft];
    if (!frame) return [`${craft}/${id}: unknown craft`];
    if (!d || typeof d.label !== 'string' || !d.label) fail('label required');
    if (!d || typeof d.credit !== 'string') fail('credit must be a string (may be empty)');
    if (!d || !(d.floor >= 520 && d.floor <= 690)) fail(`floor ${d && d.floor} out of range 520-690`);
    const knee = (d && d.floor ? d.floor : FLOOR_DEFAULT[craft]) - 60;
    const pieces = (d && d.pieces) || [];
    pieces.forEach((p, i) => {
      const tag = `${p.cls || '?'}#${i}`;
      if (!LAYERS.includes(p.layer)) fail(`${tag}: unknown layer ${p.layer}`);
      const b = p.box || [];
      const [x, y, w, h] = b;
      if (b.length !== 4 || !b.every(Number.isFinite) || w <= 0 || h <= 0) { fail(`${tag}: bad box`); return; }
      if (x < 0 || y < 0 || x + w > STAGE_W || y + h > STAGE_H) fail(`${tag}: box leaves the stage`);
      const loud = LOUD.includes(p.layer) && !p.quiet;
      if (loud && overlaps(b, frame)) fail(`${tag}: covers the content frame`);
      if ((loud || p.layer === 'occluder') && x < frame[0] && y < knee && y + h > HEAD_CLEAR) fail(`${tag}: in the avatar gutter between head and knees`);
      if (p.layer === 'occluder' && y < knee) fail(`${tag}: occluder above knee height`);
    });
    if (craft !== 'game' && !pieces.some((p) => p.layer === 'label')) fail('needs a label piece');
    return errs;
  }

  function validateAll() {
    return Object.keys(decls).flatMap((craft) => ids(craft).flatMap((id) => check(craft, id, get(craft, id))));
  }

  const api = { LAYERS, FRAMES, FLOOR_DEFAULT, register, get, ids, check, validateAll };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.PlaceDecls = api;
})(globalThis);
