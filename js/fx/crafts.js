/* Craft registry: each craft supplies a backdrop, a scene decorator, and named effects. */
const Crafts = (() => {
  const registry = {};
  const SVG_NS = 'http://www.w3.org/2000/svg';

  function register(craft, impl) {
    registry[craft] = Object.assign({ backdrop() {}, decorate() {}, fx: {} }, impl);
  }
  function decorate(craft, el, scene) {
    if (registry[craft]) registry[craft].decorate(el, scene);
  }
  function backdrop(craft, el) {
    el.replaceChildren();
    el.className = 'backdrop backdrop-' + craft;
    if (registry[craft]) registry[craft].backdrop(el);
  }
  async function runFx(craft, name, el, ctx) {
    const impl = registry[craft] && registry[craft].fx[name];
    if (!impl) { console.warn(`fx ${craft}/${name} is not implemented yet`); return; }
    await impl(el, ctx);
  }

  function anim(el, keyframes, opts = {}) {
    const a = el.animate(keyframes, Object.assign({ fill: 'both', easing: 'cubic-bezier(.2,.8,.2,1)' }, opts));
    return a.finished.catch(() => {});
  }
  const wait = (ms) => new Promise((r) => setTimeout(r, ms));
  const fxLayer = () => document.getElementById('fx-layer');
  function el(tag, cls, text) {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  }
  function svgEl(tag, attrs = {}) {
    const n = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
    return n;
  }

  // Optional per craft: animate from one place to the next. Both roots are in the backdrop; the new one is on top.
  async function placeTransition(craft, oldEl, newEl, ctx) {
    const t = registry[craft] && registry[craft].placeTransition;
    if (t) await t(oldEl, newEl, ctx || {});
  }

  return { register, decorate, backdrop, runFx, placeTransition, anim, wait, fxLayer, el, svgEl };
})();
