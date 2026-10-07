/* ACT IV places: pixel rooms over a dithered canvas sky. Declarations only; drawings live in css/places-game.css. */
(function (root) {
  'use strict';
  const reg = (typeof module === 'object' && module.exports) ? require('./registry.js') : root.PlaceDecls;
  const floor = (cls) => ({ layer: 'near', cls: 'g-floor ' + cls, box: [0, 570, 1280, 150] });
  reg.register('game', {
    workshop: {
      label: 'THE WORKSHOP', credit: 'The Secret of Monkey Island: a rubber chicken with a pulley in the middle', floor: 570,
      sky: { top: '#6b4a2e', bottom: '#4a3220', particles: 'dust' },
      pieces: [
        { layer: 'far', cls: 'gw-pegboard', box: [240, 90, 520, 300] },
        { layer: 'mid', cls: 'gw-bench', box: [880, 530, 300, 40] },
        { layer: 'mid', cls: 'gw-lamp', box: [1204, 64, 66, 220] },
        { layer: 'egg', cls: 'gw-chicken', box: [120, 44, 44, 72] },
        floor('gw-floor'),
      ],
    },
    museum: {
      label: 'MUSEUM OF TALKING MACHINES', credit: '2001: A Space Odyssey (HAL 9000)', floor: 570,
      sky: { top: '#141428', bottom: '#0a0a14', particles: 'dust' },
      pieces: [
        { layer: 'far', cls: 'gm-plinth', box: [320, 300, 170, 230] },
        { layer: 'far', cls: 'gm-plinth', box: [820, 300, 170, 230] },
        { layer: 'mid', cls: 'gm-plaque', box: [300, 536, 210, 26], text: 'E.L.I.Z.A. · 1966' },
        { layer: 'mid', cls: 'gm-plaque', box: [800, 536, 210, 26], text: 'RACTER · 1984' },
        { layer: 'egg', cls: 'gm-hal', box: [1210, 170, 56, 56] },
        floor('gm-floor'),
      ],
    },
    office: {
      label: "THE AGENT'S OFFICE", credit: 'Clippy (Microsoft Office); the Undertale save star', floor: 570,
      sky: { top: '#2e3a5a', bottom: '#1e2740' },
      pieces: [
        { layer: 'far', cls: 'go-crt', box: [980, 90, 220, 180] },
        { layer: 'mid', cls: 'go-clippy', box: [1206, 250, 66, 110] },
        { layer: 'mid', cls: 'go-bubble', box: [260, 536, 560, 28], text: '“It looks like you’re writing a talk.”' },
        { layer: 'mid', cls: 'go-desk', box: [880, 530, 320, 40] },
        { layer: 'egg', cls: 'go-save', box: [150, 64, 40, 40] },
        floor('go-floor'),
      ],
    },
    commons: {
      label: 'THE COMMONS', credit: 'Undertale: Bratty & Catty’s alley', floor: 570,
      sky: { top: '#7fb0d8', bottom: '#f2c78a' },
      pieces: [
        { layer: 'far', cls: 'gk-capitol', box: [500, 250, 320, 280] },
        { layer: 'mid', cls: 'gk-palm', box: [1204, 240, 72, 330] },
        { layer: 'egg', cls: 'gk-cans', box: [1000, 532, 84, 38] },
        floor('gk-floor'),
      ],
    },
    frontier: {
      label: 'THE FRONTIER', credit: 'Portal (Valve, 2007)', floor: 570,
      sky: { top: '#05050c', bottom: '#0b1830', particles: 'stars' },
      pieces: [
        { layer: 'far', cls: 'gf-corridor', box: [220, 64, 980, 466] },
        { layer: 'light', cls: 'gf-glow', box: [540, 110, 240, 300] },
        { layer: 'egg', cls: 'gf-cake', box: [260, 540, 280, 26], text: 'the cake is a lie' },
        floor('gf-floor'),
      ],
    },
    allotment: {
      label: 'THE ALLOTMENT', credit: 'Stardew Valley', floor: 570,
      sky: { top: '#9fd1ff', bottom: '#e9f6ff' },
      pieces: [
        { layer: 'far', cls: 'ga-fence', box: [220, 420, 980, 110] },
        { layer: 'mid', cls: 'ga-beds', box: [240, 532, 600, 38] },
        { layer: 'mid', cls: 'ga-rack', box: [1204, 380, 70, 190] },
        { layer: 'egg', cls: 'ga-scarecrow', box: [120, 40, 56, 80] },
        floor('ga-floor'),
      ],
    },
    quad: {
      label: 'THE COMMONS, AT SUNRISE', credit: '', floor: 570,
      sky: { top: '#ffb46b', bottom: '#8fc1e6' },
      pieces: [
        { layer: 'far', cls: 'gq-library', box: [600, 200, 420, 330] },
        { layer: 'mid', cls: 'gq-students', box: [300, 534, 260, 36] },
        { layer: 'mid', cls: 'gq-tree', box: [1204, 260, 72, 310] },
        floor('gq-floor'),
      ],
    },
    road: {
      label: 'THE ROAD AT THE END OF THE WORLD', credit: 'Kentucky Route Zero (Cardboard Computer); Carol & the End of the World', floor: 570,
      sky: { top: '#0b0820', bottom: '#1a1238', particles: 'stars' },
      pieces: [
        { layer: 'light', cls: 'gd-planet', box: [880, 80, 240, 240] },
        { layer: 'light', cls: 'gd-cone', box: [1110, 64, 170, 470] },
        { layer: 'mid', cls: 'gd-post', box: [1220, 64, 12, 506] },
        { layer: 'mid', cls: 'gd-moto', box: [300, 532, 130, 38] },
        floor('gd-floor'),
      ],
    },
  });
})(globalThis);
