var EventEmitter = require('events').EventEmitter,

   _ = require('lodash'),

   util = require('../util');

var CLIENT_EVENTS = {
      clientDisconnected: 'disconnect',
      shapeChanged: 'changeShape'
   },
   HAMMER_EVENTS = [
      'hold', 'tap', 'doubletap', 'drag', 'dragstart', 'dragend', 'dragup',
      'dragdown', 'dragleft', 'dragright', 'swipe', 'swipeup', 'swipedown',
      'swipeleft', 'swiperight', 'transform', 'transformstart', 'transformend',
      'rotate', 'pinch', 'pinchin', 'pinchout', 'touch', 'release', 'gesture'
   ],
   SOCKET_EVENTS = {
      racerBundle: 'bundle',
      MTEvent: 'mt'
   },
   TYPE = 'client';

function clean(model, client) {
   model.fetch(client.racer.path, function () {
      model.del(client.racer.path + '.clients.' + client.id);
   });
}

function Client(srv, racer, sock) {
   EventEmitter.call(this);
   this.srv = srv;
   this.racer = racer;
   var _this = this,
      model = this.racer.model,
      root = this.racer.path;

   this.id = model.id();
   this.type = TYPE;
   this.shape = {
      x: 0,
      y: 0,
      w: 0,
      h: 0
   };
   this.socket = sock;
   this.workspace = [];

   model.fetch(root, function() {
      model.setEach(root + '.clients.' + _this.id, {
         id: _this.id,
         type: _this.type,
         shape: _this.shape
      });
   });
   this.socket.on('disconnect', function() {
      clean(model, _this);
      _this.emit(CLIENT_EVENTS.clientDisconnected);
   });

   model.bundle(function(err, bundle) {
      if (err) { throw err; }

      _this.socket.emit(SOCKET_EVENTS.racerBundle, null, {
         bundle: bundle,
         id: _this.id,
         root: root
      });
   });

   model.subscribe(root, function() {
      model.on('change', root + '.clients.' + _this.id + '.shape**',
         function (path, newVal, oldVal, passed) {
            if (path === '') {
               _this.shape = newVal;
            } else {
               _this.shape[path] = newVal;
            }
            _this.emit(CLIENT_EVENTS.shapeChanged, null, _this.shape);
         });
   });

   this.socket.on(SOCKET_EVENTS.MTEvent, function(err, data) {
      var MTType = data.type,
         workspaceID = data.target,    // also possible data.srcElement
         workspace = _.find(_this.workspace, function(value) {
            return value.equal(workspaceID);
         });

      workspace.emit(MTType, null, workspace, _this, data);
   });
}

_.merge(Client.prototype, EventEmitter.prototype);

Client.CLIENT_EVENTS = CLIENT_EVENTS;
Client.HAMMER_EVENTS = HAMMER_EVENTS;
Client.SOCKET_EVENTS = SOCKET_EVENTS;

Client.prototype.equal = function(obj) {
   return !!(
      (this.id === obj) ||
      (this.socket === obj) ||
      (obj.id && (this.id === obj.id)) ||
      (obj.socket && (this.socket === obj.socket))
      );
};

Client.prototype.disconnect = function() {
   var _this = this,
      model = this.racer.model,
      path = this.racer.path;

   clean(model, _this);

   this.socket.disconnect();
};

function updateWorkspaceInModel(_this) {
   var model = _this.racer.model,
      path = _this.racer.path;

   function extractID(el) {
      return el.id;
   }
   model.fetch(path, function() {
      model.setArrayDiff(path + '.clients.' + _this.id + '.workspace',
         _.map(_this.workspace, extractID));
   });
}

Client.prototype.updateWorkspace = function(workspace) {

};

module.exports = exports = Client;