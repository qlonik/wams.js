var EventEmitter = require('events').EventEmitter,

   _ = require('lodash'),

   util = require('../util');

var WORKSPACE_OBJECT_EVENTS = {

};

function WorkspaceObject(json) {
   EventEmitter.call(this);


}

_.merge(WorkspaceObject.prototype, EventEmitter.prototype);

WorkspaceObject.WORKSPACE_OBJECT_EVENTS = WORKSPACE_OBJECT_EVENTS;



module.exports = exports = WorkspaceObject;