var EventEmitter = require('events').EventEmitter,

   util = require('./util');

var WORKSPACE_EVENTS = util.WORKSPACE_EVENTS,
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

   //srv listeners
};

module.exports = Workspace;
