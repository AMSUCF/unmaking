/* Validates scene data and assembles the four acts into one deck. */
(function (root) {
  'use strict';
  const Acts = (typeof module === 'object' && module.exports) ? require('./acts.js') : root.Acts;
  const { ACTS, LAYOUTS, POSES, GAME_ROOMS, FX_NAMES, LIMITS, STAGE } = Acts;

  function validateScene(scene, act) {
    if (!scene || typeof scene !== 'object') return ['(scene): not an object'];
    const errs = [];
    const fail = (msg) => errs.push(`${scene.id || '(no id)'}: ${msg}`);
    const len = (s) => (typeof s === 'string' ? s.length : 0);

    if (!/^a[1-4]-[a-z0-9-]+$/.test(scene.id || '')) fail('id must match a<act>-slug');
    else if (!scene.id.startsWith(`a${act.n}-`)) fail('id prefix does not match its act');
    if (scene.act !== act.n) fail(`act ${scene.act} does not match act ${act.n}`);
    if (!(typeof scene.minutes === 'number' && scene.minutes > 0 && scene.minutes <= 4)) fail('minutes must be a number in (0, 4]');
    if (!LAYOUTS.includes(scene.layout)) fail(`unknown layout "${scene.layout}"`);
    if (typeof scene.notes !== 'string' || !scene.notes.trim()) fail('notes are required');
    if (len(scene.heading) > LIMITS.heading) fail(`heading is ${len(scene.heading)} chars (max ${LIMITS.heading})`);
    if (len(scene.say) > LIMITS.say) fail(`say is ${len(scene.say)} chars (max ${LIMITS.say})`);

    const media = scene.media || [];
    media.forEach((m, i) => {
      if (!m || !m.src) fail(`media[${i}] missing src`);
      if (!m || typeof m.alt !== 'string' || !m.alt.trim()) fail(`media[${i}] missing alt`);
    });

    const textMax = scene.layout === 'quote' ? LIMITS.quote : LIMITS.statement;
    if (len(scene.text) > textMax) fail(`text is ${len(scene.text)} chars (max ${textMax})`);

    switch (scene.layout) {
      case 'title':
        if (!scene.heading) fail('title needs heading');
        break;
      case 'statement':
        if (!scene.text && !scene.heading) fail('statement needs text or heading');
        break;
      case 'quote':
        if (!scene.text) fail('quote needs text');
        if (!scene.source) fail('quote needs source');
        if (media.length > 1) fail('quote takes at most one media item');
        break;
      case 'image':
        if (media.length !== 1) fail('image layout needs exactly one media item');
        break;
      case 'gallery':
        if (media.length < 2 || media.length > 4) fail('gallery needs 2-4 media items');
        break;
      case 'video':
        if (media.length !== 1 || !/\.mp4$/i.test(media[0].src || '')) fail('video needs exactly one .mp4');
        break;
      case 'choice':
        if (!Array.isArray(scene.choices) || scene.choices.length < 2 || scene.choices.length > 6) fail('choice needs 2-6 choices');
        break;
      case 'credits':
        if (!Array.isArray(scene.lines) || !scene.lines.length) fail('credits needs lines');
        break;
      case 'handoff': {
        const next = ACTS[act.n]; // ACTS is 0-indexed, so this is act n+1
        if (!next) fail('the last act cannot have a handoff');
        else if (scene.to !== next.craft) fail(`handoff "to" must be the next act craft (${next.craft})`);
        break;
      }
    }

    const allowed = scene.layout === 'handoff' ? FX_NAMES.handoff : FX_NAMES[act.craft];
    (scene.fx || []).forEach((name) => {
      if (!allowed.includes(name)) fail(`fx "${name}" not available for ${scene.layout === 'handoff' ? 'handoff' : act.craft}`);
    });

    if (scene.avatar !== undefined && scene.avatar !== false) {
      const a = scene.avatar;
      if (!a || !POSES.includes(a.pose)) fail('avatar.pose invalid');
      if (!a || typeof a.x !== 'number' || a.x < 0 || a.x > STAGE.width - STAGE.avatarWidth) fail('avatar.x out of stage');
    }

    if (act.craft === 'game') {
      if (scene.room !== undefined && !GAME_ROOMS.includes(scene.room)) fail(`room must be one of ${GAME_ROOMS.join(', ')}`);
      if (scene.agency !== undefined && !(Number.isInteger(scene.agency) && scene.agency >= 0 && scene.agency <= 5)) fail('agency must be an integer 0-5');
    }
    return errs;
  }

  function buildDeck(sceneLists) {
    const scenes = [];
    const errors = [];
    const seen = new Set();
    if (sceneLists.length !== ACTS.length) errors.push(`expected ${ACTS.length} acts, got ${sceneLists.length}`);
    sceneLists.forEach((list, i) => {
      const act = ACTS[i];
      if (!act) return;
      if (!Array.isArray(list) || !list.length) { errors.push(`act ${act.n}: no scenes`); return; }
      list.forEach((scene) => {
        errors.push(...validateScene(scene, act));
        if (scene && scene.id) {
          if (seen.has(scene.id)) errors.push(`${scene.id}: duplicate id`);
          seen.add(scene.id);
        }
        scenes.push(scene);
      });
      const last = list[list.length - 1];
      const wanted = act.n < ACTS.length ? 'handoff' : 'credits';
      if (!last || last.layout !== wanted) errors.push(`act ${act.n}: last scene must be ${wanted === 'handoff' ? 'a handoff' : 'credits'}`);
    });
    return { scenes, errors };
  }

  function actMinutes(scenes) {
    const out = {};
    scenes.forEach((s) => { out[s.act] = (out[s.act] || 0) + s.minutes; });
    return out;
  }

  function mediaPaths(scenes) {
    const set = new Set();
    scenes.forEach((s) => (s.media || []).forEach((m) => set.add(m.src)));
    return [...set];
  }

  const api = { validateScene, buildDeck, actMinutes, mediaPaths };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Deck = api;
})(globalThis);
