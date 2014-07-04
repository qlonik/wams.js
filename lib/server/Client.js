var EventEmitter = require('events').EventEmitter,

   _ = require('lodash'),

   util = require('../util');

function clean(model, client) {
   model.fetch(client.wams.racer.path, function() {
      model.del(client.wams.racer.path + '.clients.' + client.id);
   });
}

function Client(wams, sock) {
   EventEmitter.call(this);
   this.wams = wams;
   var _this = this,
      model = this.wams.racer.model,
      root = this.wams.racer.path;

   this.id = model.id();
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
         shape: _this.shape
      });
   });
   this.socket.on('disconnect', function() {
      _this.emit('disconnect');
      clean(model, _this);
   });

   model.bundle(function(err, bundle) {
      if (err) { throw err; }

      _this.socket.emit('bundle', {
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
         });
   });
}

_.merge(Client.prototype, EventEmitter.prototype);

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
      model = this.wams.racer.model,
      path = this.wams.racer.path;

   clean(model, _this);

   this.socket.disconnect();
};

Client.prototype.addWorkspace = function(workspace) {
   var _this = this,
      model = this.wams.racer.model,
      path = this.wams.racer.path;

   this.workspace.push(workspace);

   function extractID(el) {
      return el.id;
   }
   model.fetch(path, function() {
      model.setArrayDiff(path + '.clients.' + _this.id + '.workspace',
         _.map(_this.workspace, extractID));
   });
};

Client.prototype.updateWorkspace = function(workspace) {

};

module.exports = exports = Client;