/* Clocks for two presenters sharing a 60-minute slot. */
(function (root) {
  'use strict';

  function formatClock(ms) {
    const neg = ms < 0;
    const total = Math.floor(Math.abs(ms) / 1000);
    const m = Math.floor(total / 60);
    const s = total % 60;
    return `${neg ? '-' : ''}${m}:${String(s).padStart(2, '0')}`;
  }

  function plannedMsBefore(scenes, index) {
    const act = scenes[index].act;
    let minutes = 0;
    for (let i = 0; i < index; i++) if (scenes[i].act === act) minutes += scenes[i].minutes;
    return Math.round(minutes * 60000);
  }

  function paceStatus(elapsedMs, plannedMs, toleranceMs = 60000) {
    const diff = elapsedMs - plannedMs;
    if (diff > toleranceMs) return 'behind';
    if (diff < -toleranceMs) return 'ahead';
    return 'on';
  }

  function createActClock(now = () => Date.now()) {
    const started = {};
    return {
      mark(act) { if (!(act in started)) started[act] = now(); },
      elapsed(act) { return act in started ? now() - started[act] : 0; },
      reset(act) { started[act] = now(); },
      total() {
        const times = Object.values(started);
        return times.length ? now() - Math.min(...times) : 0;
      },
    };
  }

  const api = { formatClock, plannedMsBefore, paceStatus, createActClock };
  if (typeof module === 'object' && module.exports) module.exports = api;
  else root.Timer = api;
})(globalThis);
