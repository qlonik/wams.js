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

function Workspace(racer) {
   EventEmitter.call(this);
   this.racer = racer;

   var _this = this,
      model = racer.model,
      path = racer.path;

   this.id = model.id();
   this.type = TYPE;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.allConnectedClients = new StorageCreator();
   this.clients = [];
   this.inner = [];

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
}

util.merge(Workspace.prototype, EventEmitter.prototype);


Workspace.prototype.attachServer = function(srv) {
   this.srv = srv;

   var client,
      _this = this;
   //srv listeners
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

         _this.emit(WORKSPACE_EVENTS.clientDisconnected, null, client);
      }
   });
};

module.exports = Workspace;
