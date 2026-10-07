/* ACT IV places: pixel rooms over a dithered canvas sky. Declarations only; drawings live in css/places-game.css. */
(function (root) {
  'use strict';
  const reg = (typeof module === 'object' && module.exports) ? require('./registry.js') : root.PlaceDecls;
  reg.register('game', {});
})(globalThis);
