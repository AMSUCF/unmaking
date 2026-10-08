/* Presenter view. Solo (phone): steps through notes with its own act clocks. Linked (same device as the deck): mirrors and drives the deck. */
(function () {
  'use strict';
  const lists = [globalThis.ACT1_SCENES, globalThis.ACT2_SCENES, globalThis.ACT3_SCENES, globalThis.ACT4_SCENES];
  const { scenes } = Deck.buildDeck(lists);
  const $ = (id) => document.getElementById(id);
  const storage = (() => { try { return window.localStorage; } catch (e) { return null; } })();
  const remote = PresenterState.createRemote(scenes, { storage });
  const channel = 'BroadcastChannel' in window ? new BroadcastChannel('unmaking-deck') : null;
  let linked = null; // last deck state while linked, else null
  let soloPinned = false; // once "Go solo" is pressed, stay solo until the page reloads
  let lastState = 0;      // time of the last deck state message
  const LINK_TTL = 5000;  // drop back to solo if the deck goes quiet this long
  const setText = (id, text) => { const el = $(id); if (el.textContent !== text) el.textContent = text; };

  function summary(s, step) {
    if (!s) return '(end of deck)';
    const choices = s.choices ? s.choices.map((c, i) => (i < step ? '✔ ' : '· ') + c).join('\n') : '';
    return [s.heading, s.text && s.text.replace(/\*([^*\n]+)\*/g, '$1'), choices, s.source].filter(Boolean).join('\n');
  }

  function view() {
    if (linked) {
      const scene = scenes[linked.index];
      return { index: linked.index, step: linked.step, scene, act: Acts.actByNumber(scene.act), started: true, elapsed: linked.actElapsed, planned: linked.planned, total: linked.total };
    }
    return remote.status();
  }

  let lastIndex = -1;
  function render() {
    if (linked && Date.now() - lastState > LINK_TTL) linked = null;
    const v = view();
    const s = v.scene;
    const act = v.act;
    document.body.dataset.presenter = act.presenter;
    $('p-who').textContent = Acts.PRESENTERS[act.presenter].name;
    $('p-mode').textContent = linked ? 'Linked to deck' : 'Solo';
    const placeId = Deck.placeOf(scenes, v.index);
    const place = placeId && globalThis.PlaceDecls ? PlaceDecls.get(act.craft, placeId) : null;
    const where = place ? ` · ${place.label}${place.credit ? ' (' + place.credit + ')' : ''}` : '';
    $('p-meta').textContent = `${act.title}: ${act.subtitle} · ${v.index + 1}/${scenes.length} · ${s.id}${s.draft ? ' · DRAFT' : ''}${where}`;
    $('p-clock').textContent = v.started ? `${Timer.formatClock(v.elapsed)} / ${act.budgetMinutes}:00` : `–:–– / ${act.budgetMinutes}:00`;
    const pace = Timer.paceStatus(v.elapsed, v.planned);
    $('p-pace').textContent = v.started ? `planned ${Timer.formatClock(v.planned)} · ${pace}` : 'clocks not started';
    $('p-pace').dataset.pace = v.started ? pace : '';
    $('p-total').textContent = v.started ? 'total ' + Timer.formatClock(v.total) : '';
    setText('p-notes', s.notes || '');
    setText('p-current', summary(s, v.step));
    $('p-url').textContent = s.url || '';
    const next = scenes[v.index + 1];
    setText('p-next', next ? `${next.id}\n${summary(next, 0)}` : '(end of deck)');
    $('p-start').classList.toggle('hidden', !!linked || v.started);
    ['p-reset-act', 'p-restart'].forEach((id) => $(id).classList.toggle('hidden', !!linked));
    document.querySelectorAll('[data-act]').forEach((b) => b.classList.toggle('hidden', !!linked));
    $('p-solo').classList.toggle('hidden', !linked);
    if (v.index !== lastIndex) { lastIndex = v.index; window.scrollTo(0, 0); } // new notes start in view on small screens
  }

  const act = (fn) => () => { fn(); render(); };
  const send = (action) => { if (channel) channel.postMessage({ type: 'nav', action }); };
  const next = () => { if (linked) send('next'); else { remote.next(); render(); } };
  const prev = () => { if (linked) send('prev'); else { remote.prev(); render(); } };

  $('p-next-btn').onclick = next;
  $('p-prev').onclick = prev;
  $('p-start').onclick = act(() => remote.start());
  $('p-reset-act').onclick = act(() => remote.resetAct());
  document.querySelectorAll('[data-act]').forEach((b) => { b.onclick = act(() => remote.gotoAct(Number(b.dataset.act))); });
  $('p-solo').onclick = act(() => { linked = null; soloPinned = true; });

  // Restart needs a second tap within 3 seconds (no browser dialogs).
  let armed = null;
  $('p-restart').onclick = () => {
    if (armed) { clearTimeout(armed); armed = null; $('p-restart').textContent = 'Restart talk'; remote.restart(); render(); return; }
    $('p-restart').textContent = 'Tap again to restart';
    armed = setTimeout(() => { armed = null; $('p-restart').textContent = 'Restart talk'; }, 3000);
  };

  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target && e.target.closest && e.target.closest('button, a, input, select, textarea') && (e.key === ' ' || e.key === 'Enter')) return;
    if (['ArrowRight', ' ', 'PageDown', 'Enter'].includes(e.key)) { e.preventDefault(); next(); }
    if (['ArrowLeft', 'PageUp', 'Backspace'].includes(e.key)) { e.preventDefault(); prev(); }
  });

  // Swipe left for next, right for prev, on the notes.
  let x0 = null;
  let y0 = 0;
  $('p-notes').addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
  $('p-notes').addEventListener('touchend', (e) => {
    if (x0 === null) return;
    const dir = Nav.swipeDirection(e.changedTouches[0].clientX - x0, e.changedTouches[0].clientY - y0);
    x0 = null;
    if (dir === 'next') next();
    else if (dir === 'prev') prev();
  });

  if (channel) {
    channel.onmessage = ({ data }) => {
      if (!data || data.type !== 'state' || soloPinned || !scenes[data.index]) return;
      linked = data;
      lastState = Date.now();
      render();
    };
    channel.postMessage({ type: 'hello' });
  }

  // Keep the phone screen awake while presenting; re-acquire after the tab comes back.
  async function keepAwake() {
    try { if ('wakeLock' in navigator && document.visibilityState === 'visible') await navigator.wakeLock.request('screen'); } catch (e) { /* not supported or denied */ }
  }
  document.addEventListener('visibilitychange', () => { keepAwake(); render(); });
  keepAwake();

  setInterval(render, 1000);
  render();
})();
