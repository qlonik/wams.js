var EventEmitter = require('events').EventEmitter,

   util = require('./util');

var SERVER_EVENTS = util.SERVER_EVENTS,
   WORKSPACE_EVENTS = util.WORKSPACE_EVENTS,
   WORKSPACE_OBJECT_EVENTS = util.WORKSPACE_OBJECT_EVENTS,
   CLIENT_EVENTS = util.CLIENT_EVENTS,
   SOCKET_EVENTS = util.SOCKET_EVENTS,
   HAMMER_EVENTS = util.HAMMER_EVENTS,
   BROWSER_EVENTS = util.BROWSER_EVENTS,
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
   },
   TYPE = util.WORKSPACE_OBJECT_TYPE;


function WorkspaceObject(store, html) {
   EventEmitter.call(this);
   this.store = store;
   this.html = html;

   var _this = this,
      model = store.createModel(),
      path = util.RACER_PATH;

   this.model = model;
   this.id = model.id();
   this.type = TYPE;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.storage = {};
   this.parent = [];

   this.modelReady = false;
   this.workspaceObjectModelPath = path + '.' + TYPE + '.' + this.id;

   if (!this.html) {
      this.html = util.cloneDeep(DEFAULT_HTML);
   }

   this.updateModel();
   this.mergeAttr({ id: _this.id, class: [_this.type] });
   this.mergeStyle({ position: 'absolute' });

   model.subscribe(path, function() {
      _this.modelReady = true;
      _this.workspaceObjectModel = model.at(_this.workspaceObjectModelPath);

      _this.workspaceObjectModel.on('change', '**', function(pathS, val, old, passed) {
         if (passed.$remote) {
            var path = pathS.split('.'), last = path.pop(),
               i = -1, len = path.length, el = _this;

            while (++i < len) {
               el = el[path[i]];
            }

            if (last) {
               el[last] = val;
            } else {
               el = val;
            }
         }
      });

      _this.emit(WORKSPACE_OBJECT_EVENTS.modelFetched, null);
   });
}

util.merge(WorkspaceObject.prototype, EventEmitter.prototype);


WorkspaceObject.prototype.updateModel = function(path ,value) {
   var _this = this;

   function update(err) {
      if (err) { throw err; }

      var model = _this.workspaceObjectModel;

      if (!path) {
         model.setDiff('id', _this.id);
         model.setDiff('type', _this.type);
         model.setDiffDeep('shape', _this.shape);
         model.setDiffDeep('storage', _this.storage);
         model.setArrayDiff('parent', util.map(_this.parent, util.getID));

         model.setDiffDeep('html', _this.html);
      } else {
         if (util.isArray(value)) {
            model.setArrayDiffDeep(path, value);
         } else {
            model.setDiffDeep(path, value);
         }
      }

      _this.emit(WORKSPACE_OBJECT_EVENTS.modelUpdated, null);
   }

   if (this.modelReady) {
      update(null);
   } else {
      this.once(WORKSPACE_OBJECT_EVENTS.modelFetched, update);
   }
};
WorkspaceObject.prototype.equal = function(param) {
   return !!(
      (this.id === param) ||
      (param.id && (this.id === param.id))
      );
};
WorkspaceObject.prototype.mergeAttr = function(newAttr) {
   util.merge(this.html.attr, newAttr, function(a, b) {
      if (util.isArray(a)) {
         if (util.isUndefined(b)) {
            return util.uniq(a);
         } else {
            return util.uniq(a.concat(b));
         }
      } else if (util.isArray(b)) {
         if (util.isUndefined(a)) {
            return util.uniq(b);
         } else {
            return util.uniq(b.concat(a));
         }
      } else {
         return undefined;
      }
   });

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
WorkspaceObject.prototype.addParent = function(parent) {
   this.parent.push(parent);

   this.updateModel('parent', util.map(this.parent, util.getID));
};
WorkspaceObject.prototype.removeParent = function(param) {
   util.remove(this.parent, function(el) {
      return el.equal(param);
   });

   this.updateModel('parent', util.map(this.parent, util.getID));
};

module.exports = WorkspaceObject;