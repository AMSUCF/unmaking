/* ACT I places: cut-paper dioramas. Declarations only; drawings live in css/places-paper.css. */
(function (root) {
  'use strict';
  const reg = (typeof module === 'object' && module.exports) ? require('./registry.js') : root.PlaceDecls;
  const tab = (label) => ({ layer: 'label', cls: 'paper-tab', box: [236, 0, 210, 46], text: label });
  reg.register('paper', {
    storybook: {
      label: 'The Storybook', credit: '', floor: 684,
      pieces: [
        { layer: 'far', cls: 'sb-table', box: [0, 500, 1280, 220] },
        { layer: 'far', cls: 'sb-book', box: [170, 70, 940, 540] },
        { layer: 'mid', cls: 'sb-tab sb-tab-1', box: [700, 10, 92, 40], text: 'paper' },
        { layer: 'mid', cls: 'sb-tab sb-tab-2', box: [798, 10, 92, 40], text: 'thread' },
        { layer: 'mid', cls: 'sb-tab sb-tab-3', box: [896, 10, 92, 40], text: 'zine' },
        { layer: 'mid', cls: 'sb-tab sb-tab-4', box: [994, 10, 120, 40], text: 'cartridge' },
        { layer: 'egg', cls: 'sb-crane', box: [1214, 560, 58, 50] },
        { layer: 'near', cls: 'sb-edge', box: [0, 662, 1280, 58] },
        tab('The Storybook'),
      ],
    },
    hamlet: {
      label: 'Handmade Hamlet', credit: 'Personal homepages, webrings and guestbooks', floor: 684,
      pieces: [
        { layer: 'far', cls: 'hm-hill', box: [0, 420, 1280, 300] },
        { layer: 'far', cls: 'hm-cottage', box: [250, 330, 150, 150] },
        { layer: 'far', cls: 'hm-cottage hm-c2', box: [560, 300, 170, 180] },
        { layer: 'far', cls: 'hm-cottage hm-c3', box: [900, 340, 150, 140] },
        { layer: 'mid', cls: 'hm-mailbox', box: [140, 630, 56, 54], text: 'guest\nbook' },
        { layer: 'mid', cls: 'hm-bridge', box: [420, 650, 460, 46], text: '◄ webring ►' },
        { layer: 'egg', cls: 'hm-sawhorse', box: [1000, 664, 64, 40] },
        { layer: 'egg', cls: 'hm-sawhorse', box: [1212, 640, 56, 40] },
        { layer: 'near', cls: 'hm-grass', box: [0, 682, 1280, 38] },
        tab('Handmade Hamlet'),
      ],
    },
    'platform-city': {
      label: 'Platform City', credit: 'Cory Doctorow, enshittification', floor: 684,
      pieces: [
        { layer: 'far', cls: 'pc-tower pc-t1', box: [300, 130, 190, 560] },
        { layer: 'far', cls: 'pc-tower pc-t2', box: [560, 90, 190, 600] },
        { layer: 'far', cls: 'pc-tower pc-t3', box: [820, 150, 190, 540] },
        { layer: 'mid', cls: 'pc-billboard', box: [1212, 170, 60, 210], text: 'ADS\nADS\nADS' },
        { layer: 'egg', cls: 'pc-msign', box: [1110, 6, 46, 46], text: 'M' },
        { layer: 'near', cls: 'pc-street', box: [0, 660, 1280, 60] },
        tab('Platform City'),
      ],
    },
    'mid-world': {
      label: 'Mid-World', credit: 'The Dark Tower, Stephen King (Blaine the Mono, the rose); Pac-Man; Moltbook', floor: 684,
      pieces: [
        { layer: 'far', cls: 'mw-dusk', box: [0, 0, 1280, 720] },
        { layer: 'far', cls: 'mw-dunes', box: [0, 430, 1280, 290] },
        { layer: 'far', cls: 'mw-tower', box: [1030, 80, 84, 370] },
        { layer: 'egg', cls: 'mw-ghost', box: [320, 200, 64, 74], quiet: true },
        { layer: 'egg', cls: 'mw-ghost mw-pac', box: [880, 130, 64, 64], quiet: true },
        { layer: 'egg', cls: 'mw-monorail', box: [0, 72, 212, 40], text: 'BLAINE' },
        { layer: 'egg', cls: 'mw-gunslinger', box: [1228, 520, 16, 32] },
        { layer: 'egg', cls: 'mw-lobster', box: [700, 656, 64, 44] },
        { layer: 'near', cls: 'mw-rose', box: [1212, 590, 60, 120] },
        { layer: 'near', cls: 'mw-sand', box: [0, 680, 1280, 40] },
        tab('Mid-World'),
      ],
    },
    'gallery-row': {
      label: 'Gallery Row', credit: 'Apricitas Economics; Andersen v. Stability AI', floor: 684,
      pieces: [
        { layer: 'far', cls: 'gy-shops', box: [220, 240, 1000, 430], text: 'FOR LEASE          FOR LEASE          FOR LEASE' },
        { layer: 'mid', cls: 'gy-columns', box: [1210, 110, 68, 560] },
        { layer: 'egg', cls: 'gy-lamp', box: [150, 6, 40, 110] },
        { layer: 'near', cls: 'gy-sidewalk', box: [0, 664, 1280, 56] },
        tab('Gallery Row'),
      ],
    },
    'companion-shop': {
      label: 'The Companion Shop', credit: 'Sanrio, Tamagotchi, Furby; Meta’s Jolly', floor: 684,
      pieces: [
        { layer: 'far', cls: 'cs-window', box: [200, 60, 1040, 600] },
        { layer: 'mid', cls: 'cs-shelf', box: [460, 6, 720, 48] },
        { layer: 'egg', cls: 'cs-furby', box: [1190, 4, 60, 50] },
        { layer: 'mid', cls: 'cs-tamagotchi', box: [1214, 280, 52, 66] },
        { layer: 'mid', cls: 'cs-yeti', box: [1212, 400, 62, 112] },
        { layer: 'mid', cls: 'cs-tag', box: [600, 654, 120, 38], text: 'FREE*' },
        { layer: 'occluder', cls: 'cs-counter', box: [0, 632, 220, 88] },
        tab('The Companion Shop'),
      ],
    },
    worktable: {
      label: 'The Worktable', credit: 'Mouse Trap (Ideal, 1963)', floor: 684,
      pieces: [
        { layer: 'far', cls: 'wt-mat', box: [180, 70, 1060, 610] },
        { layer: 'mid', cls: 'wt-scissors', box: [1212, 420, 62, 150] },
        { layer: 'mid', cls: 'wt-pattern', box: [300, 650, 230, 56], text: 'CUT ON FOLD' },
        { layer: 'mid', cls: 'wt-pattern wt-pattern-2', box: [820, 654, 170, 52], text: 'GRAIN →' },
        { layer: 'egg', cls: 'wt-mousetrap', box: [880, 4, 300, 50] },
        tab('The Worktable'),
      ],
    },
  });
})(globalThis);
