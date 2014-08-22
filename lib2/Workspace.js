var EventEmitter = require('events').EventEmitter,

   util = require('./util'),
   StorageCreator = require('./Store'),
   WorkspaceObject = require('./WorkspaceObject'),
   ClientCreator = require('./Client');

var SERVER_EVENTS = util.SERVER_EVENTS,
   WORKSPACE_EVENTS = util.WORKSPACE_EVENTS,
   WORKSPACE_OBJECT_EVENTS = util.WORKSPACE_OBJECT_EVENTS,
   CLIENT_EVENTS = util.CLIENT_EVENTS,
   DEFAULT_SHAPE = {
      x: 0,
      y: 0,
      w: 1000,
      h: 1000,
      r: 0,       // rotation
      s: 100      // scale
   },
   DEFAULT_HTML = {
      tag: 'div',
      attr: {},
      style: {},
      inner: []
   },
   TYPE = util.WORKSPACE_TYPE;

function Workspace(store, srv) {
   EventEmitter.call(this);
   this.store = store;

   if (srv) {
      this.attachServer(srv);
   }

   var _this = this,
      model = store.createModel(),
      path = util.RACER_PATH;

   this.model = model;
   this.id = model.id();
   this.type = TYPE;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.storage = {};
   this.parent = [];
   this.clients = [];
   this.inner = [];

   this.modelReady = false;
   this.workspaceModelPath = path + '.workspaces.' + this.id;
   this.workspaceModel = model.at(this.workspaceModelPath);

   this.html = util.cloneDeep(DEFAULT_HTML);

   this.mergeAttr({ id: _this.id, class: [_this.type] });

   model.fetch(path, function(err) {
      if (!err) {
         _this.modelReady = true;
      }
      _this.emit(WORKSPACE_EVENTS.modelFetched, err);
   });

   model.subscribe(path, function() {
      _this.workspaceModel.on('change', '**', function(pathS, val, old, passed) {
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
   });

   this.updateModel();
}

util.merge(Workspace.prototype, EventEmitter.prototype);


/**
 * Attaches server to the current {@link Workspace} and adds listeners
 * for connected and disconnected clients.
 * @param {Server} srv Server instance
 */
Workspace.prototype.attachServer = function(srv) {
   this.srv = srv;
   this.allConnectedClients = new StorageCreator();

   var client,
      _this = this;

   this.srv.on(SERVER_EVENTS.connectClient, function(err, socket) {
      if (err) {
         _this.emit(WORKSPACE_EVENTS.clientConnected, err);
         _this.emit(WORKSPACE_EVENTS.clientReady, err);
      } else {
         client = new ClientCreator(_this.store, socket);
         _this.allConnectedClients.push(client);

         _this.emit(WORKSPACE_EVENTS.clientConnected, null, _this, client);

         client.on(CLIENT_EVENTS.ready, function(err) {
            if (err) {
               _this.emit(WORKSPACE_EVENTS.clientReady, err);
            } else {
               _this.emit(WORKSPACE_EVENTS.clientReady, null, _this, client);
            }
         });
      }
   });
   this.srv.on(SERVER_EVENTS.disconnectClient, function(err, socket) {
      if (err) {
         _this.emit(WORKSPACE_EVENTS.clientDisconnected, err);
      } else {
         client = _this.allConnectedClients.remove(socket);
         if (client.length === 1) {
            client = client[0];
         }

         _this.emit(WORKSPACE_EVENTS.clientDisconnected, null, _this, client);
      }
   });
};
Workspace.prototype.updateModel = function(path, value) {
   var _this = this;

   function update(err) {
      if (err) { throw err; }

      var model = _this.workspaceModel;

      if (!path) {
         model.setDiff('id', _this.id);
         model.setDiff('type', _this.type);
         model.setDiffDeep('shape', _this.shape);
         model.setDiffDeep('storage', _this.storage);
         model.setArrayDiff('parent', util.map(_this.parent, util.getID));
         model.setArrayDiff('clients', util.map(_this.clients, util.getID));
         model.setArrayDiff('inner', util.map(_this.inner, util.getID));

         model.setDiffDeep('html', _this.html);
      } else {
         if (util.isArray(value)) {
            model.setArrayDiffDeep(path, value);
         } else {
            model.setDiffDeep(path, value);
         }
      }

      _this.emit(WORKSPACE_EVENTS.modelUpdated, null);
   }

   if (this.modelReady) {
      update(null);
   } else {
      this.once(WORKSPACE_EVENTS.modelFetched, update);
   }
};
Workspace.prototype.equal = function(workspace) {
   return !!(
      (this.id === workspace) ||
      (workspace.id && (this.id === workspace.id))
      );
};
Workspace.prototype.set = function(key, val) {
   this.storage[key] = val;

   this.updateModel('storage', this.storage);
};
Workspace.prototype.del = function(key) {
   delete this.storage[key];

   this.updateModel('storage', this.storage);
};
Workspace.prototype.get = function(key) {
   return this.storage[key];
};
Workspace.prototype.mergeShape = function(newShape) {
   util.merge(this.shape, newShape);

   this.updateModel('shape', this.shape);
};
Workspace.prototype.mergeStyle = function(newStyle) {
   util.merge(this.html.style, newStyle);

   this.updateModel('html.style', this.html.style);
};
Workspace.prototype.mergeAttr = function(newAttr) {
   util.merge(this.html.attr, newAttr);

   this.updateModel('html.attr', this.html.attr);
};
Workspace.prototype.addElement = function(el) {
   this.inner.push(el);
   this.html.inner.push(el.html);

   el.addParent(this);

   this.updateModel('inner', util.map(this.inner, util.getID));
   this.updateModel('html.inner', this.html.inner);
};
/**
 * Remove element by id or by element.
 * If passed parameter has equal method, then we will use it to compare html
 * inner element. Otherwise param will be considered as id.
 * @param {String|WorkspaceObject} param Parameter of element
 */
Workspace.prototype.removeElement = function(param) {
   //remove from inner array
   util.remove(this.inner, function(el) {
      return el.equal(param);
   });
   //remove from html object
   util.remove(this.html.inner, function(el) {
      return !!(
         (param === el.attr.id) ||
         (param.id && (param.id === el.attr.id))
         );
   });

   el.removeParent(this);

   this.updateModel('inner', util.map(this.inner, util.getID));
   this.updateModel('html.inner', this.html.inner);
};
Workspace.prototype.addClient = function(client) {
   this.clients.push(client);

   client.addWorkspace(this);

   this.updateModel('clients', util.map(this.clients, util.getID));
};
Workspace.prototype.removeClient = function(param) {
   var removed = util.remove(this.clients, function(client) {
      return client.equal(param)
   });

   removed.forEach(function(cl) { cl.removeWorkspace(this); });

   this.updateModel('clients', util.map(this.clients, util.getID));
};
Workspace.prototype.addParent = function(parent) {
   this.parent.push(parent);

   this.updateModel('parent', util.map(this.parent, util.getID));
};
Workspace.prototype.removeParent = function(param) {
   util.remove(this.parent, function(el) {
      return el.equal(param);
   });

   this.updateModel('parent', util.map(this.parent, util.getID));
};

module.exports = Workspace;
