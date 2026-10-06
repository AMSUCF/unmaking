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
    },
  });
})();
