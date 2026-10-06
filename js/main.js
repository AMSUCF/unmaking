/* Boot, input, notes HUD, and presenter-window broadcast. */
(function () {
  'use strict';
  const lists = [globalThis.ACT1_SCENES, globalThis.ACT2_SCENES, globalThis.ACT3_SCENES, globalThis.ACT4_SCENES].filter(Array.isArray);
  const { scenes, errors } = Deck.buildDeck(lists);
  const $ = (id) => document.getElementById(id);
  const stageEl = $('stage');
  const notesEl = $('notes');
  const blackout = $('blackout');
  const errorsEl = $('errors');
  const queue = Nav.createNavQueue();
  const clock = Timer.createActClock();
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('unmaking-deck') : null;
  let pos = { index: -1, step: 0 };

  function fit() {
    const s = Math.min(innerWidth / 1280, innerHeight / 720);
    stageEl.style.transform = `scale(${s})`;
    stageEl.style.left = (innerWidth - 1280 * s) / 2 + 'px';
    stageEl.style.top = (innerHeight - 720 * s) / 2 + 'px';
  }

  function request(target) {
    if (!target || target.index < 0 || target.index >= scenes.length) return;
    const t = queue.request(target);
    if (t) run(t, false);
  }

  async function run(target, instant) {
    try {
      if (target.index === pos.index) {
        Stage.setStep(target.step);
      } else {
        const scene = scenes[target.index];
        const act = Acts.actByNumber(scene.act);
        const kind = instant ? 'cut' : Nav.transitionFor(pos.index, target.index, scenes);
        pos = { index: target.index, step: target.step };
        clock.mark(scene.act);
        try { history.replaceState(null, '', '?scene=' + scene.id); } catch (e) { /* file:// in some browsers */ }
        await Stage.show(scene, act, { kind, step: target.step });
      }
      pos = { index: target.index, step: target.step };
      renderNotes();
      broadcast();
    } catch (err) {
      console.error(err);
    }
    const next = queue.finish();
    if (next) run(next, true); // presses made during an animation land instantly
  }

  function status() {
    const scene = scenes[pos.index];
    const act = Acts.actByNumber(scene.act);
    const elapsed = clock.elapsed(act.n);
    const planned = Timer.plannedMsBefore(scenes, pos.index);
    return { scene, act, elapsed, planned, pace: Timer.paceStatus(elapsed, planned) };
  }

  function renderNotes() {
    if (pos.index < 0) return;
    const { scene, act, elapsed, planned, pace } = status();
    const who = Acts.PRESENTERS[act.presenter].name;
    notesEl.querySelector('.notes-meta').textContent =
      `${pos.index + 1}/${scenes.length} · ${scene.id} · ${act.title}: ${act.subtitle} · ${who}${scene.draft ? ' · DRAFT' : ''}`;
    notesEl.querySelector('.notes-body').textContent = scene.notes;
    const c = notesEl.querySelector('.notes-clock');
    c.textContent = `Act ${Timer.formatClock(elapsed)} / ${act.budgetMinutes}:00 · planned ${Timer.formatClock(planned)} · ${pace.toUpperCase()} · total ${Timer.formatClock(clock.total())}`;
    c.dataset.pace = pace;
  }

  function broadcast() {
    if (!channel || pos.index < 0) return;
    const { elapsed, planned } = status();
    channel.postMessage({ type: 'state', index: pos.index, step: pos.step, actElapsed: elapsed, planned, total: clock.total() });
  }

  function onMessage({ data }) {
    if (!data) return;
    if (data.type === 'hello') broadcast();
    if (data.type === 'nav') {
      if (data.action === 'next') request(Nav.advance(pos, scenes));
      if (data.action === 'prev') request(Nav.retreat(pos, scenes));
      if (data.action === 'goto') request({ index: data.index, step: 0 });
    }
  }

  function onKey(e) {
    const k = e.key;
    if (e.target && e.target.tagName === 'VIDEO' && k === ' ') return;
    if (['ArrowRight', 'ArrowDown', ' ', 'PageDown', 'Enter'].includes(k)) { e.preventDefault(); request(Nav.advance(pos, scenes)); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].includes(k)) { e.preventDefault(); request(Nav.retreat(pos, scenes)); }
    else if (k === 'Home' || k === '0') request({ index: 0, step: 0 });
    else if (k === 'End') request({ index: scenes.length - 1, step: 0 });
    else if (/^[1-4]$/.test(k)) { const i = Nav.actStartIndex(scenes, Number(k)); if (i >= 0) request({ index: i, step: 0 }); }
    else if (k === 'n' || k === 'N') { notesEl.classList.toggle('hidden'); renderNotes(); }
    else if (k === 'b' || k === 'B' || k === '.') blackout.classList.toggle('hidden');
    else if (k === 't' || k === 'T') { if (pos.index >= 0) clock.reset(scenes[pos.index].act); renderNotes(); }
    else if (k === 'f' || k === 'F') { if (document.fullscreenElement) document.exitFullscreen(); else document.documentElement.requestFullscreen(); }
    else if (k === 'p' || k === 'P') window.open('presenter.html', 'unmaking-presenter', 'width=1100,height=760');
    else if (k === 'r' || k === 'R') document.body.classList.toggle('show-drafts');
    else if (k === 'e' || k === 'E') errorsEl.classList.toggle('hidden');
  }

  async function boot() {
    fit();
    addEventListener('resize', fit);
    Stage.init();
    Avatar.init($('avatars'));
    if (errors.length) {
      errorsEl.textContent = 'Deck errors (press E to hide):\n' + errors.join('\n');
      errorsEl.classList.remove('hidden');
      console.warn(errors);
    }
    if (!scenes.length) return;
    try { await document.fonts.ready; } catch (e) { /* fonts optional */ }
    await Avatar.preload();
    document.addEventListener('keydown', onKey);
    stageEl.addEventListener('click', (e) => {
      if (e.target.closest('a, button, video')) return;
      request(Nav.advance(pos, scenes));
    });
    if (channel) channel.onmessage = onMessage;
    setInterval(() => { renderNotes(); broadcast(); }, 1000);
    request({ index: Nav.parseStartParam(location.search, scenes), step: 0 });
  }

  boot();
})();
