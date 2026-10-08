/* Renders one scene into the stage: layout DOM, craft decoration, avatars, speech, fx. */
const Stage = (() => {
  let els = null;
  let currentCraft = null;
  let typing = null;
  const BOTH = ['title', 'handoff', 'credits'];
  const FIT = { statement: [48, 22], quote: [36, 18], image: [28, 16], video: [28, 16], gallery: [26, 16], handoff: [28, 16], choice: [32, 18], title: [30, 18] };

  function init() {
    const $ = (id) => document.getElementById(id);
    els = { stage: $('stage'), backdrop: $('backdrop'), content: $('content'), say: $('say'), fx: $('fx-layer') };
  }

  function setCraft(craft) {
    if (craft === currentCraft) return;
    currentCraft = craft;
    document.body.dataset.craft = craft;
    Crafts.backdrop(craft, els.backdrop);
    Places.reset(craft);
    Avatar.setSkinAll(craft);
  }

  const make = (tag, cls, text) => Crafts.el(tag, cls, text);

  function figure(m) {
    const f = make('figure', 'media');
    if (/\.mp4$/i.test(m.src)) {
      const v = document.createElement('video');
      v.src = m.src;
      v.controls = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.setAttribute('aria-label', m.alt);
      f.append(v);
    } else {
      const img = new Image();
      img.src = m.src;
      img.alt = m.alt;
      img.decoding = 'async';
      f.append(img);
    }
    return f;
  }

  // Quote text may carry line breaks (\n) and *emphasis*, to keep a source's own spacing and italics.
  function quoteText(text) {
    const q = make('blockquote', 'text');
    text.split(/(\*[^*\n]+\*)/).forEach((part) => {
      if (/^\*[^*]+\*$/.test(part)) q.append(make('em', '', part.slice(1, -1)));
      else if (part) q.append(document.createTextNode(part));
    });
    return q;
  }

  function renderScene(scene) {
    const root = make('section', `scene layout-${scene.layout}`);
    root.dataset.id = scene.id;
    const wrap = make('div', 'card-wrap');
    const card = make('div', 'card');
    wrap.append(card);
    root.append(wrap);
    const media = scene.media || [];

    if (scene.heading) card.append(make(scene.layout === 'title' ? 'h1' : 'h2', 'heading', scene.heading));
    if (scene.layout === 'quote') {
      card.append(quoteText(scene.text));
      card.append(make('cite', 'source', scene.source));
      if (media[0]) root.append(figure(media[0]));
    } else if (scene.layout === 'gallery') {
      const g = make('div', 'gallery');
      media.forEach((m) => g.append(figure(m)));
      root.insertBefore(g, wrap);
      if (scene.text) card.append(make('p', 'text', scene.text));
    } else if (scene.layout === 'choice') {
      if (scene.text) card.append(make('p', 'text', scene.text));
      const ol = make('ol', 'choices');
      scene.choices.forEach((c) => ol.append(make('li', 'choice', c)));
      card.append(ol);
      if (media[0]) root.append(figure(media[0]));
    } else if (scene.layout === 'credits') {
      const ul = make('ul', 'credits');
      scene.lines.forEach((l) => ul.append(make('li', '', l)));
      card.append(ul);
    } else {
      if (scene.text) card.append(make('p', 'text', scene.text));
      if (scene.byline) card.append(make('p', 'byline', scene.byline));
      if (media[0]) {
        const f = figure(media[0]);
        if (scene.layout === 'title') root.append(f); else root.insertBefore(f, wrap);
      }
    }
    if (scene.source && scene.layout !== 'quote') card.append(make('p', 'source', scene.source));
    if (scene.draft) root.append(make('div', 'draft-flag', 'DRAFT'));
    (scene.props || []).forEach((p) => {
      const n = make('div', 'prop ' + p.cls, p.text);
      const [x, y, w, h] = p.box;
      Object.assign(n.style, { left: x + 'px', top: y + 'px', width: w + 'px', height: h + 'px' });
      n.setAttribute('aria-hidden', 'true');
      root.append(n);
    });
    return root;
  }

  function fitText(el, max, min) {
    let size = max;
    el.style.fontSize = size + 'px';
    while (size > min && el.scrollHeight > el.clientHeight + 1) {
      size -= 1;
      el.style.fontSize = size + 'px';
    }
  }

  function fitAll(root, layout) {
    const [max, min] = FIT[layout] || [32, 16];
    root.querySelectorAll('.text').forEach((t) => fitText(t, max, min));
  }

  function setStep(step) {
    const items = els.content.querySelectorAll('.choice');
    items.forEach((li, i) => {
      li.classList.toggle('revealed', i < step);
      li.classList.toggle('current', i === step - 1);
    });
  }

  function say(text, x) {
    clearInterval(typing);
    const box = els.say;
    if (!text) { box.classList.add('hidden'); box.textContent = ''; return; }
    box.classList.remove('hidden');
    // Anchor inside the 180-200px avatar gutter, above the lead's head, so it never covers the card.
    box.style.left = (x > 640 ? Math.min(1280 - 178, Math.max(1080, x - 30)) : Math.max(8, x - 40)) + 'px';
    if (currentCraft === 'game') {
      box.textContent = '';
      let i = 0;
      typing = setInterval(() => {
        box.textContent = text.slice(0, ++i);
        if (i >= text.length) clearInterval(typing);
      }, 22);
    } else {
      box.textContent = text;
    }
  }

  const poseOf = (scene) => (scene.avatar && scene.avatar.pose) || 'idle';
  const xOf = (scene) => (scene.avatar && typeof scene.avatar.x === 'number' ? scene.avatar.x : 60);

  async function show(scene, act, { kind, step, place, nextPlace }) {
    els.fx.replaceChildren();
    setCraft(act.craft);
    if (place) {
      await Places.go(act.craft, place, {
        animate: kind !== 'cut',
        onChange: () => els.content.replaceChildren(), // the old slide leaves with the old place
        ctx: { Avatar, lead: act.presenter, scene },
      });
      Places.nudge(scene.id);
    }

    const el = renderScene(scene);
    const x = xOf(scene);
    el.classList.toggle('avatar-right', x > 640);
    Crafts.decorate(act.craft, el, scene);
    els.content.replaceChildren(el);
    fitAll(el, scene.layout);
    setStep(step);

    const lead = act.presenter;
    const other = lead === 'emily' ? 'anastasia' : 'emily';
    // Re-skin both every scene: an avatar that sat out an act (or left during a
    // handoff in the old skin) must reappear in the current craft.
    Avatar.setSkin(lead, act.craft);
    Avatar.setSkin(other, act.craft);
    if (scene.avatar === false) Avatar.hide(lead); else Avatar.show(lead);
    if (BOTH.includes(scene.layout)) {
      if (!Avatar.isVisible(other)) { Avatar.place(other, kind === 'cut' ? 1100 : 1400); Avatar.show(other); }
      if (kind === 'cut') Avatar.place(other, 1100); else Avatar.walkTo(other, 1100);
    } else {
      Avatar.hide(other);
    }
    say(scene.say || '', x);

    if (kind === 'cut') {
      Avatar.place(lead, x);
      Avatar.pose(lead, poseOf(scene));
      return;
    }
    const walking = Avatar.walkTo(lead, x);
    // A handoff switches craft mid-fx; build the next act's first place under it.
    const handoffCraft = (c) => { setCraft(c); if (nextPlace) Places.go(c, nextPlace); };
    const ctx = { scene, act, lead, other, setCraft: handoffCraft, Avatar, stage: els };
    const fxCraft = scene.layout === 'handoff' ? 'handoff' : act.craft;
    for (const name of scene.fx || []) await Crafts.runFx(fxCraft, name, el, ctx);
    await walking;
    if (Avatar.positionOf(lead) === x) Avatar.pose(lead, poseOf(scene));
  }

  return { init, show, setStep, setCraft, say, renderScene };
})();
