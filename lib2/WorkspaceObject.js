var EventEmitter = require('events').EventEmitter,

   util = require('./util');

function WorkspaceObject(racer) {
   EventEmitter.call(this);
   this.racer = racer;
}

util.merge(WorkspaceObject.prototype, EventEmitter.prototype);

module.exports = WorkspaceObject;