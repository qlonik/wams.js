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

   this.connection = new Connection();
   this.racer = {
      path: util.RACER_PATH
   };

   this.modelReady = false;

   this.connection.on(SOCKET_EVENTS.racerBundle, function(err, data) {
      if (err) { throw err; }

      _this.id = data.id;
      _this.racer.store = racer.init(data.bundle);
   });
   racer.ready(function(model) {
      _this.modelReady = true;
      _this.racer.model = model;
      _this.browserModelPath = _this.racer.path + '.clients.' + _this.id;
      _this.browserModel = model.at(_this.browserModelPath);
      _this.emit(BROWSER_EVENTS.modelFetched, null);
   });

   this.updateModel();
}

util.merge(WAMS.prototype, EventEmitter.prototype);


WAMS.prototype.updateModel = function(path, value) {
   var _this = this;

   function update() {
      var model = _this.browserModel;

      if (!path) {
         model.setDiff('id', _this.id);
      } else {
         if (util.isArray(value)) {
            model.setArrayDiffDeep(path, value);
         } else {
            model.setDiffDeep(path, value);
         }
      }
   }

   if (this.modelReady) {
      update();
   } else {
      this.once(BROWSER_EVENTS.modelFetched, update);
   }
};

WAMS.util = util;

WAMS._Connection = Connection;
WAMS._MTCreator = MTCreator;

WAMS.JSON2HTML = JSON2HTML;
WAMS.HTML2JSON = HTML2JSON;

module.exports = WAMS;
