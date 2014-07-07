var _ = require('lodash'),
   log = require('debug')('wams'),
   liveDbMongo = require('livedb-mongo'),
   redis = require('redis').createClient(),
   racer = require('racer'),

   util = require('../util'),
   serverCreator = require('./Server');

var store = racer.createStore({
      db: liveDbMongo('localhost:27017/wams?auto_reconnect', { safe: true }),
      redis: redis
   }),
   model = store.createModel();

model.subscribe('wams', function() {
   model.on('all', 'wams**', function() {
      console.log(arguments);
   });
});

model.fetch('wams', function() {
   model.del('wams.clients');
   model.del('wams.workspaces');
//   console.log(model.get());
});

function updateClients(_this) {
   if (_this.clients.length) {
      _.forEach(_this.clients, function(client) {
         client.updateWorkspace(_this);
      });
   }
}

function updateModel(_this) {
   function extractID(el) {
      return el.id;
   }

   model.fetch(_this.racer.path, function() {
      model.setDiff(_this.racer.path + '.workspaces.' + _this.id + '.id', _this.id);
      model.setDiffDeep(_this.racer.path + '.workspaces.' + _this.id + '.shape', _this.shape);
      model.setDiffDeep(_this.racer.path + '.workspaces.' + _this.id + '.html', _this.html);
      model.setArrayDiff(_this.racer.path + '.workspaces.' + _this.id + '.clients', _.map(_this.clients, extractID));
      model.setArrayDiff(_this.racer.path + '.workspaces.' + _this.id + '.inner', _.map(_this.inner, extractID));
   });
}

function Workspace(port) {
   var _this = this;

   this.racer = {
      store: store,
      model: model,
      path: 'wams'
   };

   this.id = model.id();
   this.shape = {
      x: 0,
      y: 0,
      w: 1000,
      h: 1000,
      r: 0, //rotation
      s: 100  //scale
   };
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

   updateModel(this);

   if (_.isNumber(port)) {
      this.srv = new serverCreator(this, { port: port });
   }
}

Workspace.prototype.startServer = function(port) {
   if (!this.srv) {
      this.srv = serverCreator({ port: port });
   }

   return this.srv;
};

Workspace.prototype.equal = function(workspace) {
   return !!(
      (workspace === this.id) ||
      (workspace.id === this.id)
      );
};

Workspace.prototype.setLocation = function(x, y) {
   if (_.isUndefined(x)) {
      return;
   }
   if (_.isUndefined(y)) {
      y = x;
   }

   this.shape.x = x;
   this.shape.y = y;
};

Workspace.prototype.setPixelDimension = function(w, h) {
   if (_.isUndefined(w)) {
      return;
   }
   if (_.isUndefined(h)) {
      h = w;
   }

   this.shape.w = w;
   this.shape.h = h;
};

Workspace.prototype.addElement = function(el) {
   this.inner.push(el);
   this.html.inner.push(el.html);
   updateModel(this);
};

Workspace.prototype.addClient = function(client) {
   var _this = this;

   this.clients.push(client);
   client.addWorkspace(this);
   client.on('disconnect', function() {
      _.remove(_this.clients, client);
      updateModel(_this);
   });
   updateModel(this);
};

Workspace.prototype.appendStyle = function(obj) {
   _.merge(this.html.style, obj);
   updateModel(this);
};

//Workspace.prototype.getJSON = function() {
//   var json = _.cloneDeep(this.html);
//
//   if (_.isString(this.inner)) {
//      json.inner = _.cloneDeep(this.inner);
//   } else if (_.isArray(this.inner)) {
//      json.inner = _.map(this.inner, function(value) {
//         return value.getJSON();
//      });
//   } else if (_.isObject(this.inner)) {
//      json.inner = this.inner.getJSON();
//   }
//
//   return json;
//};

/**
 * Callback is invoked with arguments: (Workspace, Socket, [data])
 *
 * @param {String} type
 * @param {Function} cb
 * @returns {Function}
 */
Workspace.prototype.on = function(type, cb) {
   var _this = this,
      srv = _this.srv,
      io = _this.srv.io,
      client, handler;

   if (type === 'connection') {
      handler = function(socket) {
         client = srv.getClient(socket);
         cb(_this, client);
      }
   } else {
      handler = function(socket) {
         client = srv.getClient(socket);
         socket.on(type, function(data) {
            cb(_this, client, data);
         });
      }
   }

   io.on('connection', handler);

   return handler;
};

Workspace.prototype.off = function(cb) {
   this.srv.io.off(cb);
};

/**
 * Workspace Object
 * @constructor
 */
Workspace.Object = function() {

};

module.exports = exports = Workspace;