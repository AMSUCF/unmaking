/* Node entry: load every craft's place declarations and return the shared registry. */
'use strict';
const registry = require('./registry.js');
require('./paper.js');
require('./textile.js');
require('./zine.js');
require('./game.js');
module.exports = registry;
