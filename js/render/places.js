/* Builds named places into #backdrop: layered planes, seeded parallax, the avatar floor line, and craft place transitions. */
(function (root) {
  'use strict';
  const PLANES = ['sky', 'far', 'light', 'mid', 'egg', 'near', 'label'];
  const DRIFT = { sky: 0, far: 2, light: 0, mid: 5, egg: 5, near: 9, label: 0 };
  const g = globalThis;
  let current = null; // { craft, id, decl, root, planes }
  let live = [];      // every place root still in the backdrop
  let epoch = 0;      // bumped by every go()/reset(), so a stale transition never cleans up a newer place

  const $ = (id) => document.getElementById(id);
  const reducedMotion = () => typeof g.matchMedia === 'function' && g.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function build(craft, id, decl) {
    const mk = (cls) => { const n = document.createElement('div'); n.className = cls; return n; };
    const rootEl = mk(`place place-${craft} place-${id}`);
    rootEl.dataset.place = id;
    const planes = {};
    PLANES.forEach((name) => { planes[name] = mk('plane plane-' + name); rootEl.append(planes[name]); });
    const occluders = [];
    decl.pieces.forEach((p) => {
      const n = mk('piece ' + p.cls);
      const [x, y, w, h] = p.box;
      n.style.left = x + 'px';
      n.style.top = y + 'px';
      n.style.width = w + 'px';
      n.style.height = h + 'px';
      if (p.text) n.textContent = p.text;
      if (p.layer === 'occluder') occluders.push(n);
      else planes[p.layer].append(n);
    });
    return { root: rootEl, planes, occluders };
  }

  function mount(craft, id) {
    const decl = g.PlaceDecls.get(craft, id);
    const host = $('backdrop');
    const built = build(craft, id, decl);
    host.prepend(built.root); // below the craft's chrome (HUD, quilt border, ticker)
    live.push(built.root);
    const fg = $('foreground');
    if (fg) fg.replaceChildren(...built.occluders);
    const stage = $('stage');
    if (stage) stage.style.setProperty('--floor', decl.floor + 'px');
    const hud = host.querySelector('.room-name');
    if (hud) hud.textContent = decl.label;
    if (decl.sky && g.PixelSky) g.PixelSky.mount(built.planes.sky, decl.sky, reducedMotion());
    current = { craft, id, decl, root: built.root, planes: built.planes };
    return current;
  }

  function sweep(keep) {
    live.filter((r) => r !== keep).forEach((r) => r.remove());
    live = keep ? [keep] : [];
  }

  async function go(craft, id, { animate = false, ctx = {}, onChange } = {}) {
    if (!g.PlaceDecls.get(craft, id)) return false;
    if (current && current.craft === craft && current.id === id) return false;
    const mine = ++epoch;
    const old = current && current.craft === craft ? current : null;
    if (!animate || !old) { sweep(null); mount(craft, id); return true; }
    if (onChange) onChange();
    const next = mount(craft, id);
    next.root.style.zIndex = '1';
    await g.Crafts.placeTransition(craft, old.root, next.root, ctx);
    if (mine !== epoch) return true; // a newer go() or reset() owns the backdrop now
    next.root.style.zIndex = '';
    sweep(next.root);
    return true;
  }

  function nudge(sceneId) {
    if (!current || reducedMotion()) return;
    const h = g.Random.hashString(sceneId);
    PLANES.forEach((name, i) => {
      const a = DRIFT[name];
      const dx = a ? ((h >>> (i * 4)) % (2 * a + 1)) - a : 0;
      current.planes[name].style.transform = dx ? `translateX(${dx}px)` : '';
    });
  }

  function reset(craft) {
    epoch++;
    current = null;
    live = [];
    const fg = $('foreground');
    if (fg) fg.replaceChildren();
    const stage = $('stage');
    if (stage) stage.style.setProperty('--floor', (g.PlaceDecls.FLOOR_DEFAULT[craft] || 684) + 'px');
    if (g.PixelSky) g.PixelSky.stop();
  }

  function currentPlace() {
    return current ? { craft: current.craft, id: current.id, label: current.decl.label, credit: current.decl.credit } : null;
  }

  const api = { PLANES, DRIFT, build, go, nudge, reset, current: currentPlace };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Places = api;
})(globalThis);
