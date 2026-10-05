/* Pure navigation rules: positions, reveal steps, transition kinds, request queue. */
(function (root) {
  'use strict';

  function stepsOf(scene) {
    return scene && Array.isArray(scene.choices) ? scene.choices.length : 0;
  }

  function advance(pos, scenes) {
    if (pos.step < stepsOf(scenes[pos.index])) return { index: pos.index, step: pos.step + 1 };
    if (pos.index < scenes.length - 1) return { index: pos.index + 1, step: 0 };
    return pos;
  }

  function retreat(pos, scenes) {
    if (pos.step > 0) return { index: pos.index, step: pos.step - 1 };
    if (pos.index > 0) return { index: pos.index - 1, step: stepsOf(scenes[pos.index - 1]) };
    return pos;
  }

  // Only a single step forward animates. Backward moves and jumps cut straight
  // to the target in its own craft, so handoffs never play in reverse.
  function transitionFor(fromIndex, toIndex, scenes) {
    if (fromIndex == null || fromIndex < 0) return 'cut';
    if (toIndex !== fromIndex + 1) return 'cut';
    return scenes[toIndex].act === scenes[fromIndex].act ? 'within' : 'act-enter';
  }

  function actStartIndex(scenes, n) {
    return scenes.findIndex((s) => s.act === n);
  }

  function parseStartParam(search, scenes) {
    const value = new URLSearchParams(search || '').get('scene');
    if (!value) return 0;
    const byId = scenes.findIndex((s) => s.id === value);
    if (byId >= 0) return byId;
    if (/^\d+$/.test(value)) return Math.min(Number(value), scenes.length - 1);
    return 0;
  }

  function createNavQueue() {
    let busy = false;
    let pending = null;
    return {
      request(target) {
        if (busy) { pending = target; return null; }
        busy = true;
        return target;
      },
      finish() {
        if (pending) { const next = pending; pending = null; return next; }
        busy = false;
        return null;
      },
      isBusy() { return busy; },
    };
  }

  const api = { stepsOf, advance, retreat, transitionFor, actStartIndex, parseStartParam, createNavQueue };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Nav = api;
})(globalThis);
