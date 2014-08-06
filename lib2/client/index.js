var EventEmitter = require('events').EventEmitter,

   racer = require('racer'),

   util = require('../util'),
   Connection = require('./Connection'),
   MTCreator = require('./MTCreator'),
   JSON2HTML = require('./JSON2HTML'),
   HTML2JSON = require('./HTML2JSON');

var SOCKET_EVENTS = util.SOCKET_EVENTS,
   HAMMER_EVENTS = util.HAMMER_EVENTS,
   BROWSER_EVENTS = util.BROWSER_EVENTS,
   DEFAULT_SHAPE = {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      r: 0,       // rotation
      s: 100      // scale
   };

function WAMS() {
   EventEmitter.call(this);

   var _this = this;
}

util.merge(WAMS.prototype, EventEmitter.prototype);


WAMS.util = util;

WAMS._Connection = Connection;
WAMS._MTCreator = MTCreator;

WAMS.JSON2HTML = JSON2HTML;
WAMS.HTML2JSON = HTML2JSON;

module.exports = WAMS;
