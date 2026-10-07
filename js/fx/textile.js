/* ACT II — TEXTILE craft: stitched headings, running-stitch reveals, quilt assembly. */
(function () {
  'use strict';
  const { anim, el, svgEl, fxLayer } = Crafts;
  const THREAD = '#7b4fb3';

  function xStitch(ctx, x, y, c, p) {
    ctx.beginPath();
    ctx.moveTo(x + p, y + p); ctx.lineTo(x + c - p, y + c - p);
    ctx.moveTo(x + c - p, y + p); ctx.lineTo(x + p, y + c - p);
    ctx.stroke();
  }

  // Draws text offscreen, samples it into a stitch grid, and renders X stitches.
  // Text-only canvases are never tainted, so this works from file://.
  function stitchText(text, { size = 56, cell = 4, color = THREAD } = {}) {
    const font = `700 ${size}px "Courier Prime", "Courier New", monospace`;
    const probe = document.createElement('canvas').getContext('2d');
    probe.font = font;
    const w = Math.min(2400, Math.ceil(probe.measureText(text).width) + 8);
    const h = Math.ceil(size * 1.3);
    const src = document.createElement('canvas');
    src.width = w; src.height = h;
    const sctx = src.getContext('2d');
    sctx.font = font;
    sctx.textBaseline = 'middle';
    sctx.fillText(text, 4, h / 2);
    const { cols, rows, stitches } = Stitch.pixelsToStitches(sctx.getImageData(0, 0, w, h).data, w, h, cell, 100);
    const out = document.createElement('canvas');
    out.width = cols * cell; out.height = rows * cell;
    const ctx = out.getContext('2d');
    ctx.lineCap = 'round';
    stitches.forEach((s) => {
      const x = s.col * cell, y = s.row * cell;
      ctx.strokeStyle = 'rgba(0,0,0,.22)'; ctx.lineWidth = 1.6; xStitch(ctx, x + 0.7, y + 0.7, cell, 0.6);
      ctx.strokeStyle = color; ctx.lineWidth = 1.4; xStitch(ctx, x, y, cell, 0.6);
    });
    return out;
  }

  function maskedStroke(svg, shapeAttrs, strokeAttrs, revealWidth) {
    const id = 'm' + Math.random().toString(36).slice(2);
    const mask = svgEl('mask', { id });
    const reveal = svgEl(shapeAttrs.tag, Object.assign({}, shapeAttrs.attrs, { fill: 'none', stroke: '#fff', 'stroke-width': revealWidth, pathLength: 1000, 'stroke-dasharray': 1000, 'stroke-dashoffset': 1000 }));
    mask.append(reveal);
    const thread = svgEl(shapeAttrs.tag, Object.assign({}, shapeAttrs.attrs, strokeAttrs, { fill: 'none', mask: `url(#${id})` }));
    svg.append(mask, thread);
    return reveal;
  }

  Crafts.register('textile', {
    backdrop(bg) {
      ['top', 'bottom'].forEach((pos) => {
        const row = el('div', 'quilt-border ' + pos);
        for (let i = 0; i < 16; i++) row.append(el('div', 'patch'));
        bg.append(row);
      });
    },

    decorate(root) {
      root.querySelectorAll('.heading').forEach((h) => {
        const canvas = stitchText(h.textContent, { size: h.tagName === 'H1' ? 64 : 52 });
        canvas.className = 'heading-canvas';
        canvas.setAttribute('aria-hidden', 'true');
        h.classList.add('sr-only');
        h.after(canvas);
      });
    },

    // A running stitch crosses the stage; the new felt is revealed behind the needle.
    async placeTransition(oldEl, newEl) {
      const line = el('div', 'restitch-line');
      fxLayer().append(line);
      await Promise.all([
        anim(line, [{ transform: 'translateX(-40px)' }, { transform: 'translateX(1300px)' }], { duration: 800, easing: 'linear', fill: 'none' }),
        anim(newEl, [{ clipPath: 'inset(0 100% 0 0)' }, { clipPath: 'inset(0 0% 0 0)' }], { duration: 800, easing: 'linear', fill: 'none' }),
      ]);
      line.remove();
    },

    fx: {
      'stitch-in': async (root) => {
        const card = root.querySelector('.card');
        if (!card || !card.children.length) return;
        card.classList.add('stitching');
        const w = card.offsetWidth, h = card.offsetHeight;
        const svg = svgEl('svg', { class: 'stitch-svg', width: w, height: h, viewBox: `0 0 ${w} ${h}` });
        const reveal = maskedStroke(svg,
          { tag: 'rect', attrs: { x: 15.5, y: 15.5, width: w - 31, height: h - 31, rx: 8 } },
          { stroke: THREAD, 'stroke-width': 3, 'stroke-dasharray': '12 8' }, 12);
        card.append(svg);
        await anim(reveal, [{ strokeDashoffset: 1000 }, { strokeDashoffset: 0 }], { duration: 1200, easing: 'ease-in-out' });
        card.classList.remove('stitching');
        const kids = [...card.children].filter((c) => c !== svg);
        await Promise.all(kids.map((k, i) => anim(k, [{ opacity: 0, transform: 'translateY(8px)' }, { opacity: 1, transform: 'none' }], { duration: 400, delay: i * 120 })));
        svg.remove();
      },

      'needle-pass': async (root) => {
        const wrap = root.querySelector('.card-wrap');
        if (!wrap) return;
        const w = wrap.offsetWidth;
        const needle = el('div', 'needle');
        wrap.append(needle);
        const frames = [];
        for (let i = 0; i <= 8; i++) frames.push({ transform: `translate(${(w + 40) * i / 8}px, ${i % 2 ? 18 : -6}px) rotate(${i % 2 ? 8 : -8}deg)` });
        await anim(needle, frames, { duration: 1200, easing: 'linear' });
        needle.remove();
      },

      'quilt-assemble': async (root, { scene }) => {
        const rnd = Random.mulberry32(Random.hashString(scene.id));
        const pieces = [...root.querySelectorAll('.gallery .media')];
        const targets = pieces.length ? pieces : [...root.querySelectorAll('.media')];
        await Promise.all(targets.map((f, i) => {
          const dx = (rnd() - 0.5) * 900, dy = (rnd() - 0.5) * 500, r = (rnd() - 0.5) * 60;
          return anim(f, [
            { transform: `translate(${dx}px, ${dy}px) rotate(${r}deg)`, opacity: 0 },
            { transform: 'translate(0, 0) rotate(0deg)', opacity: 1 },
          ], { duration: 900, delay: i * 140, easing: 'cubic-bezier(.2,1.2,.3,1)' });
        }));
      },
    },
  });
})();
