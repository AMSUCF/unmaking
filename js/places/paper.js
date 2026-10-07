/* ACT I places: cut-paper dioramas. Declarations only; drawings live in css/places-paper.css. */
(function (root) {
  'use strict';
  const reg = (typeof module === 'object' && module.exports) ? require('./registry.js') : root.PlaceDecls;
  reg.register('paper', {});
})(globalThis);
