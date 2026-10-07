/* The talk's fixed structure: who presents which act, in which craft. */
(function (root) {
  'use strict';

  const PRESENTERS = {
    emily: { id: 'emily', name: 'Emily K. Johnson' },
    anastasia: { id: 'anastasia', name: 'Anastasia Salter' },
  };

  const ACTS = [
    { n: 1, craft: 'paper', presenter: 'emily', title: 'Act I', subtitle: 'The Death of the Web (As We Know It)', budgetMinutes: 15 },
    { n: 2, craft: 'textile', presenter: 'anastasia', title: 'Act II', subtitle: 'Why Keep Making?', budgetMinutes: 15 },
    { n: 3, craft: 'zine', presenter: 'emily', title: 'Act III', subtitle: 'Who Owns What We Make?', budgetMinutes: 15 },
    { n: 4, craft: 'game', presenter: 'anastasia', title: 'Act IV', subtitle: 'Is There Human Agency in Agentic AI?', budgetMinutes: 15 },
  ];

  const LAYOUTS = ['title', 'statement', 'quote', 'image', 'gallery', 'video', 'choice', 'handoff', 'credits'];
  const POSES = ['idle', 'walk1', 'walk2', 'walk3', 'walk4', 'talk', 'point'];

  const FX_NAMES = {
    paper: ['popup-rise', 'fold-in', 'paper-tear', 'cut-out', 'page-turn'],
    textile: ['stitch-in', 'needle-pass', 'quilt-assemble'],
    zine: ['xerox-scan', 'ransom-shuffle', 'sticker-slap', 'misregister'],
    game: ['iris-in', 'pixel-dissolve', 'choice-menu'],
    handoff: ['pattern-to-cloth', 'scan-to-zine', 'zine-to-pixels'],
  };

  const LIMITS = { statement: 240, quote: 650, say: 120, heading: 70 };
  const STAGE = { width: 1280, height: 720, avatarWidth: 120 };

  function actByNumber(n) {
    return ACTS.find((a) => a.n === n) || null;
  }

  const api = { PRESENTERS, ACTS, LAYOUTS, POSES, FX_NAMES, LIMITS, STAGE, actByNumber };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Acts = api;
})(globalThis);
