/* Standalone presenter state (phone): position, act clocks, and persistence across reloads.
   The phone has nothing to reveal, so it moves slide to slide and skips choice reveal steps. */
(function (root) {
  'use strict';
  const isNode = typeof module === 'object' && module.exports;
  const Nav = isNode ? require('./nav.js') : root.Nav;
  const Timer = isNode ? require('./timer.js') : root.Timer;
  const Acts = isNode ? require('./acts.js') : root.Acts;
  const KEY = 'unmaking-presenter-v1';

  function createRemote(scenes, { now = () => Date.now(), storage = null } = {}) {
    const clock = Timer.createActClock(now);
    let pos = { index: 0, step: 0 };
    let started = false;

    function save() {
      if (!storage) return;
      try { storage.setItem(KEY, JSON.stringify({ pos, started, clocks: clock.snapshot() })); } catch (e) { /* storage blocked: keep going in memory */ }
    }

    function load() {
      if (!storage) return;
      try {
        const d = JSON.parse(storage.getItem(KEY) || 'null');
        if (!d || !d.pos || !scenes[d.pos.index]) return;
        pos = { index: d.pos.index, step: 0 };
        started = !!d.started;
        clock.restore(d.clocks);
      } catch (e) { /* corrupt or blocked storage: start fresh */ }
    }

    // Same clock rules as the deck (main.js): a forward step into a new act restarts that act's clock.
    function move(target) {
      const from = pos.index;
      pos = target;
      if (started) {
        const act = scenes[target.index].act;
        if (Nav.transitionFor(from, target.index, scenes) === 'act-enter') clock.reset(act);
        else clock.mark(act);
      }
      save();
    }

    const api = {
      next() { if (pos.index < scenes.length - 1) move({ index: pos.index + 1, step: 0 }); },
      prev() { if (pos.index > 0) move({ index: pos.index - 1, step: 0 }); },
      goto(index) { if (scenes[index]) move({ index, step: 0 }); },
      gotoAct(n) { const i = Nav.actStartIndex(scenes, n); if (i >= 0) api.goto(i); },
      start() { started = true; clock.mark(scenes[pos.index].act); save(); },
      resetAct() { started = true; clock.reset(scenes[pos.index].act); save(); },
      restart() { clock.resetAll(); started = false; pos = { index: 0, step: 0 }; save(); },
      status() {
        const scene = scenes[pos.index];
        const act = Acts.actByNumber(scene.act);
        const elapsed = clock.elapsed(act.n);
        const planned = Timer.plannedMsBefore(scenes, pos.index);
        return { index: pos.index, step: pos.step, scene, act, started, elapsed, planned, pace: Timer.paceStatus(elapsed, planned), total: clock.total() };
      },
    };
    load();
    return api;
  }

  const out = { KEY, createRemote };
  if (isNode) module.exports = out;
  else root.PresenterState = out;
})(globalThis);
