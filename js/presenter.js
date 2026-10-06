/* Presenter window: mirrors the deck over BroadcastChannel and can drive it. */
(function () {
  'use strict';
  const lists = [globalThis.ACT1_SCENES, globalThis.ACT2_SCENES, globalThis.ACT3_SCENES, globalThis.ACT4_SCENES];
  const { scenes } = Deck.buildDeck(lists);
  const $ = (id) => document.getElementById(id);
  const channel = new BroadcastChannel('unmaking-deck');

  function summary(s, step) {
    if (!s) return '(end of deck)';
    const choices = s.choices ? s.choices.map((c, i) => (i < step ? '✔ ' : '· ') + c).join('\n') : '';
    return [s.heading, s.text && s.text.replace(/\*([^*\n]+)\*/g, '$1'), choices, s.source].filter(Boolean).join('\n');
  }

  channel.onmessage = ({ data }) => {
    if (!data || data.type !== 'state') return;
    const s = scenes[data.index];
    if (!s) return;
    const act = Acts.actByNumber(s.act);
    document.body.dataset.presenter = act.presenter;
    $('p-who').textContent = Acts.PRESENTERS[act.presenter].name;
    $('p-meta').textContent = `${act.title}: ${act.subtitle} · ${data.index + 1}/${scenes.length} · ${s.id}${s.draft ? ' · DRAFT' : ''}`;
    $('p-clock').textContent = `${Timer.formatClock(data.actElapsed)} / ${act.budgetMinutes}:00`;
    const pace = Timer.paceStatus(data.actElapsed, data.planned);
    $('p-pace').textContent = `planned ${Timer.formatClock(data.planned)} · ${pace}`;
    $('p-pace').dataset.pace = pace;
    $('p-total').textContent = 'total ' + Timer.formatClock(data.total);
    $('p-notes').textContent = s.notes;
    $('p-current').textContent = summary(s, data.step);
    $('p-current').style.whiteSpace = 'pre-line';
    $('p-url').textContent = s.url || '';
    const next = scenes[data.index + 1];
    $('p-next').textContent = next ? `${next.id}\n${summary(next, 0)}` : '(end of deck)';
    $('p-next').style.whiteSpace = 'pre-line';
  };

  const nav = (action) => channel.postMessage({ type: 'nav', action });
  $('p-prev').onclick = () => nav('prev');
  $('p-next-btn').onclick = () => nav('next');
  document.addEventListener('keydown', (e) => {
    if (['ArrowRight', ' ', 'PageDown'].includes(e.key)) { e.preventDefault(); nav('next'); }
    if (['ArrowLeft', 'PageUp'].includes(e.key)) { e.preventDefault(); nav('prev'); }
  });
  channel.postMessage({ type: 'hello' });
})();
