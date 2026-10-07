/* ACT II places: felt appliqué inside an embroidery hoop. Declarations only; drawings live in css/places-textile.css. */
(function (root) {
  'use strict';
  const reg = (typeof module === 'object' && module.exports) ? require('./registry.js') : root.PlaceDecls;
  const hoop = { layer: 'sky', cls: 'tx-hoop', box: [0, 40, 1280, 640] };
  const label = (text) => ({ layer: 'label', cls: 'tx-label', box: [990, 648, 210, 30], text });
  reg.register('textile', {
    'sewing-room': {
      label: 'The Sewing Room', credit: '', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'sr-window', box: [1160, 52, 110, 200] },
        { layer: 'far', cls: 'sr-dressform', box: [1160, 262, 110, 290] },
        { layer: 'mid', cls: 'sr-machine', box: [14, 44, 190, 76] },
        { layer: 'mid', cls: 'sr-spool', box: [1214, 592, 48, 74] },
        { layer: 'egg', cls: 'sr-pincushion', box: [1218, 558, 44, 28] },
        label('The Sewing Room'),
      ],
    },
    'code-camp': {
      label: 'Code Camp', credit: 'Commodore 64 BASIC; Hour of Code', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'cc-desks', box: [1110, 290, 170, 120] },
        { layer: 'far', cls: 'cc-monitor', box: [1120, 160, 150, 130] },
        { layer: 'mid', cls: 'cc-banner', box: [300, 648, 320, 30], text: 'HOUR OF CODE' },
        { layer: 'mid', cls: 'cc-sampler', box: [12, 40, 198, 80], text: '10 PRINT "HELLO"\n20 GOTO 10' },
        { layer: 'light', cls: 'cc-spot', box: [1170, 300, 110, 340] },
        { layer: 'egg', cls: 'cc-chair', box: [1212, 520, 60, 110] },
        label('Code Camp'),
      ],
    },
    'sampler-wall': {
      label: 'The Sampler Wall', credit: 'Donna Haraway, A Cyborg Manifesto; the Jacquard loom', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'sw-frames', box: [240, 80, 960, 520] },
        { layer: 'mid', cls: 'sw-cyborg', box: [12, 40, 200, 80], text: '“I’d rather be a cyborg\nthan a goddess.”' },
        { layer: 'mid', cls: 'sw-home', box: [560, 648, 260, 30], text: 'HOME SWEET HOME PAGE' },
        { layer: 'egg', cls: 'sw-jacquard', box: [1212, 90, 60, 440] },
        label('The Sampler Wall'),
      ],
    },
    'craft-fair': {
      label: 'The Craft Fair', credit: 'Animal Crossing (Able Sisters); Kid Pix; Twine; Tracery', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'cf-stalls', box: [240, 290, 960, 370] },
        { layer: 'mid', cls: 'cf-bunting', box: [220, 40, 980, 16] },
        { layer: 'mid', cls: 'cf-sign', box: [300, 648, 150, 30], text: 'KID PIX' },
        { layer: 'mid', cls: 'cf-sign', box: [470, 648, 130, 30], text: 'TWINE' },
        { layer: 'mid', cls: 'cf-sign', box: [620, 648, 150, 30], text: 'TRACERY' },
        { layer: 'mid', cls: 'cf-yarn', box: [120, 636, 90, 44] },
        { layer: 'egg', cls: 'cf-able', box: [1210, 150, 66, 200], text: 'ABLE\nSIS\nTERS' },
        label('The Craft Fair'),
      ],
    },
    'quilting-bee': {
      label: 'The Quilting Bee', credit: '', floor: 684,
      pieces: [
        hoop,
        { layer: 'far', cls: 'qb-frame', box: [240, 150, 960, 430] },
        { layer: 'mid', cls: 'qb-chairs', box: [240, 648, 720, 30] },
        { layer: 'mid', cls: 'qb-tea', box: [20, 60, 180, 60] },
        { layer: 'egg', cls: 'qb-robot', box: [1210, 250, 64, 190] },
        label('The Quilting Bee'),
      ],
    },
  });
})(globalThis);
