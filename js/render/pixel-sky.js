/* Act IV sky: a 320x180 canvas with a Bayer-dithered gradient and a few particles, scaled up pixelated behind the room. */
/* var, not const: Places looks it up on globalThis. */
var PixelSky = (() => {
  const W = 320;
  const H = 180;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const BANDS = 7;
  let canvas = null;
  let ctx = null;
  let raf = 0;
  let base = null;
  let parts = [];
  let kind = null;

  const rgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16));

  function paint(top, bottom) {
    const a = rgb(top);
    const b = rgb(bottom);
    const img = ctx.createImageData(W, H);
    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const t = y / (H - 1);
        const th = (BAYER[(y % 4) * 4 + (x % 4)] + 0.5) / 16;
        const k = Math.min(1, Math.floor(t * BANDS + th) / BANDS); // stepped bands, dithered at the seams
        const i = (y * W + x) * 4;
        for (let c = 0; c < 3; c++) img.data[i + c] = Math.round(a[c] + (b[c] - a[c]) * k);
        img.data[i + 3] = 255;
      }
    }
    return img;
  }

  function seed(type) {
    const rnd = Random.mulberry32(Random.hashString(type || 'none'));
    const n = { dust: 40, stars: 80, fireflies: 24 }[type] || 0;
    parts = Array.from({ length: n }, () => ({ x: rnd() * W, y: rnd() * (type === 'stars' ? H * 0.6 : H), v: 0.05 + rnd() * 0.15, p: rnd() * 6.28 }));
  }

  function frame(t) {
    ctx.putImageData(base, 0, 0);
    parts.forEach((q) => {
      if (kind === 'dust') { q.y -= q.v; q.x += Math.sin(t / 900 + q.p) * 0.1; if (q.y < 0) q.y = H; ctx.fillStyle = 'rgba(255,230,180,.45)'; }
      else if (kind === 'stars') { ctx.fillStyle = Math.sin(t / 500 + q.p * 3) > 0.7 ? '#ffffff' : 'rgba(255,255,255,.55)'; }
      else if (kind === 'fireflies') { q.x += Math.cos(t / 700 + q.p) * 0.3; q.y += Math.sin(t / 800 + q.p) * 0.2; ctx.fillStyle = Math.sin(t / 300 + q.p) > 0 ? '#f6e05e' : 'rgba(246,224,94,.3)'; }
      ctx.fillRect(Math.round(q.x), Math.round(q.y), 1, 1);
    });
  }

  function loop(t) { frame(t); raf = requestAnimationFrame(loop); }

  function mount(host, sky, still) {
    stop();
    canvas = document.createElement('canvas');
    canvas.className = 'pixel-sky';
    canvas.width = W;
    canvas.height = H;
    ctx = canvas.getContext('2d');
    base = paint(sky.top, sky.bottom);
    kind = sky.particles || null;
    seed(kind);
    host.prepend(canvas);
    if (still || !kind) frame(0);
    else raf = requestAnimationFrame(loop);
  }

  function stop() {
    cancelAnimationFrame(raf);
    raf = 0;
    if (canvas) canvas.remove();
    canvas = null;
  }

  return { mount, stop };
})();
