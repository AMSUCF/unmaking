'use strict';
// Just enough DOM for js/render/places.js under node: elements, classes, styles, tree edits, querySelector('.cls').
class El {
  constructor(tag) {
    this.tagName = String(tag).toUpperCase();
    this.children = [];
    this.parent = null;
    this.className = '';
    this.dataset = {};
    this.textContent = '';
    const props = {};
    this.style = new Proxy(props, {
      get: (t, k) => (k === 'setProperty' ? (n, v) => { t[n] = v; } : t[k] === undefined ? '' : t[k]),
      set: (t, k, v) => { t[k] = v; return true; },
    });
    const self = this;
    const list = () => self.className.split(/\s+/).filter(Boolean);
    this.classList = {
      contains: (c) => list().includes(c),
      add: (...cs) => { self.className = [...new Set([...list(), ...cs])].join(' '); },
      remove: (...cs) => { self.className = list().filter((c) => !cs.includes(c)).join(' '); },
      toggle: (c, force) => { const on = force === undefined ? !list().includes(c) : force; if (on) self.classList.add(c); else self.classList.remove(c); return on; },
    };
  }
  append(...ns) { ns.forEach((n) => { n.remove(); n.parent = this; this.children.push(n); }); }
  prepend(...ns) { ns.slice().reverse().forEach((n) => { n.remove(); n.parent = this; this.children.unshift(n); }); }
  remove() { if (this.parent) { this.parent.children = this.parent.children.filter((c) => c !== this); this.parent = null; } }
  replaceChildren(...ns) { this.children.forEach((c) => { c.parent = null; }); this.children = []; this.append(...ns); }
  animate() { return { finished: Promise.resolve(), cancel() {} }; }
  descendants() { return this.children.flatMap((c) => [c, ...c.descendants()]); }
  querySelector(sel) { const cls = sel.replace(/^\./, ''); return this.descendants().find((d) => d.classList.contains(cls)) || null; }
  querySelectorAll(sel) { const cls = sel.replace(/^\./, ''); return this.descendants().filter((d) => d.classList.contains(cls)); }
}

function install() {
  const byId = {};
  ['stage', 'backdrop', 'foreground', 'fx-layer'].forEach((id) => { byId[id] = new El('div'); byId[id].id = id; });
  global.document = { createElement: (t) => new El(t), getElementById: (id) => byId[id] || null };
  return byId;
}

module.exports = { El, install };
