/* Handoffs: each act's craft is unmade into the next. Tasks 10-11 add to this file. */
(function () {
  'use strict';
  const { anim, wait, fxLayer, el, svgEl } = Crafts;

  function stitchPath(d, color, width, duration) {
    const svg = svgEl('svg', { class: 'handoff-svg', viewBox: '0 0 1280 720', width: 1280, height: 720 });
    svg.style.position = 'absolute';
    svg.style.inset = '0';
    const id = 'h' + Math.random().toString(36).slice(2);
    const mask = svgEl('mask', { id });
    const reveal = svgEl('path', { d, fill: 'none', stroke: '#fff', 'stroke-width': 28, pathLength: 1000, 'stroke-dasharray': 1000, 'stroke-dashoffset': 1000 });
    mask.append(reveal);
    svg.append(mask, svgEl('path', { d, fill: 'none', stroke: color, 'stroke-width': width, 'stroke-dasharray': '18 12', 'stroke-linecap': 'round', mask: `url(#${id})` }));
    fxLayer().append(svg);
    return anim(reveal, [{ strokeDashoffset: 1000 }, { strokeDashoffset: 0 }], { duration, easing: 'ease-in-out' });
  }

  async function swapBackdrop(ctx, craft) {
    const bg = ctx.stage.backdrop;
    await anim(bg, [{ opacity: 1 }, { opacity: 0 }], { duration: 300, fill: 'none' });
    bg.style.opacity = '0';
    ctx.setCraft(craft);
    ctx.Avatar.setSkin(ctx.lead, ctx.act.craft); // outgoing presenter keeps the old craft as they leave
    bg.style.opacity = '';
    await anim(bg, [{ opacity: 0 }, { opacity: 1 }], { duration: 500, fill: 'none' });
  }

  Crafts.register('handoff', {
    fx: {
      'pattern-to-cloth': async (root, ctx) => {
        const fig = root.querySelector('.media');
        if (fig) await anim(fig, [{ transform: 'scale(1) rotate(0deg)' }, { transform: 'scale(1.18) rotate(-3deg)' }], { duration: 800 });
        await stitchPath('M -20 610 C 220 430, 380 700, 640 520 S 1040 300, 1300 430', '#7b4fb3', 6, 1600);
        await swapBackdrop(ctx, 'textile');
        await ctx.Avatar.walkTo(ctx.lead, -200);
        ctx.Avatar.hide(ctx.lead);
      },
      'scan-to-zine': async (root, ctx) => {
        const bar = el('div', 'scan-bar');
        bar.style.height = '70px';
        fxLayer().append(bar);
        const sweep = anim(bar, [{ transform: 'translateY(-80px)' }, { transform: 'translateY(760px)' }], { duration: 1800, easing: 'linear' });
        await wait(900);
        await swapBackdrop(ctx, 'zine');
        await sweep;
        bar.remove();
        await ctx.Avatar.walkTo(ctx.lead, -200);
        ctx.Avatar.hide(ctx.lead);
      },
      'zine-to-pixels': async (root, ctx) => {
        const grid = el('div', 'pixel-grid');
        const n = 32 * 18;
        const colours = ['#f4f1e8', '#111', '#ff4fb8', '#b6ff3b', '#22e0ff'];
        const tiles = [];
        for (let i = 0; i < n; i++) {
          const t = el('i');
          t.style.background = colours[i % colours.length];
          t.style.visibility = 'hidden';
          grid.append(t);
          tiles.push(t);
        }
        fxLayer().append(grid);
        const seed = Random.hashString(ctx.scene.id);
        const cover = Random.shuffledOrder(n, seed);
        const uncover = Random.shuffledOrder(n, seed + 1);
        const leaving = ctx.Avatar.walkTo(ctx.lead, -200);
        for (let s = 0; s < 12; s++) {
          for (let k = Math.floor(s * n / 12); k < Math.floor((s + 1) * n / 12); k++) tiles[cover[k]].style.visibility = 'visible';
          await wait(50);
        }
        ctx.setCraft('game');
        ctx.Avatar.setSkin(ctx.lead, 'zine');
        tiles.forEach((t) => { t.style.background = '#0d0b1a'; });
        for (let s = 0; s < 12; s++) {
          for (let k = Math.floor(s * n / 12); k < Math.floor((s + 1) * n / 12); k++) tiles[uncover[k]].style.visibility = 'hidden';
          await wait(50);
        }
        grid.remove();
        await leaving;
        ctx.Avatar.hide(ctx.lead);
      },
    },
  });
})();
