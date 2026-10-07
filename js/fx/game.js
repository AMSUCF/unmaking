/* ACT IV — INDIE GAME craft: rooms, HUD agency meter, iris, pixel dissolve, choice menus. */
(function () {
  'use strict';
  const { anim, wait, fxLayer, el } = Crafts;
  Crafts.register('game', {
    backdrop(bg) {
      const bar = el('div', 'hudbar');
      bar.append(el('span', 'room-name', ''), el('span', 'agency', 'AGENCY ▯▯▯▯▯'));
      bg.append(bar);
    },

    decorate(root, scene) {
      const meter = document.querySelector('.backdrop-game .agency');
      if (meter && typeof scene.agency === 'number') {
        meter.textContent = 'AGENCY ' + '▮'.repeat(scene.agency) + '▯'.repeat(5 - scene.agency);
      }
    },

    // Leave by the right edge, iris to black, swap rooms, and come back in from the left.
    async placeTransition(oldEl, newEl, ctx) {
      newEl.style.visibility = 'hidden';
      const { Avatar, lead } = ctx;
      if (Avatar && lead && Avatar.isVisible(lead)) await Avatar.walkTo(lead, 1320);
      const iris = el('div', 'iris-wipe');
      fxLayer().append(iris);
      await anim(iris, [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(75% at 50% 50%)' }], { duration: 380, easing: 'steps(8)' });
      oldEl.style.visibility = 'hidden';
      newEl.style.visibility = '';
      if (Avatar && lead) Avatar.place(lead, -160);
      await anim(iris, [{ clipPath: 'circle(75% at 50% 50%)' }, { clipPath: 'circle(0% at 50% 50%)' }], { duration: 380, easing: 'steps(8)' });
      iris.remove();
    },

    fx: {
      'iris-in': async () => {
        const content = document.getElementById('content');
        await anim(content, [{ clipPath: 'circle(0% at 50% 50%)' }, { clipPath: 'circle(80% at 50% 50%)' }],
          { duration: 900, easing: 'steps(12)', fill: 'none' });
      },

      'pixel-dissolve': async (root, { scene }) => {
        const grid = el('div', 'pixel-grid');
        const n = 32 * 18;
        const tiles = [];
        for (let i = 0; i < n; i++) { const t = el('i'); grid.append(t); tiles.push(t); }
        fxLayer().append(grid);
        const order = Random.shuffledOrder(n, Random.hashString(scene.id));
        const steps = 14;
        for (let s = 0; s < steps; s++) {
          for (let k = Math.floor(s * n / steps); k < Math.floor((s + 1) * n / steps); k++) tiles[order[k]].style.visibility = 'hidden';
          await wait(45);
        }
        grid.remove();
      },

      'choice-menu': async (root) => {
        const wrap = root.querySelector('.card-wrap');
        if (wrap) await anim(wrap, [{ transform: 'scaleY(0)' }, { transform: 'scaleY(1)' }], { duration: 360, easing: 'steps(6)' });
      },
    },
  });
})();
