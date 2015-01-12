var EventEmitter = require('events').EventEmitter,

   _ = require('lodash'),
   io = require('socket.io-client'),
   hammer = require('hammerjs'),
   racer = require('racer'),

   util = require('../util'),
   JSON2HTML = require('./JSON2HTML'),
   HTML2JSON = require('./HTML2JSON');

var DEFAULT_OPTS = {},
   WAMS_EVENTS = {
      racerModelReady: 'modelFetched'
   },
   HAMMER_EVENTS = [
      'hold', 'tap', 'doubletap', 'drag', 'dragstart', 'dragend', 'dragup',
      'dragdown', 'dragleft', 'dragright', 'swipe', 'swipeup', 'swipedown',
      'swipeleft', 'swiperight', 'transform', 'transformstart', 'transformend',
      'rotate', 'pinch', 'pinchin', 'pinchout', 'touch', 'release', 'gesture'
   ],
   SOCKET_EVENTS = {
      racerBundle: 'bundle',
      MTEvent: 'mt',
      workspaceUpdate: 'wsupd'
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
//            console.log(arguments);
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

WAMS.prototype.emitInteractiveEvent = function(ev) {
   function extractTouch(touch) {
      return {
         altKey: touch.altKey,
//         bubbles: touch.bubbles,
//         button: touch.button,
//         cancelBubble: touch.cancelBubble,
//         cancelable: touch.cancelable,
//         charCode: touch.charCode,
         clientX: touch.clientX,
         clientY: touch.clientY,
//         clipboardData: touch.clipboardData,
         ctrlKey: touch.ctrlKey,
//         currentTarget: touch.currentTarget,
//         dataTransfer: touch.dataTransfer,
//         defaultPrevented: touch.defaultPrevented,
//         detail: touch.detail,
//         eventPhase: touch.eventPhase,
//         fromElement: touch.fromElement,
//         identifier: touch.identifier,
//         keyCode: touch.keyCode,
//         layerX: touch.layerX,
//         layerY: touch.layerY,
         metaKey: touch.metaKey,
         offsetX: touch.offsetX,
         offsetY: touch.offsetY,
         pageX: touch.pageX,
         pageY: touch.pageY,
//         path: touch.path,
//         relatedTarget: touch.relatedTarget,
//         returnValue: touch.returnValue,
         screenX: touch.screenX,
         screenY: touch.screenY,
         shiftKey: touch.shiftKey,
         srcElement: touch.srcElement.id,
         target: touch.target.id,
//         timeStamp: touch.timeStamp,
         toElement: touch.toElement.id,
         type: touch.type,
//         view: touch.view,
//         webkitMovementX: touch.webkitMovementX,
//         webkitMovementY: touch.webkitMovementY,
//         which: touch.which,
         x: touch.x,
         y: touch.y
      };
   }
   var extractEV = {
//         bubbles: ev.bubbles,
//         cancelBubble: ev.cancelBubble,
//         cancelable: ev.cancelable,
//         clipboardData: ev.clipboardData,
//         currentTarget: ev.currentTarget,
//         defaultPrevented: ev.defaultPrevented,
//         eventPhase: ev.eventPhase,
         gesture: {
            angle: ev.gesture.angle,
            center: ev.gesture.center,
            deltaTime: ev.gesture.deltaTime,
            deltaX: ev.gesture.deltaX,
            deltaY: ev.gesture.deltaY,
            direction: ev.gesture.direction,
            distance: ev.gesture.distance,
            eventType: ev.gesture.eventType,
            interimAngle: ev.gesture.interimAngle,
            interimDirection: ev.gesture.interimDirection,
            pointerType: ev.gesture.pointerType,
//            prventDefault: ev.gesture.preventDefault,
            rotation: ev.gesture.rotation,
            scale: ev.gesture.scale,
//            srcEvent: ev.gesture.srcEvent,
//            startEvent: ev.gesture.startEvent,
//            stopDetect: ev.gesture.stopDetect,
//            stopPropagation: ev.gesture.stopPropagation,
            target: ev.gesture.target.id,
//            timeStamp: ev.gesture.timeStamp,
            touches: util.map(ev.gesture.touches, extractTouch),
            velocityX: ev.gesture.velocityX,
            velocityY: ev.gesture.velocityY
         },
//         path: ev.path,
//         returnValue: ev.returnValue,
         srcElement: ev.srcElement.id,
         target: ev.target.id,
//         timeStamp: ev.timeStamp,
         type: ev.type
   };

   this.socketEmit(SOCKET_EVENTS.MTEvent, null, extractEV);
};

WAMS.prototype.getWorkspaceJSON = function(cb) {
//   var _this = this,
//      workspaceID, workspace;
//
//   this.on(WAMS_EVENTS.racerModelReady, function() {
//      _this.model.fetch(_this.root, function() {
//         workspaceID = _this.model.get('_page.me.workspace')[0];
//         workspace = _this.model.get(_this.root + '.workspaces.' + workspaceID);
//         cb(workspace.html);
//      });
//   });
};

WAMS.prototype.getWorkspaceHTML = function(cb) {
//   var _this = this,
//      workspaceID, workspace, html;
//
//   this.on(WAMS_EVENTS.racerModelReady, function() {
//      _this.model.fetch(_this.root, function() {
//         workspaceID = _this.model.get('_page.me.workspace')[0];
//         workspace = _this.model.get(_this.root + '.workspaces.' + workspaceID);
//         html = JSON2HTML(workspace.html);
//         cb(html);
//      });
//   });

   var _this = this,
      workspaceID, workspace, html;

   this.socket.on(SOCKET_EVENTS.workspaceUpdate, function(err) {
      if (err) { throw err; }

      _this.model.fetch(_this.root, function() {
         workspaceID = _this.model.get('_page.me.workspace.0');
         if (!workspaceID) {}
         workspace = _this.model.get(_this.root + '.workspaces.' + workspaceID);
         html = JSON2HTML(workspace.html);
         cb(html);
      })
   });
};

function WAMSConstructor(opts) {
   return new WAMS(opts);
}

WAMSConstructor.WAMS_EVENTS = WAMS_EVENTS;
WAMSConstructor.HAMMER_EVENTS = HAMMER_EVENTS;
WAMSConstructor.SOCKET_EVENTS = SOCKET_EVENTS;

WAMSConstructor._ = _;
WAMSConstructor.io = io;
WAMSConstructor.hammer = hammer;
WAMSConstructor.racer = racer;

WAMSConstructor.JSON2HTML = JSON2HTML;
WAMSConstructor.HTML2JSON = HTML2JSON;

module.exports = exports = WAMSConstructor;
