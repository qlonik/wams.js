var _ = require('lodash');

var isServer = process.title !== 'browser',
   enableLodash = true,

   RACER_PATH = 'wams',
   SERVER_EVENTS = {
      connectClient: 'client',
      disconnectClient: 'clientDisconnect'
   },
   WORKSPACE_EVENTS = {
      clientConnected: 'newClient',
      clientReady: 'readyClient',
      clientDisconnected: 'disconnectClient',
      modelFetched: 'modelFetched'
   },
   WORKSPACE_OBJECT_EVENTS = {},
   CLIENT_EVENTS = {
      ready: 'clientReady',
      modelFetched: 'modelFetched',
      modelUpdated: 'modelUpdated',
      attachedWorkspace: 'attachedWorkspace',
      detachedWorkspace: 'detachedWorkspace'
   },
   SOCKET_EVENTS = {
      disconnect: 'disconnect',
      racerBundle: 'racerBundle',
      ready: 'ready'
   },
   HAMMER_EVENTS = [
      'tap', 'doubletap', 'pan', 'swipe', 'press', 'pinch', 'rotate'
   ],
   BROWSER_EVENTS = {};

function notImplemented(func) {
   throw new Error('Function "' + func + '" not implemented');
}
function forOwn(collection, cb) {
   var index, item,
      ownIndex = -1, ownProps = Object.keys(collection),
      length = ownProps ? ownProps.length : 0;

   while (++ownIndex < length) {
      index = ownProps[ownIndex];
      item = collection[index];
      cb(item, index, collection);
   }
}
forOwn(_, function (item, index, collection) {
   if (typeof item === 'function' && item !== collection) {

      exports[index] = function () {
         var args = Array.prototype.slice.call(arguments, 0);
         if (enableLodash) {
            return item.apply(_, args);
         } else {
            notImplemented(index);
         }
      }

   }
});


function getID(el) {
   return el.id;
}


exports.isServer = isServer;
exports.enableLodash = enableLodash;

exports.RACER_PATH = RACER_PATH;
exports.SERVER_EVENTS = SERVER_EVENTS;
exports.WORKSPACE_EVENTS = WORKSPACE_EVENTS;
exports.WORKSPACE_OBJECT_EVENTS = WORKSPACE_OBJECT_EVENTS;
exports.CLIENT_EVENTS = CLIENT_EVENTS;
exports.SOCKET_EVENTS = SOCKET_EVENTS;
exports.HAMMER_EVENTS = HAMMER_EVENTS;
exports.BROWSER_EVENTS = BROWSER_EVENTS;

exports.getID = getID;
