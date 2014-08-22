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
   },
   TYPE = util.CLIENT_TYPE;

function WAMS() {
   EventEmitter.call(this);

   var _this = this,
      path = util.RACER_PATH;

   this.connection = new Connection();
   this.mtCreator = new MTCreator();
   this.shape = util.clone(DEFAULT_SHAPE);

   this.clientReady = false;
   this.modelReady = false;

   this.mergeShape({ w: window.innerWidth, h: window.innerHeight });

   this.connection.on(SOCKET_EVENTS.racerBundle, function(err, data) {
      if (err) { throw err; }

      _this.id = data.id;
      _this.store = racer.init(data.bundle);
   });
   racer.ready(function(mainModel) {
      _this.model = mainModel;
      _this.browserModelPath = path + '.' + TYPE + '.' + _this.id;
      _this.browserModel = mainModel.at(_this.browserModelPath);

      mainModel.subscribe(path, function() {
         _this.modelReady = true;
         _this.emit(BROWSER_EVENTS.modelFetched, null);
      });
   });

   _this.once(BROWSER_EVENTS.modelFetched, function(err) {
      setTimeout(function() {
         _this.connection.emit(SOCKET_EVENTS.ready, err);
      }, 1000);
      if (err) {
         throw err;
      } else {
         _this.clientReady = true;
      }
   });
}

util.merge(WAMS.prototype, EventEmitter.prototype);


WAMS.prototype.updateModel = function(path, value) {
   var _this = this;

   function update(err) {
      if (err) { throw err; }

      var model = _this.browserModel;

      if (!path) {
         model.setDiff('id', _this.id);
         model.setDiffDeep('shape', _this.shape);
      } else {
         if (util.isArray(value)) {
            model.setArrayDiffDeep(path, value);
         } else {
            model.setDiffDeep(path, value);
         }
      }

      _this.emit(BROWSER_EVENTS.modelUpdated, null);
   }

   if (this.modelReady) {
      update(null);
   } else {
      this.once(BROWSER_EVENTS.modelFetched, update);
   }
};
WAMS.prototype.mergeShape = function(newShape) {
   util.merge(this.shape, newShape);

   this.updateModel('shape', this.shape);
};

WAMS.prototype.createMTElement = function(html, opts) {
   return this.mtCreator.create(html, opts);
};
WAMS.prototype.removeMTElement = function(mt) {
   return this.mtCreator.remove(mt);
};
WAMS.prototype.sendMTEvent = function(ev) {
   var target = ev.target, classes = target.classList, parent = target,
      obj = {
         src: {},
         mt: this.mtCreator.getEventMetadata(ev)
      };

   if (util.indexOf(classes, util.WORKSPACE_OBJECT_TYPE) > -1) {
      obj.src.type = util.WORKSPACE_OBJECT_TYPE;
      obj.src.id = target.id;

      while (util.indexOf(parent.classList, util.WORKSPACE_TYPE) === -1 && parent) {
         parent = parent.parentNode;
      }
      obj.src.wrkspc = parent.id;
   } else if (util.indexOf(classes, util.WORKSPACE_TYPE) > -1) {
      obj.src.type = util.WORKSPACE_TYPE;
      obj.src.id = target.id;

      obj.src.wrkspc = parent.id;
   }

   this.connection.emit(SOCKET_EVENTS.MTEvent, null, obj);
};

WAMS.prototype.getWorkspaceJSON = function(cb) {
   var _this = this;

   function get(err) {
      var model = _this.browserModel, mainModel = _this.model,
         mainPath = util.RACER_PATH;

      if (err) {
         cb(err);
      } else {
         var uuids = model.get('workspaces');

         if (util.isUndefined(uuids) || util.isEmpty(uuids)) {
            cb(null);
         } else {
            var res = uuids.map(function(uuid) {
               return mainModel.get(mainPath + '.' + util.WORKSPACE_TYPE + '.' + uuid + '.html');
            });
            if (res.length === 1) {
               res = res[0];
            }

            cb(null, res);
         }
      }
   }

   if (this.modelReady) {
      get(null)
   } else {
      _this.once(BROWSER_EVENTS.modelFetched, function(err) {
         get(err);
      });
   }
};
WAMS.prototype.getWorkspaceHTML = function(cb) {
   this.getWorkspaceJSON(function(err, json) {
      if (err) {
         cb(err);
      } else {
         var res = JSON2HTML(json);
         if (res.length === 1) {
            res = res[0];
         }

         cb(null, res);
      }
   });
};

WAMS.util = util;

WAMS._Connection = Connection;
WAMS._MTCreator = MTCreator;

WAMS.JSON2HTML = JSON2HTML;
WAMS.HTML2JSON = HTML2JSON;

module.exports = WAMS;
