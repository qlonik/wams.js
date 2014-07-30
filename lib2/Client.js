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
   TYPE = 'client';

function Client(racer, socket) {
   EventEmitter.call(this);
   this.racer = racer;
   this.socket = socket;

   var _this = this,
      model = racer.model,
      path = racer.path;

   this.id = model.id();
   this.type = TYPE;
   this.clientReady = false;
   this.modelReady = false;
   this.clientModelPath = path + '.clients.' + this.id;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.workspaces = [];

   this.clientModel = model.at(this.clientModelPath);

   this.socket.on(SOCKET_EVENTS.disconnect, function() {
      _this.cleanModel();
   });
   model.fetch(path, function(err) {
      if (!err) {
         _this.modelReady = true;
      }
      _this.emit(CLIENT_EVENTS.modelFetched, err);
   });
   this.socket.on(SOCKET_EVENTS.ready, function(err) {
      if (err) {
         _this.emit(CLIENT_EVENTS.ready, err);
      } else {
         _this.clientReady = true;
         _this.emit(CLIENT_EVENTS.ready, null);
      }
   });

   this.updateModel();
   this.sendModel();
}

util.merge(Client.prototype, EventEmitter.prototype);


Client.prototype.updateModel = function(path, value) {
   var _this = this,
      mainModel = this.racer.model, mainPath = this.racer.path,
      model = this.clientModel;

//   mainModel.fetch(mainPath, function(err) {
//      if (err) {
//         _this.emit(CLIENT_EVENTS.modelUpdated, err);
//      } else {
         if (!path) {
            model.setDiff('id', _this.id);
            model.setDiff('type', _this.type);
            model.setDiff('clientReady', _this.clientReady);
            model.setDiff('clientModelPath', _this.clientModelPath);
            model.setDiffDeep('shape', _this.shape);
            model.setArrayDiff('workspaces', util.map(_this.workspaces, util.getID));
         } else {
            if (util.isArray(value)) {
               model.setArrayDiffDeep(path, value);
            } else {
               model.setDiffDeep(path, value);
            }
         }

         _this.emit(CLIENT_EVENTS.modelUpdated, null);
//      }
//   });
};
Client.prototype.cleanModel = function() {
   var model = this.clientModel;

//   model.fetch(function(err) {
//      if (err) { throw err; }

      model.del();
//   });
};
Client.prototype.sendModel = function() {
   var _this = this,
      mainModel = this.racer.model, mainPath = this.racer.path;

   mainModel.bundle(function (err, b) {
      if (err) {
         _this.socket.emit(SOCKET_EVENTS.racerBundle, err);
         throw err;
      }

      _this.socket.emit(SOCKET_EVENTS.racerBundle, null, {
         id: _this.id,
         bundle: b,
         path: mainPath
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

module.exports = Client;