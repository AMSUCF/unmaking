/* ACT IV — INDIE GAME craft: rooms, HUD agency meter, iris, pixel dissolve, choice menus. */
(function () {
  'use strict';
  const { anim, wait, fxLayer, el } = Crafts;
  const ROOM_NAMES = { workshop: 'THE WORKSHOP', office: "THE AGENT'S OFFICE", commons: 'THE COMMONS' };

  function setRoom(room) {
    const bg = document.getElementById('backdrop');
    ['workshop', 'office', 'commons'].forEach((r) => bg.classList.toggle('room-' + r, r === room));
    const label = bg.querySelector('.room-name');
    if (label) label.textContent = ROOM_NAMES[room];
  }

  Crafts.register('game', {
    backdrop(bg) {
      const bar = el('div', 'hudbar');
      bar.append(el('span', 'room-name', ROOM_NAMES.workshop), el('span', 'agency', 'AGENCY ▯▯▯▯▯'));
      bg.append(bar, el('div', 'wall'), el('div', 'prop'), el('div', 'floor'));
      setRoom('workshop');
    },

    decorate(root, scene) {
      setRoom(scene.room || 'workshop');
      const meter = document.querySelector('.backdrop-game .agency');
      if (meter && typeof scene.agency === 'number') {
        meter.textContent = 'AGENCY ' + '▮'.repeat(scene.agency) + '▯'.repeat(5 - scene.agency);
      }
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
