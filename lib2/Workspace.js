var EventEmitter = require('events').EventEmitter,

   util = require('./util'),
   StorageCreator = require('./Store'),
   WorkspaceObject = require('./WorkspaceObject'),
   ClientCreator = require('./Client');

var SERVER_EVENTS = util.SERVER_EVENTS,
   WORKSPACE_EVENTS = util.WORKSPACE_EVENTS,
   WORKSPACE_OBJECT_EVENTS = util.WORKSPACE_OBJECT_EVENTS,
   CLIENT_EVENTS = util.CLIENT_EVENTS,
   DEFAULT_SHAPE = {
      x: 0,
      y: 0,
      w: 1000,
      h: 1000,
      r: 0,       // rotation
      s: 100      // scale
   },
   DEFAULT_HTML = {
      tag: 'div',
      attr: {},
      style: {
         left: DEFAULT_SHAPE.x + 'px',
         top: DEFAULT_SHAPE.y + 'px',
         width: DEFAULT_SHAPE.w + 'px',
         height: DEFAULT_SHAPE.h + 'px'
      },
      inner: []
   },
   TYPE = util.WORKSPACE_TYPE;

function Workspace(store, srv) {
   EventEmitter.call(this);
   this.store = store;

   var _this = this,
      model = store.createModel(),
      path = util.RACER_PATH;

   this.model = model;
   this.id = model.id();
   this.type = TYPE;
   this.shape = util.clone(DEFAULT_SHAPE);
   this.storage = {};
   this.parent = undefined;
   this.clients = [];
   this.inner = [];
   this.hasServer = false;

   this.modelReady = false;
   this.workspaceModelPath = path + '.' + TYPE + '.' + this.id;

   this.html = util.cloneDeep(DEFAULT_HTML);

   this._innerUpdaters = {};

   this.updateModel();
   this.mergeAttr({ id: _this.id, class: [_this.type] });
   this.mergeStyle({ position: 'absolute' });

   if (srv) {
      this.attachServer(srv);
   }

//   model.fn('appendPX', function(num) {
//      return num + 'px';
//   });

   model.subscribe(path, function(err) {
      if (err) {
         return _this.emit(WORKSPACE_EVENTS.modelFetched, err);
      }

      _this.modelReady = true;
      _this.workspaceModel = model.at(_this.workspaceModelPath);
      console.log('model subscribed -- from workspace ' + _this.id);

      _this.workspaceModel.on('change', '**', function(pathS, val, old, passed) {
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

      _this.emit(WORKSPACE_EVENTS.modelFetched, null);
   });

//      _this.workspaceModel.start('appendPX', 'html.style.left', 'shape.x');
//      _this.workspaceModel.start('appendPX', 'html.style.top', 'shape.y');
//      _this.workspaceModel.start('appendPX', 'html.style.width', 'shape.w');
//      _this.workspaceModel.start('appendPX', 'html.style.height', 'shape.x');
}

util.merge(Workspace.prototype, EventEmitter.prototype);


/**
 * Attaches server to the current {@link Workspace} and adds listeners
 * for connected and disconnected clients.
 * @param {Server} srv Server instance
 */
Workspace.prototype.attachServer = function(srv) {
   this.srv = srv;
   this.allConnectedClients = new StorageCreator();
   this.hasServer = true;

   var client,
      _this = this;

   this.srv.on(SERVER_EVENTS.connectClient, function(err, socket) {
      if (err) {
         _this.emit(WORKSPACE_EVENTS.clientConnected, err);
         _this.emit(WORKSPACE_EVENTS.clientReady, err);
      } else {
         client = new ClientCreator(_this.store, socket);
         _this.allConnectedClients.push(client);

         _this.emit(WORKSPACE_EVENTS.clientConnected, null, _this, client);

         client.on(CLIENT_EVENTS.ready, function(err) {
            if (err) {
               _this.emit(WORKSPACE_EVENTS.clientReady, err);
            } else {
               _this.emit(WORKSPACE_EVENTS.clientReady, null, _this, client);
            }
         });
      }
   });
   this.srv.on(SERVER_EVENTS.disconnectClient, function(err, socket) {
      if (err) {
         _this.emit(WORKSPACE_EVENTS.clientDisconnected, err);
      } else {
         client = _this.allConnectedClients.remove(socket);
         if (client.length === 1) {
            client = client[0];
         }

         _this.emit(WORKSPACE_EVENTS.clientDisconnected, null, _this, client);
      }
   });
   this.updateModel('hasServer', _this.hasServer);
};
Workspace.prototype.updateModel = function(path, value) {
   var _this = this;

   function update(err) {
      if (err) { throw err; }

      var model = _this.workspaceModel;

      if (!path) {
         model.setDiff('id', _this.id);
         model.setDiff('type', _this.type);
         model.setDiffDeep('shape', _this.shape);
         model.setDiffDeep('storage', _this.storage);
//         model.setArrayDiff('parent', util.map(_this.parent, util.getID));
         model.setArrayDiff('parent', _this.parent ? _this.parent.id : _this.parent);
         model.setArrayDiff('clients', util.map(_this.clients, util.getID));
         model.setArrayDiff('inner', util.map(_this.inner, util.getID));
         model.setDiff('hasServer', _this.hasServer);

         model.setDiffDeep('html', _this.html);
      } else {
         if (util.isArray(value)) {
            model.setArrayDiffDeep(path, value);
         } else {
            model.setDiffDeep(path, value);
         }
      }

      _this.emit(WORKSPACE_EVENTS.modelUpdated, null);
   }

   if (this.modelReady) {
      update(null);
   } else {
      this.once(WORKSPACE_EVENTS.modelFetched, update);
   }
};
Workspace.prototype.equal = function(workspace) {
   return !!(
      (this.id === workspace) ||
      (workspace.id && (this.id === workspace.id))
      );
};
Workspace.prototype.set = function(key, val) {
   this.storage[key] = val;

   this.updateModel('storage', this.storage);
};
Workspace.prototype.del = function(key) {
   delete this.storage[key];

   this.updateModel('storage', this.storage);
};
Workspace.prototype.get = function(key) {
   return this.storage[key];
};
Workspace.prototype.mergeShape = function(newShape) {
   util.merge(this.shape, newShape);

   this.updateModel('shape', this.shape);

   var newStyle;
   if (newShape.x) {
      newStyle = newStyle || {};
      newStyle.left = newShape.x + 'px';
   }
   if (newShape.y) {
      newStyle = newStyle || {};
      newStyle.top = newShape.y + 'px';
   }
   if (newShape.w) {
      newStyle = newStyle || {};
      newStyle.width = newShape.w + 'px';
   }
   if (newShape.h) {
      newStyle = newStyle || {};
      newStyle.height = newShape.h + 'px';
   }
   if (newStyle) {
      this.mergeStyle(newStyle);
   }
};
Workspace.prototype.mergeStyle = function(newStyle) {
   util.merge(this.html.style, newStyle);

   this.updateModel('html.style', this.html.style);
};
Workspace.prototype.mergeAttr = function(newAttr) {
   util.merge(this.html.attr, newAttr);

   this.updateModel('html.attr', this.html.attr);
};
Workspace.prototype.addElement = function(el) {
   var _this = this, rel = {}, updater, relShape, convertedElHTML;

   if (el.type === util.WORKSPACE_OBJECT_TYPE) {
      relShape = _this.getShapeRelativeTopParent();

      rel.x = el.shape.x - relShape.x;
      rel.y = el.shape.y - relShape.y;
      rel.w = el.shape.w;
      rel.h = el.shape.h;

//      console.log(relShape);
//      console.log(rel);
//      console.log(_this.shape);

      /*
      if (
         //top
         (rel.y + rel.h >= _this.shape.y) &&
         //right
         (rel.x <= _this.shape.x + _this.shape.w) &&
         //bottom
         (rel.y <= _this.shape.y + _this.shape.h) &&
         //left
         (rel.x + rel.w >= _this.shape.x)
         ) {
         */
//         console.log(true);
         convertedElHTML = util.cloneDeep(el.html);
         convertedElHTML.style.left = rel.x + 'px';
         convertedElHTML.style.top = rel.y + 'px';

         this.inner.push(el);
         this.html.inner.push(convertedElHTML);
         /*
      }
      */
   } else {
      this.inner.push(el);
      this.html.inner.push(el.html);
   }

   el.addParent(this);

   /*
   this._innerUpdaters[el.id] = updater = function startUpdater() {
      var workspaceHtmlModel = _this.workspaceModel.at('html'),
         elHtmlModel = (el.workspaceModel || el.workspaceObjectModel).at('html');

      startUpdater.listener = elHtmlModel.on('all', '**',
         function(path, event, val, prev, passed) {
            var i = util.findIndex(_this.html.inner, function(html) {
               return (html.attr.id === el.id);
            });
            if (event === 'change') {
               workspaceHtmlModel.setDiff('inner.' + i + '.' + path, val);
            }
         });
   };

   if (el.modelReady) {
      updater();
   } else {
      if (el.type === util.WORKSPACE_TYPE) {
         el.once(WORKSPACE_EVENTS.modelFetched, updater);
      } else if (el.type === util.WORKSPACE_OBJECT_TYPE) {
         el.once(WORKSPACE_OBJECT_EVENTS.modelFetched, updater);
      }
   }
   */

   this._innerUpdaters[el.id] = updater = function startUpdater() {
      var workspaceHtmlModel = _this.workspaceModel.at('html'),
         elShapeModel = (el.workspaceModel || el.workspaceObjectModel).at('shape');

      startUpdater.listeners = startUpdater.listeners || [];
      startUpdater.listeners.push({
         ev: 'all',
         listener: elShapeModel.on('all', '**',
            function (path, event, val, prev, passed) {
               var i, rel, relShape;

               i = util.findIndex(_this.html.inner, function(html) {
                  return (html.attr.id === el.id);
               });
               if (event === 'change' && (path === 'x' || path === 'y')) {
                  relShape = _this.getShapeRelativeTopParent();
                  rel = val - relShape[path];
                  workspaceHtmlModel.setDiff('inner.' + i + '.style.' + util.R2H[path], rel + 'px');
               }
            })
      });
//      startUpdater.listeners.push({
//         type: 'all',
//         func: elShapeModel.on('all', '**', function () {
//            console.log(arguments);
//         })
//      });
   };

   if (_this.modelReady && el.modelReady) {
      updater();
   } else if (_this.modelReady && !el.modelReady) {
      if (el.type === util.WORKSPACE_TYPE) {
         el.once(WORKSPACE_EVENTS.modelFetched, updater);
      } else if (el.type === util.WORKSPACE_OBJECT_TYPE) {
         el.once(WORKSPACE_OBJECT_EVENTS.modelFetched, updater);
      }
   } else if (!_this.modelReady && el.modelReady) {
      _this.once(WORKSPACE_EVENTS.modelFetched, updater);
   } else if (!_this.modelReady && !el.modelReady) {
      _this.once(WORKSPACE_EVENTS.modelFetched, function() {
         if (el.type === util.WORKSPACE_TYPE) {
            el.once(WORKSPACE_EVENTS.modelFetched, updater);
         } else if (el.type === util.WORKSPACE_OBJECT_TYPE) {
            el.once(WORKSPACE_OBJECT_EVENTS.modelFetched, updater);
         }
      });
   }

   this.updateModel('inner', util.map(this.inner, util.getID));
   this.updateModel('html.inner', this.html.inner);
};
/**
 * Remove element by id or by element.
 * If passed parameter has equal method, then we will use it to compare html
 * inner element. Otherwise param will be considered as id.
 * @param {String|WorkspaceObject} param Parameter of element
 */
Workspace.prototype.removeElement = function(param) {
   var _this = this, i, j, els, el, updater, listener,
      model = this.model;

   //remove from inner array
   els = util.remove(this.inner, function(el) {
      return el.equal(param);
   });
   //remove from html object
   util.remove(this.html.inner, function(el) {
      return !!(
         (param === el.attr.id) ||
         (param.id && (param.id === el.attr.id))
         );
   });

   /**/
//   els.forEach(function(el) {
   for (i = 0; i < els.length; i++) {
      el = els[i];
      el.removeParent(_this);

      updater = _this._innerUpdaters[el.id];
      if (el.modelReady) {
         for (j = 0; j < updater.listeners.length; j++) {
            listener = updater.listeners[j];
            model.removeListener(listener.ev, listener.listener);
         }
      } else {
         if (el.type === util.WORKSPACE_TYPE) {
            el.removeListener(WORKSPACE_EVENTS.modelFetched, updater);
         } else if (el.type === util.WORKSPACE_OBJECT_TYPE) {
            el.removeListener(WORKSPACE_OBJECT_EVENTS.modelFetched, updater);
         }
      }

      /*
      if (_this.modelReady && el.modelReady) {
      } else if (_this.modelReady && !el.modelReady) {
      } else if (!_this.modelReady && el.modelReady) {
      } else if (!_this.modelReady && !el.modelReady) {
      }
      */

      delete _this._innerUpdaters[el.id];
   }
//   });
   /**/

   this.updateModel('inner', util.map(this.inner, util.getID));
   this.updateModel('html.inner', this.html.inner);
};
Workspace.prototype.addClient = function(client) {
   this.clients.push(client);

   client.addWorkspace(this);

   this.updateModel('clients', util.map(this.clients, util.getID));
};
Workspace.prototype.removeClient = function(param) {
   var removed = util.remove(this.clients, function(client) {
      return client.equal(param)
   });

   removed.forEach(function(cl) { cl.removeWorkspace(this); });

   this.updateModel('clients', util.map(this.clients, util.getID));
};
Workspace.prototype.addParent = function(parent) {
   this.parent = parent;
   this.updateModel('parent', this.parent.id);
};
Workspace.prototype.removeParent = function() {
   this.parent = undefined;
   this.updateModel('parent', this.parent);
};
Workspace.prototype.getShapeRelativeTopParent = function() {
   var _this = this, parent = this.parent,
      relShape = { x : 0, y : 0 };

   relShape.x += _this.shape.x;
   relShape.y += _this.shape.y;

   while (parent) {
      relShape.x += parent.shape.x;
      relShape.y += parent.shape.y;
      parent = parent.parent;
   }

   return relShape;
};

module.exports = Workspace;
