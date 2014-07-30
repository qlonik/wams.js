var EventEmitter = require('events').EventEmitter,

   util = require('./util'),
   StorageCreator = require('./Store'),
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
   TYPE = 'workspace';

function Workspace(racer, srv) {
   EventEmitter.call(this);
   this.racer = racer;

   if (srv) {
      this.attachServer(srv);
   }

   var _this = this,
      model = racer.model,
      path = racer.path;

   this.id = model.id();
   this.type = TYPE;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.clients = [];
   this.inner = [];

   this.modelReady = false;
   this.workspaceModelPath = path + '.workspaces.' + this.id;
   this.workspaceModel = model.at(this.workspaceModelPath);

   this.html = {
      tag: 'div',
      attr: {
         id: this.id,
         class: ['workspace']
      },
      style: {
         position: 'absolute'
      },
      inner: []
   };

   model.fetch(path, function(err) {
      if (!err) {
         _this.modelReady = true;
      }
      _this.emit(WORKSPACE_EVENTS.modelFetched, err);
   });

   this.updateModel();
}

util.merge(Workspace.prototype, EventEmitter.prototype);


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
         client = new ClientCreator(_this.racer, socket);
         _this.allConnectedClients.push(client);

         _this.emit(WORKSPACE_EVENTS.clientConnected, null, client);

         client.on(CLIENT_EVENTS.ready, function(err) {
            if (err) {
               _this.emit(WORKSPACE_EVENTS.clientReady, err);
            } else {
               _this.emit(WORKSPACE_EVENTS.clientReady, null, client);
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

         _this.emit(WORKSPACE_EVENTS.clientDisconnected, null, client);
      }
   });
};
Workspace.prototype.updateModel = function(path, value) {
   var _this = this, model = this.workspaceModel;

   if (!path) {
      model.setDiff('id', _this.id);
      model.setDiff('type', _this.type);
      model.setDiffDeep('shape', _this.shape);
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
};
Workspace.prototype.equal = function(workspace) {
   return !!(
      (this.id === workspace) ||
      (workspace.id && (this.id === workspace.id))
      );
};
Workspace.prototype.mergeShape = function(newShape) {
   util.merge(this.shape, newShape);

   this.updateModel('shape', this.shape);
};
Workspace.prototype.mergeStyle = function(newStyle) {
   util.merge(this.html.style, newStyle);

   this.updateModel('html.style', this.html.style);
};
Workspace.prototype.addElement = function(el) {
   this.inner.push(el);
   this.html.inner.push(el.html);

   this.updateModel('inner', util.map(this.inner, util.getID));
   this.updateModel('html.inner', this.html.inner);
};
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

   this.updateModel('inner', util.map(this.inner, util.getID));
   this.updateModel('html.inner', this.html.inner);
};
Workspace.prototype.addClient = function(client) {
   this.clients.push(client);

   this.updateModel('clients', util.map(this.clients, util.getID));
};
Workspace.prototype.removeClient = function(param) {
   var removed = util.remove(this.clients, function(client) {
      return client.equal(param)
   });

   this.updateModel('clients', util.map(this.clients, util.getID));
};

module.exports = Workspace;
