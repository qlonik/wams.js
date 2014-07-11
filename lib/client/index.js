var EventEmitter = require('events').EventEmitter,

   _ = require('lodash'),
   io = require('socket.io-client'),
   hammer = require('hammerjs'),
   racer = require('racer'),

   JSON2HTML = require('./JSON2HTML');

var DEFAULT_OPTS = {},
   WAMS_EVENTS = {
      racerModelReady: 'modelReady'
   },
   HAMMER_EVENTS = [
      'hold', 'tap', 'doubletap', 'drag', 'dragstart', 'dragend', 'dragup',
      'dragdown', 'dragleft', 'dragright', 'swipe', 'swipeup', 'swipedown',
      'swipeleft', 'swiperight', 'transform', 'transformstart', 'transformend',
      'rotate', 'pinch', 'pinchin', 'pinchout', 'touch', 'release', 'gesture'
   ],
   SOCKET_EVENTS = {
      racerBundle: 'bundle',
      MTEvent: 'mt'
   };

function WAMS(opts) {
   EventEmitter.call(this);
   window.wams = this; //TODO: delete after
   var _this = this;

   _.defaults(opts, DEFAULT_OPTS);

   this.interactive = [];
   this.shape = {
      x: 0,
      y: 0,
      w: window.innerWidth,
      h: window.innerHeight
   };
   this.socket = io();
   this.socket.on(SOCKET_EVENTS.racerBundle, function(err, data) {
      _this.id = data.id;
      _this.root = data.root;
      _this.racer = racer.init(data.bundle);
   });

   racer.ready(function(model) {
      _this.model = model;

      window.model = model; //TODO: delete after

      model.fetch(_this.root, function() {
         model.setDiff(_this.root + '.clients.' + _this.id + '.id', _this.id);
         model.setDiffDeep(_this.root + '.clients.' + _this.id + '.shape', _this.shape);

         model.ref('_page.me', _this.root + '.clients.' + _this.id);
      });
      model.subscribe(_this.root, function() {
         model.on('all', 'wams**', function() {
            console.log(arguments);
         });
      });

      _this.emit(WAMS_EVENTS.racerModelReady);
   });
}

_.merge(WAMS.prototype, EventEmitter.prototype);

WAMS.prototype.socketEmit = function(event, err, data) {
   this.socket.emit(event, err, data);
};

WAMS.prototype.createInteractiveElement = function(el) {
   var opts = {
         preventDefault: true
      },
      hammertime = hammer(el, opts);

   this.interactive.push(hammertime);

   return hammertime;
};

WAMS.prototype.getWorkspaceJSON = function(cb) {
   var _this = this,
      workspaceID, workspace;

   this.on(WAMS_EVENTS.racerModelReady, function() {
      _this.model.fetch(_this.root, function() {
         workspaceID = _this.model.get('_page.me.workspace')[0];
         workspace = _this.model.get(_this.root + '.workspaces.' + workspaceID);
         cb(workspace.html);
      });
   });
};

WAMS.prototype.getWorkspaceHTML = function(cb) {
   var _this = this,
      workspaceID, workspace, html;

   this.on(WAMS_EVENTS.racerModelReady, function() {
      _this.model.fetch(_this.root, function() {
         workspaceID = _this.model.get('_page.me.workspace')[0];
         workspace = _this.model.get(_this.root + '.workspaces.' + workspaceID);
         html = JSON2HTML(workspace.html);
         cb(html);
      });
   });
};

module.exports = exports = function(opts) {
   return new WAMS(opts);
};
