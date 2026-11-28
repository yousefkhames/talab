const test = require('node:test'), assert = require('node:assert/strict');
require('./gates.js').runGates(test, assert, { dictFile: ['i18n.js', 'shop-i18n.js'] });
