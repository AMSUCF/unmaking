/* ACT I — PAPER craft: backdrop, torn cards with washi tape, pop-up effects. */
(function () {
  'use strict';
  const { anim, wait, fxLayer, el, svgEl } = Crafts;
  const seedOf = (scene) => Random.hashString(scene.id);
  const wrapOf = (root) => root.querySelector('.card-wrap');

  Crafts.register('paper', {
    backdrop(bg) {
      const rnd = Random.mulberry32(7);
      bg.append(el('div', 'paper-sun'));
      ['h3', 'h2', 'h1'].forEach((h) => bg.append(el('div', 'hill ' + h)));
      for (let i = 0; i < 9; i++) {
        const s = el('div', 'scrap');
        s.style.left = (rnd() * 100).toFixed(1) + '%';
        s.style.top = (rnd() * 55).toFixed(1) + '%';
        s.style.setProperty('--spin', (20 + rnd() * 40).toFixed(0) + 's');
        s.style.setProperty('--hue', Math.floor(rnd() * 5));
        bg.append(s);
      }
    },

    decorate(root, scene) {
      const rnd = Random.mulberry32(seedOf(scene));
      const wrap = wrapOf(root);
      if (wrap) {
        wrap.querySelector('.card').style.clipPath = CraftShapes.tornEdgePolygon(seedOf(scene));
        wrap.style.setProperty('--tilt', ((rnd() - 0.5) * 3).toFixed(2) + 'deg');
        wrap.append(el('div', 'tape left'));
        if (rnd() > 0.5) wrap.append(el('div', 'tape right'));
      }
      root.querySelectorAll('.media').forEach((m) => m.style.setProperty('--tilt', ((rnd() - 0.5) * 4).toFixed(2) + 'deg'));
    },

    fx: {
      'popup-rise': async (root) => {
        root.style.perspective = '1100px';
        const parts = [...root.children].filter((c) => !c.classList.contains('draft-flag'));
        await Promise.all(parts.map((p, i) => anim(p, [
          { transform: 'rotateX(-92deg)', transformOrigin: '50% 100%', opacity: 0 },
          { transform: 'rotateX(10deg)', transformOrigin: '50% 100%', opacity: 1, offset: 0.7 },
          { transform: 'rotateX(0deg)', transformOrigin: '50% 100%', opacity: 1 },
        ], { duration: 900, delay: i * 160 })));
      },

      'fold-in': async (root) => {
        const parts = [...root.children].filter((c) => !c.classList.contains('draft-flag'));
        await Promise.all(parts.map((p, i) => anim(p, [
          { transform: 'perspective(900px) rotateY(88deg)', transformOrigin: '0 50%', opacity: 0 },
          { transform: 'perspective(900px) rotateY(-10deg)', transformOrigin: '0 50%', opacity: 1, offset: 0.75 },
          { transform: 'perspective(900px) rotateY(0deg)', transformOrigin: '0 50%', opacity: 1 },
        ], { duration: 800, delay: i * 140 })));
      },

      'paper-tear': async (root, { scene }) => {
        const { left, right } = CraftShapes.tornSplit(seedOf(scene));
        const l = el('div', 'tear-half');
        const r = el('div', 'tear-half');
        l.style.clipPath = left;
        r.style.clipPath = right;
        fxLayer().append(l, r);
        await wait(120);
        const ease = { duration: 950, easing: 'cubic-bezier(.6,0,.4,1)' };
        await Promise.all([
          anim(l, [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(-72%) rotate(-8deg)' }], ease),
          anim(r, [{ transform: 'translateX(0) rotate(0)' }, { transform: 'translateX(72%) rotate(8deg)' }], ease),
        ]);
        l.remove();
        r.remove();
      },

      'cut-out': async (root) => {
        const wrap = wrapOf(root);
        if (!wrap) return;
        const w = wrap.offsetWidth;
        const h = wrap.offsetHeight;
        const svg = svgEl('svg', { class: 'cut-line', width: w + 24, height: h + 24, viewBox: `0 0 ${w + 24} ${h + 24}` });
        svg.append(svgEl('rect', { x: 4, y: 4, width: w + 16, height: h + 16, rx: 6 }));
        const sc = el('div', 'scissors', '✂');
        wrap.append(svg, sc);
        await anim(sc, [{ transform: 'translateX(0)' }, { transform: `translateX(${w + 20}px)` }], { duration: 900, easing: 'linear' });
        sc.remove();
        await Promise.all([
          anim(wrap, [{ translate: '0 0' }, { translate: '0 -10px' }], { duration: 350 }),
          anim(svg, [{ opacity: 1 }, { opacity: 0 }], { duration: 350 }),
        ]);
        svg.remove();
      },

      'page-turn': async () => {
        const page = el('div', 'turn-page');
        fxLayer().append(page);
        await anim(page, [{ transform: 'perspective(1600px) rotateY(0deg)' }, { transform: 'perspective(1600px) rotateY(-180deg)' }],
          { duration: 900, easing: 'cubic-bezier(.45,0,.3,1)' });
        page.remove();
      },
    },
  });
})();
