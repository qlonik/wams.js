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
   this.clientModelPath = path + '.clients.' + this.id;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.workspaces = [];

   this.clientModel = model.at(this.clientModelPath);

}

util.merge(Client.prototype, EventEmitter.prototype);


Client.prototype.updateModel = function(path, value) {
   var _this = this, model = this.clientModel;

   if (!path) {
      model.fetch(function(err) {
         if (err) { throw err; }

         model.setDiff('id', _this.id);
         model.setDiff('type', _this.type);
         model.setDiff('clientModelPath', _this.clientModelPath);
         model.setDiffDeep('shape', _this.shape);
         model.setArrayDiff('workspaces', util.map(_this.workspaces, util.getID));
      });
   } else {
      model.fetch(function (err) {
         if (err) { throw err; }

         if (util.isArray(value)) {
            model.setArrayDiffDeep(path, value);
         } else {
            model.setDiffDeep(path, value);
         }
      });
   }

   model.unfetch();
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