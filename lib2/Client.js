var EventEmitter = require('events').EventEmitter,

   util = require('./util');

function Client(racer, socket) {
   EventEmitter.call(this);
   this.racer = racer;
   this.socket = socket;

   var _this = this,
      model = racer.model,
      path = racer.path;

   this.id = model.id();

}

util.merge(Client.prototype, EventEmitter.prototype);



module.exports = Client;