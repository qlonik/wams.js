var EventEmitter = require('events').EventEmitter,

   hammer = require('hammerjs'),

   util = require('../util');

var DEFAULT_OPTS = {
   recognizers: [
      // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
      [hammer.Tap],
//      [hammer.Tap, { event: 'doubletap', taps: 2 }, ['tap']],
//      [hammer.Press],
      [hammer.Pan, { direction: hammer.DIRECTION_ALL }],
//      [hammer.Swipe,{ direction: hammer.DIRECTION_ALL }],
      [hammer.Pinch],
      [hammer.Rotate, { enable: false }, ['pinch']]
   ]
};

function MTCreator() {
   this.mt = [];
}

MTCreator.prototype.create = function(html, opts) {
   var hmmr;

   opts = opts || {};
   util.defaults(opts, DEFAULT_OPTS);
   hmmr = new hammer.Manager(html, opts);
   this.mt.push(hmmr);

   return hmmr;
};

MTCreator.prototype.remove = function(mt) {
   return util.remove(this.mt, mt);
};

MTCreator.prototype.getEventMetadata = function(ev) {
   /*
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
   return {
//      bubbles: ev.bubbles,
//      cancelBubble: ev.cancelBubble,
//      cancelable: ev.cancelable,
//      clipboardData: ev.clipboardData,
//      currentTarget: ev.currentTarget,
//      defaultPrevented: ev.defaultPrevented,
//      eventPhase: ev.eventPhase,
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
//         preventDefault: ev.gesture.preventDefault,
         rotation: ev.gesture.rotation,
         scale: ev.gesture.scale,
//         srcEvent: ev.gesture.srcEvent,
//         startEvent: ev.gesture.startEvent,
//         stopDetect: ev.gesture.stopDetect,
//         stopPropagation: ev.gesture.stopPropagation,
         target: ev.gesture.target.id,
//         timeStamp: ev.gesture.timeStamp,
         touches: util.map(ev.gesture.touches, extractTouch),
         velocityX: ev.gesture.velocityX,
         velocityY: ev.gesture.velocityY
      },
//      path: ev.path,
//      returnValue: ev.returnValue,
      srcElement: ev.srcElement.id,
      target: ev.target.id,
//      timeStamp: ev.timeStamp,
      type: ev.type
   };
   */

   return {
      type: ev.type,
      deltaX: ev.deltaX,
      deltaY: ev.deltaY,
      deltaTime: ev.deltaTime,
      distance: ev.distance,
      angle: ev.angle,
      velocityX: ev.velocityX,
      velocityY: ev.velocityY,
      velocity: ev.velocity,
      direction: ev.direction,
      offsetDirection: ev.offsetDirection,
      scale: ev.scale,
      rotation: ev.rotation,
      center: {
         x: ev.center.x,
         y: ev.center.y
      },
      tapCount: ev.tapCount,
//      srcEvent: ev.srcEvent,
      target: ev.target.id,
      pointerType: ev.pointerType,
      eventType: ev.eventType,
      isFirst: ev.isFirst,
      isFinal: ev.isFinal,
//      pointers: ev.pointers,
//      changedPointers: ev.changedPointers,
//      preventDefault: ev.preventDefault,
      timeStamp: ev.timeStamp
   }
};

module.exports = MTCreator;