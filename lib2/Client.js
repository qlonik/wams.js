var EventEmitter = require('events').EventEmitter,

   util = require('./util');

var SERVER_EVENTS = util.SERVER_EVENTS,
   WORKSPACE_EVENTS = util.WORKSPACE_EVENTS,
   WORKSPACE_OBJECT_EVENTS = util.WORKSPACE_OBJECT_EVENTS,
   CLIENT_EVENTS = util.CLIENT_EVENTS,
   SOCKET_EVENTS = util.SOCKET_EVENTS,
   HAMMER_EVENTS = util.HAMMER_EVENTS,
   DEFAULT_SHAPE = {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      r: 0,       // rotation
      s: 100      // scale
   },
   TYPE = util.CLIENT_TYPE;

function Client(store, socket) {
   EventEmitter.call(this);
   this.store = store;
   this.socket = socket;

   var _this = this,
      model = store.createModel(),
      path = util.RACER_PATH;

   this.model = model;
   this.id = model.id();
   this.type = TYPE;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.workspaces = [];
   this.storage = {};

   this.clientReady = false;
   this.modelReady = false;
   this.clientModelPath = path + '.' + TYPE + '.' + this.id;

   this.updateModel();
   this.sendModel();

   this.socket.on(SOCKET_EVENTS.ready, function(err) {
      if (!err) {
         _this.clientReady = true;
      }
      _this.emit(CLIENT_EVENTS.ready, err);
   });
   this.socket.on(SOCKET_EVENTS.disconnect, function() {
      _this.cleanModel();
   });

   model.subscribe(path, function() {
      _this.modelReady = true;
      _this.clientModel = model.at(_this.clientModelPath);

      _this.clientModel.on('change', '**', function(pathS, val, old, passed) {
         if (passed.$remote) {
            var path = pathS.split('.'), last = path.pop(),
               i = -1, len = path.length, el = _this;

            while (++i < len) {
               el = el[path[i]];
            }

            if (last) {
               el[last] = val;
            } else {
               el = val;
            }
         }
      });

      _this.emit(CLIENT_EVENTS.modelFetched, null);
   });

   this.socket.on(SOCKET_EVENTS.MTEvent, function(err, ev) {
      if (err) {
         util.forEach(HAMMER_EVENTS, function(type) {
            _this.emit(type, err);
         });
      } else {
         var workspace, element,
            type = ev.src.type, id = ev.src.id, wrkspc = ev.src.wrkspc,
            mt = ev.mt;

         workspace = util.find(_this.workspaces, function (ws) {
            return ws.equal(wrkspc);
         });

         if (type === 'workspace') {
            workspace.emit(mt.type, null, workspace, _this, mt);
         } else if (type === 'workspaceObject') {
            element = util.find(workspace.inner, function (el) {
               return el.equal(id);
            });
            element.emit(mt.type, null, workspace, _this, mt);
         }
      }
   });
}

util.merge(Client.prototype, EventEmitter.prototype);


Client.prototype.updateModel = function(path, value) {
   var _this = this;

   function update(err) {
      if (err) { throw err; }

      var model = _this.clientModel;

      if (!path) {
         model.setDiff('id', _this.id);
         model.setDiff('type', _this.type);
         model.setDiffDeep('shape', _this.shape);
         model.setArrayDiff('workspaces', util.map(_this.workspaces, util.getID));
         model.setDiffDeep('storage', _this.storage);
      } else {
         if (util.isArray(value)) {
            model.setArrayDiffDeep(path, value);
         } else {
            model.setDiffDeep(path, value);
         }
      }

      _this.emit(CLIENT_EVENTS.modelUpdated, null);
   }

   if (this.modelReady) {
      update(null);
   } else {
      this.once(CLIENT_EVENTS.modelFetched, update);
   }
};
Client.prototype.cleanModel = function() {
   var model = this.clientModel;

   model.del();
};
Client.prototype.sendModel = function() {
   var _this = this, mainModel = this.store.createModel();

   mainModel.bundle(function (err, b) {
      if (err) {
         _this.socket.emit(SOCKET_EVENTS.racerBundle, err);
         throw err;
      }

      _this.socket.emit(SOCKET_EVENTS.racerBundle, null, {
         id: _this.id,
         bundle: b
      });
   });
};
Client.prototype.equal = function(param) {
   return !!(
      (this.id === param) ||
      (this.socket === param) ||
      (param.id && (this.id === param.id)) ||
      (param.socket && (this.socket === param.socket))
      );
};
Client.prototype.set = function(key, val) {
   this.storage[key] = val;

   this.updateModel('storage', this.storage);
};
Client.prototype.del = function(key) {
   delete this.storage[key];

   this.updateModel('storage', this.storage);
};
Client.prototype.get = function(key) {
   return this.storage[key];
};
Client.prototype.addWorkspace = function(wrkspc) {
   this.workspaces.push(wrkspc);
   this.updateModel('workspaces', util.map(this.workspaces, util.getID));
   this.emit(CLIENT_EVENTS.attachedWorkspace, null, wrkspc);
};
Client.prototype.removeWorkspace = function(param) {
   var removed = util.remove(this.workspaces, function(wrkspc) {
      return wrkspc.equal(param);
   });
   if (removed.length === 1) {
      removed = removed[0];
   }
   this.updateModel('workspaces', util.map(this.workspaces, util.getID));
   this.emit(CLIENT_EVENTS.detachedWorkspace, null, removed);
};

module.exports = Client;