/* Workshop site behaviour: the deck's pixel avatars as guides, walking guides on
   the hub, copy buttons on code, ransom-note headings, and the Act II Tracery
   playground. Plain script, no modules, so every page works from file://. */
(function () {
  'use strict';
  const AP = typeof AvatarPixels !== 'undefined' ? AvatarPixels : null;

  // A guide is <div class="guide" data-who="emily|anastasia" data-pose="talk">.
  // Inside a textile section the avatar is cross-stitched, as in the deck.
  function paintGuides() {
    if (!AP) return;
    document.querySelectorAll('.guide[data-who]').forEach((el) => {
      const craft = el.closest('[data-craft]');
      const skin = craft && craft.dataset.craft === 'textile' ? 'stitch' : 'plain';
      let img = el.querySelector('img');
      if (!img) { img = new Image(); img.alt = ''; el.append(img); }
      img.src = AP.url(el.dataset.who, el.dataset.pose || 'idle', skin);
      el.dataset.skin = skin;
    });
  }

  // Hub: the two presenters walk the floor, pause, and turn around.
  function walkers() {
    const floor = document.querySelector('.floor');
    if (!AP || !floor) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    floor.querySelectorAll('.walker').forEach((el, i) => {
      const guide = el.querySelector('.guide');
      const img = guide.querySelector('img');
      const who = guide.dataset.who;
      const frames = ['walk1', 'walk2', 'walk3', 'walk4'];
      let x = i ? 0.62 : 0.18, dir = i ? -1 : 1, f = 0, pause = 0;
      const place = () => { el.style.left = `calc(${(x * 100).toFixed(2)}% - 60px)`; el.classList.toggle('flip', dir < 0); };
      place();
      if (still) return;
      setInterval(() => {
        if (pause > 0) { pause--; img.src = AP.url(who, pause > 6 ? 'talk' : 'idle'); return; }
        x += dir * 0.006;
        if (x > 0.9 || x < 0.08) { dir = -dir; pause = 14; }
        else if (Math.random() < 0.01) pause = 18;
        img.src = AP.url(who, frames[f++ % 4]);
        place();
      }, 140);
    });
  }

  function copyButtons() {
    document.querySelectorAll('pre > code').forEach((code) => {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'copy';
      b.textContent = 'COPY';
      b.addEventListener('click', () => {
        const done = () => { b.textContent = 'COPIED'; setTimeout(() => { b.textContent = 'COPY'; }, 1400); };
        if (navigator.clipboard) navigator.clipboard.writeText(code.innerText).then(done, () => { b.textContent = 'SELECT + CTRL-C'; });
        else b.textContent = 'SELECT + CTRL-C';
      });
      code.parentElement.append(b);
    });
  }

  // Zine headings: each letter cut from a different magazine. Seeded so it stays put.
  function ransom() {
    let seed = 7;
    const rand = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const fonts = ['r-mono', 'r-type', 'r-hand', 'r-pixel', 'r-serif', 'r-courier'];
    const kinds = ['k-paper', 'k-ink', 'k-yellow', 'k-pink', 'k-lime'];
    document.querySelectorAll('.ransom-me').forEach((el) => {
      const text = el.textContent;
      el.setAttribute('aria-label', text);
      el.textContent = '';
      const box = document.createElement('span');
      box.className = 'ransom';
      box.setAttribute('aria-hidden', 'true');
      [...text].forEach((ch) => {
        const s = document.createElement('span');
        if (ch === ' ') s.className = 'space';
        else {
          s.className = fonts[Math.floor(rand() * fonts.length)] + ' ' + kinds[Math.floor(rand() * kinds.length)];
          s.style.setProperty('--r', ((rand() - 0.5) * 10).toFixed(1) + 'deg');
          s.textContent = ch;
        }
        box.append(s);
      });
      el.append(box);
    });
  }

  // Act II: <div class="play"> with a textarea, an .out, a .status and buttons.
  // Example grammars live in <script type="application/json" data-example="name">.
  function playgrounds() {
    if (typeof tracery === 'undefined') return;
    document.querySelectorAll('.play').forEach((play) => {
      const box = play.querySelector('textarea');
      const out = play.querySelector('.out');
      const status = play.querySelector('.status');
      const examples = {};
      document.querySelectorAll('script[data-example]').forEach((s) => { examples[s.dataset.example] = s.textContent.trim(); });
      const run = () => {
        let raw;
        try { raw = JSON.parse(box.value); } catch (e) { status.textContent = 'JSON problem: ' + e.message + '. Check the commas and quotes near there.'; return; }
        if (!raw.origin) { status.textContent = 'Every grammar needs an "origin" rule: that is where Tracery starts.'; return; }
        const grammar = tracery.createGrammar(raw);
        grammar.addModifiers(tracery.baseEngModifiers);
        const missing = Object.keys(raw).length ? findMissing(raw) : [];
        status.textContent = missing.length ? 'No rule named ' + missing.map((m) => '"' + m + '"').join(', ') + ' (the output shows ((' + missing[0] + ')) where it is used).' : '';
        out.textContent = grammar.flatten('#origin#');
      };
      play.querySelectorAll('[data-load]').forEach((b) => b.addEventListener('click', () => {
        box.value = examples[b.dataset.load];
        run();
      }));
      play.querySelector('[data-run]').addEventListener('click', run);
      box.addEventListener('input', () => { clearTimeout(box.t); box.t = setTimeout(run, 500); });
      const first = play.querySelector('[data-load]');
      if (!box.value.trim() && first) box.value = examples[first.dataset.load];
      run();
    });
  }

  // Symbols used in rules but never defined (ignoring modifiers and saved actions).
  function findMissing(raw) {
    const defined = new Set(Object.keys(raw));
    const saved = new Set();
    const used = new Set();
    Object.values(raw).flat().forEach((rule) => {
      String(rule).replace(/\[([A-Za-z0-9_]+):/g, (m, k) => { saved.add(k); return m; });
      String(rule).replace(/#(?:\[[^\]]*\])*([A-Za-z0-9_]+)(?:\.[A-Za-z.]+)?#/g, (m, k) => { used.add(k); return m; });
    });
    return [...used].filter((k) => !defined.has(k) && !saved.has(k));
  }

  document.addEventListener('DOMContentLoaded', () => {
    paintGuides();
    walkers();
    copyButtons();
    ransom();
    playgrounds();
  });
})();
