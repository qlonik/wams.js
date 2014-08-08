var EventEmitter = require('events').EventEmitter,

   util = require('./util');

var SERVER_EVENTS = util.SERVER_EVENTS,
   WORKSPACE_EVENTS = util.WORKSPACE_EVENTS,
   WORKSPACE_OBJECT_EVENTS = util.WORKSPACE_OBJECT_EVENTS,
   CLIENT_EVENTS = util.CLIENT_EVENTS,
   SOCKET_EVENTS = util.SOCKET_EVENTS,
   HAMMER_EVENTS = util.HAMMER_EVENTS,
   BROWSER_EVENTS = util.BROWSER_EVENTS,
   TYPE = 'workspaceObject',
   DEFAULT_SHAPE = {
      x: 0,
      y: 0,
      w: 100,
      h: 100,
      r: 0,       // rotation
      s: 100      // scale
   },
   DEFAULT_HTML = {
      tag: 'div',
      attr: {},
      style: {},
      inner: []
   };


function WorkspaceObject(racer, html) {
   EventEmitter.call(this);
   this.racer = racer;
   this.html = html;

   var _this = this,
      model = racer.model,
      path = racer.path;

   this.id = model.id();
   this.type = TYPE;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.storage = {};

   this.modelReady = false;
   this.workspaceObjectModelPath = this.racer.path + '.workspaceObjects.' + this.id;
   this.workspaceObjectModel = this.racer.model.at(this.workspaceObjectModelPath);

   if (!this.html) {
      this.html = util.cloneDeep(DEFAULT_HTML);
      this.mergeAttr({ id: _this.id, class: [_this.type] });
   }
}

util.merge(WorkspaceObject.prototype, EventEmitter.prototype);


WorkspaceObject.prototype.updateModel = function(path ,value) {
   var _this = this, model = this.workspaceObjectModel;

   if (!path) {
      model.setDiff('id', _this.id);
      model.setDiff('type', _this.type);
      model.setDiffDeep('shape', _this.shape);
      model.setDiffDeep('storage', _this.storage);

      model.setDiffDeep('html', _this.html);
   } else {
      if (util.isArray(value)) {
         model.setArrayDiffDeep(path, value);
      } else {
         model.setDiffDeep(path, value);
      }
   }

   _this.emit(WORKSPACE_OBJECT_EVENTS.modelUpdated, null);
};
WorkspaceObject.prototype.mergeAttr = function(newAttr) {
   util.merge(this.html.attr, newAttr);

   this.updateModel('html.attr', this.html.attr);
};
WorkspaceObject.prototype.mergeStyle = function(newStyle) {
   util.merge(this.html.style, newStyle);

   this.updateModel('html.style', this.html.style);
};
WorkspaceObject.prototype.set = function(key, val) {
   this.storage[key] = val;

   this.updateModel('storage', this.storage);
};
WorkspaceObject.prototype.del = function(key) {
   delete this.storage[key];

   this.updateModel('storage', this.storage);
};
WorkspaceObject.prototype.get = function(key) {
   return this.storage[key];
};

module.exports = WorkspaceObject;