var hammer = require('hammerjs'),

   util = require('../util');

var DEFAULT_OPTS = {
   recognizers: [
      // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
      [hammer.Tap],
      [hammer.Pan, { direction: hammer.DIRECTION_ALL }],
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