var _ = require('lodash');

var isServer = process.title !== 'browser',
   enableLodash = true,

   RACER_PATH = 'wams',
   SERVER_EVENTS = {
      connectClient: 'client',
      disconnectClient: 'clientDisconnect'
   },
   WORKSPACE_EVENTS = {},
   WORKSPACE_OBJECT_EVENTS = {},
   CLIENT_EVENTS = {};

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


exports.isServer = isServer;
exports.enableLodash = enableLodash;

exports.RACER_PATH = RACER_PATH;
exports.SERVER_EVENTS = SERVER_EVENTS;
exports.WORKSPACE_EVENTS = WORKSPACE_EVENTS;
exports.WORKSPACE_OBJECT_EVENTS = WORKSPACE_OBJECT_EVENTS;
exports.CLIENT_EVENTS = CLIENT_EVENTS;

