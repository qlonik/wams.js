/*
var JSON2HTML = require('./JSON2HTML'),
   HTML2JSON = require('./HTML2JSON'),
   _ = require('lodash'),
   $ = require('jquery');

window.$ = $;
window._ = _;

var json1 = {
   tag: 'div',
   attr: {
      id: 'json1',
      class: 'json1 json',
      'data-custom': 'Custom metadata'
   },
   inner: 'Hello'
};
var json2 = [{
   tag: 'div',
   attr: {
      id: 'json2'
   },
   inner: {
      tag: 'a',
      attr: {
         href: 'http://google.com/'
      },
      inner: 'Google'
   }
}];
var json3 = [{
   tag: 'div',
   attr: {
      id: 'json3'
   },
   inner: [{
      tag: 'a',
      attr: {
         href: 'http://google.com/',
         class: ['hi', 'link', 'a']
      },
      inner: 'Google'
   }, {
      tag: 'div',
      attr: {
         id: 'inner1'
      },
      inner: {
         tag: 'div',
         inner: 'Hi'
      }
   }]
}, {
   tag: 'div',
   inner: '<a href="http://google.com/">Google</a>'
}];

window.JSON2HTML = JSON2HTML;
window.json1 = json1;
window.json2 = json2;
window.json3 = json3;

var html1 = document.getElementById('test1');
var html2 = document.getElementsByClassName('test');
var html3 = document.getElementsByClassName('div');
var html4 = '<div id="listContainer">' +
   '<ul id="list"><li>First</li><li>Second</li></ul>' +
   '</div>' +
   '<div>' +
   '<a href="google.com">Goog</a>' +
   '</div>';

window.HTML2JSON = HTML2JSON;
window.html1 = html1;
window.html2 = html2;
window.html3 = html3;
window.html4 = html4;
*/

var EventEmitter = require('events').EventEmitter,

   _ = require('lodash'),
   io = require('socket.io-client'),
   racer = require('racer'),

   JSON2HTML = require('./JSON2HTML');

var DEFAULT_OPTS = {};

function WAMS(opts) {
   EventEmitter.call(this);
   window.wams = this; //TODO: delete after
   var _this = this;

   _.defaults(opts, DEFAULT_OPTS);

   this.shape = {
      x: 0,
      y: 0,
      w: window.innerWidth,
      h: window.innerHeight
   };
   this.socket = io();
   this.socket.on('bundle', function(data) {
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

      _this.emit('modelReady');
   });
}

_.merge(WAMS.prototype, EventEmitter.prototype);

WAMS.prototype.getWorkspaceJSON = function(cb) {
   var _this = this,
      workspaceID, workspace;

   this.on('modelReady', function() {
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

   this.on('modelReady', function() {
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
