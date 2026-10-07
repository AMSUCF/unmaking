/* ACT III places: photocopied collage in 90s browser windows. Declarations only; drawings live in css/places-zine.css. */
(function (root) {
  'use strict';
  const reg = (typeof module === 'object' && module.exports) ? require('./registry.js') : root.PlaceDecls;
  const win = (label) => [
    { layer: 'sky', cls: 'zw-window', box: [36, 50, 1208, 650] },
    { layer: 'label', cls: 'zw-titlebar', box: [36, 50, 1208, 30], text: `${label} - Netscape` },
  ];
  reg.register('zine', {
    'flash-graveyard': {
      label: 'The Flash Graveyard', credit: 'Adobe Flash (1996–2020)', floor: 684,
      pieces: [
        ...win('The Flash Graveyard'),
        { layer: 'far', cls: 'fg-stones', box: [236, 548, 1000, 100] },
        { layer: 'mid', cls: 'fg-flash', box: [1210, 420, 62, 130], text: 'RIP\nFLASH\n1996-\n2020' },
        { layer: 'mid', cls: 'fg-fence', box: [220, 650, 700, 46] },
        { layer: 'egg', cls: 'fg-getflash', box: [20, 86, 190, 32], text: 'Get Flash Player' },
      ],
    },
    'wayback-stacks': {
      label: 'The Wayback Stacks', credit: 'Internet Archive Wayback Machine; BlueMaxima’s Flashpoint', floor: 684,
      pieces: [
        ...win('The Wayback Stacks'),
        { layer: 'far', cls: 'ws-shelves', box: [240, 100, 960, 540] },
        { layer: 'mid', cls: 'ws-floppies', box: [686, 650, 338, 46] },
        { layer: 'mid', cls: 'ws-banner', box: [300, 650, 380, 30], text: 'WAYBACK MACHINE' },
        { layer: 'egg', cls: 'ws-cart', box: [1212, 300, 56, 80], text: 'FLASH\nPOINT' },
      ],
    },
    babel: {
      label: 'The Library of Babel', credit: 'Jorge Luis Borges, “The Library of Babel”', floor: 684,
      pieces: [
        ...win('The Library of Babel'),
        { layer: 'far', cls: 'lb-hex', box: [220, 84, 1000, 560] },
        { layer: 'mid', cls: 'lb-hose', box: [1212, 84, 60, 560] },
        { layer: 'egg', cls: 'lb-sign', box: [300, 652, 440, 30], text: 'PLEASE DO NOT FEED THE CRAWLERS' },
      ],
    },
    geocities: {
      label: 'GeoCities', credit: 'GeoCities neighborhoods (1994–2009)', floor: 684,
      pieces: [
        ...win('GeoCities'),
        { layer: 'far', cls: 'gc-tiles', box: [220, 84, 1000, 560] },
        { layer: 'mid', cls: 'gc-signs', box: [240, 650, 620, 34], text: 'Area51 · Hollywood · Heartland · SoHo' },
        { layer: 'mid', cls: 'gc-construction', box: [16, 84, 196, 36], text: 'UNDER CONSTRUCTION' },
        { layer: 'egg', cls: 'gc-webring', box: [1212, 500, 60, 40], text: '◄ ►' },
      ],
    },
    'bot-garden': {
      label: 'The Bot Garden', credit: 'Cheap Bots, Done Quick!; botsin.space', floor: 684,
      pieces: [
        ...win('The Bot Garden'),
        { layer: 'far', cls: 'bg-rows', box: [240, 420, 960, 230] },
        { layer: 'mid', cls: 'bg-cage', box: [30, 80, 90, 40] },
        { layer: 'mid', cls: 'bg-tools', box: [300, 650, 400, 32], text: 'MAINTENANCE IS RESISTANCE' },
        { layer: 'mid', cls: 'bg-arcade', box: [1212, 430, 60, 170], text: 'INSERT\nCOIN' },
        { layer: 'egg', cls: 'bg-birds', box: [1212, 110, 60, 220] },
      ],
    },
  });
})(globalThis);
