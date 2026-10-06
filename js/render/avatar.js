/* Presenter avatars: two sprite slots, per-craft skins, walking between scenes. */
const Avatar = (() => {
  const WHO = ['emily', 'anastasia'];
  const FRAMES = ['idle', 'walk1', 'walk2', 'walk3', 'walk4', 'talk', 'point'];
  const WALK = ['walk1', 'walk2', 'walk3', 'walk4'];
  const LABELS = { emily: 'Emily', anastasia: 'Anastasia' };
  const slots = {};

  const src = (who, frame, skin) => `assets/avatars/${who}/${frame}${skin === 'textile' ? '.stitch' : ''}.png`;

  function init(layer) {
    WHO.forEach((who) => {
      const el = document.createElement('div');
      el.className = 'avatar hidden';
      el.dataset.who = who;
      const frame = document.createElement('div');
      frame.className = 'frame';
      frame.dataset.label = LABELS[who];
      const img = new Image();
      img.alt = '';
      img.draggable = false;
      // Missing pose → fall back to idle; missing idle → labeled silhouette.
      img.addEventListener('error', () => {
        const s = slots[who];
        if (s.frame !== 'idle') { s.frame = 'idle'; render(who); } else el.classList.add('missing');
      });
      img.addEventListener('load', () => el.classList.remove('missing'));
      frame.append(img);
      el.append(frame);
      layer.append(el);
      slots[who] = { el, img, x: -200, frame: 'idle', skin: 'paper', timer: null, walk: null };
      render(who);
    });
  }

  function preload() {
    const urls = [];
    WHO.forEach((w) => FRAMES.forEach((f) => ['paper', 'textile'].forEach((skin) => urls.push(src(w, f, skin)))));
    return Promise.all(urls.map((u) => new Promise((resolve) => {
      const i = new Image();
      i.onload = i.onerror = resolve;
      i.src = u;
    })));
  }

  function render(who) {
    const s = slots[who];
    s.img.src = src(who, s.frame, s.skin);
    s.el.dataset.skin = s.skin;
  }
  function setSkin(who, skin) { slots[who].skin = skin; render(who); }
  function setSkinAll(skin) { WHO.forEach((w) => setSkin(w, skin)); }
  function pose(who, frame) {
    const s = slots[who];
    if (s.frame === frame) return;
    s.frame = frame;
    render(who);
  }
  function show(who) { slots[who].el.classList.remove('hidden'); }
  function hide(who) { slots[who].el.classList.add('hidden'); }
  function isVisible(who) { return !slots[who].el.classList.contains('hidden'); }
  function positionOf(who) { return slots[who].x; }

  function stop(who) {
    const s = slots[who];
    clearInterval(s.timer);
    if (s.walk) s.walk.cancel();
    s.walk = null;
    s.el.classList.remove('walking', 'flip');
    if (s.frame !== 'idle') { s.frame = 'idle'; render(who); }
  }

  function place(who, x) {
    stop(who);
    const s = slots[who];
    s.el.style.left = x + 'px';
    s.x = x;
  }

  function walkTo(who, x) {
    const s = slots[who];
    stop(who);
    const dist = Math.abs(x - s.x);
    if (dist < 4) { pose(who, 'idle'); return Promise.resolve(); }
    const duration = Math.max(600, Math.min(1600, dist * 1.6));
    s.el.classList.add('walking');
    s.el.classList.toggle('flip', x < s.x);
    let i = 0;
    s.timer = setInterval(() => pose(who, WALK[i++ % WALK.length]), 125);
    const easing = s.skin === 'zine' ? 'steps(8)' : 'linear';
    s.walk = s.el.animate([{ left: s.x + 'px' }, { left: x + 'px' }], { duration, easing, fill: 'forwards' });
    s.x = x;
    const walk = s.walk;
    return walk.finished.catch(() => {}).then(() => {
      if (s.walk !== walk) return; // superseded by a newer walk or place
      clearInterval(s.timer);
      s.el.style.left = x + 'px';
      walk.cancel();
      s.walk = null;
      s.el.classList.remove('walking', 'flip');
      pose(who, 'idle');
    });
  }

  return { init, preload, setSkin, setSkinAll, pose, show, hide, isVisible, place, walkTo, positionOf };
})();
