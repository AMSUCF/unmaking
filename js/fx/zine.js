/* ACT III — E-ZINE craft: ransom headings, xerox scans, sticker slaps, misregistration. */
(function () {
  'use strict';
  const { anim, fxLayer, el } = Crafts;
  const TICKER = '*** WHO OWNS WHAT WE MAKE? *** VIEW SOURCE *** COPY THIS ZINE *** NO LOGIN REQUIRED *** BEST VIEWED WITH YOUR OWN EYES *** ';
  const ZINE_FILTER = 'grayscale(1) contrast(1.7) brightness(1.08)';

  Crafts.register('zine', {
    backdrop(bg) {
      bg.append(el('div', 'page'), el('div', 'staple s1'), el('div', 'staple s2'));
      const ticker = el('div', 'ticker');
      ticker.append(el('span', '', TICKER.repeat(3)));
      bg.append(ticker, el('div', 'counter', 'VISITORS: 000000'));
    },

    decorate(root, scene) {
      const seed = Random.hashString(scene.id);
      const rnd = Random.mulberry32(seed);
      root.querySelectorAll('.heading').forEach((h) => {
        const label = h.textContent;
        const box = el('span', 'ransom');
        box.setAttribute('aria-hidden', 'true');
        CraftShapes.ransomLetters(label, seed).forEach((l) => {
          const s = el('span', l.space ? 'space' : `${l.font} k-${l.skin}`, l.ch);
          if (!l.space) { s.style.setProperty('--r', l.rotate + 'deg'); s.style.setProperty('--s', l.scale); }
          box.append(s);
        });
        h.setAttribute('aria-label', label);
        h.replaceChildren(box);
      });
      const wrap = root.querySelector('.card-wrap');
      if (wrap) wrap.style.setProperty('--tilt', ((rnd() - 0.5) * 3).toFixed(2) + 'deg');
      root.querySelectorAll('.media').forEach((m) => m.style.setProperty('--tilt', ((rnd() - 0.5) * 5).toFixed(2) + 'deg'));
      const counter = document.querySelector('.backdrop-zine .counter');
      if (counter) counter.textContent = 'VISITORS: ' + String(seed % 1000000).padStart(6, '0');
    },

    fx: {
      'xerox-scan': async (root) => {
        const bar = el('div', 'scan-bar');
        fxLayer().append(bar);
        await Promise.all([
          anim(bar, [{ transform: 'translateY(-50px)' }, { transform: 'translateY(740px)' }], { duration: 1100, easing: 'linear' }),
          anim(root, [{ clipPath: 'inset(0 0 100% 0)' }, { clipPath: 'inset(0 0 0% 0)' }], { duration: 1100, easing: 'linear' }),
        ]);
        bar.remove();
      },

      'ransom-shuffle': async (root, { scene }) => {
        const rnd = Random.mulberry32(Random.hashString(scene.id) + 1);
        const letters = [...root.querySelectorAll('.ransom span:not(.space)')];
        await Promise.all(letters.map((s, i) => anim(s, [
          { translate: `0 ${-260 - rnd() * 200}px`, rotate: `${(rnd() - 0.5) * 180}deg`, opacity: 0 },
          { translate: '0 0', rotate: '0deg', opacity: 1 },
        ], { duration: 520, delay: i * 35, easing: 'cubic-bezier(.3,1.4,.5,1)' })));
      },

      'sticker-slap': async (root) => {
        const items = [...root.querySelectorAll('.card-wrap, .media')];
        for (const [i, it] of items.entries()) {
          anim(it, [
            { scale: 1.5, rotate: '-10deg', opacity: 0 },
            { scale: 0.96, rotate: '1deg', opacity: 1, offset: 0.7 },
            { scale: 1, rotate: '0deg', opacity: 1 },
          ], { duration: 450, delay: i * 140, easing: 'cubic-bezier(.2,.9,.3,1.2)' });
        }
        await Crafts.wait(450 + items.length * 140);
      },

      'misregister': async (root) => {
        const targets = [...root.querySelectorAll('.media img, .heading, blockquote')];
        await Promise.all(targets.map((t) => {
          const base = t.tagName === 'IMG' ? ZINE_FILTER + ' ' : '';
          return anim(t, [
            { filter: `${base}drop-shadow(7px 0 0 #ff2bd6) drop-shadow(-7px 0 0 #22e0ff)` },
            { filter: `${base}drop-shadow(-3px 2px 0 #ff2bd6) drop-shadow(3px -2px 0 #22e0ff)` },
            { filter: `${base}drop-shadow(2px -1px 0 #ff2bd6) drop-shadow(-2px 1px 0 #22e0ff)` },
            { filter: `${base}drop-shadow(0 0 0 #ff2bd6) drop-shadow(0 0 0 #22e0ff)` },
          ], { duration: 900, easing: 'steps(4)', fill: 'none' });
        }));
      },
    },
  });
})();
